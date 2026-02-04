-- App Feedback table for storing user ratings and feedback
-- Used by the Rate the App feature

CREATE TABLE IF NOT EXISTS app_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  app_version TEXT,
  device_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX idx_app_feedback_created_at ON app_feedback(created_at DESC);
CREATE INDEX idx_app_feedback_rating ON app_feedback(rating);

-- RLS policies
ALTER TABLE app_feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users can insert feedback"
  ON app_feedback
  FOR INSERT
  WITH CHECK (true);

-- Only service role can read all feedback (for analytics)
CREATE POLICY "Service role can read all feedback"
  ON app_feedback
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Grant insert to authenticated and anon users
GRANT INSERT ON app_feedback TO authenticated, anon;
