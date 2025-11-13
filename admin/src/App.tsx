import { useState } from 'react'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState('')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [adminId, setAdminId] = useState('')
  const [error, setError] = useState('')
  const [showAdminManagement, setShowAdminManagement] = useState(false)
  const [adminUsers, setAdminUsers] = useState([])
  const [newAdminUsername, setNewAdminUsername] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [newAdminIsSuperAdmin, setNewAdminIsSuperAdmin] = useState(false)

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsLoggedIn(true)
        setLoggedInUser(data.username)
        setIsSuperAdmin(data.is_super_admin)
        setAdminId(data.id.toString())
        setError('')
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
    setUsername('')
    setPassword('')
    setError('')
  }

  const fetchAdminUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users')
      const data = await response.json()
      setAdminUsers(data)
    } catch (err) {
      console.error('Failed to fetch admin users')
    }
  }

  const handleCreateAdmin = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'admin-id': adminId
        },
        body: JSON.stringify({
          username: newAdminUsername,
          password: newAdminPassword,
          is_super_admin: newAdminIsSuperAdmin
        }),
      })

      if (response.ok) {
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
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'admin-id': adminId
        },
      })

      if (response.ok) {
        fetchAdminUsers()
      }
    } catch (err) {
      console.error('Failed to delete admin')
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'admin-id': adminId
        },
        body: JSON.stringify({
          is_active: !currentStatus
        }),
      })

      if (response.ok) {
        fetchAdminUsers()
      }
    } catch (err) {
      console.error('Failed to update admin status')
    }
  }

  if (isLoggedIn) {
    return (
      <div className="dashboard">
        <nav className="navbar">
          <div className="navbar-brand">Flavours From Home</div>
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
          <h1>Hi {loggedInUser}!</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Admin Login</h2>
        {error && <div className="error">{error}</div>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  )
}

export default App
