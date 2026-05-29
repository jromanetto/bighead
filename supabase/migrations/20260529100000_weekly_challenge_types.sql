-- Migration: Add challenge_type discriminator to weekly_challenges.
--
-- Introduces a second weekly challenge flavour that runs IN PARALLEL with the
-- existing themed challenge: 'news' (current events quiz sourced from Wikipedia
-- Current Events). Both types coexist; the app filters by challenge_type.
--
--   'themed' -> existing behaviour (default, backfilled for all current rows)
--   'news'   -> weekly current-events quiz, no question migration on close

ALTER TABLE public.weekly_challenges
  ADD COLUMN IF NOT EXISTS challenge_type TEXT NOT NULL DEFAULT 'themed'
    CHECK (challenge_type IN ('themed', 'news'));

-- Backfill: the DEFAULT 'themed' already applies to existing rows, but we make
-- it explicit/idempotent in case the column pre-existed without a value.
UPDATE public.weekly_challenges
SET challenge_type = 'themed'
WHERE challenge_type IS NULL;

-- Index to fetch the active challenge of a given type quickly (used by the app
-- service getActiveWeeklyChallenge(type) and by close/generate edge functions).
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_type_status
  ON public.weekly_challenges (challenge_type, status);

COMMENT ON COLUMN public.weekly_challenges.challenge_type IS
  'Challenge flavour: themed (classic weekly theme) or news (weekly current-events quiz). '
  'News challenges are NOT migrated into the main questions table on close.';

-- weekly_challenges.theme_slug has a FK to weekly_challenge_themes.slug. News
-- challenges all reference a single permanent 'news' theme row so they satisfy
-- the constraint without polluting the themed rotation. is_active = FALSE keeps
-- pick_next_weekly_theme() (themed generator) from ever selecting it.
INSERT INTO public.weekly_challenge_themes
  (slug, label_fr, label_en, description_fr, description_en, emoji, color, target_category, is_active)
VALUES
  ('news', 'L''actu de la semaine', 'This Week in News',
   'Teste-toi sur l''actualité des 7 derniers jours', 'Test yourself on the last 7 days of news',
   '📰', '#0ea5e9', 'general', FALSE)
ON CONFLICT (slug) DO NOTHING;
