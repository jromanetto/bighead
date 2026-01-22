-- Migration: Add more categories and prepare for sounds
-- New categories: Art, Music, Animals, Nature, Literature

-- ============================================
-- NEW CATEGORIES
-- ============================================

INSERT INTO categories (code, name, icon, color) VALUES
  ('art', 'Art', '🎨', '#ec4899'),
  ('music', 'Music', '🎵', '#8b5cf6'),
  ('animals', 'Animals', '🐾', '#f97316'),
  ('nature', 'Nature', '🌿', '#22c55e'),
  ('literature', 'Literature', '📚', '#6366f1'),
  ('movies', 'Movies', '🎬', '#ef4444')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- ============================================
-- USER SETTINGS FOR SOUNDS
-- ============================================

-- Add sound preferences to user_settings if not exists
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS music_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS sound_volume DECIMAL DEFAULT 0.8;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS music_volume DECIMAL DEFAULT 0.5;

-- ============================================
-- OFFLINE CACHE TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS user_cached_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_ids UUID[] NOT NULL,
  category TEXT,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

CREATE INDEX IF NOT EXISTS idx_user_cached_questions_user ON user_cached_questions(user_id);

ALTER TABLE user_cached_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cache" ON user_cached_questions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FRIEND CHALLENGES
-- ============================================

CREATE TABLE IF NOT EXISTS friend_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(8) UNIQUE NOT NULL,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT DEFAULT 'general',
  question_count INTEGER DEFAULT 10,
  time_per_question INTEGER DEFAULT 15,
  question_ids UUID[] NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE TABLE IF NOT EXISTS friend_challenge_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES friend_challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_time_ms INTEGER,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_friend_challenges_code ON friend_challenges(code);
CREATE INDEX IF NOT EXISTS idx_friend_challenges_creator ON friend_challenges(creator_id);
CREATE INDEX IF NOT EXISTS idx_friend_challenge_attempts_challenge ON friend_challenge_attempts(challenge_id);

ALTER TABLE friend_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_challenge_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active challenges" ON friend_challenges
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create challenges" ON friend_challenges
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Anyone can view challenge attempts" ON friend_challenge_attempts
  FOR SELECT USING (true);

CREATE POLICY "Anyone can submit attempts" ON friend_challenge_attempts
  FOR INSERT WITH CHECK (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Generate unique challenge code
CREATE OR REPLACE FUNCTION generate_friend_challenge_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create friend challenge
CREATE OR REPLACE FUNCTION create_friend_challenge(
  p_creator_id UUID,
  p_category TEXT DEFAULT 'general',
  p_question_count INTEGER DEFAULT 10,
  p_time_per_question INTEGER DEFAULT 15,
  p_language TEXT DEFAULT 'en'
)
RETURNS TABLE (
  challenge_id UUID,
  challenge_code VARCHAR(8),
  share_url TEXT
) AS $$
DECLARE
  v_code VARCHAR(8);
  v_challenge_id UUID;
  v_question_ids UUID[];
BEGIN
  -- Generate unique code
  LOOP
    v_code := generate_friend_challenge_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM friend_challenges WHERE code = v_code);
  END LOOP;

  -- Get random questions
  SELECT ARRAY_AGG(q.id) INTO v_question_ids
  FROM (
    SELECT id FROM questions
    WHERE is_active = true
      AND language = p_language
      AND (p_category = 'general' OR category = p_category)
    ORDER BY RANDOM()
    LIMIT p_question_count
  ) q;

  -- Create challenge
  INSERT INTO friend_challenges (code, creator_id, category, question_count, time_per_question, question_ids)
  VALUES (v_code, p_creator_id, p_category, p_question_count, p_time_per_question, v_question_ids)
  RETURNING id INTO v_challenge_id;

  RETURN QUERY SELECT v_challenge_id, v_code, 'bighead://challenge/' || v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get challenge by code
CREATE OR REPLACE FUNCTION get_friend_challenge(p_code VARCHAR(8))
RETURNS TABLE (
  id UUID,
  code VARCHAR(8),
  creator_name TEXT,
  category TEXT,
  question_count INTEGER,
  time_per_question INTEGER,
  question_ids UUID[],
  status TEXT,
  attempts_count BIGINT,
  best_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fc.id,
    fc.code,
    u.username as creator_name,
    fc.category,
    fc.question_count,
    fc.time_per_question,
    fc.question_ids,
    fc.status,
    (SELECT COUNT(*) FROM friend_challenge_attempts WHERE challenge_id = fc.id) as attempts_count,
    (SELECT MAX(score) FROM friend_challenge_attempts WHERE challenge_id = fc.id) as best_score
  FROM friend_challenges fc
  JOIN users u ON fc.creator_id = u.id
  WHERE fc.code = UPPER(p_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Submit challenge attempt
CREATE OR REPLACE FUNCTION submit_friend_challenge_attempt(
  p_challenge_code VARCHAR(8),
  p_user_id UUID DEFAULT NULL,
  p_player_name TEXT DEFAULT 'Anonymous',
  p_score INTEGER DEFAULT 0,
  p_correct_count INTEGER DEFAULT 0,
  p_total_time_ms INTEGER DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  rank INTEGER,
  total_attempts BIGINT
) AS $$
DECLARE
  v_challenge_id UUID;
  v_attempt_id UUID;
  v_rank INTEGER;
  v_total BIGINT;
BEGIN
  -- Get challenge
  SELECT id INTO v_challenge_id FROM friend_challenges WHERE code = UPPER(p_challenge_code) AND status = 'active';

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 0::BIGINT;
    RETURN;
  END IF;

  -- Insert attempt
  INSERT INTO friend_challenge_attempts (challenge_id, user_id, player_name, score, correct_count, total_time_ms)
  VALUES (v_challenge_id, p_user_id, p_player_name, p_score, p_correct_count, p_total_time_ms)
  RETURNING id INTO v_attempt_id;

  -- Calculate rank
  SELECT COUNT(*) + 1 INTO v_rank
  FROM friend_challenge_attempts
  WHERE challenge_id = v_challenge_id AND score > p_score;

  SELECT COUNT(*) INTO v_total FROM friend_challenge_attempts WHERE challenge_id = v_challenge_id;

  RETURN QUERY SELECT TRUE, v_rank, v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_friend_challenge TO authenticated;
GRANT EXECUTE ON FUNCTION get_friend_challenge TO authenticated;
GRANT EXECUTE ON FUNCTION get_friend_challenge TO anon;
GRANT EXECUTE ON FUNCTION submit_friend_challenge_attempt TO authenticated;
GRANT EXECUTE ON FUNCTION submit_friend_challenge_attempt TO anon;
