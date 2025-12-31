/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import * as API from '../APIS'

export default function ProductsTab() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '', description: '', price: '', weight: '', category_id: '', image_url: '', inventory: '' })

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
      const success = await API.createProduct(
        formData.name,
        formData.description,
        parseFloat(formData.price),
        formData.weight,
        parseInt(formData.category_id),
        formData.image_url,
        parseInt(formData.inventory)
      )
      if (success) {
        setFormData({ name: '', description: '', price: '', weight: '', category_id: '', image_url: '', inventory: '' })
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
      inventory: item.inventory?.toString() || '0'
    })
    setShowCreateForm(true)
  }

  const handleUpdate = async () => {
    try {
      const success = await API.updateProduct(
        editingItem!.id,
        formData.name,
        formData.description,
        parseFloat(formData.price),
        formData.weight,
        parseInt(formData.category_id),
        formData.image_url,
        parseInt(formData.inventory)
      )
      if (success) {
        setFormData({ name: '', description: '', price: '', weight: '', category_id: '', image_url: '', inventory: '' })
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

  return (
    <div className="products-section">
      <div className="section-header">
        <h2>Products</h2>
        <button className="create-btn" onClick={() => {
          setShowCreateForm(true)
          setEditingItem(null)
          setFormData({ name: '', description: '', price: '', weight: '', category_id: '', image_url: '', inventory: '' })
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
          <input
            type="number"
            placeholder="Inventory Stock"
            value={formData.inventory}
            onChange={(e) => setFormData({...formData, inventory: e.target.value})}
          />
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
          <div className="form-actions">
            <button className="create-btn" onClick={editingItem ? handleUpdate : handleCreateProduct}>
              {editingItem ? 'Update' : 'Create'}
            </button>
            <button className="cancel-btn" onClick={() => {
              setShowCreateForm(false)
              setEditingItem(null)
              setFormData({ name: '', description: '', price: '', weight: '', category_id: '', image_url: '', inventory: '' })
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
              <span className="inventory" style={{ color: product.inventory <= 10 ? 'red' : 'green', fontWeight: 'bold' }}>Stock: {product.inventory}</span>
            </div>
            <div className="item-actions">
              <button className="edit-btn" onClick={() => handleEdit(product)}>Edit</button>
              <button className="delete-btn" onClick={() => handleDelete(product.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}