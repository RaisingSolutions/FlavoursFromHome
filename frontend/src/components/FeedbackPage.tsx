import { useState, useEffect } from 'react'

export default function FeedbackPage() {
  const orderId = new URLSearchParams(window.location.search).get('order')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  
  const [productRatings, setProductRatings] = useState<any>({})
  const [deliveryRating, setDeliveryRating] = useState(0)
  const [driverRating, setDriverRating] = useState(0)
  const [deliveryComments, setDeliveryComments] = useState('')

  useEffect(() => {
    if (orderId) fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/feedback/order/${orderId}`)
      const data = await response.json()
      
      if (data.feedback_submitted) {
        setAlreadySubmitted(true)
      } else {
        setOrder(data)
        const ratings: any = {}
        data.order_items.forEach((item: any) => {
          ratings[item.products.id] = { rating: 0, comment: '' }
        })
        setProductRatings(ratings)
      }
    } catch (err) {
      console.error('Failed to fetch order')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    const allRated = Object.values(productRatings).every((r: any) => r.rating > 0) && deliveryRating > 0 && driverRating > 0
    
    if (!allRated) {
      alert('Please rate all products, delivery, and driver')
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/feedback/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          productRatings,
          deliveryRating,
          driverRating,
          deliveryComments
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setCouponCode(data.couponCode)
        setSubmitted(true)
      } else {
        if (data.message) {
          setAlreadySubmitted(true)
        } else {
          alert(data.error || 'Failed to submit feedback')
        }
      }
    } catch (err) {
      alert('Failed to submit feedback')
    }
  }

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>

  if (alreadySubmitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', maxWidth: '500px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
          <h2 style={{ color: '#2c5f2d', marginBottom: '15px' }}>Thank You!</h2>
          <p style={{ color: '#666', fontSize: '16px' }}>Thanks for submitting your feedback! It's really valuable to us. You've already received your voucher for this order.</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', maxWidth: '500px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
          <h2 style={{ color: '#2c5f2d', marginBottom: '15px' }}>Thank You!</h2>
          <p style={{ color: '#666', fontSize: '16px', marginBottom: '30px' }}>Your feedback has been submitted successfully!</p>
          <div style={{ background: '#f0f8ff', padding: '20px', borderRadius: '8px', border: '3px dashed #667eea' }}>
            <h3 style={{ color: '#667eea', marginBottom: '10px' }}>Your £2 Voucher Code</h3>
            <div style={{ background: 'white', padding: '15px', borderRadius: '8px', fontSize: '28px', fontWeight: 'bold', letterSpacing: '2px', color: '#2c5f2d', margin: '15px 0' }}>
              {couponCode}
            </div>
            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Check your email for details!</p>
          </div>
        </div>
      </div>
    )
  }

  const StarRating = ({ value, onChange }: { value: number; onChange: (rating: number) => void }) => (
    <div style={{ display: 'flex', gap: '5px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => onChange(star)}
          style={{ fontSize: '32px', cursor: 'pointer', color: star <= value ? '#ffc107' : '#ddd' }}
        >
          ★
        </span>
      ))}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#2c5f2d', marginBottom: '10px' }}>Rate Your Order</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>Share your feedback and get £2 off your next order!</p>

        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '20px' }}>Rate Your Products</h3>
          {order?.order_items.map((item: any) => (
            <div key={item.products.id} style={{ marginBottom: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
              <h4 style={{ marginBottom: '15px' }}>{item.products.name}</h4>
              <StarRating 
                value={productRatings[item.products.id]?.rating || 0}
                onChange={(rating) => setProductRatings({ ...productRatings, [item.products.id]: { ...productRatings[item.products.id], rating } })}
              />
              <textarea
                placeholder="Any comments about this product? (optional)"
                value={productRatings[item.products.id]?.comment || ''}
                onChange={(e) => setProductRatings({ ...productRatings, [item.products.id]: { ...productRatings[item.products.id], comment: e.target.value } })}
                style={{ width: '100%', marginTop: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' }}
              />
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '15px' }}>Rate Delivery Service</h3>
          <StarRating value={deliveryRating} onChange={setDeliveryRating} />
        </div>

        <div style={{ marginBottom: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '15px' }}>Rate Driver</h3>
          <StarRating value={driverRating} onChange={setDriverRating} />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Additional Comments</label>
          <textarea
            placeholder="Tell us about your overall experience..."
            value={deliveryComments}
            onChange={(e) => setDeliveryComments(e.target.value)}
            style={{ width: '100%', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '100px', fontSize: '14px' }}
          />
        </div>

        <button
          onClick={handleSubmit}
          style={{ width: '100%', padding: '15px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Submit Feedback & Get £2 Voucher
        </button>
      </div>
    </div>
  )
}
