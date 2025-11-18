import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function QuestionPage({ user }) {
  const [questionText, setQuestionText] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!questionText.trim()) {
      setError('Введіть ваше питання')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/user/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ questionText: questionText.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setQuestionText('')
        setTimeout(() => {
          navigate('/')
        }, 2000)
      } else {
        setError(data.error || 'Помилка відправки питання')
      }
    } catch (err) {
      setError('Помилка з\'єднання з сервером')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container">
      <h1>❓ Задати питання</h1>
      <div className="card">
        <a href="/" className="back-btn">← Назад</a>
        <h2>Ваше питання для спікера</h2>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">Питання успішно надіслано! ✅</div>}
        <form onSubmit={handleSubmit}>
          <textarea
            className="textarea"
            placeholder="Введіть ваше питання тут..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            maxLength={500}
            disabled={submitting}
          />
          <div style={{ textAlign: 'right', color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
            {questionText.length}/500
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Відправка...' : 'Надіслати питання'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default QuestionPage
