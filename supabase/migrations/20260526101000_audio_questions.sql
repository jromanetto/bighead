-- =====================================================================
-- AUDIO QUESTIONS — Music / sound quiz game mode
-- Stores short audio snippets (~10s) with multiple-choice answers.
-- Content (audio URLs) is seeded later — this migration ships
-- the infrastructure (table, RLS, RPC) so the mode is playable.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.audio_questions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  audio_url TEXT NOT NULL,
  audio_duration_seconds INT NOT NULL DEFAULT 10,
  audio_credit TEXT,
  category TEXT NOT NULL DEFAULT 'music',
  subcategory TEXT,
  question_fr TEXT NOT NULL DEFAULT 'Quel est l''artiste ?',
  question_en TEXT NOT NULL DEFAULT 'Who is the artist?',
  correct_answer TEXT NOT NULL,
  wrong_answers TEXT[] NOT NULL,
  difficulty INT NOT NULL DEFAULT 2 CHECK (difficulty BETWEEN 1 AND 3),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  times_played INT DEFAULT 0,
  times_correct INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_audio_questions_active_cat_diff
  ON public.audio_questions (is_active, category, difficulty);

-- =====================================================================
-- RLS — any authenticated user can SELECT active rows
-- =====================================================================
ALTER TABLE public.audio_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audio_questions_select_active" ON public.audio_questions;
CREATE POLICY "audio_questions_select_active" ON public.audio_questions
  FOR SELECT TO authenticated
  USING (is_active = TRUE);

-- =====================================================================
-- RPC: get_random_audio_questions(p_count, p_language, p_category)
-- Returns N random active audio_questions, optionally filtered by category.
-- Localised "question" column selected from question_fr/question_en.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.get_random_audio_questions(
  p_count INT DEFAULT 10,
  p_language TEXT DEFAULT 'en',
  p_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  audio_url TEXT,
  audio_duration_seconds INT,
  audio_credit TEXT,
  category TEXT,
  subcategory TEXT,
  question TEXT,
  correct_answer TEXT,
  wrong_answers TEXT[],
  difficulty INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    aq.id,
    aq.audio_url,
    aq.audio_duration_seconds,
    aq.audio_credit,
    aq.category,
    aq.subcategory,
    CASE WHEN p_language = 'fr' THEN aq.question_fr ELSE aq.question_en END AS question,
    aq.correct_answer,
    aq.wrong_answers,
    aq.difficulty
  FROM public.audio_questions aq
  WHERE aq.is_active = TRUE
    AND (p_category IS NULL OR aq.category = p_category)
  ORDER BY RANDOM()
  LIMIT GREATEST(COALESCE(p_count, 10), 1);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_random_audio_questions(INT, TEXT, TEXT) TO authenticated, anon;

-- =====================================================================
-- RPC: record_audio_question_result(p_question_id, p_was_correct)
-- Increment play / correct counters. Best-effort: ignore failures silently.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.record_audio_question_result(
  p_question_id UUID,
  p_was_correct BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.audio_questions
     SET times_played = times_played + 1,
         times_correct = times_correct + CASE WHEN p_was_correct THEN 1 ELSE 0 END
   WHERE id = p_question_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_audio_question_result(UUID, BOOLEAN) TO authenticated;

-- =====================================================================
-- SEED — placeholder rows so the mode is playable before real content lands.
-- TODO: replace with real licensed audio snippets.
-- Uses a free public-domain piano sample.
-- =====================================================================
INSERT INTO public.audio_questions (
  audio_url, audio_duration_seconds, audio_credit,
  category, subcategory,
  question_fr, question_en,
  correct_answer, wrong_answers, difficulty
) VALUES
  (
    'https://www.kozco.com/tech/piano2.wav', 10, 'Public domain — placeholder',
    'music', 'placeholder',
    'Quel instrument entends-tu ?', 'Which instrument do you hear?',
    'Piano', ARRAY['Guitar', 'Violin', 'Drums'], 1
  ),
  (
    'https://www.kozco.com/tech/piano2.wav', 10, 'Public domain — placeholder',
    'music', 'placeholder',
    'Quel est le genre musical ?', 'What is the musical genre?',
    'Classical', ARRAY['Rock', 'Jazz', 'Pop'], 2
  ),
  (
    'https://www.kozco.com/tech/piano2.wav', 10, 'Public domain — placeholder',
    'music', 'placeholder',
    'Combien de notes entends-tu ?', 'How many notes do you hear?',
    'Many', ARRAY['One', 'Two', 'Three'], 3
  )
ON CONFLICT DO NOTHING;
