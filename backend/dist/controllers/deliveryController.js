"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsDelivered = exports.getDriverDeliveries = exports.assignRoute = exports.generateRoutesFromOrders = exports.generateRoutes = void 0;
const supabase_1 = require("../utils/supabase");
const axios_1 = __importDefault(require("axios"));
const ORS_API_KEY = process.env.ORS_API_KEY;
const STORE_LOCATION = { lat: 53.8321, lng: -1.5208 }; // LS17 8RX
const generateRoutes = async (req, res) => {
    try {
        const { numDrivers } = req.body;
        // Get all ready orders that haven't been assigned to a driver yet
        const { data: orders, error } = await supabase_1.supabase
            .from('orders')
            .select('id, first_name, address, phone_number, driver_id')
            .eq('status', 'ready')
            .is('driver_id', null);
        if (error)
            throw error;
        if (!orders || orders.length === 0) {
            return res.json({ routes: [], message: 'No unassigned ready orders to deliver' });
        }
        // Geocode addresses (convert to coordinates)
        const geocodedOrders = await Promise.all(orders.map(async (order) => {
            try {
                const response = await axios_1.default.get(`https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(order.address)}, UK`);
                const coords = response.data.features[0]?.geometry.coordinates;
                return {
                    ...order,
                    coordinates: coords ? { lng: coords[0], lat: coords[1] } : null
                };
            }
            catch (err) {
                console.error(`Failed to geocode: ${order.address}`);
                return { ...order, coordinates: null };
            }
        }));
        // Filter out orders that couldn't be geocoded
        const validOrders = geocodedOrders.filter(o => o.coordinates !== null);
        // Split orders among drivers
        const ordersPerDriver = Math.ceil(validOrders.length / numDrivers);
        const routes = [];
        for (let i = 0; i < numDrivers; i++) {
            const driverOrders = validOrders.slice(i * ordersPerDriver, (i + 1) * ordersPerDriver);
            if (driverOrders.length === 0)
                continue;
            // Build coordinates array for route optimization
            const coordinates = [
                [STORE_LOCATION.lng, STORE_LOCATION.lat], // Start point
                ...driverOrders.map(o => [o.coordinates.lng, o.coordinates.lat])
            ];
            // Get optimized route from OpenRouteService
            try {
                // Use optimization API to find best order
                const optimizationResponse = await axios_1.default.post(`https://api.openrouteservice.org/optimization`, {
                    jobs: driverOrders.map((order, idx) => ({
                        id: idx + 1,
                        location: [order.coordinates.lng, order.coordinates.lat]
                    })),
                    vehicles: [{
                            id: 1,
                            profile: 'driving-car',
                            start: [STORE_LOCATION.lng, STORE_LOCATION.lat],
                            end: [STORE_LOCATION.lng, STORE_LOCATION.lat]
                        }]
                }, {
                    headers: {
                        'Authorization': ORS_API_KEY,
                        'Content-Type': 'application/json'
                    }
                });
                const optimizedOrder = optimizationResponse.data.routes[0].steps
                    .filter((step) => step.type === 'job')
                    .map((step) => driverOrders[step.job - 1]);
                // Get route geometry
                const routeCoords = [
                    [STORE_LOCATION.lng, STORE_LOCATION.lat],
                    ...optimizedOrder.map((o) => [o.coordinates.lng, o.coordinates.lat])
                ];
                const routeResponse = await axios_1.default.post(`https://api.openrouteservice.org/v2/directions/driving-car/geojson`, {
                    coordinates: routeCoords,
                    instructions: true
                }, {
                    headers: {
                        'Authorization': ORS_API_KEY,
                        'Content-Type': 'application/json'
                    }
                });
                routes.push({
                    driverNumber: i + 1,
                    orders: optimizedOrder,
                    routeGeometry: routeResponse.data.features[0].geometry,
                    distance: routeResponse.data.features[0].properties.summary.distance,
                    duration: routeResponse.data.features[0].properties.summary.duration
                });
            }
            catch (err) {
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
    }
    catch (error) {
        console.error('Generate routes error:', error);
        res.status(500).json({ error: 'Failed to generate routes', details: error.message });
    }
};
exports.generateRoutes = generateRoutes;
const generateRoutesFromOrders = async (req, res) => {
    try {
        const { orders, numDrivers } = req.body;
        if (!orders || orders.length === 0) {
            return res.json({ routes: [], message: 'No orders provided' });
        }
        // Geocode addresses
        const geocodedOrders = await Promise.all(orders.map(async (order) => {
            try {
                const response = await axios_1.default.get(`https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(order.address)}, UK`);
                const coords = response.data.features[0]?.geometry.coordinates;
                return {
                    ...order,
                    coordinates: coords ? { lng: coords[0], lat: coords[1] } : null
                };
            }
            catch (err) {
                console.error(`Failed to geocode: ${order.address}`);
                return { ...order, coordinates: null };
            }
        }));
        const validOrders = geocodedOrders.filter(o => o.coordinates !== null);
        // Split orders among drivers
        const ordersPerDriver = Math.ceil(validOrders.length / numDrivers);
        const routes = [];
        for (let i = 0; i < numDrivers; i++) {
            const driverOrders = validOrders.slice(i * ordersPerDriver, (i + 1) * ordersPerDriver);
            if (driverOrders.length === 0)
                continue;
            // Build coordinates array for route optimization
            const coordinates = [
                [STORE_LOCATION.lng, STORE_LOCATION.lat],
                ...driverOrders.map(o => [o.coordinates.lng, o.coordinates.lat])
            ];
            // Get optimized route
            try {
                const optimizationResponse = await axios_1.default.post(`https://api.openrouteservice.org/optimization`, {
                    jobs: driverOrders.map((order, idx) => ({
                        id: idx + 1,
                        location: [order.coordinates.lng, order.coordinates.lat]
                    })),
                    vehicles: [{
                            id: 1,
                            profile: 'driving-car',
                            start: [STORE_LOCATION.lng, STORE_LOCATION.lat],
                            end: [STORE_LOCATION.lng, STORE_LOCATION.lat]
                        }]
                }, {
                    headers: {
                        'Authorization': ORS_API_KEY,
                        'Content-Type': 'application/json'
                    }
                });
                const optimizedOrder = optimizationResponse.data.routes[0].steps
                    .filter((step) => step.type === 'job')
                    .map((step) => driverOrders[step.job - 1]);
                const routeCoords = [
                    [STORE_LOCATION.lng, STORE_LOCATION.lat],
                    ...optimizedOrder.map((o) => [o.coordinates.lng, o.coordinates.lat])
                ];
                const routeResponse = await axios_1.default.post(`https://api.openrouteservice.org/v2/directions/driving-car/geojson`, {
                    coordinates: routeCoords,
                    instructions: true
                }, {
                    headers: {
                        'Authorization': ORS_API_KEY,
                        'Content-Type': 'application/json'
                    }
                });
                routes.push({
                    driverNumber: i + 1,
                    orders: optimizedOrder,
                    routeGeometry: routeResponse.data.features[0].geometry,
                    distance: routeResponse.data.features[0].properties.summary.distance,
                    duration: routeResponse.data.features[0].properties.summary.duration
                });
            }
            catch (err) {
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
    }
    catch (error) {
        console.error('Generate routes error:', error);
        res.status(500).json({ error: 'Failed to generate routes', details: error.message });
    }
};
exports.generateRoutesFromOrders = generateRoutesFromOrders;
const assignRoute = async (req, res) => {
    try {
        const { driverId, orderIds, routeData } = req.body;
        // Create delivery route
        const { data: route, error: routeError } = await supabase_1.supabase
            .from('delivery_routes')
            .insert({
            driver_id: driverId,
            route_data: routeData,
            status: 'assigned'
        })
            .select()
            .single();
        if (routeError)
            throw routeError;
        // Update orders with driver and route
        const { error: ordersError } = await supabase_1.supabase
            .from('orders')
            .update({
            driver_id: driverId,
            route_id: route.id
        })
            .in('id', orderIds);
        if (ordersError)
            throw ordersError;
        res.json({ success: true, route });
    }
    catch (error) {
        console.error('Assign route error:', error);
        res.status(500).json({ error: 'Failed to assign route', details: error.message });
    }
};
exports.assignRoute = assignRoute;
const getDriverDeliveries = async (req, res) => {
    try {
        const driverId = req.headers['driver-id'];
        // Get the driver's route
        const { data: route, error: routeError } = await supabase_1.supabase
            .from('delivery_routes')
            .select('route_data')
            .eq('driver_id', driverId)
            .eq('status', 'assigned')
            .single();
        const { data: orders, error } = await supabase_1.supabase
            .from('orders')
            .select('id, first_name, address, phone_number, status, route_id')
            .eq('driver_id', driverId)
            .in('status', ['ready', 'delivered']);
        if (error)
            throw error;
        // Sort orders based on route_data order if available
        if (route && route.route_data && route.route_data.orders) {
            const orderSequence = route.route_data.orders.map((o) => o.id);
            orders?.sort((a, b) => orderSequence.indexOf(a.id) - orderSequence.indexOf(b.id));
        }
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch deliveries' });
    }
};
exports.getDriverDeliveries = getDriverDeliveries;
const markAsDelivered = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase_1.supabase
            .from('orders')
            .update({ status: 'delivered' })
            .eq('id', id)
            .select('id, email, first_name')
            .single();
        if (error)
            throw error;
        // Send feedback request email
        try {
            const { sendFeedbackRequestEmail } = await Promise.resolve().then(() => __importStar(require('../utils/email')));
            await sendFeedbackRequestEmail(data.email, {
                orderId: data.id,
                firstName: data.first_name
            });
            console.log('Feedback email sent to:', data.email);
        }
        catch (emailError) {
            console.error('Failed to send feedback email:', emailError);
        }
        res.json(data);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to mark as delivered' });
    }
};
exports.markAsDelivered = markAsDelivered;
