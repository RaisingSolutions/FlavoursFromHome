import { useState, useEffect } from 'react'

interface LocationSelectorProps {
  onLocationChange: (location: string) => void
  currentLocation: string
}

export default function LocationSelector({ onLocationChange, currentLocation }: LocationSelectorProps) {
  const [showModal, setShowModal] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const locations = ['Leeds', 'Derby', 'Sheffield']

  useEffect(() => {
    if (!currentLocation) {
      detectLocation()
    }
  }, [])

  const detectLocation = async () => {
    setDetecting(true)
    console.log('🔍 Starting location detection...')
    try {
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      const city = (data.city || '').toLowerCase()
      
      console.log('📍 Full IP API Response:', data)
      console.log('🏙️ Detected city:', data.city)
      console.log('🔤 City (lowercase):', city)
      
      // Check if user is in one of our delivery cities
      if (city.includes('leeds')) {
        console.log('✅ Matched: Leeds')
        onLocationChange('Leeds')
      } else if (city.includes('derby')) {
        console.log('✅ Matched: Derby')
        onLocationChange('Derby')
      } else if (city.includes('sheffield')) {
        console.log('✅ Matched: Sheffield')
        onLocationChange('Sheffield')
      } else {
        console.log('❌ City not in delivery areas, showing popup')
        // User is outside our delivery areas - show popup
        setShowModal(true)
      }
    } catch (error) {
      console.error('❌ Location detection failed:', error)
      // If detection fails, show popup
      setShowModal(true)
    } finally {
      setDetecting(false)
      console.log('✅ Location detection complete')
    }
  }

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1rem',
        borderRadius: '8px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>📍</span>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Delivering to</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {detecting ? 'Detecting...' : currentLocation || 'Select Location'}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: 'white',
            color: '#667eea',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Change
        </button>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>Choose Your Delivery Location</h3>
            <p style={{ marginBottom: '1.5rem', color: '#666', fontSize: '14px' }}>
              We deliver to Leeds, Derby, and Sheffield. Please select your location:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {locations.map(loc => (
                <button
                  key={loc}
                  onClick={() => {
                    onLocationChange(loc)
                    setShowModal(false)
                  }}
                  style={{
                    padding: '12px',
                    border: currentLocation === loc ? '2px solid #667eea' : '1px solid #ddd',
                    borderRadius: '8px',
                    background: currentLocation === loc ? '#f0f4ff' : 'white',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
