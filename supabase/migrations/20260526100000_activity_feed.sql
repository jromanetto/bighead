-- =====================================================================
-- Activity feed: social events stream (level_up, achievements, weekly,
-- streak milestones, referrals)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.activity_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL CHECK (event_type IN (
    'level_up',
    'achievement_unlocked',
    'weekly_completed',
    'high_score',
    'streak_milestone',
    'referral_completed',
    'badge_earned'
  )),
  payload     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_events_user_created
  ON public.activity_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_events_created
  ON public.activity_events (created_at DESC);

ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read the feed (public by design)
DROP POLICY IF EXISTS "activity_events_select_all" ON public.activity_events;
CREATE POLICY "activity_events_select_all" ON public.activity_events
  FOR SELECT
  TO authenticated
  USING (true);

-- No client-side inserts; only triggers / service role.
-- (No INSERT policy => insertions only via SECURITY DEFINER triggers
--  or the service_role key, which bypasses RLS.)

-- =====================================================================
-- Trigger helpers
-- =====================================================================

-- Level up: users.level changed (greater than old)
CREATE OR REPLACE FUNCTION public._activity_on_level_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.level IS DISTINCT FROM OLD.level AND NEW.level > COALESCE(OLD.level, 0) THEN
    INSERT INTO public.activity_events (user_id, event_type, payload)
    VALUES (
      NEW.id,
      'level_up',
      jsonb_build_object(
        'old_level', COALESCE(OLD.level, 0),
        'new_level', NEW.level
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_activity_level_up ON public.users;
CREATE TRIGGER trg_activity_level_up
AFTER UPDATE OF level ON public.users
FOR EACH ROW
EXECUTE FUNCTION public._activity_on_level_change();

-- Streak milestone: daily_streak crosses 7/14/30/60/100
CREATE OR REPLACE FUNCTION public._activity_on_streak_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  milestones INT[] := ARRAY[7, 14, 30, 60, 100];
BEGIN
  IF NEW.daily_streak IS DISTINCT FROM OLD.daily_streak
     AND NEW.daily_streak = ANY(milestones)
     AND NEW.daily_streak > COALESCE(OLD.daily_streak, 0)
  THEN
    INSERT INTO public.activity_events (user_id, event_type, payload)
    VALUES (
      NEW.id,
      'streak_milestone',
      jsonb_build_object('streak', NEW.daily_streak)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_activity_streak_milestone ON public.users;
CREATE TRIGGER trg_activity_streak_milestone
AFTER UPDATE OF daily_streak ON public.users
FOR EACH ROW
EXECUTE FUNCTION public._activity_on_streak_change();

-- Achievement unlocked: row inserted in user_achievements
CREATE OR REPLACE FUNCTION public._activity_on_achievement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ach_name TEXT;
BEGIN
  SELECT name INTO ach_name
  FROM public.achievements
  WHERE id = NEW.achievement_id;

  INSERT INTO public.activity_events (user_id, event_type, payload)
  VALUES (
    NEW.user_id,
    'achievement_unlocked',
    jsonb_build_object(
      'achievement_id', NEW.achievement_id,
      'name', ach_name
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_activity_achievement ON public.user_achievements;
CREATE TRIGGER trg_activity_achievement
AFTER INSERT ON public.user_achievements
FOR EACH ROW
EXECUTE FUNCTION public._activity_on_achievement();

-- Weekly completed: weekly_challenge_progress.completed_at set
CREATE OR REPLACE FUNCTION public._activity_on_weekly_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  theme_label TEXT;
BEGIN
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    SELECT theme_label_en INTO theme_label
    FROM public.weekly_challenges
    WHERE id = NEW.challenge_id;

    INSERT INTO public.activity_events (user_id, event_type, payload)
    VALUES (
      NEW.user_id,
      'weekly_completed',
      jsonb_build_object(
        'challenge_id', NEW.challenge_id,
        'theme', theme_label,
        'score', COALESCE(NEW.final_score, NEW.correct_count)
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_activity_weekly_completed ON public.weekly_challenge_progress;
CREATE TRIGGER trg_activity_weekly_completed
AFTER UPDATE OF completed_at ON public.weekly_challenge_progress
FOR EACH ROW
EXECUTE FUNCTION public._activity_on_weekly_completed();

-- Referral completed: rewarded_at set => 2 events (referrer + referee)
CREATE OR REPLACE FUNCTION public._activity_on_referral_rewarded()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.rewarded_at IS NOT NULL AND OLD.rewarded_at IS NULL THEN
    INSERT INTO public.activity_events (user_id, event_type, payload)
    VALUES
      (NEW.referrer_user_id, 'referral_completed',
        jsonb_build_object('role', 'referrer', 'referral_id', NEW.id)),
      (NEW.referee_user_id,  'referral_completed',
        jsonb_build_object('role', 'referee',  'referral_id', NEW.id));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_activity_referral_rewarded ON public.referrals;
CREATE TRIGGER trg_activity_referral_rewarded
AFTER UPDATE OF rewarded_at ON public.referrals
FOR EACH ROW
EXECUTE FUNCTION public._activity_on_referral_rewarded();

-- =====================================================================
-- RPC: get_activity_feed
-- Returns recent events from all users, joined with username + avatar.
-- (Future: filter to friends only.)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.get_activity_feed(
  p_limit  INT DEFAULT 30,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id          UUID,
  user_id     UUID,
  username    TEXT,
  avatar_url  TEXT,
  event_type  TEXT,
  payload     JSONB,
  created_at  TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    ae.id,
    ae.user_id,
    u.username,
    u.avatar_url,
    ae.event_type,
    ae.payload,
    ae.created_at
  FROM public.activity_events ae
  JOIN public.users u ON u.id = ae.user_id
  ORDER BY ae.created_at DESC
  LIMIT GREATEST(1, LEAST(p_limit, 100))
  OFFSET GREATEST(0, p_offset);
$$;

GRANT EXECUTE ON FUNCTION public.get_activity_feed(INT, INT) TO authenticated, anon;
