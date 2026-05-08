-- Migration: Normalize question categories
-- Adds missing categories to categories table; merges tiny orphan categories.

-- Add missing categories
INSERT INTO categories (code, name, icon, color, is_active)
VALUES
  ('logo', 'Logos', '🏷️', '#a855f7', true),
  ('pop-culture', 'Pop Culture', '🌟', '#ec4899', true)
ON CONFLICT (code) DO NOTHING;

-- Merge tiny orphan categories into closest match
-- entertainment (34 questions) → cinema  (closest, both about media)
UPDATE questions SET category = 'cinema' WHERE category = 'entertainment';

-- food (25 questions) → general
UPDATE questions SET category = 'general' WHERE category = 'food';

-- Audit log
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM categories WHERE is_active = true;
  RAISE NOTICE 'Active categories now: %', v_count;
END $$;
