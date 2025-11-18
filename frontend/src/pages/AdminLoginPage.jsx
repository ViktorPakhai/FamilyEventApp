import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'

function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { adminLogin } = useAdminAuth()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (adminLogin(username, password)) {
      navigate('/admin')
    } else {
      setError('Невірний логін або пароль')
      setPassword('')
    }
  }

  return (
    <div className="container">
      <h1>🔐 Вхід Адміністратора</h1>
      <div className="card">
        <h2>Авторизація</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="input"
            placeholder="Логін"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
          <input
            type="password"
            className="input"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button type="submit" className="btn btn-primary">
            Увійти
          </button>
        </form>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a href="/" className="back-btn">
            ← Повернутися на головну
          </a>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage
