import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function GamesPage({ user }) {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/user/games', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.games) {
          setGames(data.games)
        } else {
          setError(data.error || 'Помилка завантаження ігор')
        }
      })
      .catch(() => setError('Помилка з\'єднання з сервером'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="loading">Завантаження...</div>
  }

  return (
    <div className="container">
      <h1>🎮 Ігри</h1>
      <div className="card">
        <a href="/" className="back-btn">← Назад</a>
        <h2>Доступні ігри</h2>
        {error && <div className="error">{error}</div>}
        {games.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
            Наразі немає доступних ігор
          </p>
        ) : (
          <ul className="game-list">
            {games.map(game => (
              <li
                key={game.id}
                className="game-item"
                onClick={() => navigate(`/games/${game.id}`)}
              >
                <h3>{game.name}</h3>
                {game.description && (
                  <p style={{ color: '#6b7280', marginTop: '8px' }}>
                    {game.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default GamesPage
