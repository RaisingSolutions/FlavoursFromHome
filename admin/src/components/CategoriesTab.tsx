/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import * as API from '../APIS'

export default function CategoriesTab() {
  const [categories, setCategories] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '', description: '', image_url: '' })

  const fetchCategories = async () => {
    try {
      const data = await API.fetchCategories()
      setCategories(data)
    } catch (err) {
      console.error('Failed to fetch categories')
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleCreateCategory = async () => {
    try {
      const success = await API.createCategory(formData.name, formData.description, formData.image_url)
      if (success) {
        setFormData({ name: '', description: '', image_url: '' })
        setShowCreateForm(false)
        fetchCategories()
      }
    } catch (err) {
      console.error('Failed to create category')
    }
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      image_url: item.image_url || ''
    })
    setShowCreateForm(true)
  }

  const handleUpdate = async () => {
    try {
      const success = await API.updateCategory(editingItem!.id, formData.name, formData.description, formData.image_url)
      if (success) {
        setFormData({ name: '', description: '', image_url: '' })
        setShowCreateForm(false)
        setEditingItem(null)
        fetchCategories()
      }
    } catch (err) {
      console.error('Failed to update category')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await API.deleteCategory(id)
      fetchCategories()
    } catch (err: any) {
      console.error('Failed to delete category:', err.message)
      alert(`Cannot delete category: ${err.message}`)
    }
  }

  return (
    <div className="categories-section">
      <div className="section-header">
        <h2>Categories</h2>
        <button className="create-btn" onClick={() => {
          setShowCreateForm(true)
          setEditingItem(null)
          setFormData({ name: '', description: '', image_url: '' })
        }}>Create Category</button>
      </div>
      
      {showCreateForm && (
        <div className="create-form">
          <h3>{editingItem ? 'Edit Category' : 'Create New Category'}</h3>
          <input
            type="text"
            placeholder="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <input
            type="url"
            placeholder="Image URL (optional)"
            value={formData.image_url}
            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
          />
          <div className="form-actions">
            <button className="create-btn" onClick={editingItem ? handleUpdate : handleCreateCategory}>
              {editingItem ? 'Update' : 'Create'}
            </button>
            <button className="cancel-btn" onClick={() => {
              setShowCreateForm(false)
              setEditingItem(null)
              setFormData({ name: '', description: '', image_url: '' })
            }}>Cancel</button>
          </div>
        </div>
      )}
      
      <div className="items-grid">
        {categories.map((category: any) => (
          <div key={category.id} className="item-card">
            <div className="image-container">
              {category.image_url ? (
                <img src={category.image_url} alt={category.name} className="item-image" />
              ) : (
                <div className="placeholder-image">
                  <span>No Image</span>
                </div>
              )}
            </div>
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            <div className="item-actions">
              <button className="edit-btn" onClick={() => handleEdit(category)}>Edit</button>
              <button className="delete-btn" onClick={() => handleDelete(category.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}