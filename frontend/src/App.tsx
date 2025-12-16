import { useState, useEffect } from 'react'
import './App.css'
import * as API from './API'
import HomePage from './components/HomePage'
import CartPage from './components/CartPage'
import CheckoutPage from './components/CheckoutPage'
import SuccessPage from './components/SuccessPage'
import Toast from './components/Toast'

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
        localStorage.removeItem('currentPage')
      }
    }
    return []
  })
  const [cartCount, setCartCount] = useState(0)
  const [currentPage, setCurrentPage] = useState<'home' | 'cart' | 'checkout' | 'success'>(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') return 'success'
    const saved = localStorage.getItem('currentPage')
    return (saved as 'home' | 'cart' | 'checkout' | 'success') || 'home'
  })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

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

  useEffect(() => {
    localStorage.setItem('currentPage', currentPage)
  }, [currentPage])

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
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prevCart, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image_url: product.image_url
        }]
      }
    })
  }

  const updateQuantity = (productId: number, change: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + change
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null
        }
        return item
      }).filter(Boolean) as CartItem[]
    })
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-brand">
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
          />
        )}
      </main>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default App