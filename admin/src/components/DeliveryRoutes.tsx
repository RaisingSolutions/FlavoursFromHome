import { useState, useEffect } from 'react'
import * as API from '../APIS'

export default function DeliveryRoutes() {
  const [numDrivers, setNumDrivers] = useState(1)
  const [routes, setRoutes] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCreateDriver, setShowCreateDriver] = useState(false)
  const [newDriverUsername, setNewDriverUsername] = useState('')
  const [newDriverPassword, setNewDriverPassword] = useState('')

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const data = await API.fetchDrivers()
      setDrivers(data)
    } catch (err) {
      console.error('Failed to fetch drivers')
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
    setIsGenerating(true)
    try {
      const data = await API.generateRoutes(numDrivers)
      setRoutes(data.routes || [])
    } catch (err) {
      console.error('Failed to generate routes')
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
    } catch (err) {
      console.error('Failed to assign route')
    }
  }

  return (
    <div className="delivery-routes-section">
      <div className="section-header">
        <h2>Delivery Route Planning</h2>
        <button className="create-btn" onClick={() => setShowCreateDriver(!showCreateDriver)}>
          {showCreateDriver ? 'Cancel' : 'Create Driver'}
        </button>
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
                    {route.orders.map((order: any, idx: number) => (
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
