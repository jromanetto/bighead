-- Migration: Fix default language to French
-- Change default language from 'en' to 'fr' in get_unseen_questions function

-- Drop and recreate the function with French as default
CREATE OR REPLACE FUNCTION get_unseen_questions(
  p_user_id UUID,
  p_category TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 10,
  p_language TEXT DEFAULT 'fr'  -- Changed from 'en' to 'fr'
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

-- Grant permissions (in case they were lost)
GRANT EXECUTE ON FUNCTION get_unseen_questions TO authenticated;
