-- Add referral system columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_reward_claimed BOOLEAN DEFAULT FALSE;

-- Create index for referral lookups
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);

-- Function to generate referral code for existing users
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := UPPER(
      COALESCE(SUBSTRING(NEW.username FROM 1 FOR 4), 'BH') ||
      SUBSTRING(NEW.id::TEXT FROM 1 FOR 6)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code on user creation
DROP TRIGGER IF EXISTS trigger_generate_referral_code ON users;
CREATE TRIGGER trigger_generate_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION generate_referral_code();

-- Update existing users to have referral codes
UPDATE users
SET referral_code = UPPER(
  COALESCE(SUBSTRING(username FROM 1 FOR 4), 'BH') ||
  SUBSTRING(id::TEXT FROM 1 FOR 6)
)
WHERE referral_code IS NULL;

-- Function to apply referral and award coins
CREATE OR REPLACE FUNCTION apply_referral(
  p_user_id UUID,
  p_referral_code TEXT
)
RETURNS JSON AS $$
DECLARE
  v_referrer_id UUID;
  v_referrer_xp INTEGER;
  v_user_xp INTEGER;
  v_reward INTEGER := 500;
BEGIN
  -- Find referrer
  SELECT id, total_xp INTO v_referrer_id, v_referrer_xp
  FROM users
  WHERE referral_code = UPPER(p_referral_code);

  IF v_referrer_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid referral code');
  END IF;

  -- Check self-referral
  IF v_referrer_id = p_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot use your own code');
  END IF;

  -- Check if already referred
  IF EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND referred_by IS NOT NULL) THEN
    RETURN json_build_object('success', false, 'error', 'Already used a referral code');
  END IF;

  -- Get user current XP
  SELECT total_xp INTO v_user_xp FROM users WHERE id = p_user_id;

  -- Apply referral
  UPDATE users SET referred_by = UPPER(p_referral_code) WHERE id = p_user_id;

  -- Award coins to both
  UPDATE users SET total_xp = total_xp + v_reward WHERE id = v_referrer_id;
  UPDATE users SET total_xp = total_xp + v_reward WHERE id = p_user_id;

  RETURN json_build_object('success', true, 'reward', v_reward);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION apply_referral TO authenticated;
GRANT EXECUTE ON FUNCTION apply_referral TO anon;
