/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import * as API from '../APIS'

export default function StockTransferTab() {
  const [products, setProducts] = useState<any[]>([])
  const [fromLocation, setFromLocation] = useState('')
  const [toLocation, setToLocation] = useState('')
  const [transferItems, setTransferItems] = useState<{ product_id: number; product_name: string; quantity: number }[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState('')

  const locations = ['Leeds', 'Derby', 'Sheffield']

  const fetchProducts = async () => {
    try {
      const data = await API.fetchProducts()
      setProducts(data)
    } catch {
      console.error('Failed to fetch products')
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const addTransferItem = () => {
    if (!selectedProduct || !quantity || parseInt(quantity) <= 0) return

    const product = products.find(p => p.id === parseInt(selectedProduct))
    if (!product) return

    setTransferItems([...transferItems, {
      product_id: product.id,
      product_name: product.name,
      quantity: parseInt(quantity)
    }])
    setSelectedProduct('')
    setQuantity('')
  }

  const removeTransferItem = (index: number) => {
    setTransferItems(transferItems.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!fromLocation || !toLocation || transferItems.length === 0) {
      alert('Please select locations and add products')
      return
    }

    if (fromLocation === toLocation) {
      alert('From and To locations must be different')
      return
    }

    try {
      const success = await API.submitStockTransfer(fromLocation, toLocation, transferItems)
      if (success) {
        alert('Stock transfer completed successfully')
        setFromLocation('')
        setToLocation('')
        setTransferItems([])
        fetchProducts()
      }
    } catch {
      alert('Failed to complete stock transfer')
    }
  }

  return (
    <div className="stock-transfer-section">
      <div className="section-header">
        <h2>Stock Transfer</h2>
        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Transfer inventory between locations</p>
      </div>

      <div className="transfer-form">
        <div className="transfer-locations">
          <div className="location-select-wrapper">
            <label>From Location</label>
            <select value={fromLocation} onChange={(e) => setFromLocation(e.target.value)} className="styled-select">
              <option value="">Select Source Location</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>📍 {loc}</option>
              ))}
            </select>
          </div>
          <div className="transfer-arrow">→</div>
          <div className="location-select-wrapper">
            <label>To Location</label>
            <select value={toLocation} onChange={(e) => setToLocation(e.target.value)} className="styled-select">
              <option value="">Select Destination Location</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>📍 {loc}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="add-product-section">
          <h3>Add Products to Transfer</h3>
          <div className="transfer-product-input">
            <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="styled-select">
              <option value="">Select Product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} • Leeds: {product.inventory_leeds} | Derby: {product.inventory_derby} | Sheffield: {product.inventory_sheffield}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="quantity-input"
            />
            <button className="create-btn add-item-btn" onClick={addTransferItem}>+ Add Item</button>
          </div>
        </div>

        {transferItems.length > 0 && (
          <div className="transfer-items">
            <h3>📦 Items to Transfer ({transferItems.length})</h3>
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transferItems.map((item, index) => (
                    <tr key={index}>
                      <td className="customer-name">{item.product_name}</td>
                      <td className="total">x{item.quantity}</td>
                      <td>
                        <button className="delete-btn" onClick={() => removeTransferItem(index)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="create-btn submit-transfer-btn" onClick={handleSubmit}>
              ✅ Submit Transfer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
