interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image_url?: string
  has_limit?: boolean
  max_per_order?: number
}

interface CartPageProps {
  cart: CartItem[]
  cartCount: number
  onUpdateQuantity: (productId: number, change: number) => void
  onContinueShopping: () => void
  onCheckout: () => void
  onShowToast: (message: string, type: 'success' | 'error') => void
}

export default function CartPage({ 
  cart, 
  cartCount, 
  onUpdateQuantity, 
  onContinueShopping,
  onCheckout,
  onShowToast
}: CartPageProps) {
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)
  }

  return (
    <section className="cart-page">
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
                  <h3>{item.name}</h3>
                  <p className="item-price">£{item.price}</p>
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
                  £{(item.price * item.quantity).toFixed(2)}
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
