import { useState, useEffect } from 'react'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image_url?: string
  has_limit?: boolean
  max_per_order?: number
  isFreeRegipallu?: boolean
}

interface CartPageProps {
  cart: CartItem[]
  cartCount: number
  onUpdateQuantity: (productId: number, change: number) => void
  onContinueShopping: () => void
  onCheckout: () => void
  onShowToast: (message: string, type: 'success' | 'error') => void
  onAddFreeRegipallu?: (regipallu: any) => void
}

export default function CartPage({ 
  cart, 
  cartCount, 
  onUpdateQuantity, 
  onContinueShopping,
  onCheckout,
  onShowToast,
  onAddFreeRegipallu
}: CartPageProps) {
  const [showRegipalluPrompt, setShowRegipalluPrompt] = useState(false)
  const [regipalluOffered, setRegipalluOffered] = useState(false)

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      if (item.isFreeRegipallu) return total
      return total + (item.price * item.quantity)
    }, 0).toFixed(2)
  }

  const cartTotal = parseFloat(getCartTotal())
  const hasFreeRegipallu = cart.some(item => item.isFreeRegipallu)

  useEffect(() => {
    if (cartTotal >= 30 && !regipalluOffered && !hasFreeRegipallu && cart.length > 0 && !showRegipalluPrompt) {
      setShowRegipalluPrompt(true)
    }
  }, [cartTotal, regipalluOffered, hasFreeRegipallu, cart.length, showRegipalluPrompt])

  useEffect(() => {
    if (cartTotal < 30) {
      const freeRegipallu = cart.find(item => item.isFreeRegipallu)
      if (freeRegipallu) {
        onUpdateQuantity(freeRegipallu.id, -freeRegipallu.quantity)
        onShowToast('Free Regipallu removed (cart below £30)', 'error')
        setRegipalluOffered(false)
        setShowRegipalluPrompt(false)
      }
    }
  }, [cartTotal, cart])

  const handleAddFreeRegipallu = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/products`)
      const products = await response.json()
      const regipallu = products.find((p: any) => p.name.toLowerCase().replace(/\s/g, '').includes('regipallu'))
      
      if (regipallu && onAddFreeRegipallu) {
        onAddFreeRegipallu({ ...regipallu, isFreeRegipallu: true })
        onShowToast('Free Regipallu added to your cart!', 'success')
      } else {
        onShowToast('Regipallu product not found', 'error')
      }
    } catch (err) {
      console.error('Error:', err)
      onShowToast('Failed to add free Regipallu', 'error')
    }
    setShowRegipalluPrompt(false)
    setRegipalluOffered(true)
  }

  return (
    <section className="cart-page">
      {showRegipalluPrompt && (
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
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ color: '#28a745', marginBottom: '1rem' }}>🎉 Special Offer!</h3>
            <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
              Your basket is over £30! Would you like to add a <strong>FREE portion of Regipallu</strong>?
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setShowRegipalluPrompt(false)
                  setRegipalluOffered(true)
                }}
                style={{ flex: 1 }}
              >
                No Thanks
              </button>
              <button 
                className="btn-primary" 
                onClick={handleAddFreeRegipallu}
                style={{ flex: 1 }}
              >
                Yes, Add It!
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="cart-header">
        <h2>Your Cart</h2>
      </div>
      
      <div className="cart-content">
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty</p>
              <button className="continue-shopping" onClick={onContinueShopping}>
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} />
                  ) : (
                    <div className="placeholder-image">
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                <div className="item-details">
                  <h3>
                    {item.name}
                    {item.isFreeRegipallu && <span style={{ color: '#28a745', fontWeight: 'bold', marginLeft: '8px' }}>(FREE)</span>}
                  </h3>
                  <p className="item-price">{item.isFreeRegipallu ? 'FREE' : `£${item.price}`}</p>
                </div>
                <div className="quantity-controls">
                  <button 
                    className="qty-btn"
                    onClick={() => onUpdateQuantity(item.id, -1)}
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    className="qty-btn"
                    onClick={() => {
                      if (item.has_limit && item.quantity >= (item.max_per_order || 0)) {
                        onShowToast(`Max ${item.max_per_order} ${item.name} per order`, 'error')
                      } else {
                        onUpdateQuantity(item.id, 1)
                      }
                    }}
                  >
                    +
                  </button>
                </div>
                <div className="item-total">
                  {item.isFreeRegipallu ? 'FREE' : `£${(item.price * item.quantity).toFixed(2)}`}
                </div>
              </div>
            ))
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="cart-summary">
            <div className="summary-content">
              <h3>Order Summary</h3>
              <div className="summary-line">
                <span>Subtotal ({cartCount} items)</span>
                <span>£{getCartTotal()}</span>
              </div>
              <div className="summary-line total">
                <span>Total</span>
                <span>£{getCartTotal()}</span>
              </div>
              <button className="checkout-btn" onClick={onCheckout}>
                Proceed to Checkout
              </button>
              <button className="continue-shopping" onClick={onContinueShopping}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
