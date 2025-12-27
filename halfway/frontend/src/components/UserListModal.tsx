import { useState, useEffect } from 'react';

interface UserListModalProps {
  onClose: () => void;
}

export default function UserListModal({ onClose }: UserListModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${id}`, {
        method: 'DELETE'
      });
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleUpdatePassword = async (id: number) => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/${id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      setEditingUser(null);
      setNewPassword('');
      alert('Password updated successfully');
    } catch (err) {
      alert('Failed to update password');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: 'clamp(15px, 3vw, 30px)',
        borderRadius: '8px',
        width: '95%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ marginTop: 0, color: '#2c3e50' }}>User List</h2>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(12px, 2vw, 14px)' }}>
          <thead>
            <tr style={{ background: '#ecf0f1' }}>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Name</th>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Username</th>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Password</th>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Role</th>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.name}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.username}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {editingUser?.id === user.id ? (
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      style={{ padding: '5px', width: '100%' }}
                    />
                  ) : (
                    '••••••••'
                  )}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.role}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {editingUser?.id === user.id ? (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => handleUpdatePassword(user.id)}
                        style={{
                          padding: '5px 10px',
                          background: '#27ae60',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingUser(null);
                          setNewPassword('');
                        }}
                        style={{
                          padding: '5px 10px',
                          background: '#95a5a6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => setEditingUser(user)}
                        style={{
                          padding: '5px 10px',
                          background: '#3498db',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        style={{
                          padding: '5px 10px',
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={onClose}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
