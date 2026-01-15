import { useState, useEffect } from 'react';

interface PaymentsTabProps {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
}

export default function PaymentsTab({ selectedMonth, setSelectedMonth }: PaymentsTabProps) {
  const [userHours, setUserHours] = useState<any[]>([]);
  const [payments, setPayments] = useState<any>({});

  useEffect(() => {
    fetchMonthlyHours();
  }, [selectedMonth]);

  const fetchMonthlyHours = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/shifts/monthly-hours?month=${selectedMonth}`);
      const data = await response.json();
      setUserHours(data);
      
      // Fetch existing payments for this month
      const paymentsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/payments?month=${selectedMonth}`);
      const paymentsData = await paymentsResponse.json();
      
      // Initialize payments state with existing data or empty values
      const paymentsMap: any = {};
      data.forEach((user: any) => {
        const existingPayment = paymentsData.find((p: any) => p.user_id === user.user_id);
        paymentsMap[user.user_id] = existingPayment ? {
          amount: existingPayment.amount || '',
          account: existingPayment.account || '',
          comments: existingPayment.comments || '',
          paid: existingPayment.paid || false
        } : {
          amount: '',
          account: '',
          comments: '',
          paid: false
        };
      });
      setPayments(paymentsMap);
    } catch (err) {
      console.error('Failed to fetch monthly hours');
    }
  };

  const handlePaymentChange = (userId: number, field: string, value: any) => {
    setPayments((prev: any) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value
      }
    }));
  };

  const handleSavePayment = async (userId: number) => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          month: selectedMonth,
          ...payments[userId]
        })
      });
      alert('Payment saved successfully!');
    } catch (err) {
      console.error('Failed to save payment');
      alert('Failed to save payment');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <h2 style={{ color: '#2c3e50', margin: 0 }}>Payment Management</h2>
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
      </div>

      {userHours.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ background: '#27ae60', color: 'white' }}>
                <th style={{ padding: '15px', textAlign: 'left', border: '1px solid #ddd' }}>Employee</th>
                <th style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>Total Hours</th>
                <th style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>Total (hrs × £8)</th>
                <th style={{ padding: '15px', textAlign: 'left', border: '1px solid #ddd', minWidth: '150px' }}>Amount Paid (£)</th>
                <th style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>Remaining</th>
                <th style={{ padding: '15px', textAlign: 'left', border: '1px solid #ddd', minWidth: '150px' }}>Account</th>
                <th style={{ padding: '15px', textAlign: 'left', border: '1px solid #ddd', minWidth: '200px' }}>Comments</th>
                <th style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'center', border: '1px solid #ddd' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {userHours.map((user: any) => {
                const totalDue = user.total_hours * 8;
                const amountPaid = parseFloat(payments[user.user_id]?.amount || '0');
                const remaining = totalDue - amountPaid;
                
                return (
                <tr key={user.user_id}>
                  <td style={{ padding: '15px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                    {user.name}
                  </td>
                  <td style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#3498db' }}>
                    {user.total_hours.toFixed(1)}h
                  </td>
                  <td style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>
                    £{totalDue.toFixed(2)}
                  </td>
                  <td style={{ padding: '15px', border: '1px solid #ddd' }}>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={payments[user.user_id]?.amount || ''}
                      onChange={(e) => handlePaymentChange(user.user_id, 'amount', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </td>
                  <td style={{ 
                    padding: '15px', 
                    border: '1px solid #ddd', 
                    textAlign: 'center', 
                    fontSize: '16px', 
                    fontWeight: 'bold',
                    color: remaining > 0 ? '#e74c3c' : '#27ae60'
                  }}>
                    £{remaining.toFixed(2)}
                  </td>
                  <td style={{ padding: '15px', border: '1px solid #ddd' }}>
                    <select
                      value={payments[user.user_id]?.account || ''}
                      onChange={(e) => handlePaymentChange(user.user_id, 'account', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Select Account</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="PayPal">PayPal</option>
                      <option value="Other">Other</option>
                    </select>
                  </td>
                  <td style={{ padding: '15px', border: '1px solid #ddd' }}>
                    <textarea
                      placeholder="Add comments..."
                      value={payments[user.user_id]?.comments || ''}
                      onChange={(e) => handlePaymentChange(user.user_id, 'comments', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        minHeight: '60px',
                        resize: 'vertical'
                      }}
                    />
                  </td>
                  <td style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={payments[user.user_id]?.paid || false}
                        onChange={(e) => handlePaymentChange(user.user_id, 'paid', e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontWeight: 'bold', color: payments[user.user_id]?.paid ? '#27ae60' : '#e74c3c' }}>
                        {payments[user.user_id]?.paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </label>
                  </td>
                  <td style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <button
                      onClick={() => handleSavePayment(user.user_id)}
                      style={{
                        padding: '8px 20px',
                        background: '#27ae60',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              )})}
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
          No shifts recorded for this month.
        </div>
      )}
    </div>
  );
}
