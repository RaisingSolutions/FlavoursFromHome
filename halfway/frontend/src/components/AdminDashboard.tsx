import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import AddUserModal from './AddUserModal';
import UserListModal from './UserListModal';
import PaymentsTab from './PaymentsTab';

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [tab, setTab] = useState<'week' | 'month' | 'payments'>('week');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [shifts, setShifts] = useState<any[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showUserList, setShowUserList] = useState(false);

  useEffect(() => {
    if (tab !== 'payments') {
      fetchShifts();
    }
  }, [tab, selectedMonth]);

  const fetchShifts = async () => {
    try {
      let url = `${import.meta.env.VITE_API_BASE_URL}/shifts?period=${tab}`;
      if (tab === 'month') {
        url += `&month=${selectedMonth}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setShifts(data);
    } catch (err) {
      console.error('Failed to fetch shifts');
    }
  };

  const calculateHours = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return (diff / (1000 * 60 * 60));
  };

  const buildShiftTable = () => {
    const dates: string[] = [];
    const dateLabels: string[] = [];
    const userShifts: any = {};
    const dailyTotals: any = {};
    const userTotals: any = {};
    
    shifts.forEach(shift => {
      const date = new Date(shift.start_time);
      const dateKey = date.toLocaleDateString('en-GB');
      const dayLabel = date.toLocaleDateString('en-GB', { weekday: 'short' });
      const fullLabel = `${dayLabel} (${dateKey})`;
      const userName = shift.halfway_users.name;
      const hours = calculateHours(shift.start_time, shift.end_time);
      const startTime = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
      const endTime = new Date(shift.end_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
      
      if (!dates.includes(dateKey)) {
        dates.push(dateKey);
        dateLabels.push(fullLabel);
        dailyTotals[dateKey] = 0;
      }
      
      if (!userShifts[userName]) userShifts[userName] = {};
      if (!userShifts[userName][dateKey]) userShifts[userName][dateKey] = { times: [], totalHours: 0 };
      userShifts[userName][dateKey].times.push(`${startTime}-${endTime}`);
      userShifts[userName][dateKey].totalHours += hours;
      dailyTotals[dateKey] += hours;
      userTotals[userName] = (userTotals[userName] || 0) + hours;
    });
    
    return { dates, dateLabels, userShifts, dailyTotals, userTotals };
  };

  const { dates, dateLabels, userShifts, dailyTotals, userTotals } = buildShiftTable();
  const userNames = Object.keys(userShifts);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Navbar 
        user={user} 
        onLogout={onLogout}
        onAddUser={() => setShowAddUser(true)}
        onUserList={() => setShowUserList(true)}
      />
      
      <div style={{ textAlign: 'center', padding: '20px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h2 style={{ margin: 0, color: '#2c3e50', fontSize: 'clamp(18px, 4vw, 24px)' }}>Welcome, {user.name}</h2>
      </div>
      
      <div style={{ padding: '20px', width: '100%' }}>
        <div style={{ marginBottom: '25px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setTab('week')}
            style={{
              padding: '12px 30px',
              background: tab === 'week' ? '#3498db' : 'white',
              color: tab === 'week' ? 'white' : '#555',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '500'
            }}
          >
            This Week
          </button>
          <button
            onClick={() => setTab('month')}
            style={{
              padding: '12px 30px',
              background: tab === 'month' ? '#3498db' : 'white',
              color: tab === 'month' ? 'white' : '#555',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '500'
            }}
          >
            Monthly View
          </button>
          <button
            onClick={() => setTab('payments')}
            style={{
              padding: '12px 30px',
              background: tab === 'payments' ? '#27ae60' : 'white',
              color: tab === 'payments' ? 'white' : '#555',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '500'
            }}
          >
            Payments
          </button>
          
          {tab === 'month' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: '12px 20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '15px',
                cursor: 'pointer'
              }}
            />
          )}
        </div>

        {tab === 'payments' ? (
          <PaymentsTab selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
        ) : (
          <>
            <h2 style={{ color: '#2c3e50', marginBottom: '25px' }}>
              {tab === 'week' ? 'Weekly' : 'Monthly'} Shift Schedule
            </h2>

        {dates.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <thead>
                <tr style={{ background: '#34495e', color: 'white' }}>
                  <th style={{ padding: '15px', textAlign: 'left', border: '1px solid #ddd', position: 'sticky', left: 0, background: '#34495e', zIndex: 10 }}>Date</th>
                  {userNames.map(userName => (
                    <th key={userName} style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd', minWidth: '120px' }}>
                      <div>{userName}</div>
                      <div style={{ fontSize: '12px', fontWeight: 'normal', marginTop: '4px', opacity: 0.9 }}>({userTotals[userName].toFixed(1)}h)</div>
                    </th>
                  ))}
                  <th style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd', background: '#3498db', minWidth: '120px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {dates.map((date, idx) => (
                  <tr key={date}>
                    <td style={{ padding: '15px', border: '1px solid #ddd', fontWeight: '600', background: '#ecf0f1', position: 'sticky', left: 0, zIndex: 5 }}>
                      {dateLabels[idx]}
                    </td>
                    {userNames.map(userName => (
                      <td key={userName} style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center', background: userShifts[userName][date] ? '#d5f4e6' : 'white' }}>
                        {userShifts[userName][date] ? (
                          <div>
                            <div style={{ fontSize: '12px', color: '#555', marginBottom: '4px' }}>
                              {userShifts[userName][date].times.join(', ')}
                            </div>
                            <div style={{ fontWeight: 'bold' }}>{userShifts[userName][date].totalHours.toFixed(1)}h</div>
                          </div>
                        ) : '-'}
                      </td>
                    ))}
                    <td style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', background: '#e3f2fd' }}>
                      {dailyTotals[date].toFixed(1)}h
                    </td>
                  </tr>
                ))}
                <tr style={{ background: '#3498db', color: 'white', fontWeight: 'bold' }}>
                  <td style={{ padding: '15px', border: '1px solid #ddd', position: 'sticky', left: 0, background: '#3498db', zIndex: 5 }}>Total</td>
                  {userNames.map(userName => (
                    <td key={userName} style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center' }}>
                      {userTotals[userName].toFixed(1)}h
                    </td>
                  ))}
                  <td style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center' }}>
                    {Object.values(dailyTotals).reduce((sum: number, val: any) => sum + val, 0).toFixed(1)}h
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ 
            background: 'white', 
            padding: '40px', 
            textAlign: 'center', 
            borderRadius: '8px',
            color: '#999'
          }}>
            No shifts recorded for this {tab}.
          </div>
        )}
          </>
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
