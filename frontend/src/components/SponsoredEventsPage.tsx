import { useState, useEffect } from 'react'

interface Event {
  id: number
  name: string
  description: string
  event_date: string
  location: string
  venue_address: string
  image_url: string
  sponsor_name: string
  adult_price: number
  child_price: number
  total_capacity: number
  total_sold: number
}

interface SponsoredEventsPageProps {
  onEventClick: (eventId: number) => void
}

export default function SponsoredEventsPage({ onEventClick }: SponsoredEventsPageProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/events`)
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Loading events...</div>
  }

  return (
    <section className="sponsored-events-page">
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px',
        borderRadius: '16px',
        margin: '20px 0 40px',
        textAlign: 'center',
        color: 'white',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
      }}>
        <h1 style={{ fontSize: '36px', marginBottom: '15px' }}>🎉 Sponsored Events</h1>
        <p style={{ fontSize: '20px', margin: 0 }}>Book an event & receive 10% OFF every month until end of 2026!</p>
      </div>

      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <h2>No events available at the moment</h2>
          <p>Check back soon for upcoming events!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '30px',
          padding: '20px 0'
        }}>
          {events.map(event => {
            const percentSold = (event.total_sold / event.total_capacity) * 100
            const remaining = event.total_capacity - event.total_sold

            return (
              <div
                key={event.id}
                style={{
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  background: 'white'
                }}
                onClick={() => onEventClick(event.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                  <img
                    src={event.image_url}
                    alt={event.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ padding: '20px' }}>
                  <h3 style={{ margin: '0 0 10px', fontSize: '22px' }}>{event.name}</h3>
                  <p style={{ color: '#666', fontSize: '14px', margin: '0 0 15px', lineHeight: '1.5' }}>
                    {event.description}
                  </p>

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span>📅</span>
                      <span style={{ fontSize: '14px' }}>{new Date(event.event_date).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span>📍</span>
                      <span style={{ fontSize: '14px' }}>{event.venue_address}</span>
                    </div>
                  </div>

                  <div style={{
                    background: '#f5f5f5',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '15px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px' }}>Adult: £{event.adult_price}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px' }}>Child: £{event.child_price}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                      <span>{event.total_sold} / {event.total_capacity} tickets sold ({remaining} left)</span>
                      <span>{percentSold.toFixed(0)}%</span>
                    </div>
                    <div style={{
                      height: '8px',
                      background: '#e0e0e0',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${percentSold}%`,
                        background: percentSold > 80 ? '#dc3545' : '#667eea',
                        transition: 'width 0.3s'
                      }} />
                    </div>
                  </div>

                  <button
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event.id)
                    }}
                  >
                    Book Tickets
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
