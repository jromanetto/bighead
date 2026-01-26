-- Create daily survival results table
CREATE TABLE IF NOT EXISTS public.daily_survival_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    time_ms INTEGER,
    best_score INTEGER GENERATED ALWAYS AS (score) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,

    -- One result per user per day
    UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_survival_results ENABLE ROW LEVEL SECURITY;

-- Users can read their own results
CREATE POLICY "Users can view own daily survival results"
ON public.daily_survival_results FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own results
CREATE POLICY "Users can insert own daily survival results"
ON public.daily_survival_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_daily_survival_user_date
ON public.daily_survival_results(user_id, date);

-- Create index for leaderboard queries
CREATE INDEX idx_daily_survival_date_score
ON public.daily_survival_results(date, score DESC);

-- Function to get today's leaderboard
CREATE OR REPLACE FUNCTION get_daily_survival_leaderboard(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    rank BIGINT,
    user_id UUID,
    username TEXT,
    avatar_url TEXT,
    score INTEGER,
    time_ms INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ROW_NUMBER() OVER (ORDER BY dsr.score DESC, dsr.time_ms ASC) as rank,
        dsr.user_id,
        u.username,
        u.avatar_url,
        dsr.score,
        dsr.time_ms
    FROM daily_survival_results dsr
    JOIN users u ON u.id = dsr.user_id
    WHERE dsr.date = CURRENT_DATE
    ORDER BY dsr.score DESC, dsr.time_ms ASC
    LIMIT p_limit;
END;
$$;
