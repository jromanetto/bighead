-- Expand difficulty levels from 1-3 to 1-5 for Adventure Mode

-- Drop the existing constraint
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_difficulty_check;

-- Add new constraint allowing 1-5
ALTER TABLE questions ADD CONSTRAINT questions_difficulty_check CHECK (difficulty >= 1 AND difficulty <= 5);
