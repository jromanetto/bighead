-- Migration: Fix daily notification system
-- 1. Add language-aware push token RPC
-- 2. Fix daily_questions UNIQUE constraint to allow one question per date per language
-- Date: 2026-03-02

-- =============================================
-- 1. New RPC: Get push tokens with user language preference
-- =============================================

CREATE OR REPLACE FUNCTION get_active_push_tokens_with_language()
RETURNS TABLE (
    user_id UUID,
    push_token TEXT,
    language TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.push_token, COALESCE(us.language, 'fr') as language
    FROM users u
    LEFT JOIN user_settings us ON us.user_id = u.id
    WHERE u.push_token IS NOT NULL
    AND u.push_token != ''
    AND u.push_token LIKE 'ExponentPushToken%'
    AND (u.push_token_updated_at IS NULL OR u.push_token_updated_at > NOW() - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_active_push_tokens_with_language TO service_role;

-- =============================================
-- 2. Fix daily_questions to support multiple languages per date
-- =============================================

-- Drop the old unique constraint on date only
ALTER TABLE daily_questions DROP CONSTRAINT IF EXISTS daily_questions_date_key;

-- Add a language column to daily_questions
ALTER TABLE daily_questions ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fr';

-- Update existing records to have 'fr' language
UPDATE daily_questions SET language = 'fr' WHERE language IS NULL;

-- Add a unique constraint on (date, language) instead of just (date)
-- This allows one FR question and one EN question per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_questions_date_language
ON daily_questions(date, language);

-- =============================================
-- 3. Drop old overloaded function (single-arg version) before recreating
-- =============================================

-- Drop the old single-argument version that causes ambiguity
DROP FUNCTION IF EXISTS get_or_create_daily_question(DATE);

-- Now create/replace the two-argument version
CREATE OR REPLACE FUNCTION get_or_create_daily_question(
    target_date DATE DEFAULT CURRENT_DATE,
    p_language TEXT DEFAULT 'fr'
)
RETURNS TABLE (
    id UUID,
    date DATE,
    question_id UUID,
    question_text TEXT,
    category TEXT,
    difficulty INTEGER,
    correct_answer TEXT,
    options JSONB,
    image_url TEXT
) AS $$
DECLARE
    existing_record RECORD;
    selected_question RECORD;
    final_question_text TEXT;
BEGIN
    -- Check if we already have a question for this date AND language
    SELECT dq.* INTO existing_record
    FROM daily_questions dq
    WHERE dq.date = target_date
    AND dq.language = p_language;

    IF existing_record.id IS NOT NULL THEN
        -- Return existing question with full details
        RETURN QUERY
        SELECT
            existing_record.id,
            existing_record.date,
            existing_record.question_id,
            existing_record.question_text,
            existing_record.category,
            existing_record.difficulty,
            q.correct_answer,
            jsonb_build_array(q.correct_answer) || to_jsonb(q.wrong_answers) as options,
            q.image_url
        FROM questions q
        WHERE q.id = existing_record.question_id;
        RETURN;
    END IF;

    -- Select a random question in the requested language that hasn't been used recently (last 30 days)
    SELECT q.* INTO selected_question
    FROM questions q
    WHERE q.id NOT IN (
        SELECT dq.question_id
        FROM daily_questions dq
        WHERE dq.date > target_date - INTERVAL '30 days'
    )
    AND q.language = p_language
    AND q.is_active = true
    ORDER BY RANDOM()
    LIMIT 1;

    -- If no question found, just get any random one in that language
    IF selected_question.id IS NULL THEN
        SELECT q.* INTO selected_question
        FROM questions q
        WHERE q.language = p_language
        AND q.is_active = true
        ORDER BY RANDOM()
        LIMIT 1;
    END IF;

    -- If still no question (language has no questions), fallback to French
    IF selected_question.id IS NULL AND p_language != 'fr' THEN
        SELECT q.* INTO selected_question
        FROM questions q
        WHERE q.language = 'fr'
        AND q.is_active = true
        ORDER BY RANDOM()
        LIMIT 1;
    END IF;

    -- Ensure question ends with ?
    final_question_text := selected_question.question_text;
    IF final_question_text IS NOT NULL AND RIGHT(TRIM(final_question_text), 1) != '?' THEN
        final_question_text := TRIM(final_question_text) || ' ?';
    END IF;

    -- Insert the new daily question with language
    INSERT INTO daily_questions (date, question_id, question_text, category, difficulty, language)
    VALUES (
        target_date,
        selected_question.id,
        final_question_text,
        selected_question.category,
        selected_question.difficulty,
        p_language
    );

    -- Return the newly created question
    RETURN QUERY
    SELECT
        (SELECT dq.id FROM daily_questions dq WHERE dq.date = target_date AND dq.language = p_language),
        target_date,
        selected_question.id,
        final_question_text,
        selected_question.category,
        selected_question.difficulty,
        selected_question.correct_answer,
        jsonb_build_array(selected_question.correct_answer) || to_jsonb(selected_question.wrong_answers) as options,
        selected_question.image_url;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_or_create_daily_question(DATE, TEXT) TO authenticated, anon, service_role;
