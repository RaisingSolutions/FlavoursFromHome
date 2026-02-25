import { useState } from 'react'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image_url?: string
  has_limit?: boolean
  max_per_order?: number
}

interface CheckoutPageProps {
  cart: CartItem[]
  cartCount: number
  location: string
  onBackToCart: () => void
  onShowToast: (message: string, type: 'success' | 'error') => void
}

export default function CheckoutPage({ 
  cart, 
  cartCount, 
  location,
  onBackToCart,
  onShowToast
}: CheckoutPageProps) {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [postcode, setPostcode] = useState('')
  const [addresses, setAddresses] = useState<string[]>([])
  const [searchingAddress, setSearchingAddress] = useState(false)
  const [orderType, setOrderType] = useState<'delivery' | 'collection'>('delivery')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; amount: number; isEventDiscount?: boolean; percentage?: number; maxDiscount?: number } | null>(null)
  const [verifyingCoupon, setVerifyingCoupon] = useState(false)

  const totalAmount = cart.reduce((sum, item) => {
    return sum + (item.price * item.quantity)
  }, 0)
  
  const discount = appliedCoupon 
    ? appliedCoupon.isEventDiscount 
      ? Math.min(totalAmount * (appliedCoupon.percentage! / 100), appliedCoupon.maxDiscount!)
      : appliedCoupon.amount
    : 0
  
  const finalAmount = Math.max(0, totalAmount - discount)
  const isDeliveryMinimumMet = totalAmount >= 20

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    
    setVerifyingCoupon(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/payment/verify-coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode })
      })

      const data = await response.json()
      
      if (response.ok) {
        if (data.isEventDiscount) {
          const discountAmount = Math.min(totalAmount * 0.15, 40)
          setAppliedCoupon({ 
            code: couponCode, 
            amount: discountAmount,
            isEventDiscount: true,
            percentage: 15,
            maxDiscount: 40
          })
          onShowToast(`Event discount applied! 15% off (£${discountAmount.toFixed(2)})`, 'success')
        } else {
          setAppliedCoupon({ code: couponCode, amount: data.amount })
          onShowToast(`Coupon applied! £${data.amount} discount`, 'success')
        }
      } else {
        onShowToast(data.error || 'Invalid coupon code', 'error')
      }
    } catch {
      onShowToast('Failed to verify coupon', 'error')
    } finally {
      setVerifyingCoupon(false)
    }
  }

  const isValidPostcode = (pc: string) => {
    const cleaned = pc.toUpperCase().replace(/\s/g, '')
    return cleaned.startsWith('LS') || cleaned.startsWith('DE') || cleaned.startsWith('S')
  }

  const handleSearchAddress = async () => {
    if (!postcode.trim()) {
      onShowToast('Please enter a postcode', 'error')
      return
    }

    if (!isValidPostcode(postcode)) {
      onShowToast('We only deliver to Leeds (LS), Derby (DE), and Sheffield (S) postcodes', 'error')
      return
    }

    setSearchingAddress(true)
    try {
      const response = await fetch(`https://api.postcodes.io/postcodes/${postcode.replace(/\s/g, '')}`)
      const data = await response.json()
      
      if (response.ok && data.status === 200) {
        const result = data.result
        const city = result.admin_district || result.parliamentary_constituency || ''
        
        // Validate city matches location
        const cityMatch = 
          (location === 'Leeds' && city.toLowerCase().includes('leeds')) ||
          (location === 'Derby' && city.toLowerCase().includes('derby')) ||
          (location === 'Sheffield' && city.toLowerCase().includes('sheffield'))
        
        if (!cityMatch) {
          onShowToast(`This postcode is not in ${location}. Please select ${location} as your location or use a ${location} postcode.`, 'error')
          return
        }
        
        setAddresses(['verified'])
        setAddress(`${location}, ${postcode.toUpperCase()}`)
        onShowToast('Postcode verified! Please enter your street address.', 'success')
      } else {
        onShowToast('Invalid postcode', 'error')
      }
    } catch (err) {
      console.error('Address search error:', err)
      onShowToast('Failed to verify postcode', 'error')
    } finally {
      setSearchingAddress(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const digits = phoneNumber.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 11) {
      onShowToast('Please enter a valid UK phone number (10-11 digits)', 'error')
      return
    }
    
    if (orderType === 'delivery' && !isDeliveryMinimumMet) {
      onShowToast('Delivery orders must be over £20. Please add more items or choose collection.', 'error')
      return
    }
    
    setIsSubmitting(true)

    try {
      const customerInfo = {
        firstName,
        email,
        phoneNumber,
        address: orderType === 'delivery' ? `${streetAddress}, ${address}` : 'Collection',
        orderType,
        location
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/payment/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, customerInfo, couponCode: appliedCoupon?.code })
      })

      const { url } = await response.json()
      window.location.href = url
    } catch (err) {
      onShowToast('Failed to initiate payment. Please try again.', 'error')
      setIsSubmitting(false)
    }
  }

  return (
    <section className="checkout-page">
      <div className="checkout-header">
        <h2>Checkout</h2>
      </div>

      <div className="checkout-content">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Order Type</h3>
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="orderType"
                  value="delivery"
                  checked={orderType === 'delivery'}
                  onChange={(e) => setOrderType(e.target.value as 'delivery')}
                />
                <span>🚚 Home Delivery (Min £20)</span>
              </label>
              
              <label className="payment-option">
                <input
                  type="radio"
                  name="orderType"
                  value="collection"
                  checked={orderType === 'collection'}
                  onChange={(e) => setOrderType(e.target.value as 'collection')}
                />
                <span>📦 Collection (No minimum)</span>
              </label>
            </div>
            {orderType === 'delivery' && !isDeliveryMinimumMet && (
              <div className="error-message" style={{ marginTop: '1rem' }}>
                Delivery requires a minimum order of £20. Current total: £{totalAmount.toFixed(2)}
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>Contact Information</h3>
            
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            {orderType === 'delivery' && (
              <>
                <div className="form-group">
                  <label htmlFor="postcode">Postcode *</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      id="postcode"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                      placeholder="e.g. LS17 8RX, DE1 1AA, S1 1AA"
                      style={{ flex: 1 }}
                    />
                    <button 
                      type="button" 
                      className="btn-primary"
                      onClick={handleSearchAddress}
                      disabled={searchingAddress}
                    >
                      {searchingAddress ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                </div>

                {addresses.length > 0 && (
                  <div className="form-group">
                    <label htmlFor="streetAddress">Street Address *</label>
                    <input
                      type="text"
                      id="streetAddress"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="e.g., 85 High Ash Avenue"
                      required
                    />
                    <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>Full address: {streetAddress ? `${streetAddress}, ${address}` : address}</small>
                  </div>
                )}
              </>
            )}
            {orderType === 'collection' && (
              <div className="info-card" style={{ marginTop: '1rem' }}>
                <span className="info-icon">📍</span>
                <p><strong>Collection Details</strong><br/>Contact Sivaji at <a href="tel:07507000525">07507 000525</a> to arrange collection</p>
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>Payment Method</h3>
            <p className="payment-note">💳 Secure online payment via Stripe</p>
            <p className="payment-note" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>You will be redirected to complete your payment securely</p>
          </div>

          <div className="form-section">
            <h3>Coupon Code</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={!!appliedCoupon}
                />
              </div>
              {appliedCoupon ? (
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setAppliedCoupon(null)
                    setCouponCode('')
                  }}
                >
                  Remove
                </button>
              ) : (
                <button 
                  type="button" 
                  className="btn-primary"
                  onClick={handleApplyCoupon}
                  disabled={verifyingCoupon || !couponCode.trim()}
                >
                  {verifyingCoupon ? 'Verifying...' : 'Apply'}
                </button>
              )}
            </div>
            {appliedCoupon && (
              <div style={{ marginTop: '10px', padding: '10px', background: '#d4edda', borderRadius: '4px', color: '#155724' }}>
                ✓ {appliedCoupon.isEventDiscount ? 'Event discount' : `Coupon "${appliedCoupon.code}"`} applied - £{discount.toFixed(2)} discount
                {appliedCoupon.isEventDiscount && <div style={{ fontSize: '0.85rem', marginTop: '5px' }}>10% off (max £40)</div>}
              </div>
            )}
          </div>

          <div className="order-summary-checkout">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cart.map(item => (
                <div key={item.id} className="summary-item">
                  <span>{item.name} x{item.quantity}</span>
                  <span>£{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-subtotal">
              <span>Subtotal</span>
              <span>£{totalAmount.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className="summary-discount">
                <span>Discount ({appliedCoupon.code})</span>
                <span style={{ color: '#28a745' }}>-£{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-total">
              <span>Total ({cartCount} items)</span>
              <span>£{finalAmount.toFixed(2)}</span>
            </div>
          </div>



          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onBackToCart}>
              Back to Cart
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Redirecting...' : 'Proceed to Payment'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
