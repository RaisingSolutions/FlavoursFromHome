import { useState, useEffect } from 'react'
import { fetchPartners, createPartner } from '../APIS'
import { useToastContext } from '../context/ToastContext'

interface Partner {
  id: number
  username: string
  discount_code: string
  discount_percentage: number
  is_active: boolean
  created_at: string
}

interface PartnerManagementProps {
  adminId: string
  onClose: () => void
}

export default function PartnerManagement({ adminId, onClose }: PartnerManagementProps) {
  const [partners, setPartners] = useState<Partner[]>([])
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    discount_code: '',
    discount_percentage: ''
  })
  const [loading, setLoading] = useState(false)
  const { showToast } = useToastContext()

  useEffect(() => {
    loadPartners()
  }, [])

  const loadPartners = async () => {
    try {
      const data = await fetchPartners()
      setPartners(data)
    } catch (error) {
      showToast('Failed to load partners', 'error')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const success = await createPartner(adminId, formData.username, formData.password, formData.discount_code, parseFloat(formData.discount_percentage))
      if (success) {
        showToast('Partner created successfully', 'success')
        setFormData({ username: '', password: '', discount_code: '', discount_percentage: '' })
        loadPartners()
      } else {
        showToast('Failed to create partner', 'error')
      }
    } catch (error) {
      showToast('Failed to create partner', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>Partner Management</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="drawer-content">
          <div className="create-partner">
            <h3>Create New Partner</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Discount Code (e.g., PARTNER10)"
                  value={formData.discount_code}
                  onChange={(e) => setFormData({...formData, discount_code: e.target.value.toUpperCase()})}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="Discount Percentage (e.g., 10.5)"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({...formData, discount_percentage: e.target.value})}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="create-btn">
                {loading ? 'Creating...' : 'Create Partner'}
              </button>
            </form>
          </div>

          <div className="partners-list">
            <h3>Existing Partners</h3>
            {partners.length === 0 ? (
              <p>No partners found.</p>
            ) : (
              <table className="partners-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Discount Code</th>
                    <th>Discount %</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((partner) => (
                    <tr key={partner.id}>
                      <td>{partner.username}</td>
                      <td><code>{partner.discount_code}</code></td>
                      <td>{partner.discount_percentage}%</td>
                      <td>
                        <span className={`status ${partner.is_active ? 'active' : 'inactive'}`}>
                          {partner.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(partner.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}