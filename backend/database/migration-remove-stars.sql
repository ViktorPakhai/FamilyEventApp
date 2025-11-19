-- Migration: Remove stars field from user_questions
-- Date: 2025-11-18

-- SQLite doesn't support DROP COLUMN directly, so we need to recreate the table

-- Create new table without stars
CREATE TABLE IF NOT EXISTS user_questions_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    user_session_id INTEGER,
    question_text TEXT NOT NULL,
    is_answered INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_session_id) REFERENCES user_sessions(id) ON DELETE CASCADE
);

-- Copy data from old table to new table (excluding stars)
INSERT INTO user_questions_new (id, event_id, user_session_id, question_text, is_answered, created_at)
SELECT id, event_id, user_session_id, question_text, is_answered, created_at
FROM user_questions;

-- Drop old table
DROP TABLE user_questions;

-- Rename new table to original name
ALTER TABLE user_questions_new RENAME TO user_questions;
