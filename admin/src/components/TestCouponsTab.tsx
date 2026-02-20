/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'

export default function TestCouponsTab() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [newCouponCode, setNewCouponCode] = useState('')

  const fetchCoupons = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
      const response = await fetch(`${baseUrl}/payment/test-coupons`)
      const data = await response.json()
      setCoupons(Array.isArray(data) ? data : [])
    } catch {
      console.error('Failed to fetch test coupons')
      setCoupons([])
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleCreateCoupon = async () => {
    if (!newCouponCode.trim()) {
      alert('Please enter a coupon code')
      return
    }

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
      const response = await fetch(`${baseUrl}/payment/test-coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: newCouponCode.toUpperCase() })
      })

      if (response.ok) {
        alert('Test coupon created!')
        setNewCouponCode('')
        fetchCoupons()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create coupon')
      }
    } catch {
      alert('Failed to create coupon')
    }
  }

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm('Delete this test coupon?')) return

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
      const response = await fetch(`${baseUrl}/payment/test-coupons/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchCoupons()
      }
    } catch {
      alert('Failed to delete coupon')
    }
  }

  return (
    <div className="test-coupons-section">
      <div className="section-header">
        <h2>🧪 Test Coupons (100% Discount)</h2>
        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Create test coupons for testing checkout flow without charges</p>
      </div>

      <div className="create-form">
        <h3>Create New Test Coupon</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Enter coupon code (e.g., TEST100)"
            value={newCouponCode}
            onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          />
          <button className="create-btn" onClick={handleCreateCoupon}>Create Test Coupon</button>
        </div>
        <p style={{ color: '#666', fontSize: '13px', marginTop: '10px' }}>
          ℹ️ Test coupons give 100% discount and never expire. Use them with test products for testing.
        </p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Active Test Coupons</h3>
        {coupons.length === 0 ? (
          <div className="no-data-message">
            <div className="no-data-icon">🎫</div>
            <h3>No Test Coupons</h3>
            <p>Create a test coupon to start testing</p>
          </div>
        ) : (
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Coupon Code</th>
                  <th>Discount</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon: any) => (
                  <tr key={coupon.id}>
                    <td className="order-id">{coupon.code}</td>
                    <td className="total">100% OFF</td>
                    <td>
                      <span className="status-badge status-ready">Active</span>
                    </td>
                    <td className="date">{new Date(coupon.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="delete-btn" onClick={() => handleDeleteCoupon(coupon.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
