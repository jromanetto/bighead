-- Migration: Unified XP system across all game modes
-- Adds award_xp RPC to grant XP from any mode (duel, tournament, family, adventure, traitor, auction, daily, etc.)
-- The chain_solo/party trigger remains for backward compat — those modes still write to game_results.

-- Track XP transactions for transparency / debugging / undo
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON xp_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_source ON xp_transactions(source);

ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_xp_tx"
  ON xp_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Award XP RPC. Idempotent if same source has dedupe_key.
-- Returns the new total_xp.
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
BEGIN
  -- Reject negative or absurd amounts
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 50000 THEN
    RAISE EXCEPTION 'invalid xp amount: %', p_amount;
  END IF;

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

  -- Record transaction
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

  -- Update user total
  UPDATE users
  SET total_xp = COALESCE(total_xp, 0) + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING total_xp INTO v_new_total;

  RETURN v_new_total;
END;
$$;

GRANT EXECUTE ON FUNCTION award_xp TO authenticated;
GRANT EXECUTE ON FUNCTION award_xp TO anon;
