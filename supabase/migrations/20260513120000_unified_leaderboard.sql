-- Migration: Unify leaderboard with xp_transactions
--
-- Before: weekly leaderboard only counted game_results (chain_solo + party).
-- The all-time view filtered users with games_played=0, hiding users who only
-- played modes routed through award_xp (duel, tournament, family, traitor, auction).
--
-- After:
--  * `award_xp` also increments users.games_played when the source is a game mode,
--    so any player who finishes a game appears in the leaderboard.
--  * `get_weekly_leaderboard` sums xp_transactions in the last 7 days union'd with
--    game_results score/10 (legacy chain_solo + party paths still increment total_xp
--    via the existing trigger and we mirror that into xp_transactions for the audit
--    trail).
--  * The `leaderboard` view keeps the games_played > 0 filter (still meaningful) but
--    games_played is now incremented from all modes.

-- 1. Extend award_xp to also bump games_played for game-mode sources.
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
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 50000 THEN
    RAISE EXCEPTION 'invalid xp amount: %', p_amount;
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

-- 2. Backfill xp_transactions from game_results so the weekly leaderboard reflects
-- past chain_solo and party plays. Each game_result row → one xp_transactions row
-- (idempotent via metadata.game_result_id dedupe).
INSERT INTO xp_transactions (user_id, amount, source, metadata, created_at)
SELECT
  gr.user_id,
  GREATEST(1, gr.score / 10),
  gr.mode,
  jsonb_build_object('game_result_id', gr.id, 'backfill', true),
  gr.created_at
FROM game_results gr
WHERE gr.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM xp_transactions xt
    WHERE xt.metadata->>'game_result_id' = gr.id::text
  );

-- 3. Update the trigger so future game_results rows also log to xp_transactions.
-- (We keep total_xp update here for backward compat; award_xp is the path going forward.)
CREATE OR REPLACE FUNCTION update_user_stats_after_game()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET
    games_played = COALESCE(games_played, 0) + 1,
    total_xp = COALESCE(total_xp, 0) + GREATEST(1, NEW.score / 10),
    best_chain = GREATEST(COALESCE(best_chain, 0), NEW.max_chain),
    updated_at = NOW()
  WHERE id = NEW.user_id;

  INSERT INTO xp_transactions (user_id, amount, source, metadata, created_at)
  VALUES (
    NEW.user_id,
    GREATEST(1, NEW.score / 10),
    NEW.mode,
    jsonb_build_object('game_result_id', NEW.id),
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Rewrite get_weekly_leaderboard to sum xp_transactions instead of game_results.
DROP FUNCTION IF EXISTS get_weekly_leaderboard(INTEGER);

CREATE OR REPLACE FUNCTION get_weekly_leaderboard(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  username TEXT,
  avatar_url TEXT,
  weekly_xp BIGINT,
  weekly_games BIGINT,
  best_chain INTEGER,
  rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.username,
    u.avatar_url,
    COALESCE(SUM(xt.amount), 0)::BIGINT AS weekly_xp,
    COUNT(xt.id)::BIGINT AS weekly_games,
    COALESCE(u.best_chain, 0) AS best_chain,
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(xt.amount), 0) DESC) AS rank
  FROM users u
  LEFT JOIN xp_transactions xt
    ON u.id = xt.user_id
    AND xt.created_at >= NOW() - INTERVAL '7 days'
    AND xt.source IN ('chain_solo','party','duel','tournament','family',
                      'adventure','traitor','auction','challenge','daily')
  WHERE u.username IS NOT NULL
  GROUP BY u.id, u.username, u.avatar_url, u.best_chain
  HAVING COUNT(xt.id) > 0
  ORDER BY weekly_xp DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_weekly_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION get_weekly_leaderboard TO anon;

-- 5. Relax leaderboard view: also include users who have XP transactions but
-- whose games_played counter is still stale (older clients that pre-date the
-- award_xp games_played bump).
DROP VIEW IF EXISTS leaderboard;
CREATE VIEW leaderboard AS
SELECT
  u.id,
  u.username,
  u.avatar_url,
  u.total_xp,
  u.level,
  u.games_played,
  u.best_chain,
  ROW_NUMBER() OVER (ORDER BY u.total_xp DESC) AS rank
FROM users u
WHERE u.username IS NOT NULL
  AND u.total_xp > 0;

GRANT SELECT ON leaderboard TO authenticated;
GRANT SELECT ON leaderboard TO anon;

DO $$
DECLARE
  v_backfilled INTEGER;
  v_total_users INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_backfilled FROM xp_transactions WHERE metadata->>'backfill' = 'true';
  SELECT COUNT(*) INTO v_total_users FROM users WHERE total_xp > 0;
  RAISE NOTICE 'Backfilled % xp_transactions, % users with XP', v_backfilled, v_total_users;
END $$;
