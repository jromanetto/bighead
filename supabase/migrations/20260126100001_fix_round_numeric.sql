-- Fix ROUND function - needs NUMERIC type for precision parameter
CREATE OR REPLACE FUNCTION get_player_skill_summary(p_user_id UUID)
RETURNS TABLE (
  category TEXT,
  skill_rating FLOAT,
  skill_level TEXT,
  games_played INTEGER,
  accuracy_percent FLOAT,
  best_streak INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ps.category,
    ps.skill_rating,
    CASE
      WHEN ps.skill_rating >= 1800 THEN 'Expert'
      WHEN ps.skill_rating >= 1500 THEN 'Avancé'
      WHEN ps.skill_rating >= 1200 THEN 'Intermédiaire'
      WHEN ps.skill_rating >= 900 THEN 'Débutant'
      ELSE 'Novice'
    END AS skill_level,
    ps.games_played,
    CASE
      WHEN ps.total_answers > 0
      THEN ROUND((ps.correct_answers::NUMERIC / ps.total_answers) * 100, 1)::FLOAT
      ELSE 0::FLOAT
    END AS accuracy_percent,
    ps.best_streak
  FROM player_skill ps
  WHERE ps.user_id = p_user_id
  ORDER BY ps.skill_rating DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
