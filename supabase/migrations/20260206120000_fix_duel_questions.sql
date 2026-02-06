-- Fix: Generate duel questions once when guest joins, not on each call

-- Drop old function
DROP FUNCTION IF EXISTS get_duel_questions(UUID);

-- Modify join_duel to create rounds with questions when guest joins
CREATE OR REPLACE FUNCTION join_duel(p_code VARCHAR(6), p_guest_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  duel_id UUID,
  message TEXT
) AS $$
DECLARE
  v_duel RECORD;
  v_question RECORD;
  v_round INTEGER := 0;
BEGIN
  -- Find the duel
  SELECT * INTO v_duel FROM duels WHERE code = UPPER(p_code) AND status = 'waiting';

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Duel not found or already started';
    RETURN;
  END IF;

  IF v_duel.host_id = p_guest_id THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'You cannot join your own duel';
    RETURN;
  END IF;

  -- Join the duel
  UPDATE duels
  SET guest_id = p_guest_id, status = 'playing', started_at = NOW()
  WHERE id = v_duel.id;

  -- Generate and store questions for this duel (only if not already created)
  IF NOT EXISTS (SELECT 1 FROM duel_rounds WHERE duel_id = v_duel.id) THEN
    FOR v_question IN
      SELECT q.id
      FROM questions q
      WHERE q.is_active = true
        AND q.options IS NOT NULL
        AND (v_duel.category = 'general' OR q.category = v_duel.category)
      ORDER BY RANDOM()
      LIMIT v_duel.rounds_total
    LOOP
      v_round := v_round + 1;
      INSERT INTO duel_rounds (duel_id, round_number, question_id)
      VALUES (v_duel.id, v_round, v_question.id);
    END LOOP;
  END IF;

  RETURN QUERY SELECT TRUE, v_duel.id, 'Duel joined successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- New get_duel_questions that reads from duel_rounds
CREATE OR REPLACE FUNCTION get_duel_questions(p_duel_id UUID)
RETURNS TABLE (
  round_number INTEGER,
  question_id UUID,
  question_text TEXT,
  player_name TEXT,
  options JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dr.round_number,
    dr.question_id,
    q.question_text,
    q.player_name,
    q.options
  FROM duel_rounds dr
  JOIN questions q ON q.id = dr.question_id
  WHERE dr.duel_id = p_duel_id
  ORDER BY dr.round_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION join_duel TO authenticated;
GRANT EXECUTE ON FUNCTION get_duel_questions TO authenticated;
