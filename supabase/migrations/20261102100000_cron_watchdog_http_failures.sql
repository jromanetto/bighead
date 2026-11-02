-- Cron watchdog blind spot (incident 2026-11-02): crons call edge functions via
-- pg_net, which is async — cron.job_run_details reports "succeeded" as soon as
-- the request is queued. The edge functions' real HTTP status lands in
-- net._http_response. Weekly-challenge generation returned 500 (Anthropic credit
-- exhausted) every day from 2026-09-29 to 2026-11-02 and the watchdog never saw
-- it. Same return shape, so the cron-watchdog edge function needs no change.

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
SET search_path = public, cron, net
AS $$
  SELECT j.jobname, d.status, d.return_message, d.start_time, d.end_time
  FROM cron.job_run_details d
  JOIN cron.job j ON j.jobid = d.jobid
  WHERE d.start_time >= now() - make_interval(mins => p_minutes)
    AND d.status = 'failed'
  UNION ALL
  -- net._http_response has no URL column: the body excerpt identifies the call.
  SELECT 'pg_net #' || r.id,
         coalesce('HTTP ' || r.status_code, 'error'),
         left(coalesce(r.error_msg, r.content::text, ''), 500),
         r.created,
         r.created
  FROM net._http_response r
  WHERE r.created >= now() - make_interval(mins => p_minutes)
    AND (r.status_code >= 400 OR r.error_msg IS NOT NULL OR r.timed_out)
  ORDER BY 4 DESC;
$$;

REVOKE EXECUTE ON FUNCTION public.get_recent_cron_failures(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_cron_failures(integer) TO service_role;
