-- Migration: daily cron to flip upcoming → active + add 'math_facile' theme
--
-- Bug fixed here: the Sunday 23:30 generate cron creates next-week challenges
-- with start_date=Monday. The function's `start_date <= today` check evaluates
-- Sunday's date and marks them 'upcoming'. Nothing was activating them on
-- Monday morning, so they stayed hidden in the app.

CREATE OR REPLACE FUNCTION activate_due_weekly_challenges()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE v_count INTEGER;
BEGIN
  UPDATE weekly_challenges
     SET status = 'active', updated_at = NOW()
   WHERE status = 'upcoming' AND start_date <= CURRENT_DATE;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'activate-upcoming-challenges') THEN
    PERFORM cron.unschedule('activate-upcoming-challenges');
  END IF;
END $$;

SELECT cron.schedule(
  'activate-upcoming-challenges',
  '5 0 * * *',
  $cron$ SELECT activate_due_weekly_challenges(); $cron$
);

-- Add 'math_facile' theme to the rotation pool
INSERT INTO weekly_challenge_themes (slug, label_fr, label_en, description_fr, description_en, emoji, color, target_category, is_active)
VALUES (
  'math_facile',
  'Maths faciles',
  'Easy Maths',
  'Calculs, géométrie, logique — niveau accessible',
  'Calculations, geometry, logic — accessible level',
  '🧮',
  '#3b82f6',
  'general',
  true
)
ON CONFLICT (slug) DO NOTHING;
