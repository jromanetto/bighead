-- =====================================================================
-- LIFELINES SYSTEM
-- 4 in-game lifelines: 50/50, skip, +5s, double XP
-- Free users: +2/day capped at 5
-- Premium users: +5/day capped at 10
-- =====================================================================

-- Table
CREATE TABLE IF NOT EXISTS public.user_lifelines (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  fifty_fifty INT NOT NULL DEFAULT 2 CHECK (fifty_fifty >= 0),
  skip INT NOT NULL DEFAULT 2 CHECK (skip >= 0),
  plus_5s INT NOT NULL DEFAULT 2 CHECK (plus_5s >= 0),
  double_xp INT NOT NULL DEFAULT 2 CHECK (double_xp >= 0),
  last_granted_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_lifelines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lifelines_select_own" ON public.user_lifelines;
CREATE POLICY "lifelines_select_own" ON public.user_lifelines
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "lifelines_update_own" ON public.user_lifelines;
CREATE POLICY "lifelines_update_own" ON public.user_lifelines
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "lifelines_insert_own" ON public.user_lifelines;
CREATE POLICY "lifelines_insert_own" ON public.user_lifelines
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =====================================================================
-- RPC: get_my_lifelines — return current lifeline counts, ensuring row exists
-- =====================================================================
CREATE OR REPLACE FUNCTION public.get_my_lifelines()
RETURNS public.user_lifelines
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_row public.user_lifelines;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_row FROM public.user_lifelines WHERE user_id = v_user;
  IF NOT FOUND THEN
    INSERT INTO public.user_lifelines (user_id) VALUES (v_user)
    RETURNING * INTO v_row;
  END IF;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_lifelines() TO authenticated;

-- =====================================================================
-- RPC: use_lifeline(p_type) — decrement counter, raise if 0
-- =====================================================================
CREATE OR REPLACE FUNCTION public.use_lifeline(p_type TEXT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_count INT;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_type NOT IN ('fifty_fifty', 'skip', 'plus_5s', 'double_xp') THEN
    RAISE EXCEPTION 'Invalid lifeline type: %', p_type;
  END IF;

  -- Ensure row exists
  INSERT INTO public.user_lifelines (user_id) VALUES (v_user)
  ON CONFLICT (user_id) DO NOTHING;

  IF p_type = 'fifty_fifty' THEN
    UPDATE public.user_lifelines
       SET fifty_fifty = fifty_fifty - 1
     WHERE user_id = v_user AND fifty_fifty > 0
    RETURNING fifty_fifty INTO v_count;
  ELSIF p_type = 'skip' THEN
    UPDATE public.user_lifelines
       SET skip = skip - 1
     WHERE user_id = v_user AND skip > 0
    RETURNING skip INTO v_count;
  ELSIF p_type = 'plus_5s' THEN
    UPDATE public.user_lifelines
       SET plus_5s = plus_5s - 1
     WHERE user_id = v_user AND plus_5s > 0
    RETURNING plus_5s INTO v_count;
  ELSIF p_type = 'double_xp' THEN
    UPDATE public.user_lifelines
       SET double_xp = double_xp - 1
     WHERE user_id = v_user AND double_xp > 0
    RETURNING double_xp INTO v_count;
  END IF;

  IF v_count IS NULL THEN
    RAISE EXCEPTION 'No % lifeline left', p_type;
  END IF;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.use_lifeline(TEXT) TO authenticated;

-- =====================================================================
-- RPC: grant_daily_lifelines — once per day
-- Free user: +2 of each, cap at 5
-- Premium: +5 of each, cap at 10
-- =====================================================================
CREATE OR REPLACE FUNCTION public.grant_daily_lifelines()
RETURNS public.user_lifelines
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_today DATE := CURRENT_DATE;
  v_row public.user_lifelines;
  v_is_premium BOOLEAN;
  v_grant INT;
  v_cap INT;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Ensure row exists
  INSERT INTO public.user_lifelines (user_id) VALUES (v_user)
  ON CONFLICT (user_id) DO NOTHING;

  -- Read premium status
  SELECT COALESCE(is_premium, FALSE) INTO v_is_premium
    FROM public.users WHERE id = v_user;

  IF v_is_premium THEN
    v_grant := 5;
    v_cap := 10;
  ELSE
    v_grant := 2;
    v_cap := 5;
  END IF;

  SELECT * INTO v_row FROM public.user_lifelines WHERE user_id = v_user;

  IF v_row.last_granted_at IS NULL OR v_row.last_granted_at < v_today THEN
    UPDATE public.user_lifelines
       SET fifty_fifty = LEAST(fifty_fifty + v_grant, v_cap),
           skip        = LEAST(skip + v_grant, v_cap),
           plus_5s     = LEAST(plus_5s + v_grant, v_cap),
           double_xp   = LEAST(double_xp + v_grant, v_cap),
           last_granted_at = v_today
     WHERE user_id = v_user
    RETURNING * INTO v_row;
  END IF;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.grant_daily_lifelines() TO authenticated;

-- =====================================================================
-- Trigger: auto-create lifelines row when user row is created
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_lifelines()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_lifelines (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_user_created_create_lifelines ON public.users;
CREATE TRIGGER on_user_created_create_lifelines
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_lifelines();

-- Backfill existing users
INSERT INTO public.user_lifelines (user_id)
SELECT id FROM public.users
ON CONFLICT (user_id) DO NOTHING;
