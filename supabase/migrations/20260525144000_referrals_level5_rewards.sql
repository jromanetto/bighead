-- =====================================================================
-- Referral system v2: level-5 gated rewards (500 XP + 30 days premium)
-- =====================================================================
-- Adds dedicated referral_codes + referrals tables.
-- Keeps legacy users.referral_code / users.referred_by for backwards compat
-- and seeds the new tables from existing data.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.referral_codes (
  user_id    UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  code       TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referral_codes_select_own" ON public.referral_codes;
CREATE POLICY "referral_codes_select_own" ON public.referral_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.referrals (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referee_user_id  UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  code_used        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  rewarded_at      TIMESTAMPTZ,
  CONSTRAINT referrals_no_self CHECK (referrer_user_id <> referee_user_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_completed ON public.referrals(completed_at);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referrals_select_own" ON public.referrals;
CREATE POLICY "referrals_select_own" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_user_id OR auth.uid() = referee_user_id);

-- Backfill from legacy data
INSERT INTO public.referral_codes (user_id, code, created_at)
SELECT id, UPPER(referral_code), COALESCE(created_at, NOW())
FROM public.users
WHERE referral_code IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.referrals (referrer_user_id, referee_user_id, code_used, created_at)
SELECT ref.id, u.id, UPPER(u.referred_by), COALESCE(u.created_at, NOW())
FROM public.users u
JOIN public.users ref ON UPPER(ref.referral_code) = UPPER(u.referred_by)
WHERE u.referred_by IS NOT NULL AND ref.id <> u.id
ON CONFLICT (referee_user_id) DO NOTHING;

-- Code generator: 8-char BH-XXXXXX, no 0/O/1/I/L
CREATE OR REPLACE FUNCTION public._gen_referral_code()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  alphabet TEXT := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  result   TEXT := '';
  i        INT;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  END LOOP;
  RETURN 'BH-' || result;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_referral_code(p_user_id UUID)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_existing TEXT;
  v_new      TEXT;
  v_tries    INT := 0;
BEGIN
  SELECT code INTO v_existing FROM public.referral_codes WHERE user_id = p_user_id;
  IF v_existing IS NOT NULL THEN RETURN v_existing; END IF;
  LOOP
    v_tries := v_tries + 1;
    v_new := public._gen_referral_code();
    BEGIN
      INSERT INTO public.referral_codes (user_id, code) VALUES (p_user_id, v_new);
      UPDATE public.users SET referral_code = v_new WHERE id = p_user_id;
      RETURN v_new;
    EXCEPTION WHEN unique_violation THEN
      IF v_tries >= 10 THEN RAISE EXCEPTION 'Could not generate unique referral code after % attempts', v_tries; END IF;
    END;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_referral_code(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.redeem_referral_code(p_code TEXT)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_referee_id UUID := auth.uid();
  v_referrer_id UUID;
  v_clean_code TEXT;
BEGIN
  IF v_referee_id IS NULL THEN RETURN json_build_object('success', false, 'error', 'not_authenticated'); END IF;
  v_clean_code := UPPER(TRIM(p_code));
  IF v_clean_code IS NULL OR length(v_clean_code) < 4 THEN RETURN json_build_object('success', false, 'error', 'invalid_code'); END IF;
  SELECT user_id INTO v_referrer_id FROM public.referral_codes WHERE code = v_clean_code;
  IF v_referrer_id IS NULL THEN RETURN json_build_object('success', false, 'error', 'code_not_found'); END IF;
  IF v_referrer_id = v_referee_id THEN RETURN json_build_object('success', false, 'error', 'self_referral'); END IF;
  BEGIN
    INSERT INTO public.referrals (referrer_user_id, referee_user_id, code_used)
    VALUES (v_referrer_id, v_referee_id, v_clean_code);
  EXCEPTION WHEN unique_violation THEN
    RETURN json_build_object('success', false, 'error', 'already_redeemed');
  END;
  UPDATE public.users SET referred_by = v_clean_code WHERE id = v_referee_id;
  RETURN json_build_object('success', true, 'referrer_id', v_referrer_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_referral_code(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_referral_stats()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_code TEXT; v_total INT; v_done INT; v_pending INT;
BEGIN
  IF v_user_id IS NULL THEN RETURN json_build_object('success', false, 'error', 'not_authenticated'); END IF;
  v_code := public.ensure_referral_code(v_user_id);
  SELECT COUNT(*), COUNT(*) FILTER (WHERE completed_at IS NOT NULL), COUNT(*) FILTER (WHERE completed_at IS NULL)
  INTO v_total, v_done, v_pending
  FROM public.referrals WHERE referrer_user_id = v_user_id;
  RETURN json_build_object('success', true, 'code', v_code, 'total_invited', v_total, 'completed', v_done, 'pending', v_pending);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_referral_stats() TO authenticated;

CREATE OR REPLACE FUNCTION public.complete_referral_if_eligible(p_user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_referral RECORD; v_level INT;
BEGIN
  SELECT level INTO v_level FROM public.users WHERE id = p_user_id;
  IF v_level IS NULL OR v_level < 5 THEN RETURN FALSE; END IF;
  SELECT * INTO v_referral FROM public.referrals WHERE referee_user_id = p_user_id AND rewarded_at IS NULL LIMIT 1;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  UPDATE public.referrals SET completed_at = COALESCE(completed_at, NOW()), rewarded_at = NOW() WHERE id = v_referral.id;
  PERFORM public.award_xp(v_referral.referee_user_id,  500, 'referral_bonus', jsonb_build_object('referral_id', v_referral.id, 'role', 'referee'),  'referral_' || v_referral.id::text);
  PERFORM public.award_xp(v_referral.referrer_user_id, 500, 'referral_bonus', jsonb_build_object('referral_id', v_referral.id, 'role', 'referrer'), 'referral_' || v_referral.id::text);
  PERFORM public.grant_premium(v_referral.referee_user_id, 30);
  PERFORM public.grant_premium(v_referral.referrer_user_id, 30);
  UPDATE public.users SET referral_reward_claimed = TRUE WHERE id = v_referral.referee_user_id;
  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_referral_if_eligible(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public._trg_complete_referral_on_level_up()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.level IS NOT NULL AND NEW.level >= 5 AND (OLD.level IS NULL OR OLD.level < 5) THEN
    PERFORM public.complete_referral_if_eligible(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_complete_referral_on_level_up ON public.users;
CREATE TRIGGER trg_complete_referral_on_level_up
  AFTER UPDATE OF level ON public.users
  FOR EACH ROW WHEN (NEW.level IS DISTINCT FROM OLD.level)
  EXECUTE FUNCTION public._trg_complete_referral_on_level_up();
