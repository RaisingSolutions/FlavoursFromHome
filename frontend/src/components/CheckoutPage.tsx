import { useState } from 'react'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image_url?: string
}

interface CheckoutPageProps {
  cart: CartItem[]
  cartCount: number
  onBackToCart: () => void
  onShowToast: (message: string, type: 'success' | 'error') => void
}

export default function CheckoutPage({ 
  cart, 
  cartCount, 
  onBackToCart,
  onShowToast
}: CheckoutPageProps) {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  const [orderType, setOrderType] = useState<'delivery' | 'collection'>('delivery')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const isDeliveryMinimumMet = totalAmount >= 20

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
        address: orderType === 'delivery' ? address : 'Collection',
        orderType
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/payment/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, customerInfo })
      })

      if (!response.ok) throw new Error('Failed to create checkout session')

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
              <div className="form-group">
                <label htmlFor="address">Delivery Address *</label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  required
                />
              </div>
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
            <div className="summary-total">
              <span>Total ({cartCount} items)</span>
              <span>£{totalAmount.toFixed(2)}</span>
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
