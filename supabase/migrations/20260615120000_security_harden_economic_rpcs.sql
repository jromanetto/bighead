-- Security hardening of the economic / competitive RPCs (audit 2026-06-15).
--
-- These were callable by `anon` with the caller passing p_user_id/p_amount
-- freely → leaderboard, XP levels and difficulty stats were falsifiable. Now:
--   * award_xp: when called by a signed-in client (auth.uid() not null) it can
--     only credit itself and is capped at 5000. Server (service_role, auth.uid
--     null) keeps the 50000 ceiling + source allowlist.
--   * record_question_outcome: no-ops unless authenticated.
--   * EXECUTE revoked from PUBLIC/anon on all three, granted to
--     authenticated + service_role. Games sign in anonymously (role
--     `authenticated`), so gameplay is unaffected.

CREATE OR REPLACE FUNCTION public.award_xp(p_user_id uuid, p_amount integer, p_source text, p_metadata jsonb DEFAULT NULL::jsonb, p_dedupe_key text DEFAULT NULL::text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_new_total INTEGER;
  v_existing INTEGER;
  v_is_game_mode BOOLEAN;
  v_allowed_sources TEXT[] := ARRAY[
    'chain_solo','party','duel','tournament','family','adventure','traitor',
    'auction','challenge','daily','daily_login','weekly_open','onboarding_complete',
    'profile_complete','first_friend','first_share','first_rating','first_feedback',
    'language_change','tutorial_complete','lifeline_use','achievement_unlock',
    'activity_feed_open','friend_added','streak_milestone','referral_bonus'];
BEGIN
  -- Client call: can only award itself, with a tighter ceiling.
  IF auth.uid() IS NOT NULL THEN
    p_user_id := auth.uid();
    IF p_amount > 5000 THEN p_amount := 5000; END IF;
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 50000 THEN
    RAISE EXCEPTION 'invalid xp amount: %', p_amount;
  END IF;
  IF NOT (p_source = ANY (v_allowed_sources)) THEN
    RAISE EXCEPTION 'invalid xp source: %', p_source;
  END IF;
  v_is_game_mode := p_source IN ('chain_solo','party','duel','tournament','family','adventure','traitor','auction','challenge','daily');

  IF p_dedupe_key IS NOT NULL THEN
    SELECT COUNT(*) INTO v_existing FROM xp_transactions
    WHERE user_id = p_user_id AND source = p_source
      AND metadata->>'dedupe_key' = p_dedupe_key AND created_at > NOW() - INTERVAL '24 hours';
    IF v_existing > 0 THEN
      SELECT total_xp INTO v_new_total FROM users WHERE id = p_user_id;
      RETURN v_new_total;
    END IF;
  END IF;

  INSERT INTO xp_transactions (user_id, amount, source, metadata)
  VALUES (p_user_id, p_amount, p_source,
    COALESCE(p_metadata, '{}'::jsonb) ||
      CASE WHEN p_dedupe_key IS NOT NULL THEN jsonb_build_object('dedupe_key', p_dedupe_key) ELSE '{}'::jsonb END);

  UPDATE users
  SET total_xp = COALESCE(total_xp, 0) + p_amount,
      games_played = CASE WHEN v_is_game_mode THEN COALESCE(games_played, 0) + 1 ELSE games_played END,
      updated_at = NOW()
  WHERE id = p_user_id RETURNING total_xp INTO v_new_total;
  RETURN v_new_total;
END;
$function$;

CREATE OR REPLACE FUNCTION public.record_question_outcome(p_question_id uuid, p_was_correct boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  UPDATE questions
  SET agg_shown = agg_shown + 1,
      agg_correct = agg_correct + (CASE WHEN p_was_correct THEN 1 ELSE 0 END)
  WHERE id = p_question_id;
END $function$;

-- Lock down EXECUTE: remove the implicit PUBLIC grant (which also covers anon),
-- keep it for authenticated clients and the service role.
REVOKE EXECUTE ON FUNCTION public.award_xp(uuid, integer, text, jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_xp(uuid, integer, text, jsonb, text) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.record_question_outcome(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_question_outcome(uuid, boolean) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.record_answer_and_update_ratings(uuid, uuid, boolean, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_answer_and_update_ratings(uuid, uuid, boolean, integer, text) TO authenticated, service_role;
