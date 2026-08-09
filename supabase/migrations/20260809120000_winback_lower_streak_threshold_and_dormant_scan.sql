-- P0 win-back: the only lapsed-user push (scan_streak_warnings) required streak>=3,
-- but max daily_streak across the whole base is 0 -> it could never fire for anyone.
-- Lower to >=1, and add a generic dormant-user comeback push for real players who
-- went quiet, regardless of streak. New "comeback" template lives in send-push.

-- 1) streak_warning now fires from a 1-day streak
CREATE OR REPLACE FUNCTION public.scan_streak_warnings()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT u.id, u.daily_streak
    FROM public.users u
    WHERE u.daily_streak >= 1
      AND u.push_token IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.xp_transactions xt
        WHERE xt.user_id = u.id
          AND xt.created_at >= date_trunc('day', NOW())
      )
  LOOP
    PERFORM public.notify_user_if_enabled(
      r.id, 'streak_warning',
      jsonb_build_object('days', r.daily_streak::TEXT),
      'streak_warning'
    );
  END LOOP;
END;
$$;

-- 2) Generic dormant win-back: real players (games_played>0) with a push token who
--    played within the last 21 days but not in the last 2. One nudge per ISO-week.
CREATE OR REPLACE FUNCTION public.scan_dormant_users()
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
    SELECT u.id
    FROM public.users u
    WHERE u.push_token IS NOT NULL
      AND COALESCE(u.games_played, 0) > 0
      AND NOT EXISTS (
        SELECT 1 FROM public.xp_transactions xt
        WHERE xt.user_id = u.id AND xt.created_at >= NOW() - INTERVAL '2 days'
      )
      AND EXISTS (
        SELECT 1 FROM public.xp_transactions xt
        WHERE xt.user_id = u.id AND xt.created_at >= NOW() - INTERVAL '21 days'
      )
  LOOP
    BEGIN
      INSERT INTO public.notification_dedupe(user_id, kind, ref)
      VALUES (r.id, 'comeback', v_week);
    EXCEPTION WHEN unique_violation THEN
      CONTINUE;
    END;
    PERFORM public.notify_user_if_enabled(r.id, 'comeback', '{}'::jsonb, 'streak_warning');
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.scan_dormant_users() TO service_role;

-- 3) Schedule the dormant scan daily at 17:00 UTC
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'scan-dormant-users') THEN
    PERFORM cron.unschedule('scan-dormant-users');
  END IF;
END $$;

SELECT cron.schedule(
  'scan-dormant-users',
  '0 17 * * *',
  $cron$ SELECT public.scan_dormant_users(); $cron$
);
