-- Migration: Weekly Challenge push notifications
-- 3 broadcast notifications throughout the week
--   Mon 09:00 UTC → weekly_start  (new challenge available)
--   Thu 09:00 UTC → weekly_midweek (nudge for non-starters)
--   Sun 18:00 UTC → weekly_lastday (final hours before close)
-- All target the user's "weekly" screen.

CREATE OR REPLACE FUNCTION notify_weekly_challenge(p_template TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  v_emoji TEXT;
  v_theme_fr TEXT;
  v_request_id BIGINT;
BEGIN
  SELECT emoji, theme_label_fr INTO v_emoji, v_theme_fr
  FROM weekly_challenges
  WHERE status = 'active'
  ORDER BY start_date DESC
  LIMIT 1;

  IF v_emoji IS NULL THEN
    RAISE NOTICE 'no active challenge, skipping % notification', p_template;
    RETURN;
  END IF;

  SELECT net.http_post(
    url := 'https://dqhhpoxqrtlmhosrsdxp.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxaGhwb3hxcnRsbWhvc3JzZHhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAxODIyMywiZXhwIjoyMDg0NTk0MjIzfQ.oTir57-MZlIsvi2gUT6jCRhh-E_-1869-wAX4G5Av64'
    ),
    body := jsonb_build_object(
      'broadcast', true,
      'template', p_template,
      'variables', jsonb_build_object('emoji', v_emoji, 'theme', v_theme_fr)
    )
  ) INTO v_request_id;
END;
$func$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'weekly-start-notif') THEN PERFORM cron.unschedule('weekly-start-notif'); END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'weekly-midweek-notif') THEN PERFORM cron.unschedule('weekly-midweek-notif'); END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'weekly-lastday-notif') THEN PERFORM cron.unschedule('weekly-lastday-notif'); END IF;
END $$;

SELECT cron.schedule('weekly-start-notif',   '0 9 * * 1', $$ SELECT notify_weekly_challenge('weekly_start'); $$);
SELECT cron.schedule('weekly-midweek-notif', '0 9 * * 4', $$ SELECT notify_weekly_challenge('weekly_midweek'); $$);
SELECT cron.schedule('weekly-lastday-notif', '0 18 * * 0', $$ SELECT notify_weekly_challenge('weekly_lastday'); $$);
