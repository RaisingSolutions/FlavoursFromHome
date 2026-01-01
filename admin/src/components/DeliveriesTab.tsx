/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react'
import * as API from '../APIS'
import { useToastContext } from '../context/ToastContext'

export default function DeliveriesTab() {
  const [products, setProducts] = useState<any[]>([])
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0])
  const [deliveryItems, setDeliveryItems] = useState<{ product_id: number; quantity: number }[]>([])
  const { showToast } = useToastContext()

  const fetchProducts = useCallback(async () => {
    try {
      const data = await API.fetchProducts()
      setProducts(data)
    } catch {
      console.error('Failed to fetch products')
    }
  }, [])

  const fetchDeliveries = useCallback(async () => {
    try {
      const data = await API.fetchDeliveries()
      setDeliveries(Array.isArray(data) ? data : [])
    } catch {
      console.error('Failed to fetch deliveries')
      setDeliveries([])
    }
  }, [])

  useEffect(() => {
    fetchProducts()
    fetchDeliveries()
  }, [fetchProducts, fetchDeliveries])

  const handleAddItem = () => {
    setDeliveryItems([...deliveryItems, { product_id: 0, quantity: 0 }])
  }

  const handleUpdateItem = (index: number, field: 'product_id' | 'quantity', value: number) => {
    const updated = [...deliveryItems]
    updated[index][field] = value
    setDeliveryItems(updated)
  }

  const handleRemoveItem = (index: number) => {
    setDeliveryItems(deliveryItems.filter((_, i) => i !== index))
  }

  const handleSaveDelivery = async () => {
    if (deliveryItems.length === 0) {
      showToast('Please add at least one product', 'error')
      return
    }

    const valid = deliveryItems.every(item => item.product_id > 0 && item.quantity > 0)
    if (!valid) {
      showToast('Please select products and enter valid quantities', 'error')
      return
    }

    try {
      const success = await API.recordDelivery(deliveryDate, deliveryItems)
      if (success) {
        showToast('Delivery recorded and stock updated!', 'success')
        setDeliveryItems([])
        setShowModal(false)
        fetchProducts()
        fetchDeliveries()
      }
    } catch {
      console.error('Failed to record delivery')
      showToast('Failed to record delivery', 'error')
    }
  }

  return (
    <div className="deliveries-section">
      <div className="section-header">
        <h2>Stock Deliveries</h2>
        <button className="create-btn" onClick={() => {
          setShowModal(true)
          setDeliveryDate(new Date().toISOString().split('T')[0])
          setDeliveryItems([])
        }}>
          + Record New Delivery
        </button>
      </div>

      {deliveries.length === 0 ? (
        <div className="no-data-message">
          <div className="no-data-icon">🚚</div>
          <h3>No Deliveries Recorded</h3>
          <p>Click "Record New Delivery" to add your first stock delivery.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ background: '#34495e', color: 'white' }}>
                <th style={{ padding: '15px', textAlign: 'left', border: '1px solid #ddd' }}>Date</th>
                <th style={{ padding: '15px', textAlign: 'left', border: '1px solid #ddd' }}>Products</th>
                <th style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>Total Items</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '15px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                    {new Date(delivery.delivery_date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '15px', border: '1px solid #ddd' }}>
                    {delivery.items.map((item: any, i: number) => (
                      <div key={i} style={{ marginBottom: '5px' }}>
                        {item.product_name}: <strong>{item.quantity}</strong> units
                      </div>
                    ))}
                  </td>
                  <td style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                    {delivery.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', maxWidth: '800px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
            <h2>Record New Delivery</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Delivery Date</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', width: '200px' }}
              />
            </div>

            <h4>Products Delivered</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Product</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd', width: '150px' }}>Current Stock</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd', width: '150px' }}>Quantity Delivered</th>
                  <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', width: '100px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {deliveryItems.map((item, index) => {
                  const selectedProduct = products.find(p => p.id === item.product_id)
                  return (
                    <tr key={index}>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                        <select
                          value={item.product_id}
                          onChange={(e) => handleUpdateItem(index, 'product_id', parseInt(e.target.value))}
                          style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                          <option value={0}>Select Product</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' }}>
                        {selectedProduct ? selectedProduct.inventory : '-'}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity || ''}
                          onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                        <button
                          className="delete-btn"
                          onClick={() => handleRemoveItem(index)}
                          style={{ padding: '6px 12px' }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <button className="create-btn" onClick={handleAddItem}>
                + Add Product
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="create-btn" onClick={handleSaveDelivery} style={{ background: '#4caf50' }}>
                  Save Delivery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
