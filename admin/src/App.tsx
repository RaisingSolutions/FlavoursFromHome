import { useState, useEffect } from 'react'
import './App.css'
import LoginForm from './components/LoginForm'
import Dashboard from './components/Dashboard'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [adminId, setAdminId] = useState('')
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    const savedLoginState = localStorage.getItem('adminLoginState')
    if (savedLoginState) {
      const { isLoggedIn, isSuperAdmin, adminId, role } = JSON.parse(savedLoginState)
      setIsLoggedIn(isLoggedIn)
      setIsSuperAdmin(isSuperAdmin)
      setAdminId(adminId)
      setUserRole(role || 'admin')
    }
  }, [])

  const handleLogin = (data: any) => {
    setIsLoggedIn(true)
    setIsSuperAdmin(data.is_super_admin)
    setAdminId(data.id.toString())
    setUserRole(data.role || 'admin')
    
    localStorage.setItem('adminLoginState', JSON.stringify({
      isLoggedIn: true,
      loggedInUser: data.username,
      isSuperAdmin: data.is_super_admin,
      adminId: data.id.toString(),
      role: data.role || 'admin'
    }))
  }

  const handleSignOut = () => {
    setIsLoggedIn(false)
    setIsSuperAdmin(false)
    setAdminId('')
    setUserRole('')
    localStorage.removeItem('adminLoginState')
  }

  if (isLoggedIn) {
    return (
      <Dashboard 
        isSuperAdmin={isSuperAdmin}
        adminId={adminId}
        userRole={userRole}
        onSignOut={handleSignOut}
      />
    )
  }

  return <LoginForm onLogin={handleLogin} />
}

export default App