-- Migration: Move service_role JWT out of cron job bodies into Supabase Vault.
--
-- Background:
--   Earlier migrations (20260525120100, 20260525120200, 20260525140000) inlined
--   the service_role JWT in cron.schedule() bodies and SECURITY DEFINER
--   functions. Anyone with repo read access could lift the token and bypass RLS.
--
-- Strategy:
--   - Store the JWT in `vault.secrets` (encrypted at rest, accessible only to
--     postgres / superuser via `vault.decrypted_secrets`).
--   - Expose it through a SECURITY DEFINER helper `public.get_service_role_jwt()`
--     so cron.schedule bodies and notification functions resolve it at runtime.
--   - Recreate the 5 affected cron jobs using the helper.
--   - Recreate `notify_weekly_challenge` and `notify_user_if_enabled` so their
--     bodies no longer contain the JWT either.
--
-- IMPORTANT — manual follow-up required (see docs/security/JWT_ROTATION_TODO.md):
--   1. Rotate the service_role key in the Supabase Dashboard.
--   2. Populate the Vault secret with the new key:
--        select vault.create_secret('<NEW_JWT>', 'service_role_key',
--                                   'service_role JWT used by pg_cron + pg_net');
--   Until step 2 is done, `get_service_role_jwt()` returns NULL and cron jobs
--   that depend on it will fail to authenticate.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS supabase_vault;

-- =========================================================================
-- 1) Helper: get_service_role_jwt()
-- =========================================================================
CREATE OR REPLACE FUNCTION public.get_service_role_jwt()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = vault, pg_temp
AS $$
DECLARE
  v_jwt TEXT;
BEGIN
  SELECT decrypted_secret INTO v_jwt
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key'
  LIMIT 1;
  RETURN v_jwt;
END;
$$;

-- Only the postgres role and the cron / supabase internals need this.
-- Explicitly REVOKE from anon / authenticated to prevent accidental exposure.
REVOKE ALL ON FUNCTION public.get_service_role_jwt() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_service_role_jwt() FROM anon;
REVOKE ALL ON FUNCTION public.get_service_role_jwt() FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.get_service_role_jwt() TO postgres;
GRANT  EXECUTE ON FUNCTION public.get_service_role_jwt() TO service_role;

COMMENT ON FUNCTION public.get_service_role_jwt() IS
  'Returns the service_role JWT from vault.decrypted_secrets (name = service_role_key). '
  'Used by pg_cron jobs and notification helpers to authenticate edge function calls. '
  'Populate via: select vault.create_secret(''<JWT>'', ''service_role_key'').';

-- =========================================================================
-- 2) Recreate notify_weekly_challenge() without inlined JWT
-- =========================================================================
CREATE OR REPLACE FUNCTION public.notify_weekly_challenge(p_template TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  v_emoji      TEXT;
  v_theme_fr   TEXT;
  v_request_id BIGINT;
  v_jwt        TEXT;
BEGIN
  SELECT emoji, theme_label_fr INTO v_emoji, v_theme_fr
  FROM public.weekly_challenges
  WHERE status = 'active'
  ORDER BY start_date DESC
  LIMIT 1;

  IF v_emoji IS NULL THEN
    RAISE NOTICE 'no active challenge, skipping % notification', p_template;
    RETURN;
  END IF;

  v_jwt := public.get_service_role_jwt();
  IF v_jwt IS NULL THEN
    RAISE WARNING 'service_role_key vault secret not set, skipping notification %', p_template;
    RETURN;
  END IF;

  SELECT net.http_post(
    url := 'https://dqhhpoxqrtlmhosrsdxp.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_jwt
    ),
    body := jsonb_build_object(
      'broadcast', true,
      'template', p_template,
      'variables', jsonb_build_object('emoji', v_emoji, 'theme', v_theme_fr)
    )
  ) INTO v_request_id;
END;
$func$;

-- =========================================================================
-- 3) Recreate notify_user_if_enabled() without inlined JWT
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
  v_jwt        TEXT;
BEGIN
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

  v_jwt := public.get_service_role_jwt();
  IF v_jwt IS NULL THEN
    RAISE WARNING 'service_role_key vault secret not set, skipping notification for user %', p_user_id;
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
      'Authorization', 'Bearer ' || v_jwt
    ),
    body := v_payload
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.notify_user_if_enabled(UUID, TEXT, JSONB, TEXT) TO service_role;

-- =========================================================================
-- 4) Drop and recreate the 5 vulnerable cron jobs
-- =========================================================================
DO $$
DECLARE
  v_jobs TEXT[] := ARRAY[
    'close-weekly-challenge',
    'generate-weekly-challenge',
    'weekly-start-notif',
    'weekly-midweek-notif',
    'weekly-lastday-notif'
  ];
  v_job TEXT;
BEGIN
  FOREACH v_job IN ARRAY v_jobs LOOP
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = v_job) THEN
      PERFORM cron.unschedule(v_job);
    END IF;
  END LOOP;
END $$;

-- close-weekly-challenge — Sundays 23:00 UTC
SELECT cron.schedule(
  'close-weekly-challenge',
  '0 23 * * 0',
  $cron$
  SELECT net.http_post(
    url := 'https://dqhhpoxqrtlmhosrsdxp.supabase.co/functions/v1/close-weekly-challenge',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || public.get_service_role_jwt()
    ),
    body := '{}'::jsonb
  );
  $cron$
);

-- generate-weekly-challenge — Sundays 23:30 UTC
SELECT cron.schedule(
  'generate-weekly-challenge',
  '30 23 * * 0',
  $cron$
  SELECT net.http_post(
    url := 'https://dqhhpoxqrtlmhosrsdxp.supabase.co/functions/v1/generate-weekly-challenge',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || public.get_service_role_jwt()
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 240000
  );
  $cron$
);

-- weekly-start-notif — Mondays 09:00 UTC
SELECT cron.schedule(
  'weekly-start-notif',
  '0 9 * * 1',
  $cron$ SELECT public.notify_weekly_challenge('weekly_start'); $cron$
);

-- weekly-midweek-notif — Thursdays 09:00 UTC
SELECT cron.schedule(
  'weekly-midweek-notif',
  '0 9 * * 4',
  $cron$ SELECT public.notify_weekly_challenge('weekly_midweek'); $cron$
);

-- weekly-lastday-notif — Sundays 18:00 UTC
SELECT cron.schedule(
  'weekly-lastday-notif',
  '0 18 * * 0',
  $cron$ SELECT public.notify_weekly_challenge('weekly_lastday'); $cron$
);
