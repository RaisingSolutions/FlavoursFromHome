import './App.css'

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-brand">
          <img src="/src/FFH_Logo.png" alt="FFH Logo" className="navbar-logo" />
          Flavours From Home
        </div>
        <div className="navbar-actions">
          <button className="cart-btn">
            🛒 Cart (0)
          </button>
        </div>
      </nav>
      
      <main className="main-content">
        <h1>Welcome to Flavours From Home</h1>
      </main>
    </div>
  )
}

export default App