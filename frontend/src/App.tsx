import { useState, useEffect } from 'react'
import './App.css'
import * as API from './API'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image_url?: string
}

function App() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartCount, setCartCount] = useState(0)
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await API.fetchCategories()
      setCategories(data)
    } catch (err) {
      console.error('Failed to fetch categories')
    }
  }

  const fetchProducts = async () => {
    try {
      const data = await API.fetchProducts()
      setProducts(data)
    } catch (err) {
      console.error('Failed to fetch products')
    }
  }

  const handleCategoryFilter = async (categoryId: number | null) => {
    setSelectedCategory(categoryId)
    try {
      if (categoryId === null) {
        const data = await API.fetchProducts()
        setProducts(data)
      } else {
        const data = await API.fetchProductsByCategory(categoryId)
        setProducts(data)
      }
    } catch (err) {
      console.error('Failed to fetch products')
    }
  }

  const addToCart = (product: any) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      
      if (existingItem) {
        const updatedCart = prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        setCartCount(updatedCart.reduce((sum, item) => sum + item.quantity, 0))
        return updatedCart
      } else {
        const newCart = [...prevCart, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image_url: product.image_url
        }]
        setCartCount(newCart.reduce((sum, item) => sum + item.quantity, 0))
        return newCart
      }
    })
  }

  const updateQuantity = (productId: number, change: number) => {
    setCart(prevCart => {
      const updatedCart = prevCart.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + change
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null
        }
        return item
      }).filter(Boolean) as CartItem[]
      
      setCartCount(updatedCart.reduce((sum, item) => sum + item.quantity, 0))
      return updatedCart
    })
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-brand">
          <img src="/src/FFH_Logo.png" alt="FFH Logo" className="navbar-logo" />
          Flavours From Home
        </div>
        <div className="navbar-actions">
          <button className="cart-btn" onClick={() => setShowCart(!showCart)}>
            🛒 Cart ({cartCount})
          </button>
        </div>
      </nav>
      
      <main className="main-content">
        {showCart ? (
          <section className="cart-page">
            <div className="cart-header">
              <h2>Your Cart</h2>
            </div>
            
            <div className="cart-content">
              <div className="cart-items">
                {cart.length === 0 ? (
                  <div className="empty-cart">
                    <p>Your cart is empty</p>
                    <button className="continue-shopping" onClick={() => setShowCart(false)}>
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
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          -
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, 1)}
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
                    <button className="checkout-btn">
                      Proceed to Checkout
                    </button>
                    <button className="continue-shopping" onClick={() => setShowCart(false)}>
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            <section className="hero">
              <h1>Welcome to Flavours From Home</h1>
              <p>Authentic ingredients delivered to your door</p>
            </section>

            <section className="categories">
              <h2>Shop by Category</h2>
              <div className="category-filters">
                <button 
                  className={`filter-btn ${selectedCategory === null ? 'active' : ''}`}
                  onClick={() => handleCategoryFilter(null)}
                >
                  All Products
                </button>
                {categories.map((category: any) => (
                  <button 
                    key={category.id}
                    className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                    onClick={() => handleCategoryFilter(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </section>

            <section className="products">
              <h2>Our Products</h2>
              <div className="products-grid">
                {products.map((product: any) => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} />
                      ) : (
                        <div className="placeholder-image">
                          <span>No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-description">{product.description}</p>
                      <div className="product-details">
                        <span className="price">£{product.price}</span>
                        <span className="weight">{product.weight}</span>
                      </div>
                      {cart.find(item => item.id === product.id) ? (
                        <div className="quantity-controls">
                          <button 
                            className="qty-btn"
                            onClick={() => updateQuantity(product.id, -1)}
                          >
                            -
                          </button>
                          <span className="quantity">
                            {cart.find(item => item.id === product.id)?.quantity}
                          </span>
                          <button 
                            className="qty-btn"
                            onClick={() => updateQuantity(product.id, 1)}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="add-to-cart-btn"
                          onClick={() => addToCart(product)}
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default App