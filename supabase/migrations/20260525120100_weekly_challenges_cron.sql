-- Migration: Schedule pg_cron jobs for weekly challenges
-- Sunday 23:00 UTC → close current active challenge (award XP + migrate Q to main DB)
-- Sunday 23:30 UTC → generate next week's challenge (Monday 00:00 → Sunday 23:59)
--
-- The service_role bearer token is hardcoded in cron.job entries — these are
-- stored in a restricted Supabase-managed schema. Rotate the token if exposed.

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

-- NOTE : both schedules use the project's service role JWT. Replace if rotated.
SELECT cron.schedule(
  'close-weekly-challenge',
  '0 23 * * 0',
  $cron$
  SELECT net.http_post(
    url := 'https://dqhhpoxqrtlmhosrsdxp.supabase.co/functions/v1/close-weekly-challenge',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxaGhwb3hxcnRsbWhvc3JzZHhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAxODIyMywiZXhwIjoyMDg0NTk0MjIzfQ.oTir57-MZlIsvi2gUT6jCRhh-E_-1869-wAX4G5Av64'
    ),
    body := '{}'::jsonb
  );
  $cron$
);

SELECT cron.schedule(
  'generate-weekly-challenge',
  '30 23 * * 0',
  $cron$
  SELECT net.http_post(
    url := 'https://dqhhpoxqrtlmhosrsdxp.supabase.co/functions/v1/generate-weekly-challenge',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxaGhwb3hxcnRsbWhvc3JzZHhwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTAxODIyMywiZXhwIjoyMDg0NTk0MjIzfQ.oTir57-MZlIsvi2gUT6jCRhh-E_-1869-wAX4G5Av64'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 240000
  );
  $cron$
);
