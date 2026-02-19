import LocationSelector from './LocationSelector'

interface HomePageProps {
  categories: any[]
  products: any[]
  deals: any[]
  selectedCategory: number | null
  cart: any[]
  location: string
  onLocationChange: (location: string) => void
  onCategoryFilter: (categoryId: number | null) => void
  onAddToCart: (product: any) => void
  onUpdateQuantity: (productId: number, change: number) => void
  onShowToast: (message: string, type: 'success' | 'error') => void
}

export default function HomePage({ 
  categories, 
  products,
  deals,
  selectedCategory, 
  cart,
  location,
  onLocationChange,
  onCategoryFilter, 
  onAddToCart,
  onUpdateQuantity,
  onShowToast
}: HomePageProps) {
  return (
    <>
      <LocationSelector currentLocation={location} onLocationChange={onLocationChange} />
      
      <section className="hero">
        <h1>WELCOME TO FLAVOURS FROM HOME</h1>
        <p>Authentic ingredients delivered to your door</p>
        <div className="delivery-info">
          <div className="info-card">
            <span className="info-icon">🚚</span>
            <p><strong>Free Home Delivery in Leeds, Derby & Sheffield</strong><br/>On orders over £20</p>
          </div>
          <div className="info-card">
            <span className="info-icon">📅</span>
            <p><strong>Delivery Schedule</strong><br/>We deliver all orders on Wednesdays and Saturdays depending on when you order</p>
          </div>
          <div className="info-card">
            <span className="info-icon">📦</span>
            <p><strong>Collection Available</strong><br/>Contact Sivaji at <a href="tel:07507000525">07507 000525</a></p>
          </div>
        </div>
      </section>

      {deals.length > 0 && (
        <section className="deals-section" style={{
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
          padding: '40px 20px',
          borderRadius: '16px',
          margin: '40px 0',
          boxShadow: '0 10px 30px rgba(255, 107, 107, 0.3)'
        }}>
          <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '30px', fontSize: '32px' }}>🔥 Deal of the Week! 🔥</h2>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            maxWidth: deals.length <= 2 ? '800px' : '100%',
            margin: '0 auto'
          }}>
            {deals.map((deal: any) => {
              const product = { ...deal.product, price: deal.deal_price, originalPrice: deal.product.price }
              return (
                <div key={deal.id} className="product-card" style={{
                  border: '3px solid #ffd700',
                  boxShadow: '0 8px 24px rgba(255, 215, 0, 0.4)',
                  position: 'relative',
                  width: deals.length <= 2 ? '350px' : 'auto',
                  flex: deals.length <= 2 ? '0 0 auto' : '1'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#ffd700',
                    color: '#000',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    zIndex: 1
                  }}>
                    {Math.round(((deal.product.price - deal.deal_price) / deal.product.price) * 100)}% OFF
                  </div>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '16px' }}>£{product.originalPrice}</span>
                        <span className="price" style={{ fontSize: '24px' }}>£{product.price}</span>
                      </div>
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
              )
            })}
          </div>
        </section>
      )}

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
        {products.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            color: 'white',
            margin: '40px auto',
            maxWidth: '600px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>👨‍🍳</div>
            <h2 style={{ fontSize: '28px', marginBottom: '16px', fontWeight: 'bold', color: 'white' }}>Good food takes time!</h2>
            <p style={{ fontSize: '18px', lineHeight: '1.6', opacity: 0.95, color: 'white' }}>Our fresh meals are on the way—shop our other products for now.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product: any) => {
              // Debug: log product to see if origin exists
              if (product.origin) console.log('Product with origin:', product.name, product.origin);
              
              return (
                <div key={product.id} className="product-card" style={{
                  opacity: product.inventory === 0 ? 0.6 : 1,
                  filter: product.inventory === 0 ? 'grayscale(50%)' : 'none'
                }}>
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
                    {product.average_rating && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: '8px 0' }}>
                        <span style={{ color: '#ffc107', fontSize: '16px' }}>
                          {'★'.repeat(Math.round(product.average_rating))}{'☆'.repeat(5 - Math.round(product.average_rating))}
                        </span>
                        <span style={{ fontSize: '14px', color: '#666' }}>({product.rating_count})</span>
                      </div>
                    )}
                    <div className="product-details">
                      <span className="price">£{product.price}</span>
                      <span className="weight">{product.weight}</span>
                      {product.inventory > 0 && product.inventory <= 10 && (
                        <span style={{ color: '#ff6b6b', fontWeight: 'bold', fontSize: '12px' }}>{product.inventory} left</span>
                      )}
                      {product.inventory === 0 && (
                        <span style={{ 
                          background: '#ff6b6b', 
                          color: 'white', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontWeight: 'bold', 
                          fontSize: '11px' 
                        }}>SOLD OUT</span>
                      )}
                    </div>
                    {product.origin && (
                      <div className="origin" style={{ 
                        backgroundColor: 'green', 
                        color: 'white',
                        textAlign: 'center',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        margin: '5px 0',
                        fontSize: '12px'
                      }}>
                        Origin: {product.origin}
                      </div>
                    )}
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
                          onClick={() => {
                            const item = cart.find(i => i.id === product.id)
                            if (product.has_limit && item && item.quantity >= product.max_per_order) {
                              onShowToast(`Max ${product.max_per_order} ${product.name} per order`, 'error')
                            } else {
                              onUpdateQuantity(product.id, 1)
                            }
                          }}
                          disabled={cart.find(item => item.id === product.id)?.quantity >= product.inventory}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="add-to-cart-btn"
                        onClick={() => onAddToCart(product)}
                        disabled={product.inventory === 0}
                      >
                        {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
