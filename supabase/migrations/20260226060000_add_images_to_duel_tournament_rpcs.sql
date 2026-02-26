-- Add image_url to get_duel_questions and get_tournament_questions RPCs

DROP FUNCTION IF EXISTS get_duel_questions(UUID);

CREATE OR REPLACE FUNCTION get_duel_questions(p_duel_id UUID)
RETURNS TABLE (
  round_number INTEGER,
  question_id UUID,
  question_text TEXT,
  player_name TEXT,
  options JSONB,
  image_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dr.round_number,
    dr.question_id,
    q.question_text,
    q.player_name,
    q.options,
    q.image_url
  FROM duel_rounds dr
  JOIN questions q ON q.id = dr.question_id
  WHERE dr.duel_id = p_duel_id
  ORDER BY dr.round_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_duel_questions TO authenticated;

-- Tournament

DROP FUNCTION IF EXISTS get_tournament_questions(UUID);

CREATE OR REPLACE FUNCTION get_tournament_questions(p_tournament_id UUID)
RETURNS TABLE (
  question_order INTEGER,
  question_id UUID,
  question_text TEXT,
  player_name TEXT,
  options JSONB,
  image_url TEXT
) AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM tournament_participants
    WHERE tournament_id = p_tournament_id AND user_id = auth.uid()
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    tq.question_order,
    tq.question_id,
    q.question_text,
    q.player_name,
    q.options,
    q.image_url
  FROM tournament_questions tq
  JOIN questions q ON q.id = tq.question_id
  WHERE tq.tournament_id = p_tournament_id
  ORDER BY tq.question_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_tournament_questions TO authenticated;
