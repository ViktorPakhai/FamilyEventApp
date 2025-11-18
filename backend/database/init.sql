-- Таблиця подій
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    event_date TIMESTAMP NOT NULL,
    games_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблиця сесій користувачів
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Таблиця запитань від користувачів
CREATE TABLE IF NOT EXISTS user_questions (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    user_session_id INTEGER REFERENCES user_sessions(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    stars INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблиця ігор
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблиця питань для ігор
CREATE TABLE IF NOT EXISTS game_questions (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_1 VARCHAR(255) NOT NULL,
    option_2 VARCHAR(255) NOT NULL,
    option_3 VARCHAR(255) NOT NULL,
    option_4 VARCHAR(255) NOT NULL,
    correct_option INTEGER NOT NULL CHECK (correct_option BETWEEN 1 AND 4),
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблиця відповідей користувачів на питання ігор
CREATE TABLE IF NOT EXISTS game_answers (
    id SERIAL PRIMARY KEY,
    game_question_id INTEGER REFERENCES game_questions(id) ON DELETE CASCADE,
    user_session_id INTEGER REFERENCES user_sessions(id) ON DELETE CASCADE,
    selected_option INTEGER NOT NULL CHECK (selected_option BETWEEN 1 AND 4),
    is_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_question_id, user_session_id)
);

-- Таблиця адміністраторів
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Індекси для швидкості
CREATE INDEX IF NOT EXISTS idx_user_sessions_event ON user_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_user_questions_event ON user_questions(event_id);
CREATE INDEX IF NOT EXISTS idx_games_event ON games(event_id);
CREATE INDEX IF NOT EXISTS idx_game_questions_game ON game_questions(game_id);
CREATE INDEX IF NOT EXISTS idx_game_answers_question ON game_answers(game_question_id);
CREATE INDEX IF NOT EXISTS idx_game_answers_session ON game_answers(user_session_id);

-- Вставити тестовий івент
INSERT INTO events (name, event_date) VALUES ('Тестова подія', CURRENT_TIMESTAMP + INTERVAL '7 days')
ON CONFLICT DO NOTHING;
