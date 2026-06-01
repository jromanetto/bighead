-- Weekly Challenge Replay: lets users redo archived/closed challenges for fun
-- Replays never award XP (no award_xp call) and write to a separate table.

-- =====================================================================
-- 1. Replay results table
-- =====================================================================

CREATE TABLE IF NOT EXISTS weekly_replay_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES weekly_challenges(id) ON DELETE CASCADE,
  current_position INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_weekly_replay_user_challenge_started
  ON weekly_replay_results(user_id, challenge_id, started_at DESC);

ALTER TABLE weekly_replay_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "replay_own_select" ON weekly_replay_results;
CREATE POLICY "replay_own_select" ON weekly_replay_results
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "replay_own_insert" ON weekly_replay_results;
CREATE POLICY "replay_own_insert" ON weekly_replay_results
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "replay_own_update" ON weekly_replay_results;
CREATE POLICY "replay_own_update" ON weekly_replay_results
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- =====================================================================
-- 2. get_my_challenge_history()
-- =====================================================================

CREATE OR REPLACE FUNCTION get_my_challenge_history()
RETURNS TABLE (
  challenge_id UUID,
  challenge_type TEXT,
  theme_slug TEXT,
  theme_label_fr TEXT,
  theme_label_en TEXT,
  description_fr TEXT,
  description_en TEXT,
  emoji TEXT,
  color TEXT,
  start_date DATE,
  end_date DATE,
  total_questions INTEGER,
  final_score INTEGER,
  correct_count INTEGER,
  badge_earned TEXT,
  completed_at TIMESTAMPTZ,
  final_xp_awarded INTEGER,
  best_replay_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    c.id AS challenge_id,
    c.challenge_type,
    c.theme_slug,
    c.theme_label_fr,
    c.theme_label_en,
    c.description_fr,
    c.description_en,
    c.emoji,
    c.color,
    c.start_date,
    c.end_date,
    c.total_questions,
    p.final_score,
    p.correct_count,
    p.badge_earned,
    p.completed_at,
    p.final_xp_awarded,
    (
      SELECT MAX(r.correct_count)
      FROM weekly_replay_results r
      WHERE r.user_id = v_user_id
        AND r.challenge_id = c.id
        AND r.completed_at IS NOT NULL
    )::INTEGER AS best_replay_score
  FROM weekly_challenge_progress p
  JOIN weekly_challenges c ON c.id = p.challenge_id
  WHERE c.status IN ('archived', 'closed')
    AND p.user_id = v_user_id
  ORDER BY c.end_date DESC
  LIMIT 50;
END;
$$;

GRANT EXECUTE ON FUNCTION get_my_challenge_history TO authenticated;

-- =====================================================================
-- 3. start_weekly_replay(p_challenge_id UUID)
-- =====================================================================

CREATE OR REPLACE FUNCTION start_weekly_replay(p_challenge_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_status TEXT;
  v_total INTEGER;
  v_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT status, total_questions
    INTO v_status, v_total
  FROM weekly_challenges
  WHERE id = p_challenge_id;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'challenge not found';
  END IF;

  IF v_status NOT IN ('archived', 'closed') THEN
    RAISE EXCEPTION 'challenge is not replayable (status=%)', v_status;
  END IF;

  INSERT INTO weekly_replay_results (
    user_id, challenge_id, current_position, correct_count, total_questions
  ) VALUES (
    v_user_id, p_challenge_id, 0, 0, v_total
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION start_weekly_replay TO authenticated;

-- =====================================================================
-- 4. submit_replay_answer(p_replay_id, p_position, p_is_correct)
-- =====================================================================

CREATE OR REPLACE FUNCTION submit_replay_answer(
  p_replay_id UUID,
  p_position INTEGER,
  p_is_correct BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_replay weekly_replay_results;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT * INTO v_replay
  FROM weekly_replay_results
  WHERE id = p_replay_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'replay not found';
  END IF;

  IF v_replay.user_id <> v_user_id THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF v_replay.completed_at IS NOT NULL THEN
    RAISE EXCEPTION 'replay already completed';
  END IF;

  IF p_position <> v_replay.current_position + 1 THEN
    RAISE EXCEPTION 'expected position %, got %', v_replay.current_position + 1, p_position;
  END IF;

  UPDATE weekly_replay_results SET
    current_position = current_position + 1,
    correct_count    = correct_count + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    completed_at     = CASE
                         WHEN current_position + 1 >= total_questions THEN NOW()
                         ELSE completed_at
                       END
  WHERE id = v_replay.id
  RETURNING * INTO v_replay;

  RETURN jsonb_build_object(
    'current_position', v_replay.current_position,
    'correct_count',    v_replay.correct_count,
    'completed',        v_replay.completed_at IS NOT NULL
  );
END;
$$;

GRANT EXECUTE ON FUNCTION submit_replay_answer TO authenticated;
