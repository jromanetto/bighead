-- Migration: Daily Brain becomes 5 questions per day instead of 1
-- Strategy: Add position column to daily_questions, allow 5 rows per (date, language).
-- Add a new RPC get_or_create_daily_questions_v2 that returns all 5 questions for a date.
-- Keep get_or_create_daily_question working for legacy callers (notifications) by
-- returning the position=1 row.

-- 1. Add position column
ALTER TABLE daily_questions
  ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 1;

-- 2. Replace unique (date, language) with (date, language, position).
DROP INDEX IF EXISTS idx_daily_questions_date_language;
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_questions_date_lang_position
  ON daily_questions (date, language, position);

-- 3. New RPC: returns 5 questions for the requested date+language.
--    Picks a mix: 2 easy (difficulty<=2), 2 medium (=3), 1 hard (>=4).
CREATE OR REPLACE FUNCTION get_or_create_daily_questions_v2(
  target_date date DEFAULT CURRENT_DATE,
  p_language text DEFAULT 'fr'
)
RETURNS TABLE (
  out_id uuid,
  out_position integer,
  out_date date,
  out_question_id uuid,
  out_question_text text,
  out_category text,
  out_difficulty integer,
  out_correct_answer text,
  out_options jsonb,
  out_image_url text
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_existing_count integer;
  v_selected_ids uuid[];
  v_next_position integer;
  v_q RECORD;
  v_final_text text;
BEGIN
  SELECT COUNT(*) INTO v_existing_count
  FROM daily_questions dq
  WHERE dq.date = target_date AND dq.language = p_language;

  IF v_existing_count < 5 THEN
    SELECT COALESCE(array_agg(dq.question_id), ARRAY[]::uuid[]) INTO v_selected_ids
    FROM daily_questions dq
    WHERE dq.date > target_date - INTERVAL '30 days';

    FOR v_next_position IN 1..5 LOOP
      IF EXISTS (
        SELECT 1 FROM daily_questions dq
        WHERE dq.date = target_date
          AND dq.language = p_language
          AND dq.position = v_next_position
      ) THEN
        CONTINUE;
      END IF;

      v_q := NULL;

      IF v_next_position IN (1, 2) THEN
        SELECT q.* INTO v_q
        FROM questions q
        WHERE q.is_active = true
          AND q.language = p_language
          AND q.difficulty <= 2
          AND q.id <> ALL (v_selected_ids)
        ORDER BY RANDOM()
        LIMIT 1;
      ELSIF v_next_position IN (3, 4) THEN
        SELECT q.* INTO v_q
        FROM questions q
        WHERE q.is_active = true
          AND q.language = p_language
          AND q.difficulty = 3
          AND q.id <> ALL (v_selected_ids)
        ORDER BY RANDOM()
        LIMIT 1;
      ELSE
        SELECT q.* INTO v_q
        FROM questions q
        WHERE q.is_active = true
          AND q.language = p_language
          AND q.difficulty >= 4
          AND q.id <> ALL (v_selected_ids)
        ORDER BY RANDOM()
        LIMIT 1;
      END IF;

      IF v_q.id IS NULL THEN
        SELECT q.* INTO v_q
        FROM questions q
        WHERE q.is_active = true
          AND q.language = p_language
          AND q.id <> ALL (v_selected_ids)
        ORDER BY RANDOM()
        LIMIT 1;
      END IF;

      IF v_q.id IS NULL AND p_language <> 'fr' THEN
        SELECT q.* INTO v_q
        FROM questions q
        WHERE q.is_active = true
          AND q.language = 'fr'
          AND q.id <> ALL (v_selected_ids)
        ORDER BY RANDOM()
        LIMIT 1;
      END IF;

      IF v_q.id IS NULL THEN
        CONTINUE;
      END IF;

      v_final_text := v_q.question_text;
      IF v_final_text IS NOT NULL AND RIGHT(TRIM(v_final_text), 1) <> '?' THEN
        v_final_text := TRIM(v_final_text) || ' ?';
      END IF;

      INSERT INTO daily_questions (
        date, question_id, question_text, category, difficulty, language, position
      ) VALUES (
        target_date, v_q.id, v_final_text, v_q.category, v_q.difficulty,
        p_language, v_next_position
      )
      ON CONFLICT DO NOTHING;

      v_selected_ids := v_selected_ids || v_q.id;
    END LOOP;
  END IF;

  RETURN QUERY
  SELECT
    dq.id,
    dq.position,
    dq.date,
    dq.question_id,
    dq.question_text,
    dq.category,
    dq.difficulty,
    q.correct_answer,
    jsonb_build_array(q.correct_answer) || to_jsonb(q.wrong_answers) AS options,
    q.image_url
  FROM daily_questions dq
  JOIN questions q ON q.id = dq.question_id
  WHERE dq.date = target_date
    AND dq.language = p_language
  ORDER BY dq.position;
END;
$$;

-- 4. Keep get_or_create_daily_question working (notifications use it).
CREATE OR REPLACE FUNCTION get_or_create_daily_question(
  target_date date DEFAULT CURRENT_DATE,
  p_language text DEFAULT 'fr'
)
RETURNS TABLE (
  id uuid,
  date date,
  question_id uuid,
  question_text text,
  category text,
  difficulty integer,
  correct_answer text,
  options jsonb,
  image_url text
)
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM 1 FROM get_or_create_daily_questions_v2(target_date, p_language);

  RETURN QUERY
  SELECT
    dq.id,
    dq.date,
    dq.question_id,
    dq.question_text,
    dq.category,
    dq.difficulty,
    q.correct_answer,
    jsonb_build_array(q.correct_answer) || to_jsonb(q.wrong_answers) AS options,
    q.image_url
  FROM daily_questions dq
  JOIN questions q ON q.id = dq.question_id
  WHERE dq.date = target_date
    AND dq.language = p_language
    AND dq.position = 1;
END;
$$;
