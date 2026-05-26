-- Migration: Weekly Challenge push notifications
-- 3 broadcast notifications throughout the week
--   Mon 09:00 UTC → weekly_start  (new challenge available)
--   Thu 09:00 UTC → weekly_midweek (nudge for non-starters)
--   Sun 18:00 UTC → weekly_lastday (final hours before close)
-- All target the user's "weekly" screen.
--
-- !! SECURITY NOTE !!
-- The original revision of this file inlined the project's service_role JWT in
-- the notify_weekly_challenge() body below. That token has been REDACTED.
-- service_role JWT was inlined here; replaced by migration 20260526120000_secure_cron_jwt.sql
-- notify_weekly_challenge() is redefined by 20260526120000_secure_cron_jwt.sql
-- to read the JWT from Supabase Vault. See docs/security/JWT_ROTATION_TODO.md.

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
      -- service_role JWT was inlined here; replaced by migration 20260526120000_secure_cron_jwt.sql
      'Authorization', 'Bearer <REDACTED_SEE_20260526120000_secure_cron_jwt>'
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
