import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function LoginPage({ setUser }) {
  const [userName, setUserName] = useState('')
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Завантажити збережене ім'я з localStorage
    const savedUserName = localStorage.getItem('userName')
    if (savedUserName) {
      setUserName(savedUserName)
    }

    // Завантажити доступні події
    fetch('/api/admin/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data.events)
        if (data.events.length > 0) {
          setSelectedEvent(data.events[0].id)
        }
      })
      .catch(() => setError('Помилка завантаження подій'))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!userName.trim()) {
      setError('Введіть ваше ім\'я')
      return
    }

    if (!selectedEvent) {
      setError('Виберіть подію')
      return
    }

    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userName: userName.trim(),
          eventId: selectedEvent
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Зберегти ім'я користувача в localStorage
        localStorage.setItem('userName', userName.trim())
        setUser(data.user)
        navigate('/')
      } else {
        setError(data.error || 'Помилка входу')
      }
    } catch (err) {
      setError('Помилка з\'єднання з сервером')
    }
  }

  if (loading) {
    return <div className="loading">Завантаження...</div>
  }

  return (
    <div className="container">
      <h1>🎉 Family Evening</h1>
      <div className="card">
        <h2>Вхід на подію</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="input"
            placeholder="Введіть ваше ім'я"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            maxLength={50}
          />
          <select
            className="event-select"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.name} - {new Date(event.event_date).toLocaleDateString('uk-UA')}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">
            Увійти
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
