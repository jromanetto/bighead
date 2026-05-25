-- Streak Freeze feature
-- Free users: 1 freeze per week (granted Mon 00:00 UTC, 7-day expiry)
-- Premium users: 1 freeze per day (granted daily 00:00 UTC, 24h expiry)
-- Auto-consumed when user misses a single day.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- =========================================================================
-- Table
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.streak_freezes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('weekly_free', 'daily_premium'))
);

CREATE INDEX IF NOT EXISTS idx_streak_freezes_user_unused
  ON public.streak_freezes (user_id, used_at)
  WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_streak_freezes_user_granted
  ON public.streak_freezes (user_id, granted_at DESC);

ALTER TABLE public.streak_freezes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own streak freezes" ON public.streak_freezes;
CREATE POLICY "Users can view own streak freezes"
  ON public.streak_freezes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Inserts / updates are handled by SECURITY DEFINER RPCs only.

-- =========================================================================
-- user_settings: add toggle for auto-consume
-- =========================================================================
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS auto_use_streak_freeze BOOLEAN NOT NULL DEFAULT TRUE;

-- =========================================================================
-- RPC: grant_weekly_streak_freezes — pg_cron Monday 00:00 UTC
-- One row per free user that does not already have an active (unused, not-expired)
-- freeze. expires_at = NOW() + 7 days.
-- =========================================================================
CREATE OR REPLACE FUNCTION public.grant_weekly_streak_freezes()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count INTEGER := 0;
BEGIN
  WITH inserted AS (
    INSERT INTO public.streak_freezes (user_id, expires_at, source)
    SELECT u.id, NOW() + INTERVAL '7 days', 'weekly_free'
    FROM public.users u
    WHERE COALESCE(u.is_premium, FALSE) = FALSE
      AND NOT EXISTS (
        SELECT 1 FROM public.streak_freezes sf
        WHERE sf.user_id = u.id
          AND sf.used_at IS NULL
          AND sf.expires_at > NOW()
      )
    RETURNING 1
  )
  SELECT COUNT(*) INTO inserted_count FROM inserted;

  RETURN inserted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.grant_weekly_streak_freezes() TO service_role;

-- =========================================================================
-- RPC: grant_daily_streak_freezes — pg_cron daily 00:00 UTC
-- One row per premium user that does not already have an active freeze.
-- expires_at = NOW() + 24h.
-- =========================================================================
CREATE OR REPLACE FUNCTION public.grant_daily_streak_freezes()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count INTEGER := 0;
BEGIN
  WITH inserted AS (
    INSERT INTO public.streak_freezes (user_id, expires_at, source)
    SELECT u.id, NOW() + INTERVAL '24 hours', 'daily_premium'
    FROM public.users u
    WHERE COALESCE(u.is_premium, FALSE) = TRUE
      AND NOT EXISTS (
        SELECT 1 FROM public.streak_freezes sf
        WHERE sf.user_id = u.id
          AND sf.used_at IS NULL
          AND sf.expires_at > NOW()
      )
    RETURNING 1
  )
  SELECT COUNT(*) INTO inserted_count FROM inserted;

  RETURN inserted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.grant_daily_streak_freezes() TO service_role;

-- =========================================================================
-- RPC: use_streak_freeze(p_user_id UUID)
-- Atomically marks the oldest active freeze as used_at = NOW().
-- Returns TRUE if a freeze was consumed, FALSE otherwise.
-- =========================================================================
CREATE OR REPLACE FUNCTION public.use_streak_freeze(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Lock + pick oldest active freeze for this user
  SELECT id INTO v_id
  FROM public.streak_freezes
  WHERE user_id = p_user_id
    AND used_at IS NULL
    AND expires_at > NOW()
  ORDER BY granted_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_id IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE public.streak_freezes
  SET used_at = NOW()
  WHERE id = v_id;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.use_streak_freeze(UUID) TO authenticated, service_role;

-- =========================================================================
-- RPC: available_streak_freezes() — count for auth.uid()
-- =========================================================================
CREATE OR REPLACE FUNCTION public.available_streak_freezes()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN 0;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM public.streak_freezes
  WHERE user_id = auth.uid()
    AND used_at IS NULL
    AND expires_at > NOW();

  RETURN COALESCE(v_count, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.available_streak_freezes() TO authenticated, service_role;

-- =========================================================================
-- pg_cron schedules
-- =========================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'grant-weekly-streak-freezes') THEN
    PERFORM cron.unschedule('grant-weekly-streak-freezes');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'grant-daily-streak-freezes') THEN
    PERFORM cron.unschedule('grant-daily-streak-freezes');
  END IF;
END $$;

-- Monday 00:00 UTC — free users weekly grant
SELECT cron.schedule(
  'grant-weekly-streak-freezes',
  '0 0 * * 1',
  $cron$ SELECT public.grant_weekly_streak_freezes(); $cron$
);

-- Daily 00:00 UTC — premium users daily grant
SELECT cron.schedule(
  'grant-daily-streak-freezes',
  '0 0 * * *',
  $cron$ SELECT public.grant_daily_streak_freezes(); $cron$
);
