-- Contextual push notifications
-- 1. notification_preferences table (per-user opt-in for each trigger)
-- 2. notify_user_if_enabled() helper -> calls send-push edge function via pg_net
-- 3. AFTER INSERT trigger on user_achievements -> achievement_unlocked push
-- 4. pg_cron: hourly friend_overtake scan
-- 5. pg_cron: daily 20:00 UTC streak_warning scan
--
-- NOTE: the service_role JWT below is the same one used in 20260525120100_weekly_challenges_cron.sql

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- =========================================================================
-- 1) notification_preferences table
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id          UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  friend_overtake  BOOLEAN NOT NULL DEFAULT TRUE,
  achievement      BOOLEAN NOT NULL DEFAULT TRUE,
  streak_warning   BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notification_prefs_select_own" ON public.notification_preferences;
CREATE POLICY "notification_prefs_select_own"
  ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notification_prefs_insert_own" ON public.notification_preferences;
CREATE POLICY "notification_prefs_insert_own"
  ON public.notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notification_prefs_update_own" ON public.notification_preferences;
CREATE POLICY "notification_prefs_update_own"
  ON public.notification_preferences
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tracking table to avoid spamming the same friend_overtake notification repeatedly
CREATE TABLE IF NOT EXISTS public.notification_dedupe (
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL,
  ref        TEXT NOT NULL,  -- e.g. "<friend_id>:<iso_week>"
  sent_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, kind, ref)
);
ALTER TABLE public.notification_dedupe ENABLE ROW LEVEL SECURITY;
-- no policies -> only service_role can touch it (RLS bypass)

-- =========================================================================
-- 2) notify_user_if_enabled(p_user_id, p_template, p_variables, p_pref_col)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.notify_user_if_enabled(
  p_user_id   UUID,
  p_template  TEXT,
  p_variables JSONB,
  p_pref_col  TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enabled    BOOLEAN;
  v_has_token  BOOLEAN;
  v_payload    JSONB;
BEGIN
  -- Lookup the per-user pref dynamically (defaults to TRUE if no row).
  EXECUTE format(
    'SELECT COALESCE((SELECT %I FROM public.notification_preferences WHERE user_id = $1), TRUE)',
    p_pref_col
  )
  INTO v_enabled
  USING p_user_id;

  IF NOT v_enabled THEN
    RETURN;
  END IF;

  SELECT (push_token IS NOT NULL)
  INTO v_has_token
  FROM public.users
  WHERE id = p_user_id;

  IF v_has_token IS NOT TRUE THEN
    RETURN;
  END IF;

  v_payload := jsonb_build_object(
    'user_id', p_user_id,
    'template', p_template,
    'variables', COALESCE(p_variables, '{}'::jsonb),
    'title', '',
    'body', ''
  );

  PERFORM net.http_post(
    url := 'https://dqhhpoxqrtlmhosrsdxp.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxaGhwb3hxcnRsbWhvc3JzZHhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAxODIyMywiZXhwIjoyMDg0NTk0MjIzfQ.oTir57-MZlIsvi2gUT6jCRhh-E_-1869-wAX4G5Av64'
    ),
    body := v_payload
  );
END;
$$;

-- =========================================================================
-- 3) Achievement unlocked trigger
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_achievement_unlocked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name TEXT;
BEGIN
  SELECT name INTO v_name
  FROM public.achievements
  WHERE id = NEW.achievement_id;

  IF v_name IS NULL THEN
    v_name := 'Nouveau succès';
  END IF;

  PERFORM public.notify_user_if_enabled(
    NEW.user_id,
    'achievement',
    jsonb_build_object('achievement', v_name),
    'achievement'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_achievement_unlocked_push ON public.user_achievements;
CREATE TRIGGER trg_achievement_unlocked_push
  AFTER INSERT ON public.user_achievements
  FOR EACH ROW EXECUTE FUNCTION public.handle_achievement_unlocked();

-- =========================================================================
-- 4) Friend overtake scanner (hourly)
--    "Friends" = anyone in the same weekly leaderboard pool.
--    For each user A: find users B with weekly_xp(B) - weekly_xp(A) > 50
--    where B gained XP in the last hour.
--    Dedup per (overtaken_user, overtaker, iso_week).
-- =========================================================================
CREATE OR REPLACE FUNCTION public.scan_friend_overtakes()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  v_week TEXT;
BEGIN
  v_week := to_char(date_trunc('week', NOW()), 'IYYY-IW');

  FOR r IN
    WITH active_sources AS (
      SELECT unnest(ARRAY[
        'chain_solo','party','duel','tournament','family',
        'adventure','traitor','auction','challenge','daily'
      ]) AS s
    ),
    weekly_xp AS (
      SELECT
        u.id AS user_id,
        u.username,
        COALESCE(SUM(xt.amount), 0) AS xp
      FROM public.users u
      LEFT JOIN public.xp_transactions xt
        ON xt.user_id = u.id
       AND xt.created_at >= NOW() - INTERVAL '7 days'
       AND xt.source IN (SELECT s FROM active_sources)
      WHERE u.username IS NOT NULL
      GROUP BY u.id, u.username
    ),
    recent_gainers AS (
      SELECT DISTINCT xt.user_id
      FROM public.xp_transactions xt
      WHERE xt.created_at >= NOW() - INTERVAL '1 hour'
        AND xt.source IN (SELECT s FROM active_sources)
    )
    SELECT
      a.user_id   AS overtaken_id,
      b.user_id   AS overtaker_id,
      b.username  AS overtaker_username,
      (b.xp - a.xp)::INT AS xp_diff
    FROM weekly_xp a
    JOIN weekly_xp b
      ON b.user_id <> a.user_id
     AND b.xp > a.xp + 50
    JOIN recent_gainers rg ON rg.user_id = b.user_id
    JOIN public.users ua ON ua.id = a.user_id AND ua.push_token IS NOT NULL
    WHERE a.xp > 0  -- only notify users actively playing this week
  LOOP
    -- Dedup per (overtaken, overtaker, week)
    BEGIN
      INSERT INTO public.notification_dedupe(user_id, kind, ref)
      VALUES (
        r.overtaken_id,
        'friend_overtake',
        r.overtaker_id::TEXT || ':' || v_week
      );
    EXCEPTION WHEN unique_violation THEN
      CONTINUE;
    END;

    PERFORM public.notify_user_if_enabled(
      r.overtaken_id,
      'friend_overtake',
      jsonb_build_object(
        'username', COALESCE(r.overtaker_username, 'Un joueur'),
        'xp_diff', r.xp_diff::TEXT
      ),
      'friend_overtake'
    );
  END LOOP;
END;
$$;

-- =========================================================================
-- 5) Streak warning scanner (daily 20:00 UTC)
--    Users with daily_streak >= 3 AND no xp_transactions today (UTC).
-- =========================================================================
CREATE OR REPLACE FUNCTION public.scan_streak_warnings()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT u.id, u.daily_streak
    FROM public.users u
    WHERE u.daily_streak >= 3
      AND u.push_token IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.xp_transactions xt
        WHERE xt.user_id = u.id
          AND xt.created_at >= date_trunc('day', NOW())
      )
  LOOP
    PERFORM public.notify_user_if_enabled(
      r.id,
      'streak_warning',
      jsonb_build_object('days', r.daily_streak::TEXT),
      'streak_warning'
    );
  END LOOP;
END;
$$;

-- =========================================================================
-- 6) Cron schedules
-- =========================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'scan-friend-overtakes') THEN
    PERFORM cron.unschedule('scan-friend-overtakes');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'scan-streak-warnings') THEN
    PERFORM cron.unschedule('scan-streak-warnings');
  END IF;
END $$;

-- Hourly at minute 5
SELECT cron.schedule(
  'scan-friend-overtakes',
  '5 * * * *',
  $cron$ SELECT public.scan_friend_overtakes(); $cron$
);

-- Daily at 20:00 UTC
SELECT cron.schedule(
  'scan-streak-warnings',
  '0 20 * * *',
  $cron$ SELECT public.scan_streak_warnings(); $cron$
);

GRANT EXECUTE ON FUNCTION public.notify_user_if_enabled(UUID, TEXT, JSONB, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.scan_friend_overtakes() TO service_role;
GRANT EXECUTE ON FUNCTION public.scan_streak_warnings() TO service_role;
