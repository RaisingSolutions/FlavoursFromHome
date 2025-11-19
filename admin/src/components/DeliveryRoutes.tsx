/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import * as API from '../APIS'

export default function DeliveryRoutes() {
  const [numDrivers, setNumDrivers] = useState(1)
  const [routes, setRoutes] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [readyOrders, setReadyOrders] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCreateDriver, setShowCreateDriver] = useState(false)
  const [newDriverUsername, setNewDriverUsername] = useState('')
  const [newDriverPassword, setNewDriverPassword] = useState('')

  useEffect(() => {
    fetchDrivers()
    fetchReadyOrders()
  }, [])

  const fetchDrivers = async () => {
    try {
      const data = await API.fetchDrivers()
      setDrivers(data)
    } catch (err) {
      console.error('Failed to fetch drivers')
    }
  }

  const fetchReadyOrders = async () => {
    try {
      const data = await API.fetchOrders()
      // Only show ready orders that haven't been assigned to a driver yet
      const ready = Array.isArray(data) ? data.filter((order: any) => order.status === 'ready' && !order.driver_id) : []
      setReadyOrders(ready)
    } catch (err) {
      console.error('Failed to fetch ready orders')
    }
  }



  const handleCreateDriver = async () => {
    try {
      await API.createDriver(newDriverUsername, newDriverPassword)
      alert('Driver created successfully!')
      setShowCreateDriver(false)
      setNewDriverUsername('')
      setNewDriverPassword('')
      fetchDrivers()
    } catch (err) {
      console.error('Failed to create driver')
      alert('Failed to create driver')
    }
  }

  const handleGenerateRoutes = async () => {
    if (readyOrders.length === 0) {
      alert('No unassigned orders to generate routes for!')
      return
    }

    setIsGenerating(true)
    try {
      // Use the readyOrders already loaded instead of fetching again
      const orderIds = readyOrders.map(o => o.id).join(',')
      const data = await API.generateRoutesFromOrders(readyOrders, numDrivers)
      setRoutes(data.routes || [])
    } catch (err) {
      console.error('Failed to generate routes')
      alert('Failed to generate routes. Check console for details.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAssignRoute = async (route: any, driverId: number) => {
    try {
      const orderIds = route.orders.map((o: any) => o.id)
      await API.assignRoute(driverId, orderIds, route)
      alert('Route assigned successfully!')
      setRoutes([])
      fetchReadyOrders() // Refresh the ready orders list
    } catch (err) {
      console.error('Failed to assign route')
    }
  }

  return (
    <div className="delivery-routes-section">
      <div className="section-header">
        <h2>Delivery Route Planning</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="create-btn" onClick={() => fetchReadyOrders()}>
            Refresh Orders
          </button>
          <button className="create-btn" onClick={() => setShowCreateDriver(!showCreateDriver)}>
            {showCreateDriver ? 'Cancel' : 'Create Driver'}
          </button>
        </div>
      </div>

      {showCreateDriver && (
        <div className="create-form">
          <h3>Create New Driver</h3>
          <input
            type="text"
            placeholder="Username"
            value={newDriverUsername}
            onChange={(e) => setNewDriverUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={newDriverPassword}
            onChange={(e) => setNewDriverPassword(e.target.value)}
          />
          <div className="form-actions">
            <button className="create-btn" onClick={handleCreateDriver}>
              Create Driver
            </button>
            <button className="cancel-btn" onClick={() => setShowCreateDriver(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {readyOrders.length > 0 ? (
        <div className="ready-orders-list">
          <h3>Orders Ready for Route Assignment</h3>
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Delivery Address</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {readyOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="order-id">#{order.id}</td>
                    <td className="customer-name">{order.first_name}</td>
                    <td className="items-cell">
                      <div className="order-items">
                        {order.order_items?.map((item: any, index: number) => (
                          <div key={index} className="order-item">
                            <span className="item-name">{item.product_name}</span>
                            <span className="item-qty">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="address">{order.address}</td>
                    <td className="phone">{order.phone_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="no-data-message">
          <div className="no-data-icon">📦</div>
          <h3>No Orders Ready for Assignment</h3>
          <p>All ready orders have been assigned to drivers.</p>
        </div>
      )}

      {Array.isArray(drivers) && drivers.length > 0 && (
        <div className="drivers-list">
          <h3>Available Drivers</h3>
          <div className="drivers-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.id}>
                    <td>{driver.id}</td>
                    <td>{driver.username}</td>
                    <td><span className="status-badge active">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="route-generator">
        <div className="generator-controls">
          <label>Number of Drivers Available:</label>
          <input
            type="number"
            min="1"
            value={numDrivers}
            onChange={(e) => setNumDrivers(parseInt(e.target.value))}
          />
          <button 
            className="create-btn" 
            onClick={handleGenerateRoutes}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Routes'}
          </button>
        </div>

        {routes.length > 0 && (
          <div className="routes-container">
            {routes.map((route, index) => (
              <div key={index} className="route-card">
                <h3>Route {route.driverNumber}</h3>
                <div className="route-stats">
                  <span>📦 {route.orders.length} deliveries</span>
                  {route.distance && <span>🚗 {(route.distance / 1000).toFixed(1)} km</span>}
                  {route.duration && <span>⏱️ {Math.round(route.duration / 60)} min</span>}
                </div>

                <div className="route-orders">
                  <h4>Delivery Order:</h4>
                  <ol>
                    <li className="start-point">📍 Start: 85 High Ash Drive, LS17 8RX</li>
                    {route.orders.map((order: any) => (
                      <li key={order.id}>
                        <strong>{order.first_name}</strong><br />
                        {order.address}<br />
                        📞 {order.phone_number}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="assign-driver">
                  <label>Assign to Driver:</label>
                  <select 
                    onChange={(e) => handleAssignRoute(route, parseInt(e.target.value))}
                    defaultValue=""
                  >
                    <option value="" disabled>Select driver...</option>
                    {Array.isArray(drivers) && drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
