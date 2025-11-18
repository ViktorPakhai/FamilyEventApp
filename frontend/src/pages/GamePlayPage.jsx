import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function GamePlayPage({ user }) {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [gameFinished, setGameFinished] = useState(false)
  const [finalResults, setFinalResults] = useState(null)

  useEffect(() => {
    fetch(`/api/user/games/${gameId}/questions`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.questions) {
          setQuestions(data.questions)
        } else {
          setError(data.error || 'Помилка завантаження питань')
        }
      })
      .catch(() => setError('Помилка з\'єднання з сервером'))
      .finally(() => setLoading(false))
  }, [gameId])

  const handleAnswer = async () => {
    if (selectedOption === null) return

    try {
      const response = await fetch('/api/user/games/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          questionId: questions[currentIndex].id,
          selectedOption: selectedOption
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        setAnswered(true)
      } else {
        setError(data.error || 'Помилка відправки відповіді')
      }
    } catch (err) {
      setError('Помилка з\'єднання з сервером')
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedOption(null)
      setAnswered(false)
      setResult(null)
    } else {
      // Гра закінчена, показати результати
      fetchResults()
    }
  }

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/user/games/${gameId}/results`, {
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        setFinalResults(data)
        setGameFinished(true)
      }
    } catch (err) {
      setError('Помилка отримання результатів')
    }
  }

  if (loading) {
    return <div className="loading">Завантаження...</div>
  }

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <div className="error">{error}</div>
          <button className="btn btn-secondary" onClick={() => navigate('/games')}>
            Повернутися до ігор
          </button>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="container">
        <div className="card">
          <p style={{ textAlign: 'center', padding: '20px' }}>
            У цій грі немає питань
          </p>
          <button className="btn btn-secondary" onClick={() => navigate('/games')}>
            Повернутися до ігор
          </button>
        </div>
      </div>
    )
  }

  if (gameFinished && finalResults) {
    const percentage = Math.round((finalResults.correctAnswers / finalResults.totalQuestions) * 100)

    return (
      <div className="container">
        <div className="card">
          <div className="results">
            <h2>🎉</h2>
            <h3>Гру завершено!</h3>
            <p style={{ fontSize: '24px', margin: '20px 0' }}>
              Ви відповіли правильно на<br />
              <strong>{finalResults.correctAnswers}</strong> з <strong>{finalResults.totalQuestions}</strong> питань
            </p>
            <p style={{ fontSize: '32px', color: '#667eea', fontWeight: 'bold' }}>
              {percentage}%
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/games')}
              style={{ marginTop: '20px' }}
            >
              Повернутися до ігор
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]

  return (
    <div className="container">
      <h1>🎮 Гра</h1>
      <div className="card">
        <div style={{ marginBottom: '16px', color: '#6b7280' }}>
          Питання {currentIndex + 1} з {questions.length}
        </div>
        <div className="question-card">
          <h3>{currentQuestion.question_text}</h3>
          <div className="options">
            {[1, 2, 3, 4].map(optionNum => (
              <button
                key={optionNum}
                className={`option ${selectedOption === optionNum ? 'selected' : ''} ${
                  answered && result
                    ? optionNum === result.correctOption
                      ? 'correct'
                      : optionNum === selectedOption
                      ? 'incorrect'
                      : ''
                    : ''
                }`}
                onClick={() => !answered && setSelectedOption(optionNum)}
                disabled={answered}
              >
                {currentQuestion[`option_${optionNum}`]}
              </button>
            ))}
          </div>
        </div>
        {!answered ? (
          <button
            className="btn btn-primary"
            onClick={handleAnswer}
            disabled={selectedOption === null}
          >
            Підтвердити відповідь
          </button>
        ) : (
          <div>
            <div className={result.isCorrect ? 'success' : 'error'} style={{ marginBottom: '16px' }}>
              {result.isCorrect ? '✅ Правильно!' : '❌ Неправильно'}
            </div>
            <button className="btn btn-primary" onClick={handleNext}>
              {currentIndex < questions.length - 1 ? 'Наступне питання' : 'Завершити гру'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default GamePlayPage
