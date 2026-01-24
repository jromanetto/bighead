-- Migration: Add min_age field to questions for Family Mode
-- Maps difficulty levels to appropriate age groups

-- ============================================
-- ADD MIN_AGE COLUMN
-- ============================================

-- Add min_age column if it doesn't exist
ALTER TABLE questions ADD COLUMN IF NOT EXISTS min_age INTEGER DEFAULT 12;

-- Add constraint to ensure valid age range
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_min_age_check;
ALTER TABLE questions ADD CONSTRAINT questions_min_age_check CHECK (min_age >= 6 AND min_age <= 99);

-- Create index for min_age queries
CREATE INDEX IF NOT EXISTS idx_questions_min_age ON questions(min_age);

-- ============================================
-- UPDATE EXISTING QUESTIONS BASED ON DIFFICULTY
-- ============================================

-- Map difficulty to min_age:
-- Difficulty 1 (very easy) → min_age 6 (young kids)
-- Difficulty 2 (easy) → min_age 8 (kids)
-- Difficulty 3 (medium) → min_age 12 (pre-teens)
-- Difficulty 4 (hard) → min_age 14 (teens)
-- Difficulty 5 (very hard) → min_age 16 (older teens/adults)

UPDATE questions SET min_age = 6 WHERE difficulty = 1;
UPDATE questions SET min_age = 8 WHERE difficulty = 2;
UPDATE questions SET min_age = 12 WHERE difficulty = 3;
UPDATE questions SET min_age = 14 WHERE difficulty = 4;
UPDATE questions SET min_age = 16 WHERE difficulty = 5;

-- ============================================
-- CREATE FAMILY MODE FUNCTION
-- ============================================

-- Function to get questions for Family mode
-- Filters by min_age and optionally by category
CREATE OR REPLACE FUNCTION get_family_questions(
  p_min_age INTEGER,
  p_category TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_language TEXT DEFAULT 'fr'
)
RETURNS TABLE (
  id UUID,
  question_text TEXT,
  correct_answer TEXT,
  category TEXT,
  difficulty INTEGER,
  min_age INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.id,
    q.question_text,
    q.correct_answer,
    q.category,
    q.difficulty,
    q.min_age
  FROM questions q
  WHERE q.is_active = true
    AND q.language = p_language
    AND q.min_age <= p_min_age
    AND (p_category IS NULL OR p_category = 'mix' OR q.category = p_category)
  ORDER BY RANDOM()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_family_questions TO authenticated;
GRANT EXECUTE ON FUNCTION get_family_questions TO anon;

-- ============================================
-- VERIFY MIGRATION
-- ============================================

-- Show count of questions by min_age
DO $$
DECLARE
  age_6 INTEGER;
  age_8 INTEGER;
  age_12 INTEGER;
  age_14 INTEGER;
  age_16 INTEGER;
BEGIN
  SELECT COUNT(*) INTO age_6 FROM questions WHERE min_age = 6;
  SELECT COUNT(*) INTO age_8 FROM questions WHERE min_age = 8;
  SELECT COUNT(*) INTO age_12 FROM questions WHERE min_age = 12;
  SELECT COUNT(*) INTO age_14 FROM questions WHERE min_age = 14;
  SELECT COUNT(*) INTO age_16 FROM questions WHERE min_age = 16;

  RAISE NOTICE 'Questions by min_age: 6+: %, 8+: %, 12+: %, 14+: %, 16+: %',
    age_6, age_8, age_12, age_14, age_16;
END $$;
