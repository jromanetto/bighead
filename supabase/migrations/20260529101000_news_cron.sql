-- Migration: Schedule the weekly News Challenge generator.
--
-- generate-news-challenge runs every Monday 08:00 UTC. It pulls the past 7
-- days of Wikipedia Current Events, filters to positive/neutral categories,
-- and creates a challenge_type='news' weekly challenge for the current week.
--
-- The close-weekly-challenge cron (Sunday 23:00 UTC, see
-- 20260526120000_secure_cron_jwt.sql) already closes EVERY active challenge,
-- including news ones, so no separate close job is needed.
--
-- Auth: uses public.get_service_role_jwt() (Vault-backed) like the other jobs.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Idempotent: drop the job if it already exists before (re)scheduling.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'generate-news-challenge') THEN
    PERFORM cron.unschedule('generate-news-challenge');
  END IF;
END $$;

-- generate-news-challenge — Mondays 08:00 UTC
SELECT cron.schedule(
  'generate-news-challenge',
  '0 8 * * 1',
  $cron$
  SELECT net.http_post(
    url := 'https://dqhhpoxqrtlmhosrsdxp.supabase.co/functions/v1/generate-news-challenge',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || public.get_service_role_jwt()
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 240000
  );
  $cron$
);
