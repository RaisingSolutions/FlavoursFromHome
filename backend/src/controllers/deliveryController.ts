import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';
import axios from 'axios';

const ORS_API_KEY = process.env.ORS_API_KEY;
const STORE_LOCATION = { lat: 53.8321, lng: -1.5208 }; // LS17 8RX

export const generateRoutes = async (req: Request, res: Response) => {
  try {
    const { numDrivers } = req.body;

    // Get all ready orders that haven't been assigned to a driver yet
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, first_name, address, phone_number, driver_id')
      .eq('status', 'ready')
      .is('driver_id', null);

    if (error) throw error;

    if (!orders || orders.length === 0) {
      return res.json({ routes: [], message: 'No unassigned ready orders to deliver' });
    }

    // Geocode addresses (convert to coordinates)
    const geocodedOrders = await Promise.all(
      orders.map(async (order) => {
        try {
          const response = await axios.get(
            `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(order.address)}, UK`
          );
          const coords = response.data.features[0]?.geometry.coordinates;
          return {
            ...order,
            coordinates: coords ? { lng: coords[0], lat: coords[1] } : null
          };
        } catch (err) {
          console.error(`Failed to geocode: ${order.address}`);
          return { ...order, coordinates: null };
        }
      })
    );

    // Filter out orders that couldn't be geocoded
    const validOrders = geocodedOrders.filter(o => o.coordinates !== null);

    // Split orders among drivers
    const ordersPerDriver = Math.ceil(validOrders.length / numDrivers);
    const routes = [];

    for (let i = 0; i < numDrivers; i++) {
      const driverOrders = validOrders.slice(i * ordersPerDriver, (i + 1) * ordersPerDriver);
      
      if (driverOrders.length === 0) continue;

      // Build coordinates array for route optimization
      const coordinates = [
        [STORE_LOCATION.lng, STORE_LOCATION.lat], // Start point
        ...driverOrders.map(o => [o.coordinates!.lng, o.coordinates!.lat])
      ];

      // Get optimized route from OpenRouteService
      try {
        // Use optimization API to find best order
        const optimizationResponse = await axios.post(
          `https://api.openrouteservice.org/optimization`,
          {
            jobs: driverOrders.map((order, idx) => ({
              id: idx + 1,
              location: [order.coordinates!.lng, order.coordinates!.lat]
            })),
            vehicles: [{
              id: 1,
              profile: 'driving-car',
              start: [STORE_LOCATION.lng, STORE_LOCATION.lat],
              end: [STORE_LOCATION.lng, STORE_LOCATION.lat]
            }]
          },
          {
            headers: {
              'Authorization': ORS_API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );

        const optimizedOrder = optimizationResponse.data.routes[0].steps
          .filter((step: any) => step.type === 'job')
          .map((step: any) => driverOrders[step.job - 1]);

        // Get route geometry
        const routeCoords = [
          [STORE_LOCATION.lng, STORE_LOCATION.lat],
          ...optimizedOrder.map((o: any) => [o.coordinates.lng, o.coordinates.lat])
        ];

        const routeResponse = await axios.post(
          `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
          {
            coordinates: routeCoords,
            instructions: true
          },
          {
            headers: {
              'Authorization': ORS_API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );

        routes.push({
          driverNumber: i + 1,
          orders: optimizedOrder,
          routeGeometry: routeResponse.data.features[0].geometry,
          distance: routeResponse.data.features[0].properties.summary.distance,
          duration: routeResponse.data.features[0].properties.summary.duration
        });
      } catch (err) {
        console.error('Route optimization failed:', err);
        routes.push({
          driverNumber: i + 1,
          orders: driverOrders,
          routeGeometry: null,
          distance: null,
          duration: null
        });
      }
    }

    res.json({ routes });
  } catch (error: any) {
    console.error('Generate routes error:', error);
    res.status(500).json({ error: 'Failed to generate routes', details: error.message });
  }
};

export const generateRoutesFromOrders = async (req: Request, res: Response) => {
  try {
    const { orders, numDrivers } = req.body;

    if (!orders || orders.length === 0) {
      return res.json({ routes: [], message: 'No orders provided' });
    }

    // Geocode addresses
    const geocodedOrders = await Promise.all(
      orders.map(async (order: any) => {
        try {
          const response = await axios.get(
            `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(order.address)}, UK`
          );
          const coords = response.data.features[0]?.geometry.coordinates;
          return {
            ...order,
            coordinates: coords ? { lng: coords[0], lat: coords[1] } : null
          };
        } catch (err) {
          console.error(`Failed to geocode: ${order.address}`);
          return { ...order, coordinates: null };
        }
      })
    );

    const validOrders = geocodedOrders.filter(o => o.coordinates !== null);

    // Split orders among drivers
    const ordersPerDriver = Math.ceil(validOrders.length / numDrivers);
    const routes = [];

    for (let i = 0; i < numDrivers; i++) {
      const driverOrders = validOrders.slice(i * ordersPerDriver, (i + 1) * ordersPerDriver);
      
      if (driverOrders.length === 0) continue;

      // Build coordinates array for route optimization
      const coordinates = [
        [STORE_LOCATION.lng, STORE_LOCATION.lat],
        ...driverOrders.map(o => [o.coordinates!.lng, o.coordinates!.lat])
      ];

      // Get optimized route
      try {
        const optimizationResponse = await axios.post(
          `https://api.openrouteservice.org/optimization`,
          {
            jobs: driverOrders.map((order, idx) => ({
              id: idx + 1,
              location: [order.coordinates!.lng, order.coordinates!.lat]
            })),
            vehicles: [{
              id: 1,
              profile: 'driving-car',
              start: [STORE_LOCATION.lng, STORE_LOCATION.lat],
              end: [STORE_LOCATION.lng, STORE_LOCATION.lat]
            }]
          },
          {
            headers: {
              'Authorization': ORS_API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );

        const optimizedOrder = optimizationResponse.data.routes[0].steps
          .filter((step: any) => step.type === 'job')
          .map((step: any) => driverOrders[step.job - 1]);

        const routeCoords = [
          [STORE_LOCATION.lng, STORE_LOCATION.lat],
          ...optimizedOrder.map((o: any) => [o.coordinates.lng, o.coordinates.lat])
        ];

        const routeResponse = await axios.post(
          `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
          {
            coordinates: routeCoords,
            instructions: true
          },
          {
            headers: {
              'Authorization': ORS_API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );

        routes.push({
          driverNumber: i + 1,
          orders: optimizedOrder,
          routeGeometry: routeResponse.data.features[0].geometry,
          distance: routeResponse.data.features[0].properties.summary.distance,
          duration: routeResponse.data.features[0].properties.summary.duration
        });
      } catch (err) {
        console.error('Route optimization failed:', err);
        routes.push({
          driverNumber: i + 1,
          orders: driverOrders,
          routeGeometry: null,
          distance: null,
          duration: null
        });
      }
    }

    res.json({ routes });
  } catch (error: any) {
    console.error('Generate routes error:', error);
    res.status(500).json({ error: 'Failed to generate routes', details: error.message });
  }
};

export const assignRoute = async (req: Request, res: Response) => {
  try {
    const { driverId, orderIds, routeData } = req.body;

    // Create delivery route
    const { data: route, error: routeError } = await supabase
      .from('delivery_routes')
      .insert({
        driver_id: driverId,
        route_data: routeData,
        status: 'assigned'
      })
      .select()
      .single();

    if (routeError) throw routeError;

    // Update orders with driver and route
    const { error: ordersError } = await supabase
      .from('orders')
      .update({
        driver_id: driverId,
        route_id: route.id
      })
      .in('id', orderIds);

    if (ordersError) throw ordersError;

    res.json({ success: true, route });
  } catch (error: any) {
    console.error('Assign route error:', error);
    res.status(500).json({ error: 'Failed to assign route', details: error.message });
  }
};

export const getDriverDeliveries = async (req: Request, res: Response) => {
  try {
    const driverId = req.headers['driver-id'];

    // Get the driver's route
    const { data: route, error: routeError } = await supabase
      .from('delivery_routes')
      .select('route_data')
      .eq('driver_id', driverId)
      .eq('status', 'assigned')
      .single();

    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, first_name, address, phone_number, status, route_id')
      .eq('driver_id', driverId)
      .in('status', ['ready', 'delivered']);

    if (error) throw error;

    // Sort orders based on route_data order if available
    if (route && route.route_data && route.route_data.orders) {
      const orderSequence = route.route_data.orders.map((o: any) => o.id);
      orders?.sort((a, b) => orderSequence.indexOf(a.id) - orderSequence.indexOf(b.id));
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
};

export const markAsDelivered = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'delivered' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(400).json({ error: 'Failed to mark as delivered' });
  }
};
