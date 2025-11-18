import { createContext, useContext, useState, useEffect } from 'react'

const AdminAuthContext = createContext()

export function AdminAuthProvider({ children }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Перевірити чи є збережена сесія адміна
    const adminAuth = localStorage.getItem('adminAuth')
    if (adminAuth === 'true') {
      setIsAdminAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const adminLogin = (username, password) => {
    // Проста перевірка (в production треба робити через backend)
    if (username === 'admin' && password === 'password') {
      setIsAdminAuthenticated(true)
      localStorage.setItem('adminAuth', 'true')
      return true
    }
    return false
  }

  const adminLogout = () => {
    setIsAdminAuthenticated(false)
    localStorage.removeItem('adminAuth')
  }

  return (
    <AdminAuthContext.Provider value={{ isAdminAuthenticated, adminLogin, adminLogout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  return useContext(AdminAuthContext)
}
