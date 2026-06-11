-- Fix replay des challenges hebdo passés + historique complet.
--
-- 1. La policy RLS sur weekly_challenge_questions excluait 'archived' :
--    le replay d'un challenge archivé ne pouvait charger aucune question
--    (0 ligne visible côté client). On garde l'intention d'origine
--    (cacher les questions des challenges 'upcoming') et on ajoute 'archived'.
--
-- 2. get_my_challenge_history ne retournait que les challenges déjà joués
--    (INNER JOIN progress) : un quiz passé jamais joué était introuvable
--    dans "Plus de quiz hebdo". Passage en LEFT JOIN — tous les challenges
--    archived/closed prêts sont listés, joués ou non.

-- =====================================================================
-- 1. Questions lisibles pour les challenges passés (replay)
-- =====================================================================

DROP POLICY IF EXISTS "wc_questions_read_visible" ON weekly_challenge_questions;
CREATE POLICY "wc_questions_read_visible" ON weekly_challenge_questions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM weekly_challenges c
    WHERE c.id = challenge_id AND c.status IN ('active','closed','archived')
  ));

-- =====================================================================
-- 2. Historique : tous les challenges passés, joués ou non
-- =====================================================================

DROP FUNCTION IF EXISTS get_my_challenge_history();

CREATE OR REPLACE FUNCTION get_my_challenge_history()
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
    c.id AS challenge_id,
    c.challenge_type,
    c.theme_slug,
    c.theme_label_fr,
    c.theme_label_en,
    c.description_fr,
    c.description_en,
    c.emoji,
    c.color,
    c.start_date,
    c.end_date,
    c.total_questions,
    p.final_score,
    p.correct_count,
    p.badge_earned,
    p.completed_at,
    p.final_xp_awarded,
    (
      SELECT MAX(r.correct_count)
      FROM weekly_replay_results r
      WHERE r.user_id = v_user_id
        AND r.challenge_id = c.id
        AND r.completed_at IS NOT NULL
    )::INTEGER AS best_replay_score
  FROM weekly_challenges c
  LEFT JOIN weekly_challenge_progress p
    ON p.challenge_id = c.id AND p.user_id = v_user_id
  WHERE c.status IN ('archived', 'closed')
    AND c.generation_status = 'ready'
  ORDER BY c.end_date DESC
  LIMIT 50;
END;
$$;

GRANT EXECUTE ON FUNCTION get_my_challenge_history TO authenticated;
