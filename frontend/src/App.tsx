import { useState, useEffect } from 'react'
import './App.css'
import * as API from './API'
import HomePage from './components/HomePage'
import CartPage from './components/CartPage'
import CheckoutPage from './components/CheckoutPage'
import SuccessPage from './components/SuccessPage'
import FeedbackPage from './components/FeedbackPage'
import Toast from './components/Toast'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image_url?: string
  has_limit?: boolean
  max_per_order?: number
}

function App() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart')
    const timestamp = localStorage.getItem('cartTimestamp')
    
    if (saved && timestamp) {
      const now = Date.now()
      const savedTime = parseInt(timestamp)
      const tenMinutes = 10 * 60 * 1000
      
      if (now - savedTime < tenMinutes) {
        return JSON.parse(saved)
      } else {
        localStorage.removeItem('cart')
        localStorage.removeItem('cartTimestamp')
      }
    }
    return []
  })
  const [cartCount, setCartCount] = useState(0)
  const [currentPage, setCurrentPage] = useState<'home' | 'cart' | 'checkout' | 'success' | 'feedback'>(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('order')) return 'feedback'
    if (params.get('success') === 'true') return 'success'
    return 'home'
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('order')) {
      setCurrentPage('feedback')
    } else if (params.get('success') === 'true') {
      setCurrentPage('success')
    }
  }, [])

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart))
      localStorage.setItem('cartTimestamp', Date.now().toString())
    } else {
      localStorage.removeItem('cart')
      localStorage.removeItem('cartTimestamp')
    }
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0))
  }, [cart])

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
        const newQty = existingItem.quantity + 1
        if (product.has_limit && newQty > product.max_per_order) {
          setToast({ message: `Max ${product.max_per_order} ${product.name} per order`, type: 'error' })
          return prevCart
        }
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQty }
            : item
        )
      } else {
        return [...prevCart, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image_url: product.image_url,
          has_limit: product.has_limit,
          max_per_order: product.max_per_order
        }]
      }
    })
  }

  const updateQuantity = (productId: number, change: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + change
          if (change > 0 && item.has_limit && newQuantity > (item.max_per_order || 0)) {
            setToast({ message: `Max ${item.max_per_order} ${item.name} per order`, type: 'error' })
            return item
          }
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null
        }
        return item
      }).filter(Boolean) as CartItem[]
    })
  }

  return (
    currentPage === 'feedback' ? (
      <FeedbackPage />
    ) : (
      <div className="app">
        <nav className="navbar">
          <div className="navbar-brand" onClick={() => setCurrentPage('home')} style={{ cursor: 'pointer' }}>
            <img src="https://res.cloudinary.com/dulm4r5mo/image/upload/v1763129727/FFH_Logo_f47yft.png" alt="FFH Logo" className="navbar-logo" />
            Flavours From Home
          </div>
          <div className="navbar-actions">
            <button className="cart-btn" onClick={() => setCurrentPage('cart')}>
              🛒 Cart ({cartCount})
            </button>
          </div>
        </nav>
        
        <main className="main-content">
          {currentPage === 'success' ? (
            <SuccessPage 
              onContinueShopping={() => {
                setCart([])
                setCartCount(0)
                setCurrentPage('home')
              }}
            />
          ) : currentPage === 'checkout' ? (
            <CheckoutPage 
              cart={cart}
              cartCount={cartCount}
              onBackToCart={() => setCurrentPage('cart')}
              onShowToast={(message, type) => setToast({ message, type })}
            />
          ) : currentPage === 'cart' ? (
            <CartPage 
              cart={cart}
              cartCount={cartCount}
              onUpdateQuantity={updateQuantity}
              onContinueShopping={() => setCurrentPage('home')}
              onCheckout={() => setCurrentPage('checkout')}
              onShowToast={(message, type) => setToast({ message, type })}
            />
          ) : (
            <HomePage 
              categories={categories}
              products={products}
              selectedCategory={selectedCategory}
              cart={cart}
              onCategoryFilter={handleCategoryFilter}
              onAddToCart={addToCart}
              onUpdateQuantity={updateQuantity}
              onShowToast={(message, type) => setToast({ message, type })}
            />
          )}
        </main>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    )
  )
}

export default App