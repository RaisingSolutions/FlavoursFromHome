/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import * as API from '../APIS'

export default function OrdersTab({ userLocation, isSuperAdmin }: { userLocation: string | null, isSuperAdmin: boolean }) {
  const [orders, setOrders] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'pending' | 'ready' | 'out_for_delivery' | 'delivered' | 'pending_collection'>('pending')

  const fetchOrders = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
      const url = userLocation && !isSuperAdmin 
        ? `${baseUrl}/orders?location=${userLocation}`
        : `${baseUrl}/orders`
      
      const response = await fetch(url)
      const data = await response.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch orders')
      setOrders([])
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [userLocation])

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

  const handleCancelOrder = async (order: any) => {
    if (!confirm(`Cancel order #${order.id} and refund £${order.total_amount}?`)) return;
    
    try {
      const success = await API.cancelOrder(order.id);
      if (success) {
        alert('Order cancelled and refund initiated!');
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to cancel order');
      alert('Failed to cancel order');
    }
  };

  const filteredOrders = orders.filter((order: any) => {
    if (activeTab === 'pending_collection') {
      return order.status === 'pending' && order.address === 'Collection'
    }
    if (activeTab === 'out_for_delivery') {
      return order.status === 'ready' && order.driver_id
    }
    if (activeTab === 'ready') {
      return order.status === 'ready' && !order.driver_id
    }
    if (activeTab === 'pending') {
      return order.status === 'pending' && order.address !== 'Collection'
    }
    return order.status === activeTab
  })

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
          Pending Delivery
        </button>
        <button 
          className={`orders-tab-btn ${activeTab === 'pending_collection' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending_collection')}
        >
          Pending Collection
        </button>
        <button 
          className={`orders-tab-btn ${activeTab === 'ready' ? 'active' : ''}`}
          onClick={() => setActiveTab('ready')}
        >
          Ready Orders
        </button>
        <button 
          className={`orders-tab-btn ${activeTab === 'out_for_delivery' ? 'active' : ''}`}
          onClick={() => setActiveTab('out_for_delivery')}
        >
          Out for Delivery
        </button>
        <button 
          className={`orders-tab-btn ${activeTab === 'delivered' ? 'active' : ''}`}
          onClick={() => setActiveTab('delivered')}
        >
          Delivered/Collected
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
                {activeTab === 'out_for_delivery' && <th>Driver</th>}
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
                      {activeTab === 'out_for_delivery' ? 'Out for Delivery' : order.status}
                    </span>
                  </td>
                  {activeTab === 'out_for_delivery' && (
                    <td className="customer-name">{order.driver_username || 'Assigned'}</td>
                  )}
                  <td className="actions-cell">
                    {order.status === 'pending' && order.address !== 'Collection' && (
                      <>
                        <button 
                          className="action-btn ready-btn"
                          onClick={() => handleStatusUpdate(order.id, 'ready')}
                        >
                          Mark as Ready
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleCancelOrder(order)}
                          style={{ marginLeft: '5px' }}
                        >
                          Cancel & Refund
                        </button>
                      </>
                    )}
                    {activeTab === 'pending_collection' && (
                      <button 
                        className="action-btn delivered-btn"
                        onClick={() => handleStatusUpdate(order.id, 'delivered')}
                      >
                        Mark as Collected
                      </button>
                    )}
                    {activeTab === 'out_for_delivery' && (
                      <button 
                        className="action-btn delivered-btn"
                        onClick={() => handleStatusUpdate(order.id, 'delivered')}
                      >
                        Mark as Delivered
                      </button>
                    )}
                    {order.status === 'ready' && !order.driver_id && (
                      <span className="completed-text">Awaiting Assignment</span>
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