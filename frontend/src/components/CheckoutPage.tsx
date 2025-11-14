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
  onOrderComplete: () => void
  onShowToast: (message: string, type: 'success' | 'error') => void
}

export default function CheckoutPage({ 
  cart, 
  cartCount, 
  onBackToCart,
  onOrderComplete,
  onShowToast
}: CheckoutPageProps) {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const orderData = {
        first_name: firstName,
        email,
        phone_number: phoneNumber,
        address,
        payment_method: paymentMethod.toUpperCase(),
        total_amount: totalAmount,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) throw new Error('Failed to create order')

      const order = await response.json()
      onShowToast(`Order #${order.id} placed successfully! We'll deliver to ${address}`, 'success')
      onOrderComplete()
    } catch (err) {
      onShowToast('Failed to place order. Please try again.', 'error')
    } finally {
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
            <h3>Delivery Information</h3>
            
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
          </div>

          <div className="form-section">
            <h3>Payment Method</h3>
            <p className="payment-note">Payment will be collected upon delivery</p>
            
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                />
                <span>💵 Cash on Delivery</span>
              </label>
              
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                />
                <span>💳 Card on Delivery</span>
              </label>
            </div>
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
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
