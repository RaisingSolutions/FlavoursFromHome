import { useState, useEffect } from 'react'
import { fetchPartnerOrders } from '../APIS'
import { useToastContext } from '../context/ToastContext'

interface PartnerOrder {
  id: number
  total_amount: number
  created_at: string
  items: Array<{
    product_name: string
    quantity: number
    price: number
  }>
}

interface PartnerDashboardProps {
  partnerId: string
  onSignOut: () => void
}

export default function PartnerDashboard({ partnerId, onSignOut }: PartnerDashboardProps) {
  const [orders, setOrders] = useState<PartnerOrder[]>([])
  const [partnerData, setPartnerData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToastContext()

  useEffect(() => {
    loadPartnerData()
    loadOrders()
  }, [partnerId])

  const loadPartnerData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/partners`)
      const partners = await response.json()
      const partner = partners.find((p: any) => p.id.toString() === partnerId)
      setPartnerData(partner)
    } catch (error) {
      showToast('Failed to load partner data', 'error')
    }
  }

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await fetchPartnerOrders(partnerId)
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      showToast('Failed to load orders', 'error')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const totalDiscountGiven = orders.reduce((sum, order) => sum + (order.discount_amount || 0), 0) // 10% commission example

  return (
    <div className="partner-dashboard">
      <nav className="navbar">
        <div className="navbar-brand">
          <img src="https://res.cloudinary.com/dulm4r5mo/image/upload/v1763129727/FFH_Logo_f47yft.png" alt="FFH Logo" className="navbar-logo" />
          Partner Dashboard
        </div>
        <button className="signout-btn" onClick={onSignOut}>Sign Out</button>
      </nav>

      <div className="content">
        {partnerData && (
          <div className="partner-info">
            <div className="discount-code-card">
              <h3>Your Discount Code</h3>
              <div className="discount-code">
                <code>{partnerData.discount_code}</code>
                <button 
                  className="copy-btn" 
                  onClick={() => navigator.clipboard.writeText(partnerData.discount_code)}
                >
                  Copy
                </button>
              </div>
              <p>Share this code with customers to give them {partnerData.discount_percentage}% off their orders!</p>
            </div>
          </div>
        )}

        <div className="partner-stats">
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p className="stat-number">{orders.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Sales</h3>
            <p className="stat-number">£{orders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Total Discounts Given</h3>
            <p className="stat-number">£{totalDiscountGiven.toFixed(2)}</p>
          </div>
        </div>

        <div className="orders-section">
          <h2>Orders Through Your Discount Code</h2>
          
          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p>No orders found yet. Share your discount code to start earning commissions!</p>
          ) : (
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>
                        <div className="items-list">
                          {order.items.map((item, index) => (
                            <div key={index} className="item">
                              {item.quantity}x {item.product_name}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>£{order.total_amount.toFixed(2)}</td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}