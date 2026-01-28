-- Fix: Replace . with ? at the end of questions

-- Delete today's logs and question to regenerate
DELETE FROM notification_logs
WHERE daily_question_id IN (SELECT id FROM daily_questions WHERE date = CURRENT_DATE);
DELETE FROM daily_questions WHERE date = CURRENT_DATE;

-- Update function to replace . with ? at the end
CREATE OR REPLACE FUNCTION get_or_create_daily_question(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    id UUID,
    date DATE,
    question_id UUID,
    question_text TEXT,
    category TEXT,
    difficulty INTEGER,
    correct_answer TEXT,
    options JSONB
) AS $$
DECLARE
    existing_record RECORD;
    selected_question RECORD;
    final_question_text TEXT;
BEGIN
    -- Check if we already have a question for this date
    SELECT dq.* INTO existing_record
    FROM daily_questions dq
    WHERE dq.date = target_date;

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
            jsonb_build_array(q.correct_answer) || to_jsonb(q.wrong_answers) as options
        FROM questions q
        WHERE q.id = existing_record.question_id;
        RETURN;
    END IF;

    -- Select a random FRENCH question that hasn't been used recently (last 30 days)
    SELECT q.* INTO selected_question
    FROM questions q
    WHERE q.id NOT IN (
        SELECT dq.question_id
        FROM daily_questions dq
        WHERE dq.date > target_date - INTERVAL '30 days'
    )
    AND q.language = 'fr'
    AND q.is_active = true
    ORDER BY RANDOM()
    LIMIT 1;

    -- If no question found (unlikely), just get any random French one
    IF selected_question.id IS NULL THEN
        SELECT q.* INTO selected_question
        FROM questions q
        WHERE q.language = 'fr'
        AND q.is_active = true
        ORDER BY RANDOM()
        LIMIT 1;
    END IF;

    -- Ensure question ends with ?
    final_question_text := TRIM(selected_question.question_text);

    -- Replace trailing . with ?
    IF RIGHT(final_question_text, 1) = '.' THEN
        final_question_text := LEFT(final_question_text, LENGTH(final_question_text) - 1) || ' ?';
    -- Add ? if no punctuation at the end
    ELSIF RIGHT(final_question_text, 1) NOT IN ('?', '!', '.') THEN
        final_question_text := final_question_text || ' ?';
    END IF;

    -- Insert the new daily question
    INSERT INTO daily_questions (date, question_id, question_text, category, difficulty)
    VALUES (
        target_date,
        selected_question.id,
        final_question_text,
        selected_question.category,
        selected_question.difficulty
    );

    -- Return the newly created question
    RETURN QUERY
    SELECT
        (SELECT dq.id FROM daily_questions dq WHERE dq.date = target_date),
        target_date,
        selected_question.id,
        final_question_text,
        selected_question.category,
        selected_question.difficulty,
        selected_question.correct_answer,
        jsonb_build_array(selected_question.correct_answer) || to_jsonb(selected_question.wrong_answers) as options;
END;
$$ LANGUAGE plpgsql;
