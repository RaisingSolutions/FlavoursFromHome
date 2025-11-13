import { useState, useEffect } from 'react'
import './App.css'
import * as API from './APIS'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [, setLoggedInUser] = useState('')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [adminId, setAdminId] = useState('')
  const [error, setError] = useState('')
  const [showAdminManagement, setShowAdminManagement] = useState(false)
  const [adminUsers, setAdminUsers] = useState([])
  const [newAdminUsername, setNewAdminUsername] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [newAdminIsSuperAdmin, setNewAdminIsSuperAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState('categories')
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '', description: '', price: '', weight: '', category_id: '', image_url: '' })

  useEffect(() => {
    const savedLoginState = localStorage.getItem('adminLoginState')
    if (savedLoginState) {
      const { isLoggedIn, loggedInUser, isSuperAdmin, adminId } = JSON.parse(savedLoginState)
      setIsLoggedIn(isLoggedIn)
      setLoggedInUser(loggedInUser)
      setIsSuperAdmin(isSuperAdmin)
      setAdminId(adminId)
      if (isLoggedIn) {
        fetchCategories()
        fetchProducts()
      }
    }
  }, [])

  const handleLogin = async () => {
    try {
      const data = await API.adminLogin(username, password)
      
      if (data.username) {
        setIsLoggedIn(true)
        setLoggedInUser(data.username)
        setIsSuperAdmin(data.is_super_admin)
        setAdminId(data.id.toString())
        setError('')
        
        localStorage.setItem('adminLoginState', JSON.stringify({
          isLoggedIn: true,
          loggedInUser: data.username,
          isSuperAdmin: data.is_super_admin,
          adminId: data.id.toString()
        }))
        
        fetchCategories()
        fetchProducts()
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Connection failed')
    }
  }

  const handleSignOut = () => {
    setIsLoggedIn(false)
    setLoggedInUser('')
    setIsSuperAdmin(false)
    setAdminId('')
    setShowAdminManagement(false)
    setActiveTab('categories')
    setCategories([])
    setProducts([])
    setShowCreateForm(false)
    setEditingItem(null)
    setFormData({ name: '', description: '', price: '', weight: '', category_id: '', image_url: '' })
    setUsername('')
    setPassword('')
    setError('')
    localStorage.removeItem('adminLoginState')
  }

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

  const fetchAdminUsers = async () => {
    try {
      const data = await API.fetchAdminUsers()
      setAdminUsers(data)
    } catch (err) {
      console.error('Failed to fetch admin users')
    }
  }

  const handleCreateAdmin = async () => {
    try {
      const success = await API.createAdmin(adminId, newAdminUsername, newAdminPassword, newAdminIsSuperAdmin)
      if (success) {
        setNewAdminUsername('')
        setNewAdminPassword('')
        setNewAdminIsSuperAdmin(false)
        fetchAdminUsers()
      }
    } catch (err) {
      console.error('Failed to create admin')
    }
  }

  const handleDeleteAdmin = async (id: number) => {
    try {
      const success = await API.deleteAdmin(adminId, id)
      if (success) {
        fetchAdminUsers()
      }
    } catch (err) {
      console.error('Failed to delete admin')
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const success = await API.toggleAdminStatus(adminId, id, !currentStatus)
      if (success) {
        fetchAdminUsers()
      }
    } catch (err) {
      console.error('Failed to update admin status')
    }
  }

  const handleCreateCategory = async () => {
    try {
      const success = await API.createCategory(formData.name, formData.description, formData.image_url)
      if (success) {
        setFormData({ name: '', description: '', price: '', weight: '', category_id: '', image_url: '' })
        setShowCreateForm(false)
        fetchCategories()
      }
    } catch (err) {
      console.error('Failed to create category')
    }
  }

  const handleCreateProduct = async () => {
    try {
      const success = await API.createProduct(
        formData.name,
        formData.description,
        parseFloat(formData.price),
        formData.weight,
        parseInt(formData.category_id),
        formData.image_url
      )
      if (success) {
        setFormData({ name: '', description: '', price: '', weight: '', category_id: '', image_url: '' })
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
      image_url: item.image_url || ''
    })
    setShowCreateForm(true)
  }

  const handleUpdate = async () => {
    try {
      const isCategory = activeTab === 'categories'
      const success = isCategory 
        ? await API.updateCategory(editingItem!.id, formData.name, formData.description, formData.image_url)
        : await API.updateProduct(
            editingItem!.id,
            formData.name,
            formData.description,
            parseFloat(formData.price),
            formData.weight,
            parseInt(formData.category_id),
            formData.image_url
          )

      if (success) {
        setFormData({ name: '', description: '', price: '', weight: '', category_id: '', image_url: '' })
        setShowCreateForm(false)
        setEditingItem(null)
        isCategory ? fetchCategories() : fetchProducts()
      }
    } catch (err) {
      console.error('Failed to update item')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const isCategory = activeTab === 'categories'
      const success = isCategory 
        ? await API.deleteCategory(id)
        : await API.deleteProduct(id)

      if (success) {
        isCategory ? fetchCategories() : fetchProducts()
      }
    } catch (err) {
      console.error('Failed to delete item')
    }
  }

  if (isLoggedIn) {
    return (
      <div className="dashboard">
        <nav className="navbar">
          <div className="navbar-brand">
            <img src="/src/FFH_Logo.png" alt="FFH Logo" className="navbar-logo" />
            Flavours From Home Admin Panel
          </div>
          <div className="navbar-actions">
            {isSuperAdmin && (
              <button 
                className="admin-btn" 
                onClick={() => {
                  setShowAdminManagement(!showAdminManagement)
                  if (!showAdminManagement) fetchAdminUsers()
                }}
              >
                Admin Users
              </button>
            )}
            <button className="signout-btn" onClick={handleSignOut}>Sign Out</button>
          </div>
        </nav>
        
        {showAdminManagement && (
          <div className="drawer-overlay" onClick={() => setShowAdminManagement(false)}>
            <div className="drawer" onClick={(e) => e.stopPropagation()}>
              <div className="drawer-header">
                <h2>Admin Management</h2>
                <button className="close-btn" onClick={() => setShowAdminManagement(false)}>×</button>
              </div>
              
              <div className="drawer-content">
                <div className="create-admin">
                  <h3>Create New Admin</h3>
                  <input
                    type="text"
                    placeholder="Username"
                    value={newAdminUsername}
                    onChange={(e) => setNewAdminUsername(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                  />
                  <div className="checkbox-container">
                    <input
                      type="checkbox"
                      id="superAdmin"
                      checked={newAdminIsSuperAdmin}
                      onChange={(e) => setNewAdminIsSuperAdmin(e.target.checked)}
                    />
                    <label htmlFor="superAdmin">Make Super Admin</label>
                  </div>
                  <button className="create-btn" onClick={handleCreateAdmin}>Create Admin</button>
                </div>
                
                <div className="admin-list">
                  <h3>Admin Users</h3>
                  {adminUsers.map((admin: any) => (
                    <div key={admin.id} className="admin-item">
                      <div className="admin-info">
                        <span className="admin-name">{admin.username}</span>
                        {admin.is_super_admin && <span className="super-badge">Super Admin</span>}
                        <span className={`status-badge ${admin.is_active ? 'active' : 'inactive'}`}>
                          {admin.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="admin-controls">
                        <button 
                          className={admin.is_active ? 'deactivate-btn' : 'activate-btn'}
                          onClick={() => handleToggleStatus(admin.id, admin.is_active)}
                        >
                          {admin.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        {admin.id !== 1 && (
                          <button 
                            className="delete-btn" 
                            onClick={() => handleDeleteAdmin(admin.id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="content">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              Categories
            </button>
            <button 
              className={`tab ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              Products
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'categories' && (
              <div className="categories-section">
                <div className="section-header">
                  <h2>Categories</h2>
                  <button className="create-btn" onClick={() => {
                    setShowCreateForm(true)
                    setEditingItem(null)
                    setFormData({ name: '', description: '', price: '', weight: '', category_id: '', image_url: '' })
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
                        setFormData({ name: '', description: '', price: '', weight: '', category_id: '', image_url: '' })
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
            )}

            {activeTab === 'products' && (
              <div className="products-section">
                <div className="section-header">
                  <h2>Products</h2>
                  <button className="create-btn" onClick={() => {
                    setShowCreateForm(true)
                    setEditingItem(null)
                    setFormData({ name: '', description: '', price: '', weight: '', category_id: '', image_url: '' })
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
                        setFormData({ name: '', description: '', price: '', weight: '', category_id: '', image_url: '' })
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
                      </div>
                      <div className="item-actions">
                        <button className="edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(product.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-logo">
          <img src="/src/FFH_Logo.png" alt="Flavours From Home Logo" className="login-logo-img" />
          <h1>Flavours From Home Admin</h1>
          <p className="login-description">
            Enter your credentials to access the admin panel
          </p>
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  )
}

export default App