/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import * as API from '../APIS'

interface ProductsTabProps {
  userLocation: string | null
  isSuperAdmin: boolean
}

export default function ProductsTab({ userLocation, isSuperAdmin }: ProductsTabProps) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    weight: '', 
    category_id: '', 
    image_url: '', 
    inventory_leeds: '', 
    inventory_derby: '', 
    inventory_sheffield: '', 
    has_limit: false, 
    max_per_order: '',
    origin: ''
  })

  const fetchProducts = async () => {
    try {
      const data = await API.fetchProducts()
      setProducts(data)
    } catch (err) {
      console.error('Failed to fetch products')
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await API.fetchCategories()
      setCategories(data)
    } catch (err) {
      console.error('Failed to fetch categories')
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const handleCreateProduct = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
      const response = await fetch(`${baseUrl}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          weight: formData.weight,
          category_id: parseInt(formData.category_id),
          image_url: formData.image_url,
          inventory_leeds: parseInt(formData.inventory_leeds) || 0,
          inventory_derby: parseInt(formData.inventory_derby) || 0,
          inventory_sheffield: parseInt(formData.inventory_sheffield) || 0,
          has_limit: formData.has_limit,
          max_per_order: formData.max_per_order ? parseInt(formData.max_per_order) : null,
          origin: formData.origin || null
        })
      })
      
      if (response.ok) {
        setFormData({ name: '', description: '', price: '', weight: '', category_id: '', image_url: '', inventory_leeds: '', inventory_derby: '', inventory_sheffield: '', has_limit: false, max_per_order: '' })
        setShowCreateForm(false)
        fetchProducts()
      }
    } catch (err) {
      console.error('Failed to create product')
    }
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price?.toString() || '',
      weight: item.weight || '',
      category_id: item.category_id?.toString() || '',
      image_url: item.image_url || '',
      inventory_leeds: item.inventory_leeds?.toString() || '0',
      inventory_derby: item.inventory_derby?.toString() || '0',
      inventory_sheffield: item.inventory_sheffield?.toString() || '0',
      has_limit: item.has_limit || false,
      max_per_order: item.max_per_order?.toString() || '',
      origin: item.origin || ''
    })
    setShowCreateForm(true)
  }

  const handleUpdate = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
      const response = await fetch(`${baseUrl}/products/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          weight: formData.weight,
          category_id: parseInt(formData.category_id),
          image_url: formData.image_url,
          inventory_leeds: parseInt(formData.inventory_leeds),
          inventory_derby: parseInt(formData.inventory_derby),
          inventory_sheffield: parseInt(formData.inventory_sheffield),
          has_limit: formData.has_limit,
          max_per_order: formData.max_per_order ? parseInt(formData.max_per_order) : null,
          origin: formData.origin || null
        })
      })
      
      if (response.ok) {
        setFormData({ name: '', description: '', price: '', weight: '', category_id: '', image_url: '', inventory_leeds: '', inventory_derby: '', inventory_sheffield: '', has_limit: false, max_per_order: '' })
        setShowCreateForm(false)
        setEditingItem(null)
        fetchProducts()
      }
    } catch (err) {
      console.error('Failed to update product')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await API.deleteProduct(id)
      fetchProducts()
    } catch (err: any) {
      console.error('Failed to delete product:', err.message)
      alert(`Failed to delete product: ${err.message}`)
    }
  }

  const getInventoryForLocation = (product: any) => {
    if (isSuperAdmin) {
      return `L:${product.inventory_leeds} D:${product.inventory_derby} S:${product.inventory_sheffield}`
    }
    if (userLocation === 'Leeds') return product.inventory_leeds
    if (userLocation === 'Derby') return product.inventory_derby
    if (userLocation === 'Sheffield') return product.inventory_sheffield
    return 0
  }

  const canEditInventory = (location: 'Leeds' | 'Derby' | 'Sheffield') => {
    if (isSuperAdmin) return true
    return userLocation === location
  }

  return (
    <div className="products-section">
      <div className="section-header">
        <h2>Products</h2>
        <button className="create-btn" onClick={() => {
          setShowCreateForm(true)
          setEditingItem(null)
          setFormData({ name: '', description: '', price: '', weight: '', category_id: '', image_url: '', inventory_leeds: '', inventory_derby: '', inventory_sheffield: '', has_limit: false, max_per_order: '', origin: '' })
        }}>Create Product</button>
      </div>
      
      {showCreateForm && (
        <div className="create-form">
          <h3>{editingItem ? 'Edit Product' : 'Create New Product'}</h3>
          <input
            type="text"
            placeholder="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
          />
          <input
            type="text"
            placeholder="Weight (e.g., 5kg)"
            value={formData.weight}
            onChange={(e) => setFormData({...formData, weight: e.target.value})}
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
            {(isSuperAdmin || userLocation === 'Leeds') && (
              <input
                type="number"
                placeholder="Leeds Stock"
                value={formData.inventory_leeds}
                onChange={(e) => setFormData({...formData, inventory_leeds: e.target.value})}
                disabled={!canEditInventory('Leeds')}
              />
            )}
            {(isSuperAdmin || userLocation === 'Derby') && (
              <input
                type="number"
                placeholder="Derby Stock"
                value={formData.inventory_derby}
                onChange={(e) => setFormData({...formData, inventory_derby: e.target.value})}
                disabled={!canEditInventory('Derby')}
              />
            )}
            {(isSuperAdmin || userLocation === 'Sheffield') && (
              <input
                type="number"
                placeholder="Sheffield Stock"
                value={formData.inventory_sheffield}
                onChange={(e) => setFormData({...formData, inventory_sheffield: e.target.value})}
                disabled={!canEditInventory('Sheffield')}
              />
            )}
          </div>
          
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({...formData, category_id: e.target.value})}
          >
            <option value="">Select Category</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <input
            type="url"
            placeholder="Image URL (optional)"
            value={formData.image_url}
            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
          />
          <input
            type="text"
            placeholder="Origin (optional)"
            value={formData.origin}
            onChange={(e) => setFormData({...formData, origin: e.target.value})}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={formData.has_limit}
                onChange={(e) => setFormData({...formData, has_limit: e.target.checked})}
              />
              <span>Limit quantity per order</span>
            </label>
            {formData.has_limit && (
              <input
                type="number"
                min="1"
                placeholder="Max per order"
                value={formData.max_per_order || ''}
                onChange={(e) => setFormData({...formData, max_per_order: e.target.value})}
                style={{ width: '150px' }}
              />
            )}
          </div>
          <div className="form-actions">
            <button className="create-btn" onClick={editingItem ? handleUpdate : handleCreateProduct}>
              {editingItem ? 'Update' : 'Create'}
            </button>
            <button className="cancel-btn" onClick={() => {
              setShowCreateForm(false)
              setEditingItem(null)
              setFormData({ name: '', description: '', price: '', weight: '', category_id: '', image_url: '', inventory_leeds: '', inventory_derby: '', inventory_sheffield: '', has_limit: false, max_per_order: '', origin: '' })
            }}>Cancel</button>
          </div>
        </div>
      )}
      
      <div className="items-grid">
        {products.map((product: any) => (
          <div key={product.id} className="item-card">
            <div className="image-container">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="item-image" />
              ) : (
                <div className="placeholder-image">
                  <span>No Image</span>
                </div>
              )}
            </div>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <div className="product-details">
              <span className="price">£{product.price}</span>
              <span className="weight">{product.weight}</span>
              <span className="category">{product.categories?.name}</span>
              <span className="inventory" style={{ 
                color: (isSuperAdmin ? Math.min(product.inventory_leeds, product.inventory_derby, product.inventory_sheffield) : 
                       (userLocation === 'Leeds' ? product.inventory_leeds : 
                        userLocation === 'Derby' ? product.inventory_derby : product.inventory_sheffield)) <= 10 ? 'red' : 'green', 
                fontWeight: 'bold' 
              }}>
                Stock: {getInventoryForLocation(product)}
              </span>
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
            <div className="item-actions">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  checked={product.is_active}
                  onChange={async () => {
                    const newStatus = !product.is_active
                    await API.toggleProductStatus(product.id, newStatus)
                    fetchProducts()
                  }}
                />
                <span>{product.is_active ? 'Active' : 'Hidden'}</span>
              </label>
              <button className="edit-btn" onClick={() => handleEdit(product)}>Edit</button>
              <button className="delete-btn" onClick={() => handleDelete(product.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
