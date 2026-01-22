-- Migration: Create game_results table
-- Description: Store game results for leaderboard and user stats

-- Create game_results table
CREATE TABLE IF NOT EXISTS game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('chain_solo', 'party')),
  score INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  max_chain INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_results_user_id ON game_results(user_id);
CREATE INDEX IF NOT EXISTS idx_game_results_created_at ON game_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_results_score ON game_results(score DESC);

-- Enable RLS
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own results"
  ON game_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results"
  ON game_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Public read for leaderboard (top scores)
CREATE POLICY "Anyone can view top scores"
  ON game_results FOR SELECT
  USING (true);

-- Update users table to track stats
ALTER TABLE users ADD COLUMN IF NOT EXISTS games_played INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS best_chain INTEGER DEFAULT 0;

-- Function to update user stats after game
CREATE OR REPLACE FUNCTION update_user_stats_after_game()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET
    games_played = games_played + 1,
    total_xp = total_xp + (NEW.score / 10),
    best_chain = GREATEST(best_chain, NEW.max_chain),
    updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update user stats
DROP TRIGGER IF EXISTS on_game_result_insert ON game_results;
CREATE TRIGGER on_game_result_insert
  AFTER INSERT ON game_results
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_after_game();
