/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import * as API from '../APIS'

interface DriverViewProps {
  driverId: string
}

export default function DriverView({ driverId }: DriverViewProps) {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDeliveries = async () => {
    try {
      const data = await API.getDriverDeliveries(driverId)
      setDeliveries(data || [])
    } catch (err) {
      console.error('Failed to fetch deliveries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const handleMarkDelivered = async (orderId: number) => {
    try {
      await API.markAsDelivered(orderId)
      alert('Order marked as delivered!')
      fetchDeliveries()
    } catch (err) {
      console.error('Failed to mark as delivered')
    }
  }

  if (loading) {
    return <div className="driver-view">Loading...</div>
  }

  if (deliveries.length === 0) {
    return (
      <div className="driver-view">
        <div className="no-data-message">
          <div className="no-data-icon">🚗</div>
          <h3>You're Not On The Clock</h3>
          <p>You'll be notified when you're assigned deliveries.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="driver-view">
      <div className="section-header">
        <h2>My Deliveries</h2>
      </div>

      <div className="delivery-list">
        {deliveries.map((order, index) => (
          <div key={order.id} className="delivery-card">
            <div className="delivery-header">
              <h3>Stop #{index + 1} - Order #{order.id}</h3>
              <span className={`status-badge status-${order.status}`}>
                {order.status}
              </span>
            </div>
            <div className="delivery-details">
              <p><strong>Customer:</strong> {order.first_name}</p>
              <p><strong>Address:</strong> {order.address}</p>
              <p><strong>Phone:</strong> {order.phone_number}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ flex: 1, padding: '12px', background: '#4285f4', color: 'white', textAlign: 'center', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}
              >
                📍 Open in Google Maps
              </a>
              <a 
                href={`https://waze.com/ul?q=${encodeURIComponent(order.address)}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ flex: 1, padding: '12px', background: '#33ccff', color: 'white', textAlign: 'center', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}
              >
                🚗 Open in Waze
              </a>
            </div>
            {order.status === 'ready' && (
              <button 
                className="action-btn delivered-btn"
                onClick={() => handleMarkDelivered(order.id)}
                style={{ marginTop: '10px', width: '100%' }}
              >
                Mark as Delivered
              </button>
            )}
            {order.status === 'delivered' && (
              <span className="completed-text">✓ Delivered</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
