import { useState, useEffect } from 'react';
import Navbar from './Navbar';

interface UserDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function UserDashboard({ user, onLogout }: UserDashboardProps) {
  const [shiftDate, setShiftDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [myShifts, setMyShifts] = useState<any[]>([]);
  const [editingShift, setEditingShift] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    fetchMyShifts();
  }, []);

  const fetchMyShifts = async () => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shifts?month=${month}`);
    const data = await res.json();
    setMyShifts(data.filter((s: any) => s.user_id === user.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const startDateTime = `${shiftDate}T${startTime}`;
      const endDateTime = `${shiftDate}T${endTime}`;

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          start_time: startDateTime,
          end_time: endDateTime,
          is_admin: false,
          notes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage('Shift submitted successfully!');
      setShiftDate('');
      setStartTime('');
      setEndTime('');
      setNotes('');
      fetchMyShifts();
    } catch (err: any) {
      setMessage(err.message || 'Failed to submit shift');
    }
  };

  const handleEdit = (shift: any) => {
    setEditingShift(shift.id);
    setEditData({
      start_time: new Date(shift.start_time).toISOString().slice(0, 16),
      end_time: new Date(shift.end_time).toISOString().slice(0, 16),
      notes: shift.notes || ''
    });
  };

  const saveEdit = async (id: number) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shifts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editData, is_admin: false, user_id: user.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEditingShift(null);
      fetchMyShifts();
    } catch (err: any) {
      alert(err.message || 'Cannot edit this shift');
    }
  };

  const deleteShift = async (id: number) => {
    if (!confirm('Delete this shift?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shifts/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_admin: false, user_id: user.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchMyShifts();
    } catch (err: any) {
      alert(err.message || 'Cannot delete this shift');
    }
  };

  const canEdit = (shift: any) => {
    if (shift.approved) return false;
    const now = new Date();
    const monday = new Date(now);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff + 7);
    return now <= monday;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Navbar user={user} onLogout={onLogout} />
      
      <div style={{ textAlign: 'center', padding: '20px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>Welcome, {user.name}</h2>
      </div>
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <h2 style={{ marginTop: 0, color: '#2c3e50' }}>Log New Shift</h2>
          <p style={{ color: '#666', fontSize: '14px' }}>⚠️ Shifts must be logged within 24 hours of working</p>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: '500' }}>Shift Date</label>
              <input type="date" value={shiftDate} onChange={(e) => setShiftDate(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: '500' }}>Start Time</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: '500' }}>End Time</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }} required />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: '500' }}>Notes (optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this shift..."
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', minHeight: '60px' }} />
            </div>
            {message && (
              <p style={{ 
                padding: '10px', borderRadius: '4px',
                background: message.includes('success') ? '#d4edda' : '#f8d7da',
                color: message.includes('success') ? '#155724' : '#721c24',
                marginBottom: '15px'
              }}>{message}</p>
            )}
            <button type="submit" 
              style={{ width: '100%', padding: '12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: '500' }}>
              Submit Shift
            </button>
          </form>
        </div>

        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginTop: 0, color: '#2c3e50' }}>My Shifts This Month</h2>
          <p style={{ color: '#666', fontSize: '14px' }}>✏️ You can edit shifts until Monday of the following week</p>
          {myShifts.length > 0 ? (
            <>
              <div style={{ marginBottom: '20px', padding: '15px', background: '#ecf0f1', borderRadius: '4px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Total Shifts</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>{myShifts.length}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Total Hours</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
                      {myShifts.reduce((sum, s) => sum + (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / (1000 * 60 * 60), 0).toFixed(1)}h
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Approved</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9b59b6' }}>
                      {myShifts.filter(s => s.approved).length}/{myShifts.length}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                  <tr style={{ background: '#34495e', color: 'white' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Start</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>End</th>
                    <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Hours</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Notes</th>
                    <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myShifts.map(shift => {
                    const hours = ((new Date(shift.end_time).getTime() - new Date(shift.start_time).getTime()) / (1000 * 60 * 60)).toFixed(1);
                    const isEditing = editingShift === shift.id;
                    const editable = canEdit(shift);

                    return (
                      <tr key={shift.id}>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                          {new Date(shift.start_time).toLocaleDateString('en-GB')}
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                          {isEditing ? (
                            <input type="datetime-local" value={editData.start_time} 
                              onChange={(e) => setEditData({...editData, start_time: e.target.value})}
                              style={{ width: '100%', padding: '4px' }} />
                          ) : new Date(shift.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                          {isEditing ? (
                            <input type="datetime-local" value={editData.end_time} 
                              onChange={(e) => setEditData({...editData, end_time: e.target.value})}
                              style={{ width: '100%', padding: '4px' }} />
                          ) : new Date(shift.end_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' }}>{hours}h</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', fontSize: '13px', color: '#666' }}>
                          {isEditing ? (
                            <input type="text" value={editData.notes || ''} 
                              onChange={(e) => setEditData({...editData, notes: e.target.value})}
                              placeholder="Add notes..."
                              style={{ width: '100%', padding: '4px' }} />
                          ) : (shift.notes || '-')}
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', background: shift.approved ? '#d4edda' : '#fff3cd', color: shift.approved ? '#155724' : '#856404' }}>
                            {shift.approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                          {editable ? (
                            isEditing ? (
                              <>
                                <button onClick={() => saveEdit(shift.id)} style={{ padding: '6px 12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>Save</button>
                                <button onClick={() => setEditingShift(null)} style={{ padding: '6px 12px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => handleEdit(shift)} style={{ padding: '6px 12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>Edit</button>
                                <button onClick={() => deleteShift(shift.id)} style={{ padding: '6px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                              </>
                            )
                          ) : (
                            <span style={{ color: '#999', fontSize: '12px' }}>Locked</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </>
          ) : (
            <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>No shifts recorded yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
