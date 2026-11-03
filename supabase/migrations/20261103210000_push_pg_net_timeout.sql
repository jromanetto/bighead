-- False-positive watchdog alert (2026-11-03 20:00): scan-streak-warnings fired 11
-- send-push calls at once; cold starts pushed two of them to 5.3 s / 5.7 s.
-- Edge logs show all 11 returned 200 with "Push sent: 1", but pg_net's default
-- 5000 ms timeout had already given up and logged an error in
-- net._http_response, which the watchdog now reads. Give every send-push call
-- from SQL a 30 s timeout. Bodies are otherwise identical to prod.

CREATE OR REPLACE FUNCTION public.notify_user_if_enabled(p_user_id uuid, p_template text, p_variables jsonb, p_pref_col text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    body := v_payload,
    timeout_milliseconds := 30000
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_async_duel_event(p_user_id uuid, p_template text, p_variables jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_jwt TEXT;
  v_has_token BOOLEAN;
BEGIN
  IF p_user_id IS NULL THEN RETURN; END IF;

  SELECT (push_token IS NOT NULL) INTO v_has_token FROM public.users WHERE id = p_user_id;
  IF v_has_token IS NOT TRUE THEN RETURN; END IF;

  v_jwt := public.get_service_role_jwt();
  IF v_jwt IS NULL THEN
    RAISE WARNING 'service_role_key vault secret not set, skipping async duel notification';
    RETURN;
  END IF;

  PERFORM net.http_post(
    url := 'https://dqhhpoxqrtlmhosrsdxp.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_jwt
    ),
    body := jsonb_build_object(
      'user_id', p_user_id,
      'template', p_template,
      'variables', COALESCE(p_variables, '{}'::jsonb),
      'title', '',
      'body', ''
    ),
    timeout_milliseconds := 30000
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_weekly_challenge(p_template text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    ),
    timeout_milliseconds := 30000
  ) INTO v_request_id;
END;
$function$;
