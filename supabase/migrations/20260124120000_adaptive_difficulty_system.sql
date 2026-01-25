-- Migration: Adaptive Difficulty System
-- Intelligent question difficulty adjustment based on player performance
-- Uses Elo-like rating system for both questions and players

-- ============================================
-- QUESTION STATISTICS
-- ============================================

-- Add statistics columns to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS times_shown INTEGER DEFAULT 0;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS times_correct INTEGER DEFAULT 0;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS avg_time_ms INTEGER; -- Average time to answer
ALTER TABLE questions ADD COLUMN IF NOT EXISTS empirical_difficulty FLOAT; -- Calculated from stats
ALTER TABLE questions ADD COLUMN IF NOT EXISTS difficulty_rating FLOAT DEFAULT 1200; -- Elo-like rating
ALTER TABLE questions ADD COLUMN IF NOT EXISTS difficulty_updated_at TIMESTAMPTZ;

-- Create index for efficient difficulty-based queries
CREATE INDEX IF NOT EXISTS idx_questions_empirical_difficulty ON questions(empirical_difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty_rating ON questions(difficulty_rating);
CREATE INDEX IF NOT EXISTS idx_questions_category_difficulty ON questions(category, empirical_difficulty);

-- ============================================
-- PLAYER SKILL RATINGS
-- ============================================

-- Track player skill per category using Elo-like system
CREATE TABLE IF NOT EXISTS player_skill (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  skill_rating FLOAT DEFAULT 1200, -- Elo rating (1200 = average)
  rating_deviation FLOAT DEFAULT 350, -- Confidence (high = uncertain)
  games_played INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_answers INTEGER DEFAULT 0,
  win_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

CREATE INDEX IF NOT EXISTS idx_player_skill_user ON player_skill(user_id);
CREATE INDEX IF NOT EXISTS idx_player_skill_category ON player_skill(category);
CREATE INDEX IF NOT EXISTS idx_player_skill_rating ON player_skill(skill_rating);

-- Enable RLS
ALTER TABLE player_skill ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skill" ON player_skill
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skill" ON player_skill
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skill" ON player_skill
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- ANSWER ANALYTICS (for detailed tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS answer_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_skill_at_time FLOAT, -- Player's skill when answering
  question_difficulty_at_time FLOAT, -- Question's difficulty when shown
  was_correct BOOLEAN NOT NULL,
  time_to_answer_ms INTEGER, -- Milliseconds to answer
  tier TEXT, -- Player's tier when answering
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_answer_analytics_question ON answer_analytics(question_id);
CREATE INDEX IF NOT EXISTS idx_answer_analytics_user ON answer_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_answer_analytics_created ON answer_analytics(created_at);

-- Enable RLS (allow anonymous tracking)
ALTER TABLE answer_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert analytics" ON answer_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own analytics" ON answer_analytics
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- ============================================
-- ELO CALCULATION FUNCTIONS
-- ============================================

-- Calculate expected score (probability of correct answer)
CREATE OR REPLACE FUNCTION elo_expected_score(player_rating FLOAT, question_rating FLOAT)
RETURNS FLOAT AS $$
BEGIN
  RETURN 1.0 / (1.0 + POWER(10, (question_rating - player_rating) / 400.0));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate new Elo rating
CREATE OR REPLACE FUNCTION elo_new_rating(
  old_rating FLOAT,
  expected_score FLOAT,
  actual_score FLOAT, -- 1.0 for correct, 0.0 for incorrect
  k_factor FLOAT DEFAULT 32 -- Higher = more volatile
)
RETURNS FLOAT AS $$
BEGIN
  RETURN old_rating + k_factor * (actual_score - expected_score);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- RECORD ANSWER AND UPDATE RATINGS
-- ============================================

CREATE OR REPLACE FUNCTION record_answer_and_update_ratings(
  p_user_id UUID,
  p_question_id UUID,
  p_was_correct BOOLEAN,
  p_time_ms INTEGER DEFAULT NULL,
  p_tier TEXT DEFAULT NULL
)
RETURNS TABLE (
  new_player_skill FLOAT,
  new_question_difficulty FLOAT,
  skill_change FLOAT
) AS $$
DECLARE
  v_category TEXT;
  v_player_skill FLOAT;
  v_question_rating FLOAT;
  v_expected FLOAT;
  v_actual FLOAT;
  v_k_player FLOAT;
  v_k_question FLOAT;
  v_new_player_skill FLOAT;
  v_new_question_rating FLOAT;
  v_player_deviation FLOAT;
  v_games_played INTEGER;
BEGIN
  -- Get question info
  SELECT category, COALESCE(difficulty_rating, 1200)
  INTO v_category, v_question_rating
  FROM questions WHERE id = p_question_id;

  IF v_category IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  -- Get or create player skill for this category
  INSERT INTO player_skill (user_id, category, skill_rating, rating_deviation)
  VALUES (p_user_id, v_category, 1200, 350)
  ON CONFLICT (user_id, category) DO NOTHING;

  SELECT skill_rating, rating_deviation, games_played
  INTO v_player_skill, v_player_deviation, v_games_played
  FROM player_skill
  WHERE user_id = p_user_id AND category = v_category;

  -- Calculate expected score
  v_expected := elo_expected_score(v_player_skill, v_question_rating);
  v_actual := CASE WHEN p_was_correct THEN 1.0 ELSE 0.0 END;

  -- K-factor adjustments:
  -- Players: Higher K when uncertain (high deviation), lower when established
  v_k_player := GREATEST(16, LEAST(48, 32 * (v_player_deviation / 350)));

  -- Questions: Lower K to make question ratings more stable
  v_k_question := 16;

  -- Calculate new ratings
  v_new_player_skill := elo_new_rating(v_player_skill, v_expected, v_actual, v_k_player);
  v_new_question_rating := elo_new_rating(v_question_rating, 1 - v_expected, 1 - v_actual, v_k_question);

  -- Update player skill
  UPDATE player_skill
  SET
    skill_rating = v_new_player_skill,
    rating_deviation = GREATEST(50, rating_deviation - 5), -- Reduce uncertainty over time
    games_played = games_played + 1,
    total_answers = total_answers + 1,
    correct_answers = correct_answers + CASE WHEN p_was_correct THEN 1 ELSE 0 END,
    win_streak = CASE WHEN p_was_correct THEN win_streak + 1 ELSE 0 END,
    best_streak = GREATEST(best_streak, CASE WHEN p_was_correct THEN win_streak + 1 ELSE 0 END),
    last_played_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id AND category = v_category;

  -- Update question statistics
  UPDATE questions
  SET
    times_shown = COALESCE(times_shown, 0) + 1,
    times_correct = COALESCE(times_correct, 0) + CASE WHEN p_was_correct THEN 1 ELSE 0 END,
    avg_time_ms = CASE
      WHEN p_time_ms IS NOT NULL THEN
        COALESCE((COALESCE(avg_time_ms, p_time_ms) * COALESCE(times_shown, 0) + p_time_ms) / (COALESCE(times_shown, 0) + 1), p_time_ms)
      ELSE avg_time_ms
    END,
    difficulty_rating = v_new_question_rating,
    empirical_difficulty = CASE
      WHEN COALESCE(times_shown, 0) + 1 >= 10 THEN
        -- Calculate empirical difficulty based on success rate and time
        (1.0 - (COALESCE(times_correct, 0) + CASE WHEN p_was_correct THEN 1 ELSE 0 END)::FLOAT / (COALESCE(times_shown, 0) + 1)) * 5
      ELSE
        difficulty -- Keep manual difficulty until enough data
    END,
    difficulty_updated_at = NOW()
  WHERE id = p_question_id;

  -- Record analytics
  INSERT INTO answer_analytics (
    question_id, user_id, user_skill_at_time, question_difficulty_at_time,
    was_correct, time_to_answer_ms, tier
  ) VALUES (
    p_question_id, p_user_id, v_player_skill, v_question_rating,
    p_was_correct, p_time_ms, p_tier
  );

  -- Return results
  RETURN QUERY SELECT
    v_new_player_skill,
    v_new_question_rating,
    v_new_player_skill - v_player_skill;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GET ADAPTIVE QUESTIONS
-- ============================================

-- Get questions matched to player skill level
CREATE OR REPLACE FUNCTION get_adaptive_questions(
  p_user_id UUID,
  p_category TEXT,
  p_limit INTEGER DEFAULT 10,
  p_language TEXT DEFAULT 'fr',
  p_tier TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  question_text TEXT,
  correct_answer TEXT,
  wrong_answers TEXT[],
  category TEXT,
  difficulty INTEGER,
  image_url TEXT,
  image_credit TEXT,
  difficulty_rating FLOAT,
  match_quality FLOAT -- How well matched to player skill
) AS $$
DECLARE
  v_player_skill FLOAT;
  v_skill_deviation FLOAT;
BEGIN
  -- Get player's current skill for this category
  SELECT COALESCE(skill_rating, 1200), COALESCE(rating_deviation, 350)
  INTO v_player_skill, v_skill_deviation
  FROM player_skill
  WHERE user_id = p_user_id AND category = p_category;

  -- Default skill if not found
  IF v_player_skill IS NULL THEN
    v_player_skill := 1200;
    v_skill_deviation := 350;
  END IF;

  RETURN QUERY
  WITH ranked_questions AS (
    SELECT
      q.id,
      q.question_text,
      q.correct_answer,
      q.wrong_answers,
      q.category,
      q.difficulty,
      q.image_url,
      q.image_credit,
      COALESCE(q.difficulty_rating, 1200) as difficulty_rating,
      -- Calculate match quality (closer to player skill = better match)
      1.0 / (1.0 + ABS(v_player_skill - COALESCE(q.difficulty_rating, 1200)) / 200) as match_quality,
      -- Has user seen this question?
      CASE WHEN uqs.id IS NULL THEN 0 ELSE 1 END as seen_priority,
      COALESCE(uqs.times_seen, 0) as times_seen
    FROM questions q
    LEFT JOIN user_questions_seen uqs ON q.id = uqs.question_id AND uqs.user_id = p_user_id
    WHERE q.is_active = true
      AND q.language = p_language
      AND q.category = p_category
  )
  SELECT
    rq.id,
    rq.question_text,
    rq.correct_answer,
    rq.wrong_answers,
    rq.category,
    rq.difficulty,
    rq.image_url,
    rq.image_credit,
    rq.difficulty_rating,
    rq.match_quality
  FROM ranked_questions rq
  ORDER BY
    rq.seen_priority ASC, -- Unseen questions first
    -- Mix of skill matching and randomness
    -- 70% weight on skill match, 30% random for variety
    (rq.match_quality * 0.7 + RANDOM() * 0.3) DESC,
    rq.times_seen ASC -- Least seen of similar difficulty
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GET PLAYER SKILL SUMMARY
-- ============================================

CREATE OR REPLACE FUNCTION get_player_skill_summary(p_user_id UUID)
RETURNS TABLE (
  category TEXT,
  skill_rating FLOAT,
  skill_level TEXT, -- Descriptive level
  games_played INTEGER,
  accuracy_percent FLOAT,
  best_streak INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ps.category,
    ps.skill_rating,
    CASE
      WHEN ps.skill_rating >= 1800 THEN 'Expert'
      WHEN ps.skill_rating >= 1500 THEN 'Avancé'
      WHEN ps.skill_rating >= 1200 THEN 'Intermédiaire'
      WHEN ps.skill_rating >= 900 THEN 'Débutant'
      ELSE 'Novice'
    END as skill_level,
    ps.games_played,
    CASE
      WHEN ps.total_answers > 0
      THEN ROUND((ps.correct_answers::FLOAT / ps.total_answers) * 100, 1)
      ELSE 0
    END as accuracy_percent,
    ps.best_streak
  FROM player_skill ps
  WHERE ps.user_id = p_user_id
  ORDER BY ps.skill_rating DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RECALCULATE QUESTION DIFFICULTIES (BATCH)
-- ============================================

-- Run periodically to recalibrate all questions based on stats
CREATE OR REPLACE FUNCTION recalculate_all_question_difficulties()
RETURNS INTEGER AS $$
DECLARE
  v_updated INTEGER := 0;
BEGIN
  UPDATE questions
  SET
    empirical_difficulty = CASE
      WHEN times_shown >= 10 THEN
        (1.0 - times_correct::FLOAT / times_shown) * 5
      ELSE
        difficulty
    END,
    difficulty_updated_at = NOW()
  WHERE times_shown >= 10
    AND (difficulty_updated_at IS NULL OR difficulty_updated_at < NOW() - INTERVAL '1 day');

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION elo_expected_score TO authenticated;
GRANT EXECUTE ON FUNCTION elo_new_rating TO authenticated;
GRANT EXECUTE ON FUNCTION record_answer_and_update_ratings TO authenticated;
GRANT EXECUTE ON FUNCTION get_adaptive_questions TO authenticated;
GRANT EXECUTE ON FUNCTION get_player_skill_summary TO authenticated;
GRANT EXECUTE ON FUNCTION recalculate_all_question_difficulties TO authenticated;

-- Allow anonymous users to record answers (for guest play)
GRANT EXECUTE ON FUNCTION record_answer_and_update_ratings TO anon;
GRANT EXECUTE ON FUNCTION get_adaptive_questions TO anon;
