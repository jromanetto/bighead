-- Migration: Achievements, Daily Challenges, and Categories
-- Description: Add gamification features

-- ============================================
-- ACHIEVEMENTS SYSTEM
-- ============================================

-- Achievement definitions
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('games', 'score', 'streak', 'social', 'special')),
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('games_played', 'total_xp', 'best_chain', 'perfect_games', 'daily_streak', 'weekly_top', 'first_game', 'level_reached')),
  requirement_value INTEGER NOT NULL DEFAULT 1,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  is_secret BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements (junction table)
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Insert default achievements
INSERT INTO achievements (code, name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
  -- Games played achievements
  ('first_game', 'Première Partie', 'Joue ta première partie', '🎮', 'games', 'first_game', 1, 50),
  ('games_10', 'Habitué', 'Joue 10 parties', '🎯', 'games', 'games_played', 10, 100),
  ('games_50', 'Vétéran', 'Joue 50 parties', '⭐', 'games', 'games_played', 50, 250),
  ('games_100', 'Légende', 'Joue 100 parties', '👑', 'games', 'games_played', 100, 500),

  -- XP achievements
  ('xp_1000', 'Apprenti', 'Accumule 1000 XP', '📚', 'score', 'total_xp', 1000, 100),
  ('xp_5000', 'Érudit', 'Accumule 5000 XP', '🎓', 'score', 'total_xp', 5000, 250),
  ('xp_10000', 'Maître', 'Accumule 10000 XP', '🏆', 'score', 'total_xp', 10000, 500),
  ('xp_50000', 'Grand Maître', 'Accumule 50000 XP', '💎', 'score', 'total_xp', 50000, 1000),

  -- Chain achievements
  ('chain_5', 'Combo Débutant', 'Atteins une chaîne de 5', '🔥', 'streak', 'best_chain', 5, 75),
  ('chain_10', 'Combo Pro', 'Atteins une chaîne de 10', '💥', 'streak', 'best_chain', 10, 150),
  ('chain_20', 'Combo Master', 'Atteins une chaîne de 20', '⚡', 'streak', 'best_chain', 20, 300),
  ('chain_50', 'Inarrêtable', 'Atteins une chaîne de 50', '🌟', 'streak', 'best_chain', 50, 750),

  -- Level achievements
  ('level_5', 'Niveau 5', 'Atteins le niveau 5', '🌱', 'score', 'level_reached', 5, 100),
  ('level_10', 'Niveau 10', 'Atteins le niveau 10', '🌿', 'score', 'level_reached', 10, 250),
  ('level_25', 'Niveau 25', 'Atteins le niveau 25', '🌳', 'score', 'level_reached', 25, 500),
  ('level_50', 'Niveau 50', 'Atteins le niveau 50', '🏔️', 'score', 'level_reached', 50, 1000),

  -- Special achievements
  ('perfect_game', 'Parfait!', 'Termine une partie sans erreur', '💯', 'special', 'perfect_games', 1, 200),
  ('speed_demon', 'Éclair', 'Réponds en moins de 2 secondes 10 fois', '⚡', 'special', 'perfect_games', 1, 150)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- DAILY CHALLENGES
-- ============================================

CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  question_id UUID REFERENCES questions(id),
  category TEXT,
  bonus_xp INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  is_correct BOOLEAN NOT NULL,
  answer_time_ms INTEGER,
  UNIQUE(user_id, challenge_id)
);

-- Add daily streak to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_daily_challenge DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS perfect_games INTEGER DEFAULT 0;

-- ============================================
-- QUESTION CATEGORIES
-- ============================================

-- Add category to questions if not exists
ALTER TABLE questions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Create categories table for reference
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO categories (code, name, icon, color) VALUES
  ('general', 'Culture Générale', '🧠', '#6366f1'),
  ('sport', 'Sport', '⚽', '#22c55e'),
  ('science', 'Science', '🔬', '#3b82f6'),
  ('history', 'Histoire', '📜', '#f59e0b'),
  ('geography', 'Géographie', '🌍', '#14b8a6'),
  ('music', 'Musique', '🎵', '#ec4899'),
  ('cinema', 'Cinéma', '🎬', '#8b5cf6'),
  ('literature', 'Littérature', '📚', '#f97316'),
  ('nature', 'Nature', '🌿', '#84cc16'),
  ('technology', 'Technologie', '💻', '#06b6d4')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- USER SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  haptic_enabled BOOLEAN DEFAULT TRUE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  language TEXT DEFAULT 'fr',
  theme TEXT DEFAULT 'dark',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(challenge_date);
CREATE INDEX IF NOT EXISTS idx_user_daily_challenges_user ON user_daily_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Achievements are readable by all
CREATE POLICY "Achievements are viewable by everyone" ON achievements FOR SELECT USING (true);

-- User achievements
CREATE POLICY "Users can view all achievements" ON user_achievements FOR SELECT USING (true);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily challenges
CREATE POLICY "Daily challenges are viewable by everyone" ON daily_challenges FOR SELECT USING (true);
CREATE POLICY "User daily challenges viewable by owner" ON user_daily_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User daily challenges insertable by owner" ON user_daily_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Categories
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- User settings
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID)
RETURNS TABLE (
  achievement_code TEXT,
  achievement_name TEXT,
  achievement_icon TEXT,
  xp_reward INTEGER
) AS $$
DECLARE
  v_user RECORD;
  v_achievement RECORD;
BEGIN
  -- Get user stats
  SELECT * INTO v_user FROM users WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Check each achievement
  FOR v_achievement IN
    SELECT a.* FROM achievements a
    WHERE NOT EXISTS (
      SELECT 1 FROM user_achievements ua
      WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
    )
  LOOP
    -- Check if requirement is met
    IF (
      (v_achievement.requirement_type = 'games_played' AND v_user.games_played >= v_achievement.requirement_value) OR
      (v_achievement.requirement_type = 'total_xp' AND v_user.total_xp >= v_achievement.requirement_value) OR
      (v_achievement.requirement_type = 'best_chain' AND v_user.best_chain >= v_achievement.requirement_value) OR
      (v_achievement.requirement_type = 'level_reached' AND v_user.level >= v_achievement.requirement_value) OR
      (v_achievement.requirement_type = 'perfect_games' AND v_user.perfect_games >= v_achievement.requirement_value) OR
      (v_achievement.requirement_type = 'first_game' AND v_user.games_played >= 1)
    ) THEN
      -- Award achievement
      INSERT INTO user_achievements (user_id, achievement_id)
      VALUES (p_user_id, v_achievement.id)
      ON CONFLICT DO NOTHING;

      -- Award XP
      UPDATE users SET total_xp = total_xp + v_achievement.xp_reward WHERE id = p_user_id;

      -- Return the awarded achievement
      achievement_code := v_achievement.code;
      achievement_name := v_achievement.name;
      achievement_icon := v_achievement.icon;
      xp_reward := v_achievement.xp_reward;
      RETURN NEXT;
    END IF;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get today's challenge
CREATE OR REPLACE FUNCTION get_daily_challenge()
RETURNS TABLE (
  id UUID,
  challenge_date DATE,
  question_id UUID,
  category TEXT,
  bonus_xp INTEGER,
  question_text TEXT,
  player_name TEXT,
  options JSONB
) AS $$
BEGIN
  -- Create today's challenge if not exists
  INSERT INTO daily_challenges (challenge_date, question_id, category, bonus_xp)
  SELECT
    CURRENT_DATE,
    q.id,
    q.category,
    100
  FROM questions q
  WHERE q.is_active = true
  ORDER BY RANDOM()
  LIMIT 1
  ON CONFLICT (challenge_date) DO NOTHING;

  -- Return today's challenge with question
  RETURN QUERY
  SELECT
    dc.id,
    dc.challenge_date,
    dc.question_id,
    dc.category,
    dc.bonus_xp,
    q.question_text,
    q.player_name,
    q.options
  FROM daily_challenges dc
  JOIN questions q ON dc.question_id = q.id
  WHERE dc.challenge_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_achievements TO authenticated;
GRANT EXECUTE ON FUNCTION check_achievements TO anon;
GRANT EXECUTE ON FUNCTION get_daily_challenge TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_challenge TO anon;
