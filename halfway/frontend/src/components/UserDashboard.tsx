import { useState } from 'react';
import Navbar from './Navbar';

interface UserDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function UserDashboard({ user, onLogout }: UserDashboardProps) {
  const [shiftDate, setShiftDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const startDateTime = `${shiftDate}T${startTime}`;
      const endDateTime = `${shiftDate}T${endTime}`;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          start_time: startDateTime,
          end_time: endDateTime
        })
      });

      if (!response.ok) throw new Error('Failed to submit shift');

      setMessage('Shift submitted successfully!');
      setShiftDate('');
      setStartTime('');
      setEndTime('');
    } catch (err) {
      setMessage('Failed to submit shift');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Navbar user={user} onLogout={onLogout} />
      
      <div style={{ textAlign: 'center', padding: '20px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ margin: 0, color: '#2c3e50', fontSize: 'clamp(18px, 4vw, 24px)' }}>Welcome, {user.name}</h2>
      </div>
      
      <div style={{ padding: '20px', width: '100%' }}>
        <div style={{ background: 'white', padding: 'clamp(20px, 5vw, 30px)', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginTop: 0, color: '#2c3e50' }}>Enter Your Shift</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: '500' }}>Shift Date</label>
              <input
                type="date"
                value={shiftDate}
                onChange={(e) => setShiftDate(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                required
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: '500' }}>Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                required
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: '500' }}>End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                required
              />
            </div>
            {message && (
              <p style={{ 
                padding: '10px', 
                borderRadius: '4px',
                background: message.includes('success') ? '#d4edda' : '#f8d7da',
                color: message.includes('success') ? '#155724' : '#721c24',
                marginBottom: '15px'
              }}>
                {message}
              </p>
            )}
            <button 
              type="submit" 
              style={{ 
                width: '100%', 
                padding: '12px', 
                background: '#27ae60', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              Submit Shift
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
