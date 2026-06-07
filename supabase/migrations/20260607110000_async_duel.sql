-- Migration: Async (turn-based) duel mode
-- REPLACES the synchronous 1v1 model with a Trivia Crack / Words With Friends
-- model. Both players play the SAME 10 questions but at different times.
-- Old sync rows are preserved with mode='sync'.

-- =========================================================================
-- 1) ALTER TABLE duels
-- =========================================================================
ALTER TABLE public.duels
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'async',
  ADD COLUMN IF NOT EXISTS host_played_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS guest_played_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS host_time_ms INTEGER,
  ADD COLUMN IF NOT EXISTS guest_time_ms INTEGER,
  ADD COLUMN IF NOT EXISTS host_answers JSONB,
  ADD COLUMN IF NOT EXISTS guest_answers JSONB,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS questions_payload JSONB;

-- Preserve old sync rows: anything created before this migration is sync.
UPDATE public.duels SET mode = 'sync' WHERE mode = 'async' AND questions_payload IS NULL AND created_at < NOW() - INTERVAL '1 minute';

-- Now make the future default the new async mode.
ALTER TABLE public.duels ALTER COLUMN mode SET DEFAULT 'async';

-- Mode check constraint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'duels_mode_check'
  ) THEN
    ALTER TABLE public.duels ADD CONSTRAINT duels_mode_check CHECK (mode IN ('async','sync'));
  END IF;
END $$;

-- Status check: allow the new async states alongside the legacy ones
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'duels_status_check') THEN
    ALTER TABLE public.duels DROP CONSTRAINT duels_status_check;
  END IF;
  ALTER TABLE public.duels ADD CONSTRAINT duels_status_check
    CHECK (status IN ('waiting','playing','finished','cancelled','pending','awaiting_opponent','completed','expired'));
END $$;

-- =========================================================================
-- 2) Indexes
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_duels_host_status ON public.duels(host_id, status);
CREATE INDEX IF NOT EXISTS idx_duels_guest_status ON public.duels(guest_id, status);
CREATE INDEX IF NOT EXISTS idx_duels_status_expires ON public.duels(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_duels_mode ON public.duels(mode);

-- =========================================================================
-- 3) RLS
-- =========================================================================
ALTER TABLE public.duels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS duels_select_participants ON public.duels;
CREATE POLICY duels_select_participants ON public.duels
  FOR SELECT
  USING (auth.uid() = host_id OR auth.uid() = guest_id);

-- =========================================================================
-- 4) RPC: create_async_duel
-- =========================================================================
CREATE OR REPLACE FUNCTION public.create_async_duel(
  p_guest_id UUID,
  p_category TEXT,
  p_language TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_host_id UUID;
  v_host_level INTEGER;
  v_guest UUID;
  v_duel_id UUID;
  v_code TEXT;
  v_questions JSONB;
BEGIN
  v_host_id := auth.uid();
  IF v_host_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  -- Resolve guest: explicit or random opponent (level band ±5, widen to ±10)
  IF p_guest_id IS NOT NULL THEN
    v_guest := p_guest_id;
  ELSE
    SELECT level INTO v_host_level FROM public.users WHERE id = v_host_id;
    v_host_level := COALESCE(v_host_level, 1);

    SELECT u.id INTO v_guest
    FROM public.users u
    WHERE u.id <> v_host_id
      AND COALESCE(u.level, 1) BETWEEN GREATEST(1, v_host_level - 5) AND v_host_level + 5
    ORDER BY RANDOM()
    LIMIT 1;

    IF v_guest IS NULL THEN
      SELECT u.id INTO v_guest
      FROM public.users u
      WHERE u.id <> v_host_id
        AND COALESCE(u.level, 1) BETWEEN GREATEST(1, v_host_level - 10) AND v_host_level + 10
      ORDER BY RANDOM()
      LIMIT 1;
    END IF;

    IF v_guest IS NULL THEN
      RAISE EXCEPTION 'no opponent available';
    END IF;
  END IF;

  -- Snapshot 10 questions
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', q.id,
      'question_text', q.question_text,
      'correct_answer', q.correct_answer,
      'wrong_answers', q.wrong_answers,
      'image_url', q.image_url,
      'explanation', q.explanation,
      'player_name', q.player_name
    )
    ORDER BY q.rnd
  ) INTO v_questions
  FROM (
    SELECT id, question_text, correct_answer, wrong_answers, image_url, explanation, player_name, RANDOM() AS rnd
    FROM public.questions
    WHERE (p_category IS NULL OR category = p_category)
      AND (p_language IS NULL OR language = p_language)
      AND is_active = TRUE
    ORDER BY RANDOM()
    LIMIT 10
  ) q;

  IF v_questions IS NULL OR jsonb_array_length(v_questions) < 10 THEN
    RAISE EXCEPTION 'not enough questions for category=% language=%', p_category, p_language;
  END IF;

  v_code := UPPER(SUBSTRING(MD5(gen_random_uuid()::text), 1, 6));

  INSERT INTO public.duels (
    id, code, host_id, guest_id, status, category, language,
    rounds_total, current_round, host_score, guest_score,
    mode, expires_at, questions_payload, created_at
  ) VALUES (
    gen_random_uuid(), v_code, v_host_id, v_guest, 'pending',
    p_category, p_language, 10, 0, 0, 0,
    'async', NOW() + INTERVAL '48 hours', v_questions, NOW()
  )
  RETURNING id INTO v_duel_id;

  RETURN v_duel_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_async_duel(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_async_duel(UUID, TEXT, TEXT) TO authenticated;

-- =========================================================================
-- 5) RPC: submit_async_duel_play
-- =========================================================================
CREATE OR REPLACE FUNCTION public.submit_async_duel_play(
  p_duel_id UUID,
  p_answers JSONB,
  p_total_time_ms INTEGER
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user UUID;
  v_duel RECORD;
  v_is_host BOOLEAN;
  v_my_score INTEGER;
  v_opp_score INTEGER;
  v_status TEXT;
  v_winner UUID;
  v_xp_winner INTEGER := 50;
  v_xp_loser INTEGER := 25;
  v_xp_draw INTEGER := 30;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  -- Lock duel row
  SELECT * INTO v_duel FROM public.duels WHERE id = p_duel_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'duel not found';
  END IF;

  IF v_duel.mode <> 'async' THEN
    RAISE EXCEPTION 'duel is not async';
  END IF;

  IF v_duel.status NOT IN ('pending','awaiting_opponent') THEN
    RAISE EXCEPTION 'duel not playable (status=%)', v_duel.status;
  END IF;

  IF v_duel.expires_at IS NOT NULL AND v_duel.expires_at < NOW() THEN
    UPDATE public.duels SET status = 'expired' WHERE id = p_duel_id;
    RAISE EXCEPTION 'duel expired';
  END IF;

  IF v_user = v_duel.host_id THEN
    v_is_host := TRUE;
    IF v_duel.host_played_at IS NOT NULL THEN
      RAISE EXCEPTION 'host already played';
    END IF;
  ELSIF v_user = v_duel.guest_id THEN
    v_is_host := FALSE;
    IF v_duel.guest_played_at IS NOT NULL THEN
      RAISE EXCEPTION 'guest already played';
    END IF;
  ELSE
    RAISE EXCEPTION 'not a participant';
  END IF;

  -- Compute score = COUNT of is_correct
  SELECT COUNT(*) INTO v_my_score
  FROM jsonb_array_elements(p_answers) AS a
  WHERE (a->>'is_correct')::boolean IS TRUE;

  IF v_is_host THEN
    UPDATE public.duels
    SET host_score = v_my_score,
        host_answers = p_answers,
        host_played_at = NOW(),
        host_time_ms = p_total_time_ms,
        status = CASE WHEN guest_played_at IS NOT NULL THEN 'completed' ELSE 'awaiting_opponent' END
    WHERE id = p_duel_id;
  ELSE
    UPDATE public.duels
    SET guest_score = v_my_score,
        guest_answers = p_answers,
        guest_played_at = NOW(),
        guest_time_ms = p_total_time_ms,
        status = CASE WHEN host_played_at IS NOT NULL THEN 'completed' ELSE 'awaiting_opponent' END
    WHERE id = p_duel_id;
  END IF;

  -- Re-fetch latest after update
  SELECT * INTO v_duel FROM public.duels WHERE id = p_duel_id;

  IF v_duel.status = 'completed' THEN
    -- Compute winner: highest score, tie-break by lower total_time_ms
    IF v_duel.host_score > v_duel.guest_score THEN
      v_winner := v_duel.host_id;
    ELSIF v_duel.guest_score > v_duel.host_score THEN
      v_winner := v_duel.guest_id;
    ELSE
      IF COALESCE(v_duel.host_time_ms, 2147483647) < COALESCE(v_duel.guest_time_ms, 2147483647) THEN
        v_winner := v_duel.host_id;
      ELSIF COALESCE(v_duel.guest_time_ms, 2147483647) < COALESCE(v_duel.host_time_ms, 2147483647) THEN
        v_winner := v_duel.guest_id;
      ELSE
        v_winner := NULL; -- true draw
      END IF;
    END IF;

    UPDATE public.duels SET winner_id = v_winner, finished_at = NOW() WHERE id = p_duel_id;

    -- Award XP to both players (idempotent via dedupe_key)
    IF v_winner IS NULL THEN
      PERFORM public.award_xp(v_duel.host_id, v_xp_draw, 'duel',
        jsonb_build_object('duel_id', v_duel.id, 'result', 'draw'),
        'duel_async:' || v_duel.id);
      PERFORM public.award_xp(v_duel.guest_id, v_xp_draw, 'duel',
        jsonb_build_object('duel_id', v_duel.id, 'result', 'draw'),
        'duel_async:' || v_duel.id);
    ELSE
      PERFORM public.award_xp(v_winner,
        v_xp_winner, 'duel',
        jsonb_build_object('duel_id', v_duel.id, 'result', 'win'),
        'duel_async:' || v_duel.id);
      PERFORM public.award_xp(
        CASE WHEN v_winner = v_duel.host_id THEN v_duel.guest_id ELSE v_duel.host_id END,
        v_xp_loser, 'duel',
        jsonb_build_object('duel_id', v_duel.id, 'result', 'loss'),
        'duel_async:' || v_duel.id);
    END IF;
  END IF;

  v_status := v_duel.status;
  v_opp_score := CASE WHEN v_is_host THEN v_duel.guest_score ELSE v_duel.host_score END;

  RETURN jsonb_build_object(
    'status', v_status,
    'my_score', v_my_score,
    'opponent_score', CASE WHEN v_status = 'completed' THEN v_opp_score ELSE NULL END,
    'winner_id', v_duel.winner_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_async_duel_play(UUID, JSONB, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_async_duel_play(UUID, JSONB, INTEGER) TO authenticated;

-- =========================================================================
-- 6) RPC: get_my_duels
-- =========================================================================
CREATE OR REPLACE FUNCTION public.get_my_duels()
RETURNS TABLE (
  duel_id UUID,
  my_role TEXT,
  opponent_id UUID,
  opponent_username TEXT,
  opponent_avatar TEXT,
  category TEXT,
  status TEXT,
  my_played_at TIMESTAMPTZ,
  opponent_played_at TIMESTAMPTZ,
  my_score INTEGER,
  opponent_score INTEGER,
  winner_id UUID,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user UUID;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    d.id,
    CASE WHEN d.host_id = v_user THEN 'host' ELSE 'guest' END,
    CASE WHEN d.host_id = v_user THEN d.guest_id ELSE d.host_id END,
    u.username,
    u.avatar_url,
    d.category,
    d.status,
    CASE WHEN d.host_id = v_user THEN d.host_played_at ELSE d.guest_played_at END,
    CASE WHEN d.host_id = v_user THEN d.guest_played_at ELSE d.host_played_at END,
    CASE WHEN d.host_id = v_user THEN d.host_score ELSE d.guest_score END,
    CASE WHEN d.host_id = v_user THEN d.guest_score ELSE d.host_score END,
    d.winner_id,
    d.expires_at,
    d.created_at
  FROM public.duels d
  LEFT JOIN public.users u ON u.id = (CASE WHEN d.host_id = v_user THEN d.guest_id ELSE d.host_id END)
  WHERE (d.host_id = v_user OR d.guest_id = v_user)
    AND d.mode = 'async'
  ORDER BY
    CASE d.status
      WHEN 'pending' THEN 1
      WHEN 'awaiting_opponent' THEN 2
      WHEN 'completed' THEN 3
      WHEN 'expired' THEN 4
      ELSE 5
    END,
    d.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_duels() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_duels() TO authenticated;

-- =========================================================================
-- 7) RPC: find_random_opponent
-- =========================================================================
CREATE OR REPLACE FUNCTION public.find_random_opponent(p_level_band INT DEFAULT 5)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user UUID;
  v_level INTEGER;
  v_opp UUID;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT COALESCE(level, 1) INTO v_level FROM public.users WHERE id = v_user;
  v_level := COALESCE(v_level, 1);

  SELECT id INTO v_opp
  FROM public.users
  WHERE id <> v_user
    AND COALESCE(level, 1) BETWEEN GREATEST(1, v_level - p_level_band) AND v_level + p_level_band
  ORDER BY RANDOM()
  LIMIT 1;

  IF v_opp IS NULL THEN
    SELECT id INTO v_opp
    FROM public.users
    WHERE id <> v_user
      AND COALESCE(level, 1) BETWEEN GREATEST(1, v_level - (p_level_band * 2)) AND v_level + (p_level_band * 2)
    ORDER BY RANDOM()
    LIMIT 1;
  END IF;

  RETURN v_opp;
END;
$$;

REVOKE ALL ON FUNCTION public.find_random_opponent(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_random_opponent(INT) TO authenticated;

-- =========================================================================
-- 8) Notification helper for async duel events
-- =========================================================================
CREATE OR REPLACE FUNCTION public.notify_async_duel_event(
  p_user_id UUID,
  p_template TEXT,
  p_variables JSONB
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_jwt TEXT;
  v_has_token BOOLEAN;
BEGIN
  IF p_user_id IS NULL THEN RETURN; END IF;

  SELECT (push_token IS NOT NULL) INTO v_has_token FROM public.users WHERE id = p_user_id;
  IF v_has_token IS NOT TRUE THEN RETURN; END IF;

  v_jwt := public.get_service_role_jwt();
  IF v_jwt IS NULL THEN
    RAISE WARNING 'service_role_key vault secret not set, skipping async duel notification';
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := 'https://dqhhpoxqrtlmhosrsdxp.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_jwt
    ),
    body := jsonb_build_object(
      'user_id', p_user_id,
      'template', p_template,
      'variables', COALESCE(p_variables, '{}'::jsonb),
      'title', '',
      'body', ''
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.notify_async_duel_event(UUID, TEXT, JSONB) TO service_role;

-- =========================================================================
-- 9) Triggers — notify on async duel state changes
-- =========================================================================
CREATE OR REPLACE FUNCTION public.async_duel_after_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_host_username TEXT;
BEGIN
  IF NEW.mode = 'async' AND NEW.guest_id IS NOT NULL THEN
    SELECT username INTO v_host_username FROM public.users WHERE id = NEW.host_id;
    PERFORM public.notify_async_duel_event(
      NEW.guest_id,
      'duel_invite',
      jsonb_build_object('username', COALESCE(v_host_username, 'Quelqu''un'), 'duel_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_async_duel_after_insert ON public.duels;
CREATE TRIGGER trg_async_duel_after_insert
  AFTER INSERT ON public.duels
  FOR EACH ROW
  EXECUTE FUNCTION public.async_duel_after_insert();

CREATE OR REPLACE FUNCTION public.async_duel_after_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_other UUID;
  v_played_username TEXT;
BEGIN
  IF NEW.mode <> 'async' THEN RETURN NEW; END IF;

  -- One player just played, awaiting other
  IF NEW.status = 'awaiting_opponent' AND OLD.status <> 'awaiting_opponent' THEN
    IF NEW.host_played_at IS NOT NULL AND OLD.host_played_at IS NULL THEN
      v_other := NEW.guest_id;
      SELECT username INTO v_played_username FROM public.users WHERE id = NEW.host_id;
    ELSIF NEW.guest_played_at IS NOT NULL AND OLD.guest_played_at IS NULL THEN
      v_other := NEW.host_id;
      SELECT username INTO v_played_username FROM public.users WHERE id = NEW.guest_id;
    END IF;

    IF v_other IS NOT NULL THEN
      PERFORM public.notify_async_duel_event(
        v_other,
        'duel_invite',
        jsonb_build_object(
          'username', COALESCE(v_played_username, 'Quelqu''un'),
          'duel_id', NEW.id,
          'their_turn_done', TRUE
        )
      );
    END IF;
  END IF;

  -- Both played: notify each side with their personalized result
  IF NEW.status = 'completed' AND OLD.status <> 'completed' THEN
    PERFORM public.notify_async_duel_event(
      NEW.host_id,
      'duel_result',
      jsonb_build_object(
        'duel_id', NEW.id,
        'my_score', NEW.host_score,
        'opponent_score', NEW.guest_score,
        'won', (NEW.winner_id = NEW.host_id)
      )
    );
    PERFORM public.notify_async_duel_event(
      NEW.guest_id,
      'duel_result',
      jsonb_build_object(
        'duel_id', NEW.id,
        'my_score', NEW.guest_score,
        'opponent_score', NEW.host_score,
        'won', (NEW.winner_id = NEW.guest_id)
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_async_duel_after_update ON public.duels;
CREATE TRIGGER trg_async_duel_after_update
  AFTER UPDATE ON public.duels
  FOR EACH ROW
  EXECUTE FUNCTION public.async_duel_after_update();

-- =========================================================================
-- 10) Cron — expire stale async duels every hour
-- =========================================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-async-duels') THEN
    PERFORM cron.unschedule('expire-async-duels');
  END IF;
END $$;

SELECT cron.schedule(
  'expire-async-duels',
  '0 * * * *',
  $cron$
  UPDATE public.duels
  SET status = 'expired'
  WHERE mode = 'async'
    AND status IN ('pending','awaiting_opponent')
    AND expires_at < NOW();
  $cron$
);
