-- 1-6 age-based difficulty + live requalification.
-- `difficulty` = effective level (AI cold-start, then nudged by play data).
-- `ai_difficulty` = immutable AI base, bounds the auto-adjustment to ±1.

ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_difficulty_check;
ALTER TABLE questions ADD CONSTRAINT questions_difficulty_check
  CHECK (difficulty >= 1 AND difficulty <= 6);

ALTER TABLE questions ADD COLUMN IF NOT EXISTS ai_difficulty smallint;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS agg_shown integer NOT NULL DEFAULT 0;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS agg_correct integer NOT NULL DEFAULT 0;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS requalified_at timestamptz;

CREATE OR REPLACE FUNCTION level_to_min_age(p_level integer)
RETURNS integer LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE p_level
    WHEN 1 THEN 6 WHEN 2 THEN 8 WHEN 3 THEN 10
    WHEN 4 THEN 12 WHEN 5 THEN 15 WHEN 6 THEN 18 ELSE 12 END;
$$;

-- Lightweight per-answer recorder, called fire-and-forget by every game mode.
CREATE OR REPLACE FUNCTION record_question_outcome(p_question_id uuid, p_was_correct boolean)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE questions
  SET agg_shown = agg_shown + 1,
      agg_correct = agg_correct + (CASE WHEN p_was_correct THEN 1 ELSE 0 END)
  WHERE id = p_question_id;
$$;
GRANT EXECUTE ON FUNCTION record_question_outcome(uuid, boolean) TO authenticated, anon;

-- Daily requalification: nudge difficulty ±1 toward player experience, bounded
-- around the AI base. Counters reset after each change (fresh evidence needed).
CREATE OR REPLACE FUNCTION requalify_question_difficulties()
RETURNS TABLE(harder integer, easier integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_harder integer := 0; v_easier integer := 0;
BEGIN
  WITH bumped AS (
    UPDATE questions q
    SET difficulty = LEAST(6, difficulty + 1),
        min_age = level_to_min_age(LEAST(6, difficulty + 1)),
        agg_shown = 0, agg_correct = 0, requalified_at = now(), difficulty_updated_at = now()
    WHERE is_active AND agg_shown >= 8 AND (agg_shown - agg_correct) >= 3
      AND agg_correct::float / agg_shown < 0.40
      AND difficulty < 6 AND difficulty <= COALESCE(ai_difficulty, difficulty)
    RETURNING 1
  ) SELECT count(*) INTO v_harder FROM bumped;

  WITH lowered AS (
    UPDATE questions q
    SET difficulty = GREATEST(1, difficulty - 1),
        min_age = level_to_min_age(GREATEST(1, difficulty - 1)),
        agg_shown = 0, agg_correct = 0, requalified_at = now(), difficulty_updated_at = now()
    WHERE is_active AND agg_shown >= 8
      AND agg_correct::float / agg_shown > 0.92
      AND difficulty > 1 AND difficulty >= COALESCE(ai_difficulty, difficulty)
    RETURNING 1
  ) SELECT count(*) INTO v_easier FROM lowered;

  harder := v_harder; easier := v_easier; RETURN NEXT;
END;
$$;
GRANT EXECUTE ON FUNCTION requalify_question_difficulties() TO service_role;

-- Family RPC returns wrong_answers + images and uses the AI-driven min_age.
DROP FUNCTION IF EXISTS get_family_questions(integer, text, integer, text);
CREATE OR REPLACE FUNCTION public.get_family_questions(
  p_min_age integer, p_category text DEFAULT NULL,
  p_limit integer DEFAULT 20, p_language text DEFAULT 'fr')
RETURNS TABLE(id uuid, question_text text, correct_answer text, wrong_answers text[],
  category text, difficulty integer, min_age integer, image_url text, image_credit text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  RETURN QUERY
  SELECT q.id, q.question_text, q.correct_answer, q.wrong_answers,
         q.category, q.difficulty, q.min_age, q.image_url, q.image_credit
  FROM questions q
  WHERE q.is_active AND q.language = p_language
    AND q.min_age <= p_min_age
    AND (p_category IS NULL OR p_category = 'mix' OR q.category = p_category)
  ORDER BY RANDOM() LIMIT p_limit;
END;
$function$;
GRANT EXECUTE ON FUNCTION get_family_questions(integer, text, integer, text) TO authenticated, anon;
