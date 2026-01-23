-- Migration: Add premium status to users
-- Premium users get access to duels, exclusive themes, etc.

-- Add premium columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ;

-- Create index for premium users
CREATE INDEX IF NOT EXISTS idx_users_premium ON users(is_premium) WHERE is_premium = true;

-- Function to check if user is premium (handles expiration)
CREATE OR REPLACE FUNCTION is_user_premium(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_premium BOOLEAN;
  expires_at TIMESTAMPTZ;
BEGIN
  SELECT is_premium, premium_expires_at
  INTO user_premium, expires_at
  FROM users
  WHERE id = p_user_id;

  IF user_premium IS NULL OR user_premium = false THEN
    RETURN false;
  END IF;

  -- If no expiration date, it's lifetime premium
  IF expires_at IS NULL THEN
    RETURN true;
  END IF;

  -- Check if still valid
  RETURN expires_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to grant premium (called after purchase)
CREATE OR REPLACE FUNCTION grant_premium(
  p_user_id UUID,
  p_duration_days INTEGER DEFAULT NULL -- NULL = lifetime
)
RETURNS BOOLEAN AS $$
DECLARE
  new_expires_at TIMESTAMPTZ;
BEGIN
  IF p_duration_days IS NOT NULL THEN
    -- Check if user already has premium and extend it
    SELECT
      CASE
        WHEN premium_expires_at IS NOT NULL AND premium_expires_at > NOW()
        THEN premium_expires_at + (p_duration_days || ' days')::INTERVAL
        ELSE NOW() + (p_duration_days || ' days')::INTERVAL
      END
    INTO new_expires_at
    FROM users
    WHERE id = p_user_id;
  ELSE
    new_expires_at := NULL; -- Lifetime
  END IF;

  UPDATE users
  SET
    is_premium = true,
    premium_expires_at = new_expires_at,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION is_user_premium TO authenticated, anon;
GRANT EXECUTE ON FUNCTION grant_premium TO authenticated;
