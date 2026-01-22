-- Fix: Only select questions that have the options JSONB field populated
DROP FUNCTION IF EXISTS get_daily_challenge();

CREATE OR REPLACE FUNCTION get_daily_challenge()
RETURNS TABLE (
  out_challenge_id UUID,
  out_challenge_date DATE,
  out_question_id UUID,
  out_category TEXT,
  out_bonus_xp INTEGER,
  out_question_text TEXT,
  out_player_name TEXT,
  out_options JSONB
) AS $$
BEGIN
  -- Create today's challenge if not exists
  -- Only select questions that have the options field populated
  INSERT INTO daily_challenges (challenge_date, question_id, category, bonus_xp)
  SELECT
    CURRENT_DATE,
    q.id,
    q.category,
    100
  FROM questions q
  WHERE q.is_active = true
    AND q.options IS NOT NULL
    AND q.player_name IS NOT NULL
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
  JOIN questions q ON q.id = dc.question_id
  WHERE dc.challenge_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-grant execute permission
GRANT EXECUTE ON FUNCTION get_daily_challenge TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_challenge TO anon;
