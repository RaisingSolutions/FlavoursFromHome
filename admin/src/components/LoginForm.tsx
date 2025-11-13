import { useState } from 'react'
import * as API from '../APIS'

interface LoginFormProps {
  onLogin: (data: any) => void
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    try {
      const data = await API.adminLogin(username, password)
      
      if (data.username) {
        onLogin(data)
        setError('')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Connection failed')
    }
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-logo">
          <img src="/src/FFH_Logo.png" alt="Flavours From Home Logo" className="login-logo-img" />
          <h1>Flavours From Home Admin</h1>
          <p className="login-description">
            Enter your credentials to access the admin panel
          </p>
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  )
}