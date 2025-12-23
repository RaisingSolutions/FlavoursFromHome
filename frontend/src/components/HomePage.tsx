interface HomePageProps {
  categories: any[]
  products: any[]
  selectedCategory: number | null
  cart: any[]
  onCategoryFilter: (categoryId: number | null) => void
  onAddToCart: (product: any) => void
  onUpdateQuantity: (productId: number, change: number) => void
}

export default function HomePage({ 
  categories, 
  products, 
  selectedCategory, 
  cart,
  onCategoryFilter, 
  onAddToCart,
  onUpdateQuantity
}: HomePageProps) {
  return (
    <>
      <section className="hero">
        <h1>WELCOME TO FLAVOURS FROM HOME</h1>
        <p>Authentic ingredients delivered to your door</p>
        <div className="delivery-info">
          <div className="info-card">
            <span className="info-icon">🚚</span>
            <p><strong>Free Home Delivery in Leeds</strong><br/>On orders over £20</p>
          </div>
          <div className="info-card">
            <span className="info-icon">📦</span>
            <p><strong>Collection Available</strong><br/>Contact Sivaji at <a href="tel:07507000525">07507 000525</a></p>
          </div>
        </div>
      </section>

      <section className="categories">
        <h2>Shop by Category</h2>
        <div className="category-filters">
          <button 
            className={`filter-btn ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => onCategoryFilter(null)}
          >
            All Products
          </button>
          {categories.map((category: any) => (
            <button 
              key={category.id}
              className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => onCategoryFilter(category.id)}
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
                      onClick={() => onUpdateQuantity(product.id, -1)}
                    >
                      -
                    </button>
                    <span className="quantity">
                      {cart.find(item => item.id === product.id)?.quantity}
                    </span>
                    <button 
                      className="qty-btn"
                      onClick={() => onUpdateQuantity(product.id, 1)}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => onAddToCart(product)}
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
  )
}
