export default function OurStoryPage() {
  return (
    <div style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)', minHeight: '100vh', padding: '60px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '60px',
          padding: '40px 20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          color: 'white',
          boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
        }}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px', fontWeight: 'bold' }}>Welcome to Flavours From Home</h1>
          <div style={{ fontSize: '24px', fontStyle: 'italic', lineHeight: '1.6' }}>
            <p style={{ margin: '10px 0' }}>Food isn't just something you eat.</p>
            <p style={{ margin: '10px 0' }}>It's something you experience.</p>
          </div>
        </div>

        {/* Mission Statement */}
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          marginBottom: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          fontSize: '18px',
          lineHeight: '1.8',
          textAlign: 'center'
        }}>
          <p style={{ color: '#2c3e50' }}>
            At Flavours From Home, we connect people to food they can trust — from the soil it grows in to the plate it's served on. 
            We are building a transparent, modern food ecosystem where quality, flavour, and authenticity come first.
          </p>
        </div>

        {/* Groceries Section */}
        <div style={{
          background: 'white',
          padding: '50px 40px',
          borderRadius: '16px',
          marginBottom: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderLeft: '6px solid #27ae60'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px' }}>
            <span style={{ fontSize: '48px', marginRight: '20px' }}>🛒</span>
            <h2 style={{ color: '#27ae60', fontSize: '32px', margin: 0 }}>Groceries – From Farm to Fork</h2>
          </div>
          
          <div style={{ fontSize: '17px', lineHeight: '1.8', color: '#34495e' }}>
            <p style={{ marginBottom: '20px', fontSize: '19px', fontWeight: 'bold', color: '#27ae60' }}>
              We don't just sell products. We tell their story.
            </p>
            
            <div style={{ background: '#f0f9f4', padding: '25px', borderRadius: '12px', marginBottom: '20px' }}>
              <p style={{ marginBottom: '12px' }}>✓ Every product comes with a clear source of origin</p>
              <p style={{ marginBottom: '12px' }}>✓ Supply chain tracking from "farm to fork"</p>
              <p style={{ marginBottom: '0', fontWeight: 'bold', color: '#27ae60' }}>✓ Transparency. Traceability. Trust.</p>
            </div>
            
            <p style={{ marginBottom: '15px' }}>When customers shop with Flavours From Home, they know exactly what they're bringing home.</p>
            <p style={{ fontStyle: 'italic', fontSize: '18px', color: '#27ae60', fontWeight: '500' }}>
              This is the future of grocery — and we're building it now.
            </p>
          </div>
        </div>

        {/* Hot Food Section */}
        <div style={{
          background: 'white',
          padding: '50px 40px',
          borderRadius: '16px',
          marginBottom: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderLeft: '6px solid #e67e22'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px' }}>
            <span style={{ fontSize: '48px', marginRight: '20px' }}>🍲</span>
            <h2 style={{ color: '#e67e22', fontSize: '32px', margin: 0 }}>Hot Food – Powering Local Kitchens</h2>
          </div>
          
          <div style={{ fontSize: '17px', lineHeight: '1.8', color: '#34495e' }}>
            <p style={{ marginBottom: '20px', fontSize: '19px', fontWeight: 'bold', color: '#e67e22' }}>
              Great food deserves a bigger stage.
            </p>
            
            <p style={{ marginBottom: '25px' }}>
              We collaborate with talented chefs, restaurants, and cloud kitchens across each city to deliver bold flavours straight to customers' doors.
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              margin: '30px 0',
              textAlign: 'center'
            }}>
              <div style={{ background: '#fef5e7', padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#e67e22', margin: 0 }}>Real kitchens.</p>
              </div>
              <div style={{ background: '#fef5e7', padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#e67e22', margin: 0 }}>Real recipes.</p>
              </div>
              <div style={{ background: '#fef5e7', padding: '20px', borderRadius: '12px' }}>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#e67e22', margin: 0 }}>Real taste.</p>
              </div>
            </div>
            
            <p style={{ marginBottom: '15px', fontSize: '18px' }}>You cook. We connect. Customers enjoy.</p>
            <p style={{ fontStyle: 'italic', fontSize: '18px', color: '#e67e22', fontWeight: '500' }}>
              Simple. Powerful. Scalable.
            </p>
          </div>
        </div>

        {/* Partnership CTA */}
        <div style={{
          background: 'linear-gradient(135deg, #8e44ad 0%, #3498db 100%)',
          padding: '50px 40px',
          borderRadius: '20px',
          color: 'white',
          boxShadow: '0 10px 40px rgba(142, 68, 173, 0.3)'
        }}>
          <h2 style={{ fontSize: '36px', marginBottom: '25px', textAlign: 'center' }}>🚀 Ready to Grow With Us?</h2>
          
          <p style={{ fontSize: '18px', marginBottom: '30px', textAlign: 'center', lineHeight: '1.6' }}>
            We're expanding into new cities — and we're looking for ambitious partners who want to grow fast.
          </p>
          
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            padding: '30px',
            borderRadius: '12px',
            marginBottom: '30px',
            backdropFilter: 'blur(10px)'
          }}>
            <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Are you a:</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px'
            }}>
              {['Farmer', 'Grocery supplier', 'Distributor', 'Restaurant', 'Cloud kitchen', 'Food brand'].map(role => (
                <div key={role} style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '15px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500'
                }}>
                  ✓ {role}
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '17px', marginBottom: '15px', lineHeight: '1.6' }}>
              If you're serious about quality and ready to scale, we want you on our platform.
            </p>
            <p style={{ fontSize: '19px', fontWeight: 'bold', marginBottom: '10px' }}>
              This is more than a partnership.
            </p>
            <p style={{ fontSize: '17px', marginBottom: '30px' }}>
              This is a movement toward transparent sourcing and smarter food delivery.
            </p>
            
            <div style={{
              background: 'white',
              color: '#8e44ad',
              padding: '30px',
              borderRadius: '12px',
              marginTop: '30px'
            }}>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 15px 0' }}>Join Flavours From Home.</p>
              <p style={{ fontSize: '20px', fontStyle: 'italic', margin: 0 }}>Let's build the future of food — together.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
