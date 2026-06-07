-- Make weekly leaderboard show ALL players who earn any XP in the last 7d.
--
-- The previous version hard-coded an IN list of "game-mode" sources, which
-- silently excluded users who only earned XP via universal/engagement sources
-- (daily_login, weekly_open, achievement, referral, first_*, etc.). As soon as
-- a player's only contribution this week is e.g. opening the app daily, they
-- vanished from the board.
--
-- This drops the source filter entirely. Any xp_transactions row with
-- amount > 0 in the last 7 days now counts toward weekly_xp. weekly_games
-- still uses COUNT(xt.id) — it's an approximation of activity, slightly
-- inflated when a single game stacks bonuses, but the structural fairness
-- gain outweighs the loose semantics.

CREATE OR REPLACE FUNCTION get_weekly_leaderboard(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  username TEXT,
  avatar_url TEXT,
  weekly_xp BIGINT,
  weekly_games BIGINT,
  best_chain INTEGER,
  rank BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
    AND xt.amount > 0
  WHERE u.username IS NOT NULL
  GROUP BY u.id, u.username, u.avatar_url, u.best_chain
  HAVING COUNT(xt.id) > 0
  ORDER BY weekly_xp DESC
  LIMIT limit_count;
END;
$$;

GRANT EXECUTE ON FUNCTION get_weekly_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION get_weekly_leaderboard TO anon;
