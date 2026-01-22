-- Migration: Add push notification support
-- Store push tokens for users

-- Add push_token column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Index for finding users by push token
CREATE INDEX IF NOT EXISTS idx_users_push_token ON users(push_token) WHERE push_token IS NOT NULL;
