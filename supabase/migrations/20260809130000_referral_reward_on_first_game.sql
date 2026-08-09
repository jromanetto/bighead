-- P2 virality: the referral reward (500 XP + 30d premium for both) only paid out
-- when the referee reached LEVEL 5 — far too deferred, kills loop velocity.
-- Reward as soon as the referee plays their FIRST game instead.

-- 1) Eligibility now = referee has played >=1 game (was level>=5). Still idempotent
--    (only pending referrals, award_xp deduped by referral id).
CREATE OR REPLACE FUNCTION public.complete_referral_if_eligible(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_referral RECORD;
  v_games    INT;
BEGIN
  SELECT COALESCE(games_played, 0) INTO v_games FROM public.users WHERE id = p_user_id;
  IF v_games < 1 THEN
    RETURN FALSE;
  END IF;

  SELECT * INTO v_referral
  FROM public.referrals
  WHERE referee_user_id = p_user_id
    AND rewarded_at IS NULL
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  UPDATE public.referrals
  SET completed_at = COALESCE(completed_at, NOW()),
      rewarded_at  = NOW()
  WHERE id = v_referral.id;

  PERFORM public.award_xp(
    v_referral.referee_user_id, 500, 'referral_bonus',
    jsonb_build_object('referral_id', v_referral.id, 'role', 'referee'),
    'referral_' || v_referral.id::text
  );
  PERFORM public.award_xp(
    v_referral.referrer_user_id, 500, 'referral_bonus',
    jsonb_build_object('referral_id', v_referral.id, 'role', 'referrer'),
    'referral_' || v_referral.id::text
  );

  PERFORM public.grant_premium(v_referral.referee_user_id, 30);
  PERFORM public.grant_premium(v_referral.referrer_user_id, 30);

  UPDATE public.users SET referral_reward_claimed = TRUE
  WHERE id = v_referral.referee_user_id;

  RETURN TRUE;
END;
$function$;

-- 2) Fire it when the referee crosses 0 -> 1 game played.
--    (The legacy level>=5 trigger still exists and is harmless — idempotent.)
CREATE OR REPLACE FUNCTION public._trg_complete_referral_on_first_game()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF COALESCE(NEW.games_played, 0) >= 1
     AND COALESCE(OLD.games_played, 0) < 1 THEN
    PERFORM public.complete_referral_if_eligible(NEW.id);
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_complete_referral_on_first_game ON public.users;
CREATE TRIGGER trg_complete_referral_on_first_game
  AFTER UPDATE OF games_played ON public.users
  FOR EACH ROW
  WHEN (NEW.games_played IS DISTINCT FROM OLD.games_played)
  EXECUTE FUNCTION public._trg_complete_referral_on_first_game();
