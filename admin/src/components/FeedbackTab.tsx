/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { fetchFeedbacks } from '../APIS'

export default function FeedbackTab() {
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeedbacks()
  }, [])

  const loadFeedbacks = async () => {
    try {
      const data = await fetchFeedbacks()
      setFeedbacks(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch feedbacks', err)
      setFeedbacks([])
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => '⭐'.repeat(rating)

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2>Customer Feedback</h2>
      {feedbacks.length === 0 ? (
        <p>No feedback yet</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product Ratings</th>
              <th>Delivery</th>
              <th>Driver</th>
              <th>Comments</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((fb) => (
              <tr key={fb.id}>
                <td>#{fb.order_id}</td>
                <td>{fb.customer_name}</td>
                <td>
                  {Object.entries(fb.product_ratings || {}).map(([productId, data]: any) => (
                    <div key={productId} style={{ marginBottom: '8px' }}>
                      <strong>{data.productName}:</strong> {renderStars(data.rating)}
                      {data.comment && <div style={{ fontSize: '12px', color: '#666' }}>{data.comment}</div>}
                    </div>
                  ))}
                </td>
                <td>{renderStars(fb.delivery_rating)}</td>
                <td>{renderStars(fb.driver_rating)}</td>
                <td>{fb.delivery_comments || '-'}</td>
                <td>{new Date(fb.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
