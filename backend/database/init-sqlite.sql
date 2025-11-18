-- SQLite Database Schema для Family Evening

-- Таблиця подій
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    event_date DATETIME NOT NULL,
    games_enabled INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Таблиця сесій користувачів
CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    user_name TEXT NOT NULL,
    event_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Таблиця запитань від користувачів
CREATE TABLE IF NOT EXISTS user_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    user_session_id INTEGER,
    question_text TEXT NOT NULL,
    stars INTEGER DEFAULT 0,
    is_answered INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_session_id) REFERENCES user_sessions(id) ON DELETE CASCADE
);

-- Таблиця ігор
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    is_active INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Таблиця питань для ігор
CREATE TABLE IF NOT EXISTS game_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER,
    question_text TEXT NOT NULL,
    option_1 TEXT NOT NULL,
    option_2 TEXT NOT NULL,
    option_3 TEXT NOT NULL,
    option_4 TEXT NOT NULL,
    correct_option INTEGER NOT NULL CHECK (correct_option BETWEEN 1 AND 4),
    order_index INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- Таблиця відповідей користувачів на питання ігор
CREATE TABLE IF NOT EXISTS game_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_question_id INTEGER,
    user_session_id INTEGER,
    selected_option INTEGER NOT NULL CHECK (selected_option BETWEEN 1 AND 4),
    is_correct INTEGER NOT NULL,
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_question_id) REFERENCES game_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_session_id) REFERENCES user_sessions(id) ON DELETE CASCADE,
    UNIQUE(game_question_id, user_session_id)
);

-- Таблиця адміністраторів
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Індекси для швидкості
CREATE INDEX IF NOT EXISTS idx_user_sessions_event ON user_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_user_questions_event ON user_questions(event_id);
CREATE INDEX IF NOT EXISTS idx_games_event ON games(event_id);
CREATE INDEX IF NOT EXISTS idx_game_questions_game ON game_questions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_answers_question ON game_answers(game_question_id);
CREATE INDEX IF NOT EXISTS idx_game_answers_session ON game_answers(user_session_id);

-- Вставити тестовий івент
INSERT OR IGNORE INTO events (id, name, event_date)
VALUES (1, 'Тестова подія', datetime('now', '+7 days'));
