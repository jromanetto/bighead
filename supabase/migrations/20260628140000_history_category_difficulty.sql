-- Migration: expose target_category + target_difficulty dans l'historique des défis
-- pour pouvoir afficher catégorie + badge de difficulté sur chaque carte d'historique.

DROP FUNCTION IF EXISTS get_my_challenge_history();
CREATE FUNCTION get_my_challenge_history()
RETURNS TABLE (
  challenge_id UUID,
  challenge_type TEXT,
  theme_slug TEXT,
  theme_label_fr TEXT,
  theme_label_en TEXT,
  description_fr TEXT,
  description_en TEXT,
  emoji TEXT,
  color TEXT,
  target_category TEXT,
  target_difficulty SMALLINT,
  start_date DATE,
  end_date DATE,
  total_questions INTEGER,
  final_score INTEGER,
  correct_count INTEGER,
  badge_earned TEXT,
  completed_at TIMESTAMPTZ,
  final_xp_awarded INTEGER,
  best_replay_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    c.id AS challenge_id, c.challenge_type, c.theme_slug,
    c.theme_label_fr, c.theme_label_en, c.description_fr, c.description_en,
    c.emoji, c.color, c.target_category, c.target_difficulty,
    c.start_date, c.end_date, c.total_questions,
    p.final_score, p.correct_count, p.badge_earned, p.completed_at, p.final_xp_awarded,
    (
      SELECT MAX(r.correct_count) FROM weekly_replay_results r
      WHERE r.user_id = v_user_id AND r.challenge_id = c.id AND r.completed_at IS NOT NULL
    )::INTEGER AS best_replay_score
  FROM weekly_challenges c
  LEFT JOIN weekly_challenge_progress p ON p.challenge_id = c.id AND p.user_id = v_user_id
  WHERE c.status IN ('archived', 'closed') AND c.generation_status = 'ready'
  ORDER BY c.end_date DESC
  LIMIT 50;
END;
$$;
GRANT EXECUTE ON FUNCTION get_my_challenge_history TO authenticated;
