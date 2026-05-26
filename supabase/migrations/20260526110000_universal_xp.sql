-- Migration: Universal XP — reward XP for ALL meaningful user activities
-- ================================================================
-- Adds:
--   * Expanded source whitelist on `award_xp` (rejects unknown sources)
--   * `claim_daily_login_bonus()` — daily login + streak multiplier
--   * `claim_first_time_milestone(p_milestone)` — onboarding / profile / etc.
--   * `claim_lifeline_use_xp()` — capped per-day micro reward
--   * Trigger `award_streak_milestone_xp` — fires when daily_streak crosses
--     3/7/14/30/60/100
--   * Trigger `award_achievement_unlock_xp` — fires on user_achievements INSERT
-- ================================================================

-- 1. Expand award_xp: enforce whitelist, keep games_played bump scoped to game modes.
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_source TEXT,
  p_metadata JSONB DEFAULT NULL,
  p_dedupe_key TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_total INTEGER;
  v_existing INTEGER;
  v_is_game_mode BOOLEAN;
  v_allowed_sources TEXT[] := ARRAY[
    -- game modes (bump games_played)
    'chain_solo', 'party', 'duel', 'tournament', 'family',
    'adventure', 'traitor', 'auction', 'challenge', 'daily',
    -- non-game sources (no games_played bump)
    'daily_login', 'weekly_open', 'onboarding_complete', 'profile_complete',
    'first_friend', 'first_share', 'first_rating', 'first_feedback',
    'language_change', 'tutorial_complete', 'lifeline_use',
    'achievement_unlock', 'activity_feed_open', 'friend_added',
    'streak_milestone', 'referral_bonus'
  ];
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 50000 THEN
    RAISE EXCEPTION 'invalid xp amount: %', p_amount;
  END IF;

  IF NOT (p_source = ANY (v_allowed_sources)) THEN
    RAISE EXCEPTION 'invalid xp source: %', p_source;
  END IF;

  v_is_game_mode := p_source IN (
    'chain_solo', 'party', 'duel', 'tournament', 'family',
    'adventure', 'traitor', 'auction', 'challenge', 'daily'
  );

  -- Dedupe check (same user + source + dedupe_key in last 24h)
  IF p_dedupe_key IS NOT NULL THEN
    SELECT COUNT(*) INTO v_existing
    FROM xp_transactions
    WHERE user_id = p_user_id
      AND source = p_source
      AND metadata->>'dedupe_key' = p_dedupe_key
      AND created_at > NOW() - INTERVAL '24 hours';
    IF v_existing > 0 THEN
      SELECT total_xp INTO v_new_total FROM users WHERE id = p_user_id;
      RETURN v_new_total;
    END IF;
  END IF;

  INSERT INTO xp_transactions (user_id, amount, source, metadata)
  VALUES (
    p_user_id,
    p_amount,
    p_source,
    COALESCE(p_metadata, '{}'::jsonb) ||
      CASE WHEN p_dedupe_key IS NOT NULL
           THEN jsonb_build_object('dedupe_key', p_dedupe_key)
           ELSE '{}'::jsonb END
  );

  UPDATE users
  SET total_xp = COALESCE(total_xp, 0) + p_amount,
      games_played = CASE WHEN v_is_game_mode
                          THEN COALESCE(games_played, 0) + 1
                          ELSE games_played END,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING total_xp INTO v_new_total;

  RETURN v_new_total;
END;
$$;

GRANT EXECUTE ON FUNCTION award_xp TO authenticated;
GRANT EXECUTE ON FUNCTION award_xp TO anon;

-- 2. RPC: claim_daily_login_bonus — once per UTC day, multiplier by streak.
DROP FUNCTION IF EXISTS public.claim_daily_login_bonus();
CREATE OR REPLACE FUNCTION public.claim_daily_login_bonus()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_today TEXT := to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD');
  v_dedupe TEXT;
  v_existing INT;
  v_streak INT;
  v_base INT := 10;
  v_multiplier NUMERIC := 1;
  v_amount INT;
  v_new_total INT;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('xp_awarded', 0, 'reason', 'not_authenticated');
  END IF;

  v_dedupe := 'daily_login_' || v_today;

  -- Already claimed today?
  SELECT COUNT(*) INTO v_existing
  FROM xp_transactions
  WHERE user_id = v_user_id
    AND source = 'daily_login'
    AND metadata->>'dedupe_key' = v_dedupe
    AND created_at > NOW() - INTERVAL '24 hours';

  IF v_existing > 0 THEN
    SELECT total_xp INTO v_new_total FROM users WHERE id = v_user_id;
    RETURN jsonb_build_object(
      'xp_awarded', 0,
      'new_total', COALESCE(v_new_total, 0),
      'reason', 'already_claimed'
    );
  END IF;

  -- Read current streak
  SELECT COALESCE(daily_streak, 0) INTO v_streak FROM users WHERE id = v_user_id;
  IF v_streak >= 7 THEN
    v_multiplier := 2;
  ELSIF v_streak >= 3 THEN
    v_multiplier := 1.5;
  ELSE
    v_multiplier := 1;
  END IF;

  v_amount := GREATEST(1, FLOOR(v_base * v_multiplier)::INT);

  v_new_total := award_xp(
    v_user_id,
    v_amount,
    'daily_login',
    jsonb_build_object('streak', v_streak, 'multiplier', v_multiplier),
    v_dedupe
  );

  RETURN jsonb_build_object(
    'xp_awarded', v_amount,
    'new_total', v_new_total,
    'streak', v_streak,
    'multiplier', v_multiplier
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_daily_login_bonus() TO authenticated;

-- 3. RPC: claim_first_time_milestone — one-shot milestones.
DROP FUNCTION IF EXISTS public.claim_first_time_milestone(TEXT);
CREATE OR REPLACE FUNCTION public.claim_first_time_milestone(p_milestone TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_amount INT;
  v_source TEXT;
  v_dedupe TEXT;
  v_existing INT;
  v_new_total INT;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('xp_awarded', 0, 'reason', 'not_authenticated');
  END IF;

  -- Map milestone → amount + source
  CASE p_milestone
    WHEN 'onboarding_complete' THEN v_amount := 100; v_source := 'onboarding_complete';
    WHEN 'profile_complete'    THEN v_amount := 50;  v_source := 'profile_complete';
    WHEN 'first_friend'        THEN v_amount := 50;  v_source := 'first_friend';
    WHEN 'first_share'         THEN v_amount := 25;  v_source := 'first_share';
    WHEN 'first_rating'        THEN v_amount := 50;  v_source := 'first_rating';
    WHEN 'first_feedback'      THEN v_amount := 25;  v_source := 'first_feedback';
    WHEN 'language_change'     THEN v_amount := 10;  v_source := 'language_change';
    WHEN 'tutorial_complete'   THEN v_amount := 30;  v_source := 'tutorial_complete';
    ELSE
      RETURN jsonb_build_object('xp_awarded', 0, 'reason', 'unknown_milestone');
  END CASE;

  v_dedupe := 'milestone_' || p_milestone;

  -- Lifetime dedupe (any past transaction with this dedupe_key counts)
  SELECT COUNT(*) INTO v_existing
  FROM xp_transactions
  WHERE user_id = v_user_id
    AND source = v_source
    AND metadata->>'dedupe_key' = v_dedupe;

  IF v_existing > 0 THEN
    SELECT total_xp INTO v_new_total FROM users WHERE id = v_user_id;
    RETURN jsonb_build_object(
      'xp_awarded', 0,
      'new_total', COALESCE(v_new_total, 0),
      'reason', 'already_claimed'
    );
  END IF;

  -- Direct insert (skip 24h dedupe in award_xp by using NULL dedupe — we already checked lifetime)
  INSERT INTO xp_transactions (user_id, amount, source, metadata)
  VALUES (
    v_user_id,
    v_amount,
    v_source,
    jsonb_build_object('milestone', p_milestone, 'dedupe_key', v_dedupe)
  );

  UPDATE users
  SET total_xp = COALESCE(total_xp, 0) + v_amount,
      updated_at = NOW()
  WHERE id = v_user_id
  RETURNING total_xp INTO v_new_total;

  RETURN jsonb_build_object(
    'xp_awarded', v_amount,
    'new_total', v_new_total,
    'milestone', p_milestone
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_first_time_milestone(TEXT) TO authenticated;

-- 4. RPC: claim_lifeline_use_xp — +2 XP per use, max 10 uses/day (= 20 XP/day cap).
DROP FUNCTION IF EXISTS public.claim_lifeline_use_xp();
CREATE OR REPLACE FUNCTION public.claim_lifeline_use_xp()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_today TEXT := to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD');
  v_count INT;
  v_dedupe TEXT;
  v_new_total INT;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('xp_awarded', 0, 'reason', 'not_authenticated');
  END IF;

  -- Count today's lifeline uses
  SELECT COUNT(*) INTO v_count
  FROM xp_transactions
  WHERE user_id = v_user_id
    AND source = 'lifeline_use'
    AND created_at >= (date_trunc('day', NOW() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC');

  IF v_count >= 10 THEN
    SELECT total_xp INTO v_new_total FROM users WHERE id = v_user_id;
    RETURN jsonb_build_object(
      'xp_awarded', 0,
      'new_total', COALESCE(v_new_total, 0),
      'reason', 'daily_cap_reached'
    );
  END IF;

  v_dedupe := 'lifeline_use_' || v_today || '_' || (v_count + 1)::TEXT;
  v_new_total := award_xp(
    v_user_id,
    2,
    'lifeline_use',
    jsonb_build_object('count_today', v_count + 1),
    v_dedupe
  );

  RETURN jsonb_build_object(
    'xp_awarded', 2,
    'new_total', v_new_total,
    'count_today', v_count + 1
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_lifeline_use_xp() TO authenticated;

-- 5. Trigger: streak milestone XP on users.daily_streak UPDATE.
CREATE OR REPLACE FUNCTION public._award_streak_milestone_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_thresholds INT[] := ARRAY[3, 7, 14, 30, 60, 100];
  v_amounts INT[]   := ARRAY[50, 150, 300, 750, 1500, 3000];
  v_i INT;
  v_level INT;
  v_amount INT;
  v_old INT := COALESCE(OLD.daily_streak, 0);
  v_new INT := COALESCE(NEW.daily_streak, 0);
BEGIN
  IF v_new <= v_old THEN
    RETURN NEW;
  END IF;

  FOR v_i IN 1..array_length(v_thresholds, 1) LOOP
    v_level := v_thresholds[v_i];
    v_amount := v_amounts[v_i];
    IF v_old < v_level AND v_new >= v_level THEN
      BEGIN
        PERFORM award_xp(
          NEW.id,
          v_amount,
          'streak_milestone',
          jsonb_build_object('level', v_level),
          'streak_milestone_' || v_level::TEXT
        );
      EXCEPTION WHEN OTHERS THEN
        -- never block the parent UPDATE
        RAISE WARNING 'streak_milestone xp failed for user %: %', NEW.id, SQLERRM;
      END;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_streak_milestone_xp ON public.users;
CREATE TRIGGER trg_award_streak_milestone_xp
AFTER UPDATE OF daily_streak ON public.users
FOR EACH ROW
EXECUTE FUNCTION public._award_streak_milestone_xp();

-- Note: streak_milestone dedupe uses 24h window in award_xp. For lifetime
-- dedupe (so a user who loses then rebuilds a 7-day streak doesn't farm it
-- repeatedly), we additionally check existing transactions.
CREATE OR REPLACE FUNCTION public._award_streak_milestone_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_thresholds INT[] := ARRAY[3, 7, 14, 30, 60, 100];
  v_amounts INT[]   := ARRAY[50, 150, 300, 750, 1500, 3000];
  v_i INT;
  v_level INT;
  v_amount INT;
  v_old INT := COALESCE(OLD.daily_streak, 0);
  v_new INT := COALESCE(NEW.daily_streak, 0);
  v_dedupe TEXT;
  v_existing INT;
BEGIN
  IF v_new <= v_old THEN
    RETURN NEW;
  END IF;

  FOR v_i IN 1..array_length(v_thresholds, 1) LOOP
    v_level := v_thresholds[v_i];
    v_amount := v_amounts[v_i];
    IF v_old < v_level AND v_new >= v_level THEN
      v_dedupe := 'streak_milestone_' || v_level::TEXT;
      -- Lifetime dedupe
      SELECT COUNT(*) INTO v_existing
      FROM xp_transactions
      WHERE user_id = NEW.id
        AND source = 'streak_milestone'
        AND metadata->>'dedupe_key' = v_dedupe;
      IF v_existing = 0 THEN
        BEGIN
          INSERT INTO xp_transactions (user_id, amount, source, metadata)
          VALUES (
            NEW.id,
            v_amount,
            'streak_milestone',
            jsonb_build_object('level', v_level, 'dedupe_key', v_dedupe)
          );
          UPDATE users
          SET total_xp = COALESCE(total_xp, 0) + v_amount,
              updated_at = NOW()
          WHERE id = NEW.id;
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING 'streak_milestone xp failed for user %: %', NEW.id, SQLERRM;
        END;
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- 6. Trigger: achievement unlock XP on user_achievements INSERT.
CREATE OR REPLACE FUNCTION public._award_achievement_unlock_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dedupe TEXT;
  v_existing INT;
BEGIN
  v_dedupe := 'achievement_unlock_' || NEW.achievement_id::TEXT;
  SELECT COUNT(*) INTO v_existing
  FROM xp_transactions
  WHERE user_id = NEW.user_id
    AND source = 'achievement_unlock'
    AND metadata->>'dedupe_key' = v_dedupe;

  IF v_existing = 0 THEN
    BEGIN
      INSERT INTO xp_transactions (user_id, amount, source, metadata)
      VALUES (
        NEW.user_id,
        30,
        'achievement_unlock',
        jsonb_build_object('achievement_id', NEW.achievement_id, 'dedupe_key', v_dedupe)
      );
      UPDATE users
      SET total_xp = COALESCE(total_xp, 0) + 30,
          updated_at = NOW()
      WHERE id = NEW.user_id;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'achievement_unlock xp failed for user %: %', NEW.user_id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_achievement_unlock_xp ON public.user_achievements;
CREATE TRIGGER trg_award_achievement_unlock_xp
AFTER INSERT ON public.user_achievements
FOR EACH ROW
EXECUTE FUNCTION public._award_achievement_unlock_xp();
