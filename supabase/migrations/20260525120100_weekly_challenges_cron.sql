-- Migration: Schedule pg_cron jobs for weekly challenges
-- Sunday 23:00 UTC → close current active challenge (award XP + migrate Q to main DB)
-- Sunday 23:30 UTC → generate next week's challenge (Monday 00:00 → Sunday 23:59)
--
-- !! SECURITY NOTE !!
-- The original revision of this file inlined the project's service_role JWT in
-- the cron.schedule() bodies below. That token has been REDACTED.
-- service_role JWT was inlined here; replaced by migration 20260526120000_secure_cron_jwt.sql
-- The cron jobs are dropped + recreated by 20260526120000_secure_cron_jwt.sql
-- using a Vault-backed get_service_role_jwt() helper. See
-- docs/security/JWT_ROTATION_TODO.md for rotation steps.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'close-weekly-challenge') THEN
    PERFORM cron.unschedule('close-weekly-challenge');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'generate-weekly-challenge') THEN
    PERFORM cron.unschedule('generate-weekly-challenge');
  END IF;
END $$;

-- close-weekly-challenge
-- Original body called net.http_post with a hardcoded Bearer service_role JWT.
-- service_role JWT was inlined here; replaced by migration 20260526120000_secure_cron_jwt.sql
SELECT cron.schedule(
  'close-weekly-challenge',
  '0 23 * * 0',
  $cron$
  SELECT net.http_post(
    url := 'https://dqhhpoxqrtlmhosrsdxp.supabase.co/functions/v1/close-weekly-challenge',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization', 'Bearer <REDACTED_SEE_20260526120000_secure_cron_jwt>'
    ),
    body := '{}'::jsonb
  );
  $cron$
);

-- generate-weekly-challenge
-- service_role JWT was inlined here; replaced by migration 20260526120000_secure_cron_jwt.sql
SELECT cron.schedule(
  'generate-weekly-challenge',
  '30 23 * * 0',
  $cron$
  SELECT net.http_post(
    url := 'https://dqhhpoxqrtlmhosrsdxp.supabase.co/functions/v1/generate-weekly-challenge',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization', 'Bearer <REDACTED_SEE_20260526120000_secure_cron_jwt>'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 240000
  );
  $cron$
);
