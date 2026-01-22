-- Migration: Create leaderboard view
-- Description: View for displaying user rankings

-- Drop existing view if exists (to handle column changes)
DROP VIEW IF EXISTS leaderboard;

-- Create leaderboard view for all-time rankings
CREATE VIEW leaderboard AS
SELECT
  u.id,
  u.username,
  u.avatar_url,
  u.total_xp,
  u.level,
  u.games_played,
  u.best_chain,
  ROW_NUMBER() OVER (ORDER BY u.total_xp DESC) as rank
FROM users u
WHERE u.username IS NOT NULL
  AND u.games_played > 0
ORDER BY u.total_xp DESC;

-- Create function to get weekly leaderboard
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
    COALESCE(SUM(gr.score / 10), 0)::BIGINT as weekly_xp,
    COUNT(gr.id)::BIGINT as weekly_games,
    COALESCE(MAX(gr.max_chain), 0) as best_chain,
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(gr.score / 10), 0) DESC) as rank
  FROM users u
  LEFT JOIN game_results gr ON u.id = gr.user_id
    AND gr.created_at >= NOW() - INTERVAL '7 days'
  WHERE u.username IS NOT NULL
  GROUP BY u.id, u.username, u.avatar_url
  HAVING COUNT(gr.id) > 0
  ORDER BY weekly_xp DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the view and function
GRANT SELECT ON leaderboard TO authenticated;
GRANT SELECT ON leaderboard TO anon;
GRANT EXECUTE ON FUNCTION get_weekly_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION get_weekly_leaderboard TO anon;
