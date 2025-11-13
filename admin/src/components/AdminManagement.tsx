import { useState } from 'react'
import * as API from '../APIS'

interface AdminManagementProps {
  adminId: string
  onClose: () => void
}

export default function AdminManagement({ adminId, onClose }: AdminManagementProps) {
  const [adminUsers, setAdminUsers] = useState([])
  const [newAdminUsername, setNewAdminUsername] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [newAdminIsSuperAdmin, setNewAdminIsSuperAdmin] = useState(false)

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

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>Admin Management</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="drawer-content">
          <div className="create-admin">
            <h3>Create New Admin</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="Username"
                value={newAdminUsername}
                onChange={(e) => setNewAdminUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
              />
            </div>
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
            <button onClick={fetchAdminUsers}>Load Users</button>
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
  )
}