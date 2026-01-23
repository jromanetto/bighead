-- Adventure Mode Tables
-- Run this in your Supabase SQL Editor

-- Adventure Progress Table
-- 11 tiers × 3 levels = 33 total levels
CREATE TABLE IF NOT EXISTS adventure_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  tier TEXT DEFAULT 'coton' CHECK (tier IN ('coton', 'carton', 'bois', 'bronze', 'argent', 'gold', 'platinium', 'titane', 'diamant', 'mythique', 'legendaire')),
  level INT DEFAULT 1 CHECK (level BETWEEN 1 AND 3),
  completed_categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Daily Attempts Table
CREATE TABLE IF NOT EXISTS daily_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  attempts_used INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Add min_age column to questions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'min_age'
  ) THEN
    ALTER TABLE questions ADD COLUMN min_age INT DEFAULT 18;
  END IF;
END $$;

-- Add difficulty_tier column to questions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'difficulty_tier'
  ) THEN
    ALTER TABLE questions ADD COLUMN difficulty_tier TEXT DEFAULT 'coton';
  END IF;
END $$;

-- RLS Policies for adventure_progress
ALTER TABLE adventure_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own adventure progress"
  ON adventure_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own adventure progress"
  ON adventure_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own adventure progress"
  ON adventure_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for daily_attempts
ALTER TABLE daily_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily attempts"
  ON daily_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily attempts"
  ON daily_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily attempts"
  ON daily_attempts FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_adventure_progress_user_id ON adventure_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_attempts_user_date ON daily_attempts(user_id, date);
