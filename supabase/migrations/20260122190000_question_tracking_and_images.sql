-- Migration: Question tracking and images
-- Track which questions users have seen + add image support

-- ============================================
-- QUESTION TRACKING
-- ============================================

-- Track questions seen by each user
CREATE TABLE IF NOT EXISTS user_questions_seen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  seen_at TIMESTAMPTZ DEFAULT NOW(),
  times_seen INTEGER DEFAULT 1,
  last_correct BOOLEAN,
  UNIQUE(user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_user_questions_seen_user ON user_questions_seen(user_id);
CREATE INDEX IF NOT EXISTS idx_user_questions_seen_question ON user_questions_seen(question_id);

-- Enable RLS
ALTER TABLE user_questions_seen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own seen questions" ON user_questions_seen
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own seen questions" ON user_questions_seen
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own seen questions" ON user_questions_seen
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- IMAGE SUPPORT FOR QUESTIONS
-- ============================================

-- Add image_url column to questions
ALTER TABLE questions ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS image_credit TEXT; -- For Unsplash attribution

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to mark question as seen
CREATE OR REPLACE FUNCTION mark_question_seen(
  p_user_id UUID,
  p_question_id UUID,
  p_was_correct BOOLEAN DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_questions_seen (user_id, question_id, last_correct)
  VALUES (p_user_id, p_question_id, p_was_correct)
  ON CONFLICT (user_id, question_id) DO UPDATE
  SET
    times_seen = user_questions_seen.times_seen + 1,
    seen_at = NOW(),
    last_correct = COALESCE(p_was_correct, user_questions_seen.last_correct);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's question coverage stats
CREATE OR REPLACE FUNCTION get_user_question_stats(p_user_id UUID)
RETURNS TABLE (
  total_questions BIGINT,
  questions_seen BIGINT,
  coverage_percent NUMERIC,
  needs_new_questions BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM questions WHERE is_active = true) as total_questions,
    (SELECT COUNT(*) FROM user_questions_seen WHERE user_id = p_user_id) as questions_seen,
    ROUND(
      (SELECT COUNT(*) FROM user_questions_seen WHERE user_id = p_user_id)::NUMERIC /
      NULLIF((SELECT COUNT(*) FROM questions WHERE is_active = true), 0) * 100,
      1
    ) as coverage_percent,
    (
      (SELECT COUNT(*) FROM user_questions_seen WHERE user_id = p_user_id)::NUMERIC /
      NULLIF((SELECT COUNT(*) FROM questions WHERE is_active = true), 0) > 0.8
    ) as needs_new_questions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get questions user hasn't seen (prioritize unseen)
CREATE OR REPLACE FUNCTION get_unseen_questions(
  p_user_id UUID,
  p_category TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 10,
  p_language TEXT DEFAULT 'en'
)
RETURNS TABLE (
  id UUID,
  question_text TEXT,
  correct_answer TEXT,
  wrong_answers TEXT[],
  category TEXT,
  difficulty INTEGER,
  image_url TEXT,
  image_credit TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.id,
    q.question_text,
    q.correct_answer,
    q.wrong_answers,
    q.category,
    q.difficulty,
    q.image_url,
    q.image_credit
  FROM questions q
  LEFT JOIN user_questions_seen uqs ON q.id = uqs.question_id AND uqs.user_id = p_user_id
  WHERE q.is_active = true
    AND q.language = p_language
    AND (p_category IS NULL OR q.category = p_category)
  ORDER BY
    CASE WHEN uqs.id IS NULL THEN 0 ELSE 1 END, -- Unseen first
    uqs.times_seen ASC NULLS FIRST, -- Then least seen
    RANDOM()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION mark_question_seen TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_question_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_unseen_questions TO authenticated;
