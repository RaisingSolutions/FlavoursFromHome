/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { fetchFeedbacks } from '../APIS'

export default function FeedbackTab({ userLocation, isSuperAdmin }: { userLocation: string | null, isSuperAdmin: boolean }) {
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<'all' | 'Leeds' | 'Derby' | 'Sheffield'>(isSuperAdmin ? 'all' : (userLocation as any) || 'all')

  useEffect(() => {
    loadFeedbacks()
  }, [])

  const loadFeedbacks = async () => {
    try {
      const data = await fetchFeedbacks()
      const allFeedbacks = Array.isArray(data) ? data : []
      // Filter by location for location admins
      if (!isSuperAdmin && userLocation) {
        setFeedbacks(allFeedbacks.filter(fb => fb.location === userLocation))
      } else {
        setFeedbacks(allFeedbacks)
      }
    } catch (err) {
      console.error('Failed to fetch feedbacks', err)
      setFeedbacks([])
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => '⭐'.repeat(rating)

  const filteredFeedbacks = selectedLocation === 'all' 
    ? feedbacks 
    : feedbacks.filter(fb => fb.location === selectedLocation)

  const getLocationStats = (location: 'Leeds' | 'Derby' | 'Sheffield') => {
    const locationFeedbacks = feedbacks.filter(fb => fb.location === location)
    const avgDelivery = locationFeedbacks.length > 0 
      ? (locationFeedbacks.reduce((sum, fb) => sum + fb.delivery_rating, 0) / locationFeedbacks.length).toFixed(1)
      : 'N/A'
    const avgDriver = locationFeedbacks.length > 0
      ? (locationFeedbacks.reduce((sum, fb) => sum + fb.driver_rating, 0) / locationFeedbacks.length).toFixed(1)
      : 'N/A'
    return { count: locationFeedbacks.length, avgDelivery, avgDriver }
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0 }}>Customer Reviews {!isSuperAdmin && userLocation ? `- ${userLocation}` : ''}</h2>
        {isSuperAdmin && (
          <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setSelectedLocation('all')}
            style={{ 
              padding: '10px 20px', 
              border: selectedLocation === 'all' ? '2px solid #3498db' : '1px solid #ddd',
              background: selectedLocation === 'all' ? '#3498db' : 'white',
              color: selectedLocation === 'all' ? 'white' : '#333',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            All Locations
          </button>
          <button 
            onClick={() => setSelectedLocation('Leeds')}
            style={{ 
              padding: '10px 20px', 
              border: selectedLocation === 'Leeds' ? '2px solid #3498db' : '1px solid #ddd',
              background: selectedLocation === 'Leeds' ? '#3498db' : 'white',
              color: selectedLocation === 'Leeds' ? 'white' : '#333',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Leeds
          </button>
          <button 
            onClick={() => setSelectedLocation('Derby')}
            style={{ 
              padding: '10px 20px', 
              border: selectedLocation === 'Derby' ? '2px solid #e74c3c' : '1px solid #ddd',
              background: selectedLocation === 'Derby' ? '#e74c3c' : 'white',
              color: selectedLocation === 'Derby' ? 'white' : '#333',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Derby
          </button>
          <button 
            onClick={() => setSelectedLocation('Sheffield')}
            style={{ 
              padding: '10px 20px', 
              border: selectedLocation === 'Sheffield' ? '2px solid #2ecc71' : '1px solid #ddd',
              background: selectedLocation === 'Sheffield' ? '#2ecc71' : 'white',
              color: selectedLocation === 'Sheffield' ? 'white' : '#333',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Sheffield
          </button>
        </div>
        )}
      </div>

      {/* Location Stats Cards - Only for Super Admin */}
      {isSuperAdmin && (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {(['Leeds', 'Derby', 'Sheffield'] as const).map((location) => {
          const stats = getLocationStats(location)
          const bgColor = location === 'Leeds' ? '#3498db' : location === 'Derby' ? '#e74c3c' : '#2ecc71'
          return (
            <div key={location} style={{ 
              background: bgColor, 
              color: 'white', 
              padding: '20px', 
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '20px' }}>{location}</h3>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                <div style={{ marginBottom: '8px' }}>📊 Total Reviews: <strong>{stats.count}</strong></div>
                <div style={{ marginBottom: '8px' }}>🚚 Avg Delivery: <strong>{stats.avgDelivery} ⭐</strong></div>
                <div>👤 Avg Driver: <strong>{stats.avgDriver} ⭐</strong></div>
              </div>
            </div>
          )
        })}
      </div>
      )}

      {filteredFeedbacks.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          background: '#f8f9fa', 
          borderRadius: '12px',
          border: '2px dashed #ddd'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>💬</div>
          <h3 style={{ color: '#666', marginBottom: '10px' }}>No Reviews Yet</h3>
          <p style={{ color: '#999' }}>No customer feedback for {selectedLocation === 'all' ? 'any location' : selectedLocation} at the moment.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            background: 'white', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ background: '#34495e', color: 'white' }}>
                <th style={{ padding: '15px', textAlign: 'left', border: 'none' }}>Order</th>
                <th style={{ padding: '15px', textAlign: 'left', border: 'none' }}>Location</th>
                <th style={{ padding: '15px', textAlign: 'left', border: 'none' }}>Customer</th>
                <th style={{ padding: '15px', textAlign: 'left', border: 'none' }}>Product Ratings</th>
                <th style={{ padding: '15px', textAlign: 'center', border: 'none' }}>Delivery</th>
                <th style={{ padding: '15px', textAlign: 'center', border: 'none' }}>Driver</th>
                <th style={{ padding: '15px', textAlign: 'left', border: 'none' }}>Comments</th>
                <th style={{ padding: '15px', textAlign: 'left', border: 'none' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map((fb, index) => {
                const locationColor = fb.location === 'Leeds' ? '#3498db' : fb.location === 'Derby' ? '#e74c3c' : '#2ecc71'
                return (
                  <tr key={fb.id} style={{ 
                    background: index % 2 === 0 ? '#f8f9fa' : 'white',
                    borderBottom: '1px solid #e9ecef'
                  }}>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#2c3e50' }}>#{fb.order_id}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ 
                        background: locationColor, 
                        color: 'white', 
                        padding: '4px 12px', 
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {fb.location || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '15px', color: '#2c3e50' }}>{fb.customer_name}</td>
                    <td style={{ padding: '15px' }}>
                      {Object.entries(fb.product_ratings || {}).map(([productId, data]: any) => (
                        <div key={productId} style={{ 
                          marginBottom: '10px', 
                          padding: '8px', 
                          background: 'white', 
                          borderRadius: '6px',
                          border: '1px solid #e9ecef'
                        }}>
                          <div style={{ fontWeight: 'bold', color: '#2c3e50', marginBottom: '4px' }}>{data.productName}</div>
                          <div style={{ fontSize: '16px' }}>{renderStars(data.rating)}</div>
                          {data.comment && (
                            <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '4px', fontStyle: 'italic' }}>
                              "{data.comment}"
                            </div>
                          )}
                        </div>
                      ))}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center', fontSize: '18px' }}>{renderStars(fb.delivery_rating)}</td>
                    <td style={{ padding: '15px', textAlign: 'center', fontSize: '18px' }}>{renderStars(fb.driver_rating)}</td>
                    <td style={{ padding: '15px', maxWidth: '200px' }}>
                      {fb.delivery_comments ? (
                        <div style={{ 
                          padding: '8px', 
                          background: '#fff3cd', 
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontStyle: 'italic',
                          color: '#856404'
                        }}>
                          "{fb.delivery_comments}"
                        </div>
                      ) : (
                        <span style={{ color: '#adb5bd' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '15px', color: '#7f8c8d', fontSize: '13px' }}>
                      {new Date(fb.created_at).toLocaleDateString('en-GB', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
