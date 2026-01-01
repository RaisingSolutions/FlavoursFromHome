import { useEffect, useState } from 'react'

interface SuccessPageProps {
  onContinueShopping: () => void
}

export default function SuccessPage({ onContinueShopping }: SuccessPageProps) {
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('session_id')
    setSessionId(id)
    
    localStorage.removeItem('cart')
    localStorage.removeItem('cartTimestamp')
  }, [])

  return (
    <div className="success-page" style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
      <h1>Payment Successful!</h1>
      <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>
        Your order has been placed successfully.
      </p>
      <p style={{ color: '#666', marginTop: '1rem' }}>
        You will receive a confirmation via WhatsApp and email shortly.
      </p>
      {sessionId && (
        <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '2rem' }}>
          Session ID: {sessionId}
        </p>
      )}
      <button 
        className="btn-primary" 
        style={{ marginTop: '2rem' }}
        onClick={onContinueShopping}
      >
        Continue Shopping
      </button>
    </div>
  )
}
