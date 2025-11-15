/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import * as API from '../APIS'

export default function OrdersTab() {
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState<'pending' | 'ready' | 'delivered'>('pending')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const data = await API.fetchOrders()
      setOrders(data)
    } catch (err) {
      console.error('Failed to fetch orders')
    }
  }

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      const success = await API.updateOrderStatus(id, status)
      if (success) {
        fetchOrders()
      }
    } catch (err) {
      console.error('Failed to update order status')
    }
  }

  const filteredOrders = orders.filter((order: any) => order.status === activeTab)

  return (
    <div className="orders-section">
      <div className="section-header">
        <h2>Orders</h2>
      </div>
      
      <div className="orders-tabs">
        <button 
          className={`orders-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Orders
        </button>
        <button 
          className={`orders-tab-btn ${activeTab === 'ready' ? 'active' : ''}`}
          onClick={() => setActiveTab('ready')}
        >
          Ready Orders
        </button>
        <button 
          className={`orders-tab-btn ${activeTab === 'delivered' ? 'active' : ''}`}
          onClick={() => setActiveTab('delivered')}
        >
          Delivered Orders
        </button>
      </div>
      
      {filteredOrders.length === 0 ? (
        <div className="no-data-message">
          <div className="no-data-icon">📋</div>
          <h3>No {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Orders</h3>
          <p>No orders with status "{activeTab}" at the moment.</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order: any) => (
                <tr key={order.id}>
                  <td className="order-id">#{order.id}</td>
                  <td className="customer-name">{order.first_name}</td>
                  <td className="email">{order.email}</td>
                  <td className="phone">{order.phone_number}</td>
                  <td className="address">{order.address}</td>
                  <td className="items-cell">
                    <div className="order-items">
                      {order.order_items?.map((item: any, index: number) => (
                        <div key={index} className="order-item">
                          <span className="item-name">{item.product_name}</span>
                          <span className="item-qty">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="total">£{order.total_amount}</td>
                  <td className="payment">{order.payment_method}</td>
                  <td className="date">{new Date(order.order_date).toLocaleDateString()}</td>
                  <td className="status-cell">
                    <span className={`status-badge status-${order.status?.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {order.status === 'pending' && (
                      <button 
                        className="action-btn ready-btn"
                        onClick={() => handleStatusUpdate(order.id, 'ready')}
                      >
                        Mark as Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button 
                        className="action-btn delivered-btn"
                        onClick={() => handleStatusUpdate(order.id, 'delivered')}
                      >
                        Mark as Delivered
                      </button>
                    )}
                    {order.status === 'delivered' && (
                      <span className="completed-text">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}