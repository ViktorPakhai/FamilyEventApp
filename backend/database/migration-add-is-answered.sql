-- Migration: Add is_answered field to user_questions
-- Date: 2025-11-18

-- Add is_answered column if it doesn't exist
ALTER TABLE user_questions ADD COLUMN is_answered INTEGER DEFAULT 0;
