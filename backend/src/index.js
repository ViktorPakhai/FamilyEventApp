import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true, // Дозволяємо всі origins (для production можна обмежити конкретним доменом)
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 4 * 60 * 60 * 1000, // 4 години
    httpOnly: true,
    secure: false, // false для HTTP, true тільки якщо є HTTPS
    sameSite: 'lax'
  }
}));

// ============================================
// USER ROUTES (для користувачів на події)
// ============================================

// Вхід користувача за іменем
app.post('/api/user/login', async (req, res) => {
  try {
    const { userName, eventId } = req.body;

    if (!userName || !eventId) {
      return res.status(400).json({ error: 'Ім\'я та ID події обов\'язкові' });
    }

    // Перевірка існування події
    const eventCheck = db.prepare('SELECT id FROM events WHERE id = ?').get(eventId);
    if (!eventCheck) {
      return res.status(404).json({ error: 'Подію не знайдено' });
    }

    // Створення сесії користувача
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(); // 4 години
    const result = db.prepare(
      'INSERT INTO user_sessions (session_id, user_name, event_id, expires_at) VALUES (?, ?, ?, ?)'
    ).run(req.sessionID, userName, eventId, expiresAt);

    const newSession = db.prepare('SELECT * FROM user_sessions WHERE id = ?').get(result.lastInsertRowid);

    req.session.userId = newSession.id;
    req.session.userName = userName;
    req.session.eventId = eventId;

    res.json({
      success: true,
      user: {
        id: newSession.id,
        name: userName,
        eventId: eventId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Помилка входу' });
  }
});

// Отримати поточну сесію користувача
app.get('/api/user/session', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Не авторизовано' });
    }

    const result = db.prepare(
      'SELECT id, user_name, event_id FROM user_sessions WHERE id = ? AND expires_at > datetime(\'now\')'
    ).get(req.session.userId);

    if (!result) {
      req.session.destroy();
      return res.status(401).json({ error: 'Сесія закінчилася' });
    }

    res.json({
      user: {
        id: result.id,
        name: result.user_name,
        eventId: result.event_id
      }
    });
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ error: 'Помилка отримання сесії' });
  }
});

// Вихід користувача
app.post('/api/user/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Задати питання
app.post('/api/user/questions', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Не авторизовано' });
    }

    const { questionText } = req.body;

    if (!questionText || questionText.trim() === '') {
      return res.status(400).json({ error: 'Питання не може бути порожнім' });
    }

    const result = db.prepare(
      'INSERT INTO user_questions (event_id, user_session_id, question_text) VALUES (?, ?, ?)'
    ).run(req.session.eventId, req.session.userId, questionText);

    const newQuestion = db.prepare('SELECT * FROM user_questions WHERE id = ?').get(result.lastInsertRowid);

    res.json({
      success: true,
      question: newQuestion
    });
  } catch (error) {
    console.error('Question submission error:', error);
    res.status(500).json({ error: 'Помилка відправки питання' });
  }
});

// Отримати доступні ігри для події
app.get('/api/user/games', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Не авторизовано' });
    }

    const games = db.prepare(
      'SELECT id, name, description FROM games WHERE event_id = ? AND is_active = 1'
    ).all(req.session.eventId);

    res.json({ games });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ error: 'Помилка отримання ігор' });
  }
});

// Отримати питання гри
app.get('/api/user/games/:gameId/questions', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Не авторизовано' });
    }

    const { gameId } = req.params;

    // Перевірка, чи гра належить до події користувача
    const gameCheck = db.prepare(
      'SELECT id FROM games WHERE id = ? AND event_id = ? AND is_active = 1'
    ).get(gameId, req.session.eventId);

    if (!gameCheck) {
      return res.status(404).json({ error: 'Гру не знайдено' });
    }

    const questions = db.prepare(
      'SELECT id, question_text, option_1, option_2, option_3, option_4, order_index FROM game_questions WHERE game_id = ? ORDER BY order_index'
    ).all(gameId);

    res.json({ questions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Помилка отримання питань' });
  }
});

// Відповісти на питання гри
app.post('/api/user/games/answer', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Не авторизовано' });
    }

    const { questionId, selectedOption } = req.body;

    if (!questionId || !selectedOption || selectedOption < 1 || selectedOption > 4) {
      return res.status(400).json({ error: 'Невірні дані' });
    }

    // Отримати правильну відповідь
    const question = db.prepare(
      'SELECT correct_option FROM game_questions WHERE id = ?'
    ).get(questionId);

    if (!question) {
      return res.status(404).json({ error: 'Питання не знайдено' });
    }

    const correctOption = question.correct_option;
    const isCorrect = selectedOption === correctOption ? 1 : 0;

    // Зберегти відповідь
    // SQLite doesn't have ON CONFLICT ... DO UPDATE, we need to use INSERT OR REPLACE or separate logic
    const existingAnswer = db.prepare(
      'SELECT id FROM game_answers WHERE game_question_id = ? AND user_session_id = ?'
    ).get(questionId, req.session.userId);

    if (existingAnswer) {
      db.prepare(
        'UPDATE game_answers SET selected_option = ?, is_correct = ? WHERE game_question_id = ? AND user_session_id = ?'
      ).run(selectedOption, isCorrect, questionId, req.session.userId);
    } else {
      db.prepare(
        'INSERT INTO game_answers (game_question_id, user_session_id, selected_option, is_correct) VALUES (?, ?, ?, ?)'
      ).run(questionId, req.session.userId, selectedOption, isCorrect);
    }

    res.json({
      success: true,
      isCorrect: isCorrect === 1,
      correctOption
    });
  } catch (error) {
    console.error('Answer submission error:', error);
    res.status(500).json({ error: 'Помилка збереження відповіді' });
  }
});

// Отримати результати гри
app.get('/api/user/games/:gameId/results', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Не авторизовано' });
    }

    const { gameId } = req.params;

    const result = db.prepare(
      `SELECT
        COUNT(*) as total_questions,
        SUM(CASE WHEN ga.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers
       FROM game_questions gq
       LEFT JOIN game_answers ga ON gq.id = ga.game_question_id AND ga.user_session_id = ?
       WHERE gq.game_id = ?`
    ).get(req.session.userId, gameId);

    res.json({
      totalQuestions: parseInt(result.total_questions),
      correctAnswers: parseInt(result.correct_answers) || 0
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Помилка отримання результатів' });
  }
});

// Отримати live результати гри для адміна (всі учасники)
app.get('/api/admin/games/:gameId/live-results', async (req, res) => {
  try {
    const { gameId } = req.params;

    const results = db.prepare(
      `SELECT
        us.user_name,
        us.id as session_id,
        COUNT(gq.id) as total_questions,
        SUM(CASE WHEN ga.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
        COUNT(ga.id) as answered_questions
       FROM game_questions gq
       CROSS JOIN user_sessions us
       LEFT JOIN game_answers ga ON gq.id = ga.game_question_id AND ga.user_session_id = us.id
       WHERE gq.game_id = ? AND us.expires_at > datetime('now')
       GROUP BY us.id, us.user_name
       HAVING COUNT(ga.id) > 0
       ORDER BY correct_answers DESC, answered_questions DESC, us.user_name ASC`
    ).all(gameId);

    res.json({
      participants: results.map((row, index) => ({
        position: index + 1,
        userName: row.user_name,
        correctAnswers: parseInt(row.correct_answers) || 0,
        totalQuestions: parseInt(row.total_questions),
        answeredQuestions: parseInt(row.answered_questions),
        percentage: Math.round(((parseInt(row.correct_answers) || 0) / parseInt(row.total_questions)) * 100)
      }))
    });
  } catch (error) {
    console.error('Get live results error:', error);
    res.status(500).json({ error: 'Помилка отримання live результатів' });
  }
});

// ============================================
// ADMIN ROUTES (для адміністраторів)
// ============================================

// Отримати всі події
app.get('/api/admin/events', async (req, res) => {
  try {
    const events = db.prepare('SELECT * FROM events ORDER BY event_date DESC').all();
    res.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Помилка отримання подій' });
  }
});

// Створити подію
app.post('/api/admin/events', async (req, res) => {
  try {
    const { name, eventDate } = req.body;

    if (!name || !eventDate) {
      return res.status(400).json({ error: 'Назва та дата події обов\'язкові' });
    }

    const result = db.prepare(
      'INSERT INTO events (name, event_date) VALUES (?, ?)'
    ).run(name, eventDate);

    const newEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);

    res.json({
      success: true,
      event: newEvent
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Помилка створення події' });
  }
});

// Видалити подію
app.delete('/api/admin/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    db.prepare('DELETE FROM events WHERE id = ?').run(eventId);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Помилка видалення події' });
  }
});

// Перемкнути доступність ігор для події
app.patch('/api/admin/events/:eventId/toggle-games', async (req, res) => {
  try {
    const { eventId } = req.params;

    // SQLite doesn't support NOT operator in UPDATE, so we need to read first
    const currentEvent = db.prepare('SELECT games_enabled FROM events WHERE id = ?').get(eventId);
    const newValue = currentEvent.games_enabled === 1 ? 0 : 1;

    db.prepare(
      'UPDATE events SET games_enabled = ? WHERE id = ?'
    ).run(newValue, eventId);

    const updatedEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);

    res.json({
      success: true,
      event: updatedEvent
    });
  } catch (error) {
    console.error('Toggle games error:', error);
    res.status(500).json({ error: 'Помилка зміни доступності ігор' });
  }
});

// Отримати ігри для події
app.get('/api/admin/events/:eventId/games', async (req, res) => {
  try {
    const { eventId } = req.params;

    const games = db.prepare(
      'SELECT * FROM games WHERE event_id = ? ORDER BY created_at DESC'
    ).all(eventId);

    res.json({ games });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ error: 'Помилка отримання ігор' });
  }
});

// Створити гру
app.post('/api/admin/games', async (req, res) => {
  try {
    const { eventId, name, description } = req.body;

    if (!eventId || !name) {
      return res.status(400).json({ error: 'ID події та назва обов\'язкові' });
    }

    const result = db.prepare(
      'INSERT INTO games (event_id, name, description) VALUES (?, ?, ?)'
    ).run(eventId, name, description);

    const newGame = db.prepare('SELECT * FROM games WHERE id = ?').get(result.lastInsertRowid);

    res.json({
      success: true,
      game: newGame
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ error: 'Помилка створення гри' });
  }
});

// Активувати/деактивувати гру
app.patch('/api/admin/games/:gameId/toggle', async (req, res) => {
  try {
    const { gameId } = req.params;

    // SQLite doesn't support NOT operator in UPDATE, so we need to read first
    const currentGame = db.prepare('SELECT is_active FROM games WHERE id = ?').get(gameId);
    const newValue = currentGame.is_active === 1 ? 0 : 1;

    db.prepare(
      'UPDATE games SET is_active = ? WHERE id = ?'
    ).run(newValue, gameId);

    const updatedGame = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId);

    res.json({
      success: true,
      game: updatedGame
    });
  } catch (error) {
    console.error('Toggle game error:', error);
    res.status(500).json({ error: 'Помилка зміни статусу гри' });
  }
});

// Отримати питання гри
app.get('/api/admin/games/:gameId/questions', async (req, res) => {
  try {
    const { gameId } = req.params;

    const questions = db.prepare(
      'SELECT * FROM game_questions WHERE game_id = ? ORDER BY order_index'
    ).all(gameId);

    res.json({ questions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Помилка отримання питань' });
  }
});

// Додати питання до гри
app.post('/api/admin/games/:gameId/questions', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { questionText, option1, option2, option3, option4, correctOption, orderIndex } = req.body;

    if (!questionText || !option1 || !option2 || !option3 || !option4 || !correctOption) {
      return res.status(400).json({ error: 'Усі поля обов\'язкові' });
    }

    if (correctOption < 1 || correctOption > 4) {
      return res.status(400).json({ error: 'Правильна відповідь має бути від 1 до 4' });
    }

    // Визначити порядковий індекс
    let order = orderIndex;
    if (!order) {
      const maxOrderResult = db.prepare(
        'SELECT COALESCE(MAX(order_index), 0) as max_order FROM game_questions WHERE game_id = ?'
      ).get(gameId);
      order = maxOrderResult.max_order + 1;
    }

    const result = db.prepare(
      'INSERT INTO game_questions (game_id, question_text, option_1, option_2, option_3, option_4, correct_option, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(gameId, questionText, option1, option2, option3, option4, correctOption, order);

    const newQuestion = db.prepare('SELECT * FROM game_questions WHERE id = ?').get(result.lastInsertRowid);

    res.json({
      success: true,
      question: newQuestion
    });
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({ error: 'Помилка додавання питання' });
  }
});

// Видалити питання
app.delete('/api/admin/questions/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;

    db.prepare('DELETE FROM game_questions WHERE id = ?').run(questionId);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Помилка видалення питання' });
  }
});

// Отримати питання користувачів для події
app.get('/api/admin/events/:eventId/user-questions', async (req, res) => {
  try {
    const { eventId } = req.params;

    const questions = db.prepare(
      `SELECT uq.*, us.user_name
       FROM user_questions uq
       JOIN user_sessions us ON uq.user_session_id = us.id
       WHERE uq.event_id = ?
       ORDER BY uq.created_at DESC`
    ).all(eventId);

    res.json({ questions });
  } catch (error) {
    console.error('Get user questions error:', error);
    res.status(500).json({ error: 'Помилка отримання питань' });
  }
});

// Перемкнути статус відповіді на питання
app.patch('/api/admin/user-questions/:questionId/toggle-answered', async (req, res) => {
  try {
    const { questionId } = req.params;

    // Отримати поточний статус
    const currentQuestion = db.prepare('SELECT is_answered FROM user_questions WHERE id = ?').get(questionId);

    if (!currentQuestion) {
      return res.status(404).json({ error: 'Питання не знайдено' });
    }

    // Перемкнути статус
    const newStatus = currentQuestion.is_answered === 1 ? 0 : 1;

    db.prepare(
      'UPDATE user_questions SET is_answered = ? WHERE id = ?'
    ).run(newStatus, questionId);

    const updatedQuestion = db.prepare('SELECT * FROM user_questions WHERE id = ?').get(questionId);

    res.json({
      success: true,
      question: updatedQuestion
    });
  } catch (error) {
    console.error('Toggle answered error:', error);
    res.status(500).json({ error: 'Помилка оновлення статусу' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
