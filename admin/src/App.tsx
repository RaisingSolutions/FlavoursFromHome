/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import './App.css'
import LoginForm from './components/LoginForm'
import Dashboard from './components/Dashboard'
import { ToastProvider } from './context/ToastContext'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [adminId, setAdminId] = useState('')
  const [userRole, setUserRole] = useState('')
  const [userLocation, setUserLocation] = useState<string | null>(null)

  useEffect(() => {
    const savedLoginState = localStorage.getItem('adminLoginState')
    if (savedLoginState) {
      const parsed = JSON.parse(savedLoginState)
      if (parsed.isLoggedIn) {
        const loginData = {
          isLoggedIn: parsed.isLoggedIn,
          isSuperAdmin: parsed.isSuperAdmin,
          adminId: parsed.adminId,
          role: parsed.role || 'admin',
          location: parsed.location || null
        }
        setIsLoggedIn(loginData.isLoggedIn)
        setIsSuperAdmin(loginData.isSuperAdmin)
        setAdminId(loginData.adminId)
        setUserRole(loginData.role)
        setUserLocation(loginData.location)
      }
    }
  }, [])

  const handleLogin = (data: any) => {
    setIsLoggedIn(true)
    setIsSuperAdmin(data.is_super_admin)
    setAdminId(data.id.toString())
    setUserRole(data.role || 'admin')
    setUserLocation(data.location || null)
    
    localStorage.setItem('adminLoginState', JSON.stringify({
      isLoggedIn: true,
      loggedInUser: data.username,
      isSuperAdmin: data.is_super_admin,
      adminId: data.id.toString(),
      role: data.role || 'admin',
      location: data.location || null
    }))
  }

  const handleSignOut = () => {
    setIsLoggedIn(false)
    setIsSuperAdmin(false)
    setAdminId('')
    setUserRole('')
    setUserLocation(null)
    localStorage.removeItem('adminLoginState')
  }

  if (isLoggedIn) {
    return (
      <ToastProvider>
        <Dashboard 
          isSuperAdmin={isSuperAdmin}
          adminId={adminId}
          userRole={userRole}
          userLocation={userLocation}
          onSignOut={handleSignOut}
        />
      </ToastProvider>
    )
  }

  return (
    <ToastProvider>
      <LoginForm onLogin={handleLogin} />
    </ToastProvider>
  )
}

export default App