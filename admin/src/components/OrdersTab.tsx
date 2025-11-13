import { useState, useEffect } from 'react'
import * as API from '../APIS'

export default function OrdersTab() {
  const [orders, setOrders] = useState([])

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

  return (
    <div className="orders-section">
      <div className="section-header">
        <h2>Orders</h2>
      </div>
      
      {orders.length === 0 ? (
        <div className="no-data-message">
          <div className="no-data-icon">📋</div>
          <h3>No Orders Yet</h3>
          <p>Orders will appear here once customers start placing them.</p>
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
              {orders.map((order: any) => (
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
                    <select 
                      className="status-select"
                      value={order.status} 
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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