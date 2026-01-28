-- Fix: Correct column names in get_or_create_daily_question function

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

    -- Select a random question that hasn't been used recently (last 30 days)
    SELECT q.* INTO selected_question
    FROM questions q
    WHERE q.id NOT IN (
        SELECT dq.question_id
        FROM daily_questions dq
        WHERE dq.date > target_date - INTERVAL '30 days'
    )
    AND q.language = 'fr'  -- French questions for now
    AND q.is_active = true
    ORDER BY RANDOM()
    LIMIT 1;

    -- If no question found (unlikely), just get any random one
    IF selected_question.id IS NULL THEN
        SELECT q.* INTO selected_question
        FROM questions q
        WHERE q.language = 'fr'
        AND q.is_active = true
        ORDER BY RANDOM()
        LIMIT 1;
    END IF;

    -- Insert the new daily question
    INSERT INTO daily_questions (date, question_id, question_text, category, difficulty)
    VALUES (
        target_date,
        selected_question.id,
        selected_question.question_text,
        selected_question.category,
        selected_question.difficulty
    );

    -- Return the newly created question
    RETURN QUERY
    SELECT
        (SELECT dq.id FROM daily_questions dq WHERE dq.date = target_date),
        target_date,
        selected_question.id,
        selected_question.question_text,
        selected_question.category,
        selected_question.difficulty,
        selected_question.correct_answer,
        jsonb_build_array(selected_question.correct_answer) || to_jsonb(selected_question.wrong_answers) as options;
END;
$$ LANGUAGE plpgsql;
