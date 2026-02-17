/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import * as API from '../APIS'

export default function DealOfTheWeekTab() {
  const [products, setProducts] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [dealPrice, setDealPrice] = useState('')

  const fetchProducts = async () => {
    try {
      const data = await API.fetchProducts()
      setProducts(data)
    } catch {
      console.error('Failed to fetch products')
    }
  }

  const fetchDeals = async () => {
    try {
      const data = await API.fetchDeals()
      setDeals(data)
    } catch {
      console.error('Failed to fetch deals')
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchDeals()
  }, [])

  const handleCreateDeal = async () => {
    if (!selectedProduct || !dealPrice) {
      alert('Please select a product and enter deal price')
      return
    }

    const product = products.find(p => p.id === parseInt(selectedProduct))
    if (parseFloat(dealPrice) >= product.price) {
      alert('Deal price must be lower than original price')
      return
    }

    try {
      const success = await API.createDeal(parseInt(selectedProduct), parseFloat(dealPrice))
      if (success) {
        alert('Deal created successfully!')
        setSelectedProduct('')
        setDealPrice('')
        fetchDeals()
      }
    } catch {
      alert('Failed to create deal')
    }
  }

  const handleDeleteDeal = async (id: number) => {
    if (!confirm('Remove this deal?')) return

    try {
      const success = await API.deleteDeal(id)
      if (success) {
        fetchDeals()
      }
    } catch {
      alert('Failed to delete deal')
    }
  }

  return (
    <div className="deal-section">
      <div className="section-header">
        <h2>🔥 Deal of the Week</h2>
        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Feature special discounted products</p>
      </div>

      <div className="create-form">
        <h3>Create New Deal</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '10px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Product</label>
            <select 
              value={selectedProduct} 
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
            >
              <option value="">Select Product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - £{product.price}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Deal Price (£)</label>
            <input
              type="number"
              step="0.01"
              placeholder="Deal Price"
              value={dealPrice}
              onChange={(e) => setDealPrice(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>
          <button className="create-btn" onClick={handleCreateDeal}>Create Deal</button>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Active Deals</h3>
        {deals.length === 0 ? (
          <div className="no-data-message">
            <div className="no-data-icon">🎯</div>
            <h3>No Active Deals</h3>
            <p>Create a deal to feature special products</p>
          </div>
        ) : (
          <div className="items-grid">
            {deals.map((deal: any) => (
              <div key={deal.id} className="item-card">
                <div className="image-container">
                  {deal.product.image_url ? (
                    <img src={deal.product.image_url} alt={deal.product.name} className="item-image" />
                  ) : (
                    <div className="placeholder-image">
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                <h3>{deal.product.name}</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '10px' }}>
                    £{deal.product.price}
                  </span>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>
                    £{deal.deal_price}
                  </span>
                  <span style={{ marginLeft: '10px', background: '#e74c3c', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                    {Math.round(((deal.product.price - deal.deal_price) / deal.product.price) * 100)}% OFF
                  </span>
                </div>
                <button className="delete-btn" onClick={() => handleDeleteDeal(deal.id)} style={{ width: '100%' }}>
                  Remove Deal
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
