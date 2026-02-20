import { useState } from 'react'
import AdminManagement from './AdminManagement'
import OrdersTab from './OrdersTab'
import CategoriesTab from './CategoriesTab'
import ProductsTab from './ProductsTab'
import DeliveryRoutes from './DeliveryRoutes'
import DriverView from './DriverView'
import DeliveriesTab from './DeliveriesTab'
import StockLevelsTab from './StockLevelsTab'
import FeedbackTab from './FeedbackTab'
import StockTransferTab from './StockTransferTab'
import DealOfTheWeekTab from './DealOfTheWeekTab'
import TestCouponsTab from './TestCouponsTab'

interface DashboardProps {
  isSuperAdmin: boolean
  adminId: string
  userRole: string
  userLocation: string | null
  onSignOut: () => void
}

export default function Dashboard({ isSuperAdmin, adminId, userRole, userLocation, onSignOut }: DashboardProps) {
  const [showAdminManagement, setShowAdminManagement] = useState(false)
  const [activeTab, setActiveTab] = useState(userRole === 'driver' ? 'delivery' : 'orders')

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand">
          <img src="https://res.cloudinary.com/dulm4r5mo/image/upload/v1763129727/FFH_Logo_f47yft.png" alt="FFH Logo" className="navbar-logo" />
          Flavours From Home Admin Panel
          {userLocation && <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#666' }}>({userLocation})</span>}
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
        ) : isSuperAdmin ? (
          // Super Admin View - Analytics Only
          <>
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
              <button 
                className={`tab ${activeTab === 'stock' ? 'active' : ''}`}
                onClick={() => setActiveTab('stock')}
              >
                Stock Levels
              </button>
              <button 
                className={`tab ${activeTab === 'deliveries' ? 'active' : ''}`}
                onClick={() => setActiveTab('deliveries')}
              >
                Deliveries
              </button>
              <button 
                className={`tab ${activeTab === 'feedback' ? 'active' : ''}`}
                onClick={() => setActiveTab('feedback')}
              >
                Reviews
              </button>
              <button 
                className={`tab ${activeTab === 'transfer' ? 'active' : ''}`}
                onClick={() => setActiveTab('transfer')}
              >
                Stock Transfer
              </button>
              <button 
                className={`tab ${activeTab === 'deals' ? 'active' : ''}`}
                onClick={() => setActiveTab('deals')}
              >
                Deal of the Week
              </button>
              <button 
                className={`tab ${activeTab === 'test-coupons' ? 'active' : ''}`}
                onClick={() => setActiveTab('test-coupons')}
              >
                Test Coupons
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'categories' && <CategoriesTab />}
              {activeTab === 'products' && <ProductsTab userLocation={userLocation} isSuperAdmin={isSuperAdmin} />}
              {activeTab === 'stock' && <StockLevelsTab userLocation={userLocation} isSuperAdmin={isSuperAdmin} />}
              {activeTab === 'deliveries' && <DeliveriesTab userLocation={userLocation} isSuperAdmin={isSuperAdmin} />}
              {activeTab === 'feedback' && <FeedbackTab userLocation={userLocation} isSuperAdmin={isSuperAdmin} />}
              {activeTab === 'transfer' && <StockTransferTab />}
              {activeTab === 'deals' && <DealOfTheWeekTab />}
              {activeTab === 'test-coupons' && <TestCouponsTab />}
            </div>
          </>
        ) : (
          // Location Admin View - Full Operations
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
                className={`tab ${activeTab === 'stock' ? 'active' : ''}`}
                onClick={() => setActiveTab('stock')}
              >
                Stock Levels
              </button>
              <button 
                className={`tab ${activeTab === 'deliveries' ? 'active' : ''}`}
                onClick={() => setActiveTab('deliveries')}
              >
                Deliveries
              </button>
              <button 
                className={`tab ${activeTab === 'delivery' ? 'active' : ''}`}
                onClick={() => setActiveTab('delivery')}
              >
                Delivery Routes
              </button>
              <button 
                className={`tab ${activeTab === 'feedback' ? 'active' : ''}`}
                onClick={() => setActiveTab('feedback')}
              >
                Feedback
              </button>
              <button 
                className={`tab ${activeTab === 'transfer' ? 'active' : ''}`}
                onClick={() => setActiveTab('transfer')}
              >
                Stock Transfer
              </button>
              <button 
                className={`tab ${activeTab === 'deals' ? 'active' : ''}`}
                onClick={() => setActiveTab('deals')}
              >
                Deal of the Week
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'orders' && <OrdersTab userLocation={userLocation} isSuperAdmin={isSuperAdmin} />}
              {activeTab === 'categories' && <CategoriesTab />}
              {activeTab === 'products' && <ProductsTab userLocation={userLocation} isSuperAdmin={isSuperAdmin} />}
              {activeTab === 'stock' && <StockLevelsTab userLocation={userLocation} isSuperAdmin={isSuperAdmin} />}
              {activeTab === 'deliveries' && <DeliveriesTab userLocation={userLocation} isSuperAdmin={isSuperAdmin} />}
              {activeTab === 'delivery' && <DeliveryRoutes userLocation={userLocation} isSuperAdmin={isSuperAdmin} />}
              {activeTab === 'feedback' && <FeedbackTab userLocation={userLocation} isSuperAdmin={isSuperAdmin} />}
              {activeTab === 'transfer' && <StockTransferTab />}
              {activeTab === 'deals' && <DealOfTheWeekTab />}
            </div>
          </>
        )}
      </div>
    </div>
  )
}