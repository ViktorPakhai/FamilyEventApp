import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function HomePage({ user, setUser }) {
  const navigate = useNavigate()
  const [eventData, setEventData] = useState(null)

  useEffect(() => {
    // Завантажити дані про подію, щоб перевірити чи увімкнені ігри
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        const currentEvent = data.events.find(e => e.id === user.eventId)
        setEventData(currentEvent)
      })
      .catch(err => console.error('Error loading event:', err))
  }, [user.eventId])

  const handleLogout = async () => {
    await fetch('/api/user/logout', {
      method: 'POST',
      credentials: 'include'
    })
    setUser(null)
    navigate('/login')
  }

  return (
    <div className="container">
      <h1>Вітаємо, {user.name}! 👋</h1>
      <div className="card">
        <h2>Оберіть дію</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/question')}
        >
          ❓ Задати питання
        </button>
        {eventData?.games_enabled && (
          <button
            className="btn btn-primary"
            onClick={() => navigate('/games')}
          >
            🎮 ГРА
          </button>
        )}
        <button
          className="btn btn-secondary"
          onClick={handleLogout}
        >
          Вийти
        </button>
      </div>
    </div>
  )
}

export default HomePage
