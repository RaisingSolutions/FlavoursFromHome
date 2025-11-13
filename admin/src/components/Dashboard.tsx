import { useState } from 'react'
import AdminManagement from './AdminManagement'
import OrdersTab from './OrdersTab'
import CategoriesTab from './CategoriesTab'
import ProductsTab from './ProductsTab'

interface DashboardProps {
  isSuperAdmin: boolean
  adminId: string
  onSignOut: () => void
}

export default function Dashboard({ isSuperAdmin, adminId, onSignOut }: DashboardProps) {
  const [showAdminManagement, setShowAdminManagement] = useState(false)
  const [activeTab, setActiveTab] = useState('orders')

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
              onClick={() => setShowAdminManagement(!showAdminManagement)}
            >
              Admin Users
            </button>
          )}
          <button className="signout-btn" onClick={onSignOut}>Sign Out</button>
        </div>
      </nav>
      
      {showAdminManagement && (
        <AdminManagement 
          adminId={adminId} 
          onClose={() => setShowAdminManagement(false)} 
        />
      )}
      
      <div className="content">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
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
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'categories' && <CategoriesTab />}
          {activeTab === 'products' && <ProductsTab />}
        </div>
      </div>
    </div>
  )
}