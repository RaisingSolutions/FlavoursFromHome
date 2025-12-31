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

  const startLocation = '85 High Ash Drive, LS17 8RX';
  
  const openFullRoute = (app: 'google' | 'waze') => {
    const waypoints = deliveries.map(d => encodeURIComponent(d.address)).join('/');
    
    if (app === 'google') {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startLocation)}&destination=${encodeURIComponent(deliveries[deliveries.length - 1].address)}&waypoints=${waypoints}`;
      window.open(url, '_blank');
    } else {
      // Waze doesn't support multi-stop, so open first destination
      const url = `https://waze.com/ul?q=${encodeURIComponent(deliveries[0].address)}&navigate=yes`;
      window.open(url, '_blank');
    }
  };

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
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => openFullRoute('google')}
            style={{ padding: '12px 24px', background: '#4285f4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            📍 Open Route in Google Maps
          </button>
          <button 
            onClick={() => openFullRoute('waze')}
            style={{ padding: '12px 24px', background: '#33ccff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🚗 Open Route in Waze
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto', marginTop: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ background: '#34495e', color: 'white' }}>
              <th style={{ padding: '15px', textAlign: 'left', border: '1px solid #ddd' }}>Stop #</th>
              <th style={{ padding: '15px', textAlign: 'left', border: '1px solid #ddd' }}>Address</th>
              <th style={{ padding: '15px', textAlign: 'left', border: '1px solid #ddd' }}>Contact</th>
              <th style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((order, index) => (
              <tr key={order.id} style={{ background: order.status === 'delivered' ? '#e8f5e9' : 'white' }}>
                <td style={{ padding: '15px', border: '1px solid #ddd', fontWeight: 'bold' }}>#{index + 1}</td>
                <td style={{ padding: '15px', border: '1px solid #ddd' }}>{order.address}</td>
                <td style={{ padding: '15px', border: '1px solid #ddd' }}>
                  <div><strong>{order.first_name}</strong></div>
                  <div style={{ fontSize: '14px', color: '#666' }}>{order.phone_number}</div>
                </td>
                <td style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center' }}>
                  {order.status === 'ready' ? (
                    <button 
                      onClick={() => handleMarkDelivered(order.id)}
                      style={{ padding: '10px 20px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      ✓ Mark as Delivered
                    </button>
                  ) : (
                    <span style={{ color: '#4caf50', fontWeight: 'bold' }}>✓ Delivered</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
