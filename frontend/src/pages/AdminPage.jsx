import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'

function AdminPage() {
  const navigate = useNavigate()
  const { adminLogout } = useAdminAuth()
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [games, setGames] = useState([])
  const [userQuestions, setUserQuestions] = useState([])
  const [activeTab, setActiveTab] = useState('events') // events, games, questions
  const [loading, setLoading] = useState(true)

  // Форми для створення
  const [newEventName, setNewEventName] = useState('')
  const [newEventDate, setNewEventDate] = useState('')
  const [newGameName, setNewGameName] = useState('')
  const [newGameDesc, setNewGameDesc] = useState('')

  // Форма для питань гри
  const [selectedGame, setSelectedGame] = useState(null)
  const [gameQuestions, setGameQuestions] = useState([])
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correct: 1
  })

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    if (selectedEvent) {
      loadGames(selectedEvent)
      loadUserQuestions(selectedEvent)
    }
  }, [selectedEvent])

  const loadEvents = async () => {
    try {
      const res = await fetch('/api/admin/events')
      const data = await res.json()
      setEvents(data.events)
      if (data.events.length > 0 && !selectedEvent) {
        setSelectedEvent(data.events[0].id)
      }
    } catch (err) {
      console.error('Error loading events:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadGames = async (eventId) => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}/games`)
      const data = await res.json()
      setGames(data.games)
    } catch (err) {
      console.error('Error loading games:', err)
    }
  }

  const loadUserQuestions = async (eventId) => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}/user-questions`)
      const data = await res.json()
      setUserQuestions(data.questions)
    } catch (err) {
      console.error('Error loading questions:', err)
    }
  }

  const loadGameQuestions = async (gameId) => {
    try {
      const res = await fetch(`/api/admin/games/${gameId}/questions`)
      const data = await res.json()
      setGameQuestions(data.questions)
    } catch (err) {
      console.error('Error loading game questions:', err)
    }
  }

  const createEvent = async (e) => {
    e.preventDefault()
    try {
      await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newEventName, eventDate: newEventDate })
      })
      setNewEventName('')
      setNewEventDate('')
      loadEvents()
    } catch (err) {
      console.error('Error creating event:', err)
    }
  }

  const deleteEvent = async (eventId) => {
    if (!confirm('Ви впевнені, що хочете видалити цю подію? Це також видалить всі пов\'язані ігри та питання.')) {
      return
    }
    try {
      await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE'
      })
      // Якщо видалена поточна подія, скинути вибір
      if (selectedEvent === eventId) {
        setSelectedEvent(null)
      }
      loadEvents()
    } catch (err) {
      console.error('Error deleting event:', err)
    }
  }

  const toggleEventGames = async (eventId) => {
    try {
      await fetch(`/api/admin/events/${eventId}/toggle-games`, {
        method: 'PATCH'
      })
      loadEvents()
    } catch (err) {
      console.error('Error toggling games:', err)
    }
  }

  const createGame = async (e) => {
    e.preventDefault()
    if (!selectedEvent) return
    try {
      await fetch('/api/admin/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent,
          name: newGameName,
          description: newGameDesc
        })
      })
      setNewGameName('')
      setNewGameDesc('')
      loadGames(selectedEvent)
    } catch (err) {
      console.error('Error creating game:', err)
    }
  }

  const toggleGame = async (gameId) => {
    try {
      await fetch(`/api/admin/games/${gameId}/toggle`, {
        method: 'PATCH'
      })
      loadGames(selectedEvent)
    } catch (err) {
      console.error('Error toggling game:', err)
    }
  }

  const addGameQuestion = async (e) => {
    e.preventDefault()
    if (!selectedGame) return
    try {
      await fetch(`/api/admin/games/${selectedGame}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: newQuestion.text,
          option1: newQuestion.option1,
          option2: newQuestion.option2,
          option3: newQuestion.option3,
          option4: newQuestion.option4,
          correctOption: parseInt(newQuestion.correct)
        })
      })
      setNewQuestion({
        text: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correct: 1
      })
      loadGameQuestions(selectedGame)
    } catch (err) {
      console.error('Error adding question:', err)
    }
  }

  const deleteGameQuestion = async (questionId) => {
    try {
      await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE'
      })
      loadGameQuestions(selectedGame)
    } catch (err) {
      console.error('Error deleting question:', err)
    }
  }

  const updateQuestionStars = async (questionId, stars) => {
    try {
      await fetch(`/api/admin/user-questions/${questionId}/stars`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars })
      })
      loadUserQuestions(selectedEvent)
    } catch (err) {
      console.error('Error updating stars:', err)
    }
  }

  const toggleQuestionAnswered = async (questionId) => {
    try {
      await fetch(`/api/admin/user-questions/${questionId}/toggle-answered`, {
        method: 'PATCH'
      })
      loadUserQuestions(selectedEvent)
    } catch (err) {
      console.error('Error toggling answered status:', err)
    }
  }

  if (loading) {
    return <div className="loading">Завантаження...</div>
  }

  const handleLogout = () => {
    adminLogout()
    navigate('/admin/login')
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>⚙️ Адмін панель</h1>
        <button className="btn btn-secondary" onClick={handleLogout} style={{ width: 'auto', padding: '12px 24px' }}>
          Вийти
        </button>
      </div>

      {/* Вибір події */}
      {events.length > 0 && (
        <div className="card">
          <h3>Поточна подія:</h3>
          <select
            className="event-select"
            value={selectedEvent || ''}
            onChange={(e) => setSelectedEvent(parseInt(e.target.value))}
          >
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.name} - {new Date(event.event_date).toLocaleDateString('uk-UA')}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Таби */}
      <div className="card">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button
            className={`btn ${activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('events')}
          >
            Події
          </button>
          <button
            className={`btn ${activeTab === 'games' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('games')}
          >
            Ігри
          </button>
          <button
            className={`btn ${activeTab === 'questions' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('questions')}
          >
            Питання
          </button>
        </div>

        {/* Таб події */}
        {activeTab === 'events' && (
          <div>
            <h2>Створити нову подію</h2>
            <form onSubmit={createEvent}>
              <input
                className="input"
                type="text"
                placeholder="Назва події"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                required
              />
              <input
                className="input"
                type="datetime-local"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-success">
                Створити подію
              </button>
            </form>

            <h3 style={{ marginTop: '30px' }}>Існуючі події</h3>
            <ul className="game-list">
              {events.map(event => (
                <li key={event.id} className="game-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <strong>{event.name}</strong><br />
                      <small>{new Date(event.event_date).toLocaleString('uk-UA')}</small><br />
                      <span style={{
                        display: 'inline-block',
                        marginTop: '8px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: event.games_enabled ? '#d1fae5' : '#fee2e2',
                        color: event.games_enabled ? '#059669' : '#dc2626'
                      }}>
                        Ігри: {event.games_enabled ? 'Увімкнено' : 'Вимкнено'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className={`btn ${event.games_enabled ? 'btn-secondary' : 'btn-success'}`}
                        style={{ padding: '8px 16px', fontSize: '14px', marginBottom: 0, width: 'auto' }}
                        onClick={() => toggleEventGames(event.id)}
                      >
                        {event.games_enabled ? 'Вимкнути ігри' : 'Увімкнути ігри'}
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '8px 16px', fontSize: '14px', marginBottom: 0, width: 'auto' }}
                        onClick={() => deleteEvent(event.id)}
                      >
                        Видалити
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Таб ігри */}
        {activeTab === 'games' && selectedEvent && (
          <div>
            <h2>Створити нову гру</h2>
            <form onSubmit={createGame}>
              <input
                className="input"
                type="text"
                placeholder="Назва гри"
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
                required
              />
              <textarea
                className="textarea"
                placeholder="Опис гри (необов'язково)"
                value={newGameDesc}
                onChange={(e) => setNewGameDesc(e.target.value)}
              />
              <button type="submit" className="btn btn-success">
                Створити гру
              </button>
            </form>

            <h3 style={{ marginTop: '30px' }}>Ігри для поточної події</h3>
            <ul className="game-list">
              {games.map(game => (
                <li key={game.id} className="game-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{game.name}</strong>
                      <span style={{
                        marginLeft: '12px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: game.is_active ? '#d1fae5' : '#fee2e2',
                        color: game.is_active ? '#059669' : '#dc2626'
                      }}>
                        {game.is_active ? 'Активна' : 'Неактивна'}
                      </span>
                      {game.description && (
                        <>
                          <br />
                          <small style={{ color: '#6b7280' }}>{game.description}</small>
                        </>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '14px', marginBottom: 0 }}
                        onClick={() => {
                          setSelectedGame(game.id)
                          loadGameQuestions(game.id)
                        }}
                      >
                        Питання
                      </button>
                      {/* <button
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '14px', marginBottom: 0 }}
                        onClick={() => navigate(`/admin/games/${game.id}/live`)}
                      >
                        📊 Live Результати
                      </button> */}
                      <button
                        className={`btn ${game.is_active ? 'btn-danger' : 'btn-success'}`}
                        style={{ padding: '8px 16px', fontSize: '14px', marginBottom: 0 }}
                        onClick={() => toggleGame(game.id)}
                      >
                        {game.is_active ? 'Вимкнути' : 'Увімкнути'}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Управління питаннями гри */}
            {selectedGame && (
              <div style={{ marginTop: '30px', padding: '20px', background: '#f9fafb', borderRadius: '12px' }}>
                <h3>Питання для гри</h3>
                <form onSubmit={addGameQuestion}>
                  <input
                    className="input"
                    type="text"
                    placeholder="Текст питання"
                    value={newQuestion.text}
                    onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                    required
                  />
                  <input
                    className="input"
                    type="text"
                    placeholder="Варіант 1"
                    value={newQuestion.option1}
                    onChange={(e) => setNewQuestion({ ...newQuestion, option1: e.target.value })}
                    required
                  />
                  <input
                    className="input"
                    type="text"
                    placeholder="Варіант 2"
                    value={newQuestion.option2}
                    onChange={(e) => setNewQuestion({ ...newQuestion, option2: e.target.value })}
                    required
                  />
                  <input
                    className="input"
                    type="text"
                    placeholder="Варіант 3"
                    value={newQuestion.option3}
                    onChange={(e) => setNewQuestion({ ...newQuestion, option3: e.target.value })}
                    required
                  />
                  <input
                    className="input"
                    type="text"
                    placeholder="Варіант 4"
                    value={newQuestion.option4}
                    onChange={(e) => setNewQuestion({ ...newQuestion, option4: e.target.value })}
                    required
                  />
                  <select
                    className="event-select"
                    value={newQuestion.correct}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correct: e.target.value })}
                  >
                    <option value={1}>Правильна відповідь: Варіант 1</option>
                    <option value={2}>Правильна відповідь: Варіант 2</option>
                    <option value={3}>Правильна відповідь: Варіант 3</option>
                    <option value={4}>Правильна відповідь: Варіант 4</option>
                  </select>
                  <button type="submit" className="btn btn-success">
                    Додати питання
                  </button>
                </form>

                <h4 style={{ marginTop: '20px' }}>Існуючі питання:</h4>
                <ul className="question-list">
                  {gameQuestions.map((q, index) => (
                    <li key={q.id} className="question-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1 }}>
                          <strong>#{index + 1}: {q.question_text}</strong>
                          <div style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
                            <div>1. {q.option_1} {q.correct_option === 1 && '✅'}</div>
                            <div>2. {q.option_2} {q.correct_option === 2 && '✅'}</div>
                            <div>3. {q.option_3} {q.correct_option === 3 && '✅'}</div>
                            <div>4. {q.option_4} {q.correct_option === 4 && '✅'}</div>
                          </div>
                        </div>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '8px 16px', fontSize: '14px', marginBottom: 0, height: 'fit-content' }}
                          onClick={() => deleteGameQuestion(q.id)}
                        >
                          Видалити
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedGame(null)
                    setGameQuestions([])
                  }}
                  style={{ marginTop: '20px' }}
                >
                  Закрити
                </button>
              </div>
            )}
          </div>
        )}

        {/* Таб питання користувачів */}
        {activeTab === 'questions' && selectedEvent && (
          <div>
            <h2>Питання від учасників</h2>
            {userQuestions.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                Поки що немає питань
              </p>
            ) : (
              <ul className="question-list">
                {userQuestions.map(q => (
                  <li key={q.id} className="question-item">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <input
                        type="checkbox"
                        checked={q.is_answered === 1}
                        onChange={() => toggleQuestionAnswered(q.id)}
                        style={{
                          width: '20px',
                          height: '20px',
                          marginTop: '4px',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div>
                          <strong>{q.user_name}</strong>
                          <small style={{ marginLeft: '12px', color: '#6b7280' }}>
                            {new Date(q.created_at).toLocaleString('uk-UA')}
                          </small>
                        </div>
                        <p style={{
                          margin: '12px 0',
                          textDecoration: q.is_answered === 1 ? 'line-through' : 'none',
                          color: q.is_answered === 1 ? '#9ca3af' : '#1f2937',
                          transition: 'all 0.2s ease'
                        }}>
                          {q.question_text}
                        </p>
                        <div className="stars">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span
                              key={star}
                              className={`star ${star <= q.stars ? 'filled' : 'empty'}`}
                              onClick={() => updateQuestionStars(q.id, star === q.stars ? star - 1 : star)}
                            >
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPage
