-- Fix: Ambiguous column reference in get_daily_challenge function

-- Drop the existing function first (required when changing return type)
DROP FUNCTION IF EXISTS get_daily_challenge();

CREATE OR REPLACE FUNCTION get_daily_challenge()
RETURNS TABLE (
  challenge_id UUID,
  challenge_date DATE,
  question_id UUID,
  challenge_category TEXT,
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
    dc.id AS challenge_id,
    dc.challenge_date,
    dc.question_id,
    dc.category AS challenge_category,
    dc.bonus_xp,
    q.question_text,
    q.player_name,
    q.options
  FROM daily_challenges dc
  JOIN questions q ON dc.question_id = q.id
  WHERE dc.challenge_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-grant execute permission
GRANT EXECUTE ON FUNCTION get_daily_challenge TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_challenge TO anon;
