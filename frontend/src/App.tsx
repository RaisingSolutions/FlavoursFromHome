import { useState, useEffect } from 'react'
import './App.css'
import * as API from './API'

function App() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

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

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-brand">
          <img src="/src/FFH_Logo.png" alt="FFH Logo" className="navbar-logo" />
          Flavours From Home
        </div>
        <div className="navbar-actions">
          <button className="cart-btn">
            🛒 Cart (0)
          </button>
        </div>
      </nav>
      
      <main className="main-content">
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
                  <button className="add-to-cart-btn">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App