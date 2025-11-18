import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function GameLiveResultsPage() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const [results, setResults] = useState([])
  const [gameName, setGameName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadResults = async () => {
    try {
      const response = await fetch(`/api/admin/games/${gameId}/live-results`)
      const data = await response.json()

      if (response.ok) {
        setResults(data.participants)
      } else {
        setError(data.error || 'Помилка завантаження результатів')
      }
    } catch (err) {
      console.error('Error loading results:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadGameInfo = async () => {
    try {
      const response = await fetch('/api/admin/events')
      const data = await response.json()

      // Знайти гру серед всіх подій
      for (const event of data.events) {
        const gamesResponse = await fetch(`/api/admin/events/${event.id}/games`)
        const gamesData = await gamesResponse.json()
        const game = gamesData.games.find(g => g.id === parseInt(gameId))
        if (game) {
          setGameName(game.name)
          break
        }
      }
    } catch (err) {
      console.error('Error loading game info:', err)
    }
  }

  useEffect(() => {
    loadGameInfo()
    loadResults()

    // Автооновлення кожні 3 секунди
    const interval = setInterval(() => {
      loadResults()
    }, 3000)

    return () => clearInterval(interval)
  }, [gameId])

  const getMedalIcon = (position) => {
    switch (position) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return position
    }
  }

  const getPositionStyle = (position) => {
    const baseStyle = {
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all 0.3s ease'
    }

    switch (position) {
      case 1:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          boxShadow: '0 8px 20px rgba(255, 215, 0, 0.4)',
          transform: 'scale(1.02)',
          border: '3px solid #FFD700'
        }
      case 2:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)',
          boxShadow: '0 6px 15px rgba(192, 192, 192, 0.4)',
          border: '3px solid #C0C0C0'
        }
      case 3:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)',
          boxShadow: '0 6px 15px rgba(205, 127, 50, 0.4)',
          border: '3px solid #CD7F32'
        }
      default:
        return {
          ...baseStyle,
          background: '#f9fafb',
          border: '2px solid #e5e7eb'
        }
    }
  }

  if (loading) {
    return <div className="loading">Завантаження...</div>
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>📊 Live Результати</h1>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/admin')}
          style={{ width: 'auto', padding: '12px 24px' }}
        >
          ← Назад
        </button>
      </div>

      <div className="card">
        <h2>{gameName || `Гра #${gameId}`}</h2>

        <div style={{
          textAlign: 'center',
          padding: '12px',
          background: '#eef2ff',
          borderRadius: '8px',
          marginBottom: '20px',
          color: '#4f46e5',
          fontWeight: 'bold'
        }}>
          🔄 Автооновлення кожні 3 секунди
        </div>

        {error && <div className="error">{error}</div>}

        {results.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
            Поки немає учасників, які відповіли на питання
          </p>
        ) : (
          <div>
            <div style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold', color: '#374151' }}>
              Всього учасників: {results.length}
            </div>

            {results.map((participant) => (
              <div key={participant.userName + participant.position} style={getPositionStyle(participant.position)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    fontSize: participant.position <= 3 ? '36px' : '24px',
                    fontWeight: 'bold',
                    minWidth: participant.position <= 3 ? '60px' : '40px',
                    textAlign: 'center',
                    color: participant.position <= 3 ? '#fff' : '#374151'
                  }}>
                    {getMedalIcon(participant.position)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: participant.position <= 3 ? '24px' : '18px',
                      fontWeight: 'bold',
                      color: participant.position <= 3 ? '#fff' : '#1f2937',
                      marginBottom: '4px'
                    }}>
                      {participant.userName}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: participant.position <= 3 ? 'rgba(255,255,255,0.9)' : '#6b7280'
                    }}>
                      Відповів на {participant.answeredQuestions} з {participant.totalQuestions} питань
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: participant.position <= 3 ? '32px' : '24px',
                    fontWeight: 'bold',
                    color: participant.position <= 3 ? '#fff' : '#059669',
                    marginBottom: '4px'
                  }}>
                    {participant.correctAnswers}/{participant.totalQuestions}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: participant.position <= 3 ? 'rgba(255,255,255,0.9)' : '#059669'
                  }}>
                    {participant.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default GameLiveResultsPage
