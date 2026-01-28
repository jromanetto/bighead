-- Migration: Daily Notifications System
-- Adds infrastructure for daily push notifications with question of the day

-- 1. Add missing column for push token tracking
ALTER TABLE users
ADD COLUMN IF NOT EXISTS push_token_updated_at TIMESTAMPTZ;

-- Update existing tokens to have a timestamp
UPDATE users
SET push_token_updated_at = NOW()
WHERE push_token IS NOT NULL AND push_token_updated_at IS NULL;

-- 2. Create daily_questions table to store the question of the day
CREATE TABLE IF NOT EXISTS daily_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    question_id UUID NOT NULL REFERENCES questions(id),
    question_text TEXT NOT NULL,
    category TEXT,
    difficulty INTEGER,
    notifications_sent INTEGER DEFAULT 0,
    notifications_failed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups by date
CREATE INDEX IF NOT EXISTS idx_daily_questions_date ON daily_questions(date DESC);

-- 3. Create notification_logs table to track sent notifications
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_question_id UUID REFERENCES daily_questions(id),
    user_id UUID REFERENCES users(id),
    push_token TEXT NOT NULL,
    status TEXT NOT NULL, -- 'sent', 'failed', 'invalid_token'
    error_message TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_notification_logs_daily ON notification_logs(daily_question_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user ON notification_logs(user_id);

-- 4. Function to select today's question (or create if not exists)
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
            jsonb_build_array(q.correct_answer, q.wrong_answer1, q.wrong_answer2, q.wrong_answer3) as options
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
    ORDER BY RANDOM()
    LIMIT 1;

    -- If no question found (unlikely), just get any random one
    IF selected_question.id IS NULL THEN
        SELECT q.* INTO selected_question
        FROM questions q
        WHERE q.language = 'fr'
        ORDER BY RANDOM()
        LIMIT 1;
    END IF;

    -- Insert the new daily question
    INSERT INTO daily_questions (date, question_id, question_text, category, difficulty)
    VALUES (
        target_date,
        selected_question.id,
        selected_question.question,
        selected_question.category,
        selected_question.difficulty
    );

    -- Return the newly created question
    RETURN QUERY
    SELECT
        (SELECT dq.id FROM daily_questions dq WHERE dq.date = target_date),
        target_date,
        selected_question.id,
        selected_question.question,
        selected_question.category,
        selected_question.difficulty,
        selected_question.correct_answer,
        jsonb_build_array(
            selected_question.correct_answer,
            selected_question.wrong_answer1,
            selected_question.wrong_answer2,
            selected_question.wrong_answer3
        ) as options;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to get all active push tokens for notifications
CREATE OR REPLACE FUNCTION get_active_push_tokens()
RETURNS TABLE (
    user_id UUID,
    push_token TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.push_token
    FROM users u
    WHERE u.push_token IS NOT NULL
    AND u.push_token != ''
    AND u.push_token LIKE 'ExponentPushToken%'
    -- Only tokens updated in the last 30 days (active users)
    AND (u.push_token_updated_at IS NULL OR u.push_token_updated_at > NOW() - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql;

-- 6. Function to log notification results
CREATE OR REPLACE FUNCTION log_notification_result(
    p_daily_question_id UUID,
    p_user_id UUID,
    p_push_token TEXT,
    p_status TEXT,
    p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO notification_logs (daily_question_id, user_id, push_token, status, error_message)
    VALUES (p_daily_question_id, p_user_id, p_push_token, p_status, p_error_message);

    -- Update counters on daily_questions
    IF p_status = 'sent' THEN
        UPDATE daily_questions
        SET notifications_sent = notifications_sent + 1
        WHERE id = p_daily_question_id;
    ELSE
        UPDATE daily_questions
        SET notifications_failed = notifications_failed + 1
        WHERE id = p_daily_question_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON daily_questions TO authenticated, anon;
GRANT SELECT ON notification_logs TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_daily_question TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_active_push_tokens TO service_role;
GRANT EXECUTE ON FUNCTION log_notification_result TO service_role;
