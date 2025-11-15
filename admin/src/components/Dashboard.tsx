/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState } from 'react'
import AdminManagement from './AdminManagement'
import OrdersTab from './OrdersTab'
import CategoriesTab from './CategoriesTab'
import ProductsTab from './ProductsTab'
import DeliveryRoutes from './DeliveryRoutes'
import DriverView from './DriverView'

interface DashboardProps {
  isSuperAdmin: boolean
  adminId: string
  userRole: string
  onSignOut: () => void
}

export default function Dashboard({ isSuperAdmin, adminId, userRole, onSignOut }: DashboardProps) {
  const [showAdminManagement, setShowAdminManagement] = useState(false)
  const [activeTab, setActiveTab] = useState(userRole === 'driver' ? 'delivery' : 'orders')

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand">
          <img src="https://res.cloudinary.com/dulm4r5mo/image/upload/v1763129727/FFH_Logo_f47yft.png" alt="FFH Logo" className="navbar-logo" />
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
        {userRole === 'driver' ? (
          <div className="tab-content">
            <DriverView driverId={adminId} />
          </div>
        ) : (
          <>
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
              <button 
                className={`tab ${activeTab === 'delivery' ? 'active' : ''}`}
                onClick={() => setActiveTab('delivery')}
              >
                Delivery Routes
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'orders' && <OrdersTab />}
              {activeTab === 'categories' && <CategoriesTab />}
              {activeTab === 'products' && <ProductsTab />}
              {activeTab === 'delivery' && <DeliveryRoutes />}
            </div>
          </>
        )}
      </div>
    </div>
  )
}