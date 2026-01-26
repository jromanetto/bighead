-- Migration: Fix ambiguous column reference in get_adaptive_questions
-- The 'category' column was ambiguous between RETURNS TABLE and query columns

-- Drop and recreate with fixed column references
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
  match_quality FLOAT
) AS $$
DECLARE
  v_player_skill FLOAT;
  v_skill_deviation FLOAT;
BEGIN
  -- Get player's current skill for this category
  SELECT COALESCE(ps.skill_rating, 1200), COALESCE(ps.rating_deviation, 350)
  INTO v_player_skill, v_skill_deviation
  FROM player_skill ps
  WHERE ps.user_id = p_user_id AND ps.category = p_category;

  -- Default skill if not found
  IF v_player_skill IS NULL THEN
    v_player_skill := 1200;
    v_skill_deviation := 350;
  END IF;

  RETURN QUERY
  WITH ranked_questions AS (
    SELECT
      q.id AS q_id,
      q.question_text AS q_question_text,
      q.correct_answer AS q_correct_answer,
      q.wrong_answers AS q_wrong_answers,
      q.category AS q_category,
      q.difficulty AS q_difficulty,
      q.image_url AS q_image_url,
      q.image_credit AS q_image_credit,
      COALESCE(q.difficulty_rating, 1200) AS q_difficulty_rating,
      1.0 / (1.0 + ABS(v_player_skill - COALESCE(q.difficulty_rating, 1200)) / 200) AS q_match_quality,
      CASE WHEN uqs.id IS NULL THEN 0 ELSE 1 END AS seen_priority,
      COALESCE(uqs.times_seen, 0) AS times_seen
    FROM questions q
    LEFT JOIN user_questions_seen uqs ON q.id = uqs.question_id AND uqs.user_id = p_user_id
    WHERE q.is_active = true
      AND q.language = p_language
      AND q.category = p_category
  )
  SELECT
    rq.q_id,
    rq.q_question_text,
    rq.q_correct_answer,
    rq.q_wrong_answers,
    rq.q_category,
    rq.q_difficulty,
    rq.q_image_url,
    rq.q_image_credit,
    rq.q_difficulty_rating,
    rq.q_match_quality
  FROM ranked_questions rq
  ORDER BY
    rq.seen_priority ASC,
    (rq.q_match_quality * 0.7 + RANDOM() * 0.3) DESC,
    rq.times_seen ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also fix get_player_skill_summary which may have same issue
CREATE OR REPLACE FUNCTION get_player_skill_summary(p_user_id UUID)
RETURNS TABLE (
  category TEXT,
  skill_rating FLOAT,
  skill_level TEXT,
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
    END AS skill_level,
    ps.games_played,
    CASE
      WHEN ps.total_answers > 0
      THEN ROUND((ps.correct_answers::NUMERIC / ps.total_answers) * 100, 1)::FLOAT
      ELSE 0
    END AS accuracy_percent,
    ps.best_streak
  FROM player_skill ps
  WHERE ps.user_id = p_user_id
  ORDER BY ps.skill_rating DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-grant permissions
GRANT EXECUTE ON FUNCTION get_adaptive_questions TO authenticated;
GRANT EXECUTE ON FUNCTION get_adaptive_questions TO anon;
GRANT EXECUTE ON FUNCTION get_player_skill_summary TO authenticated;
