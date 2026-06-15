-- Cron watchdog (audit 2026-06-15): crons used to fail silently. This wires an
-- hourly job that emails a digest (via the cron-watchdog edge function, reusing
-- the RESEND_API_KEY_BIGHEAD / AUDIT_EMAIL_TO secrets) whenever a scheduled job
-- failed in the last window.
--
-- Prereq (already provisioned in prod, documented here for reproducibility):
--   * Vault secret `cron_secret` holds the edge functions' CRON_SECRET.
--   * Edge function `cron-watchdog` deployed (supabase/functions/cron-watchdog).

-- Reads the shared cron secret from Vault so pg_cron can authenticate to the
-- edge functions without a hardcoded token.
CREATE OR REPLACE FUNCTION public.get_cron_secret()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'vault', 'pg_temp'
AS $function$
DECLARE v text; BEGIN
  SELECT decrypted_secret INTO v FROM vault.decrypted_secrets WHERE name='cron_secret' LIMIT 1;
  RETURN v;
END $function$;

-- Returns cron runs that ended in failure within the window. SECURITY DEFINER
-- because service_role (the edge function caller) cannot read the cron schema.
CREATE OR REPLACE FUNCTION public.get_recent_cron_failures(p_minutes integer DEFAULT 70)
RETURNS TABLE (
  jobname text,
  status text,
  return_message text,
  start_time timestamptz,
  end_time timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, cron
AS $$
  SELECT j.jobname, d.status, d.return_message, d.start_time, d.end_time
  FROM cron.job_run_details d
  JOIN cron.job j ON j.jobid = d.jobid
  WHERE d.start_time >= now() - make_interval(mins => p_minutes)
    AND d.status = 'failed'
  ORDER BY d.start_time DESC;
$$;

REVOKE EXECUTE ON FUNCTION public.get_recent_cron_failures(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_cron_failures(integer) TO service_role;

-- Hourly schedule (70-min window → slight overlap so a failure is never missed
-- between runs). Idempotent: unschedule first if it already exists.
SELECT cron.unschedule('cron-watchdog')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cron-watchdog');

SELECT cron.schedule(
  'cron-watchdog',
  '7 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://dqhhpoxqrtlmhosrsdxp.supabase.co/functions/v1/cron-watchdog',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || public.get_cron_secret()
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);
