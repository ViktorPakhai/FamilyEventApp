-- Migration: Add is_active field to events
-- Date: 2025-11-18

-- Add is_active column (defaults to 1 = active)
ALTER TABLE events ADD COLUMN is_active INTEGER DEFAULT 1;
