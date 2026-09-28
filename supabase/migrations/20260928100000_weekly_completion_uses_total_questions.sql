-- Fix : submit_weekly_answer marquait un défi terminé à 30 réponses (valeur en dur),
-- alors que les défis générés ont 16 à 20 questions (weekly_challenges.total_questions).
-- Résultat : completed_at jamais rempli → écran de résultat bloqué sur « Continuer »
-- (boucle play → result), pas de pont vers le daily, 0 défi « terminé » depuis août.

CREATE OR REPLACE FUNCTION public.submit_weekly_answer(p_challenge_id uuid, p_position integer, p_is_correct boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_user_id UUID := auth.uid();
  v_today DATE := CURRENT_DATE;
  v_today_key TEXT := v_today::text;
  v_progress weekly_challenge_progress;
  v_today_count INTEGER;
  v_yesterday DATE := v_today - INTERVAL '1 day';
  v_played_yesterday BOOLEAN;
  v_new_streak INTEGER;
  v_total INTEGER;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  SELECT total_questions INTO v_total FROM weekly_challenges WHERE id = p_challenge_id;
  IF v_total IS NULL THEN RAISE EXCEPTION 'challenge not found'; END IF;

  SELECT * INTO v_progress FROM weekly_challenge_progress
  WHERE user_id = v_user_id AND challenge_id = p_challenge_id FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO weekly_challenge_progress (user_id, challenge_id)
    VALUES (v_user_id, p_challenge_id) RETURNING * INTO v_progress;
  END IF;

  IF p_position <> v_progress.current_position + 1 THEN
    RAISE EXCEPTION 'expected position %, got %', v_progress.current_position + 1, p_position;
  END IF;

  v_today_count := COALESCE((v_progress.daily_play_counts->>v_today_key)::int, 0);

  IF (v_progress.daily_play_counts ? v_today_key) THEN
    v_new_streak := v_progress.day_streak;
  ELSE
    v_played_yesterday := v_progress.daily_play_counts ? v_yesterday::text;
    v_new_streak := CASE WHEN v_played_yesterday THEN v_progress.day_streak + 1 ELSE 1 END;
  END IF;

  UPDATE weekly_challenge_progress SET
    current_position = current_position + 1,
    correct_count = correct_count + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    daily_play_counts = daily_play_counts || jsonb_build_object(v_today_key, v_today_count + 1),
    day_streak = v_new_streak,
    best_day_streak = GREATEST(best_day_streak, v_new_streak),
    last_played_at = NOW(),
    completed_at = CASE WHEN current_position + 1 >= v_total THEN NOW() ELSE completed_at END
  WHERE id = v_progress.id RETURNING * INTO v_progress;

  RETURN jsonb_build_object(
    'current_position', v_progress.current_position,
    'correct_count', v_progress.correct_count,
    'day_streak', v_progress.day_streak,
    'completed', v_progress.completed_at IS NOT NULL,
    'today_count', (v_progress.daily_play_counts->>v_today_key)::int
  );
END;
$function$;

-- Rattrapage : les parties allées jusqu'au bout sont marquées terminées
-- (horodatage = dernière réponse). Pas d'XP rétroactive : la clôture l'a déjà versée.
UPDATE weekly_challenge_progress p
SET completed_at = COALESCE(p.last_played_at, NOW())
FROM weekly_challenges wc
WHERE wc.id = p.challenge_id
  AND p.completed_at IS NULL
  AND p.current_position >= wc.total_questions;
