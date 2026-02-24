import { useState, useEffect } from 'react'

interface OrganiserDashboardProps {
  token: string
  eventId: number
  onLogout: () => void
  onShowToast: (message: string, type: 'success' | 'error') => void
}

export default function OrganiserDashboard({ token, eventId, onLogout, onShowToast }: OrganiserDashboardProps) {
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
    const interval = setInterval(fetchDashboard, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/organiser/dashboard/${eventId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setDashboard(data)
      } else if (response.status === 401) {
        onShowToast('Session expired. Please login again.', 'error')
        onLogout()
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/organiser/export/${eventId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `attendees-${eventId}.csv`
        a.click()
        onShowToast('Attendee list exported!', 'success')
      } else {
        onShowToast('Export failed', 'error')
      }
    } catch (error) {
      onShowToast('Export failed', 'error')
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Loading dashboard...</div>
  }

  if (!dashboard) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Failed to load dashboard</div>
  }

  const soldPercentage = (dashboard.sold.total / dashboard.capacity.total) * 100

  return (
    <section style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>{dashboard.event.name}</h1>
        <button onClick={onLogout} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <div style={{ marginBottom: '20px', color: '#666' }}>
        <div>📅 {new Date(dashboard.event.date).toLocaleString()}</div>
        <div>📍 {dashboard.event.location}</div>
        <div style={{ fontSize: '14px', marginTop: '10px' }}>
          Last updated: {new Date().toLocaleTimeString()} (Auto-refreshes every 30s)
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '30px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold' }}>{dashboard.sold.total}</div>
          <div style={{ fontSize: '18px', marginTop: '10px' }}>Total Tickets Sold</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '30px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold' }}>{dashboard.remaining.total}</div>
          <div style={{ fontSize: '18px', marginTop: '10px' }}>Tickets Remaining</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          padding: '30px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold' }}>£{dashboard.revenue.toFixed(2)}</div>
          <div style={{ fontSize: '18px', marginTop: '10px' }}>Total Revenue</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          color: 'white',
          padding: '30px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold' }}>{dashboard.bookings}</div>
          <div style={{ fontSize: '18px', marginTop: '10px' }}>Total Bookings</div>
        </div>
      </div>

      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        border: '2px solid #e0e0e0',
        marginBottom: '30px'
      }}>
        <h2 style={{ marginTop: 0 }}>Ticket Breakdown</h2>
        
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Overall Progress</span>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{soldPercentage.toFixed(1)}%</span>
          </div>
          <div style={{
            height: '30px',
            background: '#e0e0e0',
            borderRadius: '15px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${soldPercentage}%`,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              transition: 'width 0.5s'
            }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div>
            <h3>Adult Tickets</h3>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
              {dashboard.sold.adult} sold / {dashboard.capacity.adult} total
            </div>
            <div style={{
              height: '20px',
              background: '#e0e0e0',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${(dashboard.sold.adult / dashboard.capacity.adult) * 100}%`,
                background: '#667eea',
                transition: 'width 0.5s'
              }} />
            </div>
            <div style={{ marginTop: '10px', fontSize: '16px', fontWeight: 'bold', color: '#28a745' }}>
              {dashboard.remaining.adult} remaining
            </div>
          </div>

          <div>
            <h3>Child Tickets</h3>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
              {dashboard.sold.child} sold / {dashboard.capacity.child} total
            </div>
            <div style={{
              height: '20px',
              background: '#e0e0e0',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${(dashboard.sold.child / dashboard.capacity.child) * 100}%`,
                background: '#764ba2',
                transition: 'width 0.5s'
              }} />
            </div>
            <div style={{ marginTop: '10px', fontSize: '16px', fontWeight: 'bold', color: '#28a745' }}>
              {dashboard.remaining.child} remaining
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleExport}
        style={{
          padding: '15px 30px',
          background: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        📥 Export Attendee List (CSV)
      </button>
    </section>
  )
}
