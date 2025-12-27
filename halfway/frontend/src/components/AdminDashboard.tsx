import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import AddUserModal from './AddUserModal';
import UserListModal from './UserListModal';

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [tab, setTab] = useState<'week' | 'month'>('week');
  const [shifts, setShifts] = useState<any[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchShifts();
  }, [tab]);

  const fetchShifts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shifts?period=${tab}`);
      const data = await response.json();
      setShifts(data);
    } catch (err) {
      console.error('Failed to fetch shifts');
    }
  };

  const calculateHours = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return (diff / (1000 * 60 * 60)).toFixed(2);
  };

  const buildShiftTable = () => {
    const shiftsByDate: any = {};
    
    shifts.forEach(shift => {
      const date = new Date(shift.start_time);
      const dateKey = date.toLocaleDateString('en-GB');
      const userName = shift.halfway_users.name;
      const startTime = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
      const endTime = new Date(shift.end_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
      
      if (!shiftsByDate[dateKey]) shiftsByDate[dateKey] = { date, shifts: [] };
      shiftsByDate[dateKey].shifts.push({ userName, time: `${startTime}-${endTime}` });
    });
    
    if (tab === 'month') {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const weeks: any[][] = [];
      let currentWeek: any[] = [];
      
      for (let i = 0; i < firstDay.getDay(); i++) currentWeek.push(null);
      
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(now.getFullYear(), now.getMonth(), day);
        const dateKey = date.toLocaleDateString('en-GB');
        currentWeek.push(shiftsByDate[dateKey] ? { dateKey, date, shifts: shiftsByDate[dateKey].shifts } : { date, shifts: [] });
        
        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      }
      
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) currentWeek.push(null);
        weeks.push(currentWeek);
      }
      
      return weeks;
    } else {
      const sortedDates = Object.keys(shiftsByDate).sort((a, b) => {
        const [dayA, monthA, yearA] = a.split('/');
        const [dayB, monthB, yearB] = b.split('/');
        return new Date(`${yearA}-${monthA}-${dayA}`).getTime() - new Date(`${yearB}-${monthB}-${dayB}`).getTime();
      });
      
      const weeks: any[][] = [];
      let currentWeek: any[] = [];
      
      if (sortedDates.length > 0) {
        const firstDate = shiftsByDate[sortedDates[0]].date;
        const startDay = firstDate.getDay();
        for (let i = 0; i < startDay; i++) currentWeek.push(null);
      }
      
      sortedDates.forEach(dateKey => {
        const dateData = shiftsByDate[dateKey];
        currentWeek.push({ dateKey, ...dateData });
        
        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      });
      
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) currentWeek.push(null);
        weeks.push(currentWeek);
      }
      
      return weeks;
    }
  };

  const weeks = buildShiftTable();
  
  const toggleWeek = (weekIdx: number) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekIdx)) {
      newExpanded.delete(weekIdx);
    } else {
      newExpanded.add(weekIdx);
    }
    setExpandedWeeks(newExpanded);
  };
  
  const getWeekLabel = (week: any[]) => {
    const firstDay = week.find(d => d)?.date;
    const lastDay = [...week].reverse().find(d => d)?.date;
    if (!firstDay || !lastDay) return 'Empty Week';
    return `${firstDay.getDate()}/${firstDay.getMonth() + 1} - ${lastDay.getDate()}/${lastDay.getMonth() + 1}`;
  };

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
        <div style={{ marginBottom: '25px' }}>
          <button
            onClick={() => setTab('week')}
            style={{
              padding: '12px 30px',
              marginRight: '10px',
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
            This Month
          </button>
        </div>

        <h2 style={{ color: '#2c3e50', marginBottom: '25px' }}>
          {tab === 'week' ? 'Weekly' : 'Monthly'} Shift Schedule
        </h2>

        {weeks.length > 0 ? (
          tab === 'week' ? (
            <div>
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} style={{ marginBottom: '15px', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    onClick={() => toggleWeek(weekIdx)}
                    style={{ 
                      padding: '15px', 
                      background: '#34495e', 
                      color: 'white', 
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontWeight: '600' }}>Week {weekIdx + 1}: {getWeekLabel(week)}</span>
                    <span>{expandedWeeks.has(weekIdx) ? '▼' : '▶'}</span>
                  </div>
                  {expandedWeeks.has(weekIdx) && (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(11px, 1.5vw, 14px)' }}>
                        <thead>
                          <tr style={{ background: '#ecf0f1' }}>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                              <th key={day} style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', width: '14.28%' }}>
                                {day}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            {week.map((day, dayIdx) => (
                              <td key={dayIdx} style={{ padding: '8px', border: '1px solid #ddd', verticalAlign: 'top', height: '100px', background: day ? 'white' : '#f9f9f9' }}>
                                {day && (
                                  <>
                                    <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2c3e50' }}>
                                      {day.date.getDate()}
                                    </div>
                                    {day.shifts.map((shift: any, idx: number) => (
                                      <div key={idx} style={{ fontSize: '11px', background: '#d5f4e6', padding: '4px', marginBottom: '4px', borderRadius: '3px' }}>
                                        <div style={{ fontWeight: '600' }}>{shift.userName}</div>
                                        <div style={{ color: '#555' }}>{shift.time}</div>
                                      </div>
                                    ))}
                                  </>
                                )}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(11px, 1.5vw, 14px)' }}>
                <thead>
                  <tr style={{ background: '#34495e', color: 'white' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <th key={day} style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd', width: '14.28%' }}>
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((week, weekIdx) => (
                    <tr key={weekIdx}>
                      {week.map((day, dayIdx) => (
                        <td key={dayIdx} style={{ padding: '8px', border: '1px solid #ddd', verticalAlign: 'top', height: '100px', background: day ? 'white' : '#f9f9f9' }}>
                          {day && (
                            <>
                              <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2c3e50' }}>
                                {day.date.getDate()}
                              </div>
                              {day.shifts.map((shift: any, idx: number) => (
                                <div key={idx} style={{ fontSize: '11px', background: '#d5f4e6', padding: '4px', marginBottom: '4px', borderRadius: '3px' }}>
                                  <div style={{ fontWeight: '600' }}>{shift.userName}</div>
                                  <div style={{ color: '#555' }}>{shift.time}</div>
                                </div>
                              ))}
                            </>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
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
