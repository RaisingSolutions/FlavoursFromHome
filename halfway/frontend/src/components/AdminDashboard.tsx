import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import AddUserModal from './AddUserModal';
import UserListModal from './UserListModal';

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [tab, setTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [shifts, setShifts] = useState<any[]>([]);
  const [payments, setPayments] = useState<any>({});
  const [editingShift, setEditingShift] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showAddUser, setShowAddUser] = useState(false);
  const [showUserList, setShowUserList] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    try {
      const [shiftsRes, paymentsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/shifts?month=${selectedMonth}`),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/payments?month=${selectedMonth}`)
      ]);
      const shiftsData = await shiftsRes.json();
      const paymentsData = await paymentsRes.json();
      setShifts(Array.isArray(shiftsData) ? shiftsData : []);

      const paymentsMap: any = {};
      paymentsData.forEach((p: any) => {
        paymentsMap[p.user_id] = p;
      });
      setPayments(paymentsMap);
    } catch (err) {
      setShifts([]);
      setPayments({});
    }
  };

  const handleEdit = (shift: any) => {
    setEditingShift(shift.id);
    setEditData({
      start_time: new Date(shift.start_time).toISOString().slice(0, 16),
      end_time: new Date(shift.end_time).toISOString().slice(0, 16)
    });
  };

  const saveEdit = async (id: number) => {
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/shifts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editData, is_admin: true, user_id: user.id })
    });
    setEditingShift(null);
    fetchData();
  };

  const deleteShift = async (id: number) => {
    if (!confirm('Delete this shift?')) return;
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/shifts/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_admin: true, user_id: user.id })
    });
    fetchData();
  };

  const approveWeek = async (weekStart: string) => {
    if (!confirm('Approve all shifts for this week?')) return;
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/shifts/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week_start: weekStart, admin_id: user.id })
    });
    fetchData();
  };

  const savePayment = async (userId: number) => {
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, month: selectedMonth, ...payments[userId] })
    });
    alert('Payment saved');
  };

  const exportData = () => {
    window.open(`${import.meta.env.VITE_API_BASE_URL}/export/month?month=${selectedMonth}`, '_blank');
  };

  const groupByDate = () => {
    const grouped: any = {};
    shifts.forEach(shift => {
      const date = new Date(shift.start_time).toLocaleDateString('en-GB');
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(shift);
    });
    return grouped;
  };

  const groupByWeek = () => {
    const grouped: any = {};
    shifts.filter(s => s.approved).forEach(shift => {
      const week = shift.week_start;
      if (!grouped[week]) grouped[week] = [];
      grouped[week].push(shift);
    });
    return grouped;
  };

  const getUserTotals = () => {
    const totals: any = {};
    shifts.filter(s => s.approved).forEach(shift => {
      const hours = (new Date(shift.end_time).getTime() - new Date(shift.start_time).getTime()) / (1000 * 60 * 60);
      const userId = shift.user_id;
      if (!totals[userId]) totals[userId] = { name: shift.halfway_users.name, hours: 0 };
      totals[userId].hours += hours;
    });
    return totals;
  };

  const groupedShifts = groupByDate();
  const weeklyShifts = groupByWeek();
  const userTotals = getUserTotals();

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Navbar 
        user={user} 
        onLogout={onLogout}
        onAddUser={() => setShowAddUser(true)}
        onUserList={() => setShowUserList(true)}
      />
      
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => setTab('daily')} style={{ padding: '10px 20px', background: tab === 'daily' ? '#3498db' : 'white', color: tab === 'daily' ? 'white' : '#555', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
            Daily Approvals
          </button>
          <button onClick={() => setTab('weekly')} style={{ padding: '10px 20px', background: tab === 'weekly' ? '#3498db' : 'white', color: tab === 'weekly' ? 'white' : '#555', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
            Weekly Hours
          </button>
          <button onClick={() => setTab('monthly')} style={{ padding: '10px 20px', background: tab === 'monthly' ? '#27ae60' : 'white', color: tab === 'monthly' ? 'white' : '#555', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
            Monthly Payments
          </button>
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} 
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
          <button onClick={exportData} style={{ padding: '10px 20px', background: '#e67e22', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Export CSV
          </button>
        </div>

        {tab === 'daily' && (
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
            <h3>Daily Shifts - Approve by Week</h3>
            {Object.keys(groupedShifts).map(date => {
              const dayShifts = groupedShifts[date];
              const weekStart = dayShifts[0]?.week_start;
              const allApproved = dayShifts.every((s: any) => s.approved);
              const dayTotal = dayShifts.reduce((sum: number, s: any) => 
                sum + (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / (1000 * 60 * 60), 0);

              return (
                <div key={date} style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '4px', padding: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                    <h4 style={{ margin: 0 }}>{date} - Total: {dayTotal.toFixed(1)}h</h4>
                    {!allApproved && <button onClick={() => approveWeek(weekStart)} 
                      style={{ padding: '5px 15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Approve Week
                    </button>}
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ background: '#ecf0f1' }}>
                          <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Employee</th>
                          <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Start</th>
                          <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>End</th>
                          <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>Hours</th>
                          <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>Status</th>
                          <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayShifts.map((shift: any) => {
                          const hours = ((new Date(shift.end_time).getTime() - new Date(shift.start_time).getTime()) / (1000 * 60 * 60)).toFixed(1);
                          const isEditing = editingShift === shift.id;

                          return (
                            <tr key={shift.id}>
                              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{shift.halfway_users.name}</td>
                              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                {isEditing ? (
                                  <input type="datetime-local" value={editData.start_time} 
                                    onChange={(e) => setEditData({...editData, start_time: e.target.value})}
                                    style={{ width: '100%', padding: '4px', fontSize: '12px' }} />
                                ) : new Date(shift.start_time).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                {isEditing ? (
                                  <input type="datetime-local" value={editData.end_time} 
                                    onChange={(e) => setEditData({...editData, end_time: e.target.value})}
                                    style={{ width: '100%', padding: '4px', fontSize: '12px' }} />
                                ) : new Date(shift.end_time).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' }}>{hours}h</td>
                              <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: shift.approved ? '#d4edda' : '#fff3cd', color: shift.approved ? '#155724' : '#856404' }}>
                                  {shift.approved ? 'Approved' : 'Pending'}
                                </span>
                              </td>
                              <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                                {isEditing ? (
                                  <>
                                    <button onClick={() => saveEdit(shift.id)} style={{ padding: '4px 8px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontSize: '12px' }}>Save</button>
                                    <button onClick={() => setEditingShift(null)} style={{ padding: '4px 8px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => handleEdit(shift)} style={{ padding: '4px 8px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontSize: '12px' }}>Edit</button>
                                    <button onClick={() => deleteShift(shift.id)} style={{ padding: '4px 8px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'weekly' && (
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
            <h3>Weekly Hours (Approved Only)</h3>
            {Object.keys(weeklyShifts).length > 0 ? Object.keys(weeklyShifts).map(week => {
              const weekShifts = weeklyShifts[week];
              const userWeekTotals: any = {};
              weekShifts.forEach((shift: any) => {
                const hours = (new Date(shift.end_time).getTime() - new Date(shift.start_time).getTime()) / (1000 * 60 * 60);
                const userId = shift.user_id;
                if (!userWeekTotals[userId]) userWeekTotals[userId] = { name: shift.halfway_users.name, hours: 0 };
                userWeekTotals[userId].hours += hours;
              });

              return (
                <div key={week} style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '4px', padding: '15px' }}>
                  <h4>Week Starting: {new Date(week).toLocaleDateString('en-GB')}</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#3498db', color: 'white' }}>
                        <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Employee</th>
                        <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Total Hours</th>
                        <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Total Due (£8/h)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(userWeekTotals).map(userId => {
                        const total = userWeekTotals[userId];
                        return (
                          <tr key={userId}>
                            <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>{total.name}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '16px', fontWeight: 'bold' }}>{total.hours.toFixed(1)}h</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '16px', fontWeight: 'bold' }}>£{(total.hours * 8).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            }) : <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>No approved shifts yet</p>}
          </div>
        )}

        {tab === 'monthly' && (
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
            <h3>Monthly Summary & Payments (Approved Only)</h3>
            {Object.keys(userTotals).length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#27ae60', color: 'white' }}>
                      <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Employee</th>
                      <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Total Hours</th>
                      <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Total Due (£8/h)</th>
                      <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd', minWidth: '200px' }}>Payment Notes</th>
                      <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Status</th>
                      <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(userTotals).map(userId => {
                      const total = userTotals[userId];
                      const payment = payments[userId] || {};
                      return (
                        <tr key={userId}>
                          <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>{total.name}</td>
                          <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>{total.hours.toFixed(1)}h</td>
                          <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>£{(total.hours * 8).toFixed(2)}</td>
                          <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                            <textarea value={payment.comments || ''} 
                              onChange={(e) => setPayments({...payments, [userId]: {...payment, comments: e.target.value}})}
                              placeholder="Add payment notes..."
                              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px', fontSize: '14px' }} />
                          </td>
                          <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={payment.paid || false} 
                                onChange={(e) => setPayments({...payments, [userId]: {...payment, paid: e.target.checked}})}
                                style={{ width: '18px', height: '18px' }} />
                              <span style={{ fontWeight: 'bold', color: payment.paid ? '#27ae60' : '#e74c3c' }}>
                                {payment.paid ? 'Paid' : 'Unpaid'}
                              </span>
                            </label>
                          </td>
                          <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                            <button onClick={() => savePayment(parseInt(userId))} 
                              style={{ padding: '8px 20px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                              Save
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>No approved shifts for payment yet</p>}
          </div>
        )}
      </div>

      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onUserAdded={() => setShowAddUser(false)}
        />
      )}
      
      {showUserList && (
        <UserListModal onClose={() => setShowUserList(false)} />
      )}
    </div>
  );
}
