import { useState, useEffect } from 'react'

interface EventDetailsPageProps {
  eventId: number
  onBack: () => void
  onShowToast: (message: string, type: 'success' | 'error') => void
}

export default function EventDetailsPage({ eventId, onBack, onShowToast }: EventDetailsPageProps) {
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [adultTickets, setAdultTickets] = useState(0)
  const [childTickets, setChildTickets] = useState(0)
  const [parentTickets, setParentTickets] = useState(0)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percentage: number } | null>(null)
  const [verifyingCoupon, setVerifyingCoupon] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/events/${eventId}`)
      const data = await response.json()
      setEvent(data)
    } catch (error) {
      onShowToast('Failed to load event', 'error')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = (adultTickets * (event?.adult_price || 0)) + (childTickets * (event?.child_price || 0))
  const discount = appliedCoupon ? subtotal * (appliedCoupon.percentage / 100) : 0

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    
    setVerifyingCoupon(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/events/coupon/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode })
      })

      const data = await response.json()
      
      if (response.ok) {
        setAppliedCoupon({ code: couponCode, percentage: data.percentage })
        onShowToast(`Coupon applied! ${data.percentage}% off`, 'success')
      } else {
        onShowToast(data.error || 'Invalid coupon code', 'error')
      }
    } catch {
      onShowToast('Failed to verify coupon', 'error')
    } finally {
      setVerifyingCoupon(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const totalTickets = adultTickets + childTickets + parentTickets
    const remaining = event.total_capacity - event.total_sold

    if (totalTickets === 0) {
      onShowToast('Please select at least one ticket', 'error')
      return
    }

    if (totalTickets > remaining) {
      onShowToast(`Only ${remaining} tickets available`, 'error')
      return
    }

    if (!marketingConsent) {
      setShowConfirmDialog(true)
      return
    }

    proceedToPayment()
  }

  const proceedToPayment = async () => {
    setIsSubmitting(true)
    setShowConfirmDialog(false)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/events/${eventId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          customerInfo: { firstName, email, phoneNumber, marketingConsent },
          adultTickets,
          childTickets,
          parentTickets,
          couponCode: appliedCoupon?.code
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        window.location.href = data.url
      } else {
        onShowToast(data.error || 'Booking failed', 'error')
        setIsSubmitting(false)
      }
    } catch (error) {
      onShowToast('Failed to process booking', 'error')
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Loading event...</div>
  }

  if (!event) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>Event not found</div>
  }

  return (
    <section className="event-details-page">
      <button onClick={onBack} style={{ marginBottom: '20px', padding: '10px 20px', cursor: 'pointer' }}>
        ← Back to Events
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '20px' }}>
        <div>
          <img src={event.image_url} alt={event.name} style={{ width: '100%', borderRadius: '12px' }} />
          
          <h1 style={{ marginTop: '20px' }}>{event.name}</h1>
          <p style={{ color: '#666', lineHeight: '1.6' }}>{event.description}</p>

          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span>📅</span>
              <span>{new Date(event.event_date).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>📍</span>
              <span>{event.venue_address}</span>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '30px',
            borderRadius: '12px',
            marginTop: '30px',
            color: 'white'
          }}>
            <h3 style={{ margin: '0 0 15px', fontSize: '22px' }}>🎁 Special Offer!</h3>
            <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.6' }}>
              Book tickets and receive <strong>10% OFF</strong> every month until end of 2026!
              <br/><br/>
              You'll receive a unique discount code via email each month (max £40 discount per order).
            </p>
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit} style={{
            background: '#f9f9f9',
            padding: '30px',
            borderRadius: '12px',
            border: '2px solid #e0e0e0'
          }}>
            <h2 style={{ marginTop: 0 }}>Book Tickets</h2>

            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z\s]/g, '')
                  setFirstName(value)
                }}
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9+\s()-]/g, '')
                  setPhoneNumber(value)
                }}
                required
              />
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                background: 'white',
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Adult Tickets</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    £{event.adult_price} each
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setAdultTickets(Math.max(0, adultTickets - 1))}
                    style={{ padding: '5px 15px', fontSize: '18px' }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>
                    {adultTickets}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAdultTickets(adultTickets + 1)}
                    style={{ padding: '5px 15px', fontSize: '18px' }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                background: 'white',
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Child Tickets</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    £{event.child_price} each
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setChildTickets(Math.max(0, childTickets - 1))}
                    style={{ padding: '5px 15px', fontSize: '18px' }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>
                    {childTickets}
                  </span>
                  <button
                    type="button"
                    onClick={() => setChildTickets(childTickets + 1)}
                    style={{ padding: '5px 15px', fontSize: '18px' }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                background: '#e8f5e9',
                borderRadius: '8px',
                border: '2px dashed #4caf50',
                marginBottom: '15px'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#2e7d32' }}>Visiting Parents</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    FREE
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setParentTickets(Math.max(0, parentTickets - 1))}
                    style={{ padding: '5px 15px', fontSize: '18px' }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>
                    {parentTickets}
                  </span>
                  <button
                    type="button"
                    onClick={() => setParentTickets(parentTickets + 1)}
                    style={{ padding: '5px 15px', fontSize: '18px' }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{
                padding: '15px',
                background: '#f0f0f0',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                  Total Capacity: {event.total_capacity}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: event.total_capacity - event.total_sold > 0 ? '#28a745' : '#dc3545' }}>
                  {event.total_capacity - event.total_sold} tickets remaining
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>Coupon Code (Optional)</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  disabled={!!appliedCoupon}
                  style={{ flex: 1 }}
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null)
                      setCouponCode('')
                    }}
                    style={{ padding: '10px 20px' }}
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={verifyingCoupon || !couponCode.trim()}
                    style={{ padding: '10px 20px' }}
                  >
                    {verifyingCoupon ? 'Verifying...' : 'Apply'}
                  </button>
                )}
              </div>
              {appliedCoupon && (
                <div style={{ marginTop: '10px', padding: '10px', background: '#d4edda', borderRadius: '4px', color: '#155724' }}>
                  ✓ Coupon "{appliedCoupon.code}" applied - {appliedCoupon.percentage}% off
                </div>
              )}
            </div>

            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: 'white',
              borderRadius: '8px'
            }}>
              {subtotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', marginBottom: '10px' }}>
                  <span>Subtotal:</span>
                  <span>£{subtotal.toFixed(2)}</span>
                </div>
              )}
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', marginBottom: '10px', color: '#28a745' }}>
                  <span>Discount ({appliedCoupon?.percentage}%):</span>
                  <span>-£{discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', borderTop: '2px solid #e0e0e0', paddingTop: '10px' }}>
                <span>Total:</span>
                <span>£{(subtotal - discount).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  style={{ marginTop: '4px' }}
                />
                <span style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  I agree to receive Flavours From Home monthly discount codes via email till the end of 2026
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '15px',
                marginTop: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.6 : 1
              }}
            >
              {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </form>
        </div>
      </div>

      {showConfirmDialog && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <h2 style={{ marginTop: 0, color: '#dc3545' }}>⚠️ Miss Out on 10% Discount?</h2>
            <p style={{ fontSize: '16px', lineHeight: '1.6', margin: '20px 0' }}>
              Are you sure you want to miss out on <strong>10% OFF every month until end of 2026</strong>?
              <br/><br/>
              You won't receive any monthly discount codes if you proceed without consent.
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowConfirmDialog(false)}
                style={{
                  padding: '12px 30px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Go Back
              </button>
              <button
                onClick={proceedToPayment}
                style={{
                  padding: '12px 30px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Yes, Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
