export default function EventSuccessPage() {
  return (
    <section style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '70vh',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
        background: 'white',
        padding: '50px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎉</div>
        <h1 style={{ color: '#28a745', marginBottom: '20px' }}>Booking Confirmed!</h1>
        <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#666', marginBottom: '30px' }}>
          Thank you for booking! Your tickets have been confirmed and sent to your email.
        </p>

        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '30px',
          borderRadius: '12px',
          color: 'white',
          marginBottom: '30px'
        }}>
          <h3 style={{ margin: '0 0 15px', fontSize: '22px' }}>🎁 Your Monthly Discount!</h3>
          <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.6' }}>
            Check your email for your first <strong>15% discount code</strong>!
            <br/><br/>
            You'll receive a new code every month for the next 12 months.
            <br/>
            Use it on any food order (max £40 discount per order).
          </p>
        </div>

        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '15px 40px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Continue Shopping
        </button>
      </div>
    </section>
  )
}
