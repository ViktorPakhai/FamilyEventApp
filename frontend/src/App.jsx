import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import QuestionPage from './pages/QuestionPage'
import GamesPage from './pages/GamesPage'
import GamePlayPage from './pages/GamePlayPage'
import AdminPage from './pages/AdminPage'
import AdminLoginPage from './pages/AdminLoginPage'
// import GameLiveResultsPage from './pages/GameLiveResultsPage'

// Компонент для захисту адмін роутів
function ProtectedAdminRoute({ children }) {
  const { isAdminAuthenticated, loading } = useAdminAuth()

  if (loading) {
    return <div className="loading">Завантаження...</div>
  }

  return isAdminAuthenticated ? children : <Navigate to="/admin/login" />
}

function AppRoutes() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Перевірити чи є активна сесія
    fetch('/api/user/session', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="loading">Завантаження...</div>
  }

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to="/" /> : <LoginPage setUser={setUser} />
      } />
      <Route path="/" element={
        user ? <HomePage user={user} setUser={setUser} /> : <Navigate to="/login" />
      } />
      <Route path="/question" element={
        user ? <QuestionPage user={user} /> : <Navigate to="/login" />
      } />
      <Route path="/games" element={
        user ? <GamesPage user={user} /> : <Navigate to="/login" />
      } />
      <Route path="/games/:gameId" element={
        user ? <GamePlayPage user={user} /> : <Navigate to="/login" />
      } />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={
        <ProtectedAdminRoute>
          <AdminPage />
        </ProtectedAdminRoute>
      } />
      {/* <Route path="/admin/games/:gameId/live" element={
        <ProtectedAdminRoute>
          <GameLiveResultsPage />
        </ProtectedAdminRoute>
      } /> */}
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AppRoutes />
      </AdminAuthProvider>
    </BrowserRouter>
  )
}

export default App
