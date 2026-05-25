-- Migration: Weekly Challenges
-- Creates the data model for the automated weekly themed quiz (30 Q / semaine).
-- 1. weekly_challenge_themes : pool of rotating themes
-- 2. weekly_challenges       : one row per weekly run (active/closed/archived)
-- 3. weekly_challenge_questions : 30 questions per challenge, bilingual FR+EN
-- 4. weekly_challenge_progress  : per-user progress + streak + final score

-- =====================================================================
-- 1. Theme pool
-- =====================================================================
CREATE TABLE IF NOT EXISTS weekly_challenge_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  label_fr TEXT NOT NULL,
  label_en TEXT NOT NULL,
  description_fr TEXT,
  description_en TEXT,
  emoji TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  target_category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekly_themes_active_last
  ON weekly_challenge_themes (is_active, last_used_at NULLS FIRST);

-- =====================================================================
-- 2. Weekly challenges (one row per week)
-- =====================================================================
CREATE TABLE IF NOT EXISTS weekly_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  theme_slug TEXT NOT NULL REFERENCES weekly_challenge_themes(slug) ON DELETE RESTRICT,
  theme_label_fr TEXT NOT NULL,
  theme_label_en TEXT NOT NULL,
  description_fr TEXT,
  description_en TEXT,
  emoji TEXT NOT NULL,
  color TEXT NOT NULL,
  target_category TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming'
    CHECK (status IN ('upcoming','active','closed','archived','failed')),
  generation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (generation_status IN ('pending','generating','ready','failed')),
  generation_error TEXT,
  total_questions INTEGER NOT NULL DEFAULT 30,
  total_players INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_weekly_challenges_status
  ON weekly_challenges (status, end_date);
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_active
  ON weekly_challenges (status) WHERE status = 'active';

-- =====================================================================
-- 3. Bilingual questions per challenge
-- =====================================================================
CREATE TABLE IF NOT EXISTS weekly_challenge_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES weekly_challenges(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 30),
  difficulty INTEGER NOT NULL DEFAULT 2 CHECK (difficulty BETWEEN 1 AND 3),

  question_fr TEXT NOT NULL,
  correct_answer_fr TEXT NOT NULL,
  wrong_answers_fr TEXT[] NOT NULL,
  learning_fact_fr TEXT,

  question_en TEXT NOT NULL,
  correct_answer_en TEXT NOT NULL,
  wrong_answers_en TEXT[] NOT NULL,
  learning_fact_en TEXT,

  image_url TEXT,
  image_credit TEXT,

  -- Once the challenge is archived, these point to rows inserted into `questions`
  archived_question_id_fr UUID REFERENCES questions(id) ON DELETE SET NULL,
  archived_question_id_en UUID REFERENCES questions(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (challenge_id, position)
);

CREATE INDEX IF NOT EXISTS idx_wc_questions_challenge
  ON weekly_challenge_questions (challenge_id, position);

-- =====================================================================
-- 4. Per-user progress + per-day quota tracking + final score
-- =====================================================================
CREATE TABLE IF NOT EXISTS weekly_challenge_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES weekly_challenges(id) ON DELETE CASCADE,

  current_position INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,

  -- {"2026-05-26": 5, "2026-05-27": 3} → used for daily quota + streak
  daily_play_counts JSONB NOT NULL DEFAULT '{}'::jsonb,
  day_streak INTEGER NOT NULL DEFAULT 0,
  best_day_streak INTEGER NOT NULL DEFAULT 0,

  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_played_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  final_score INTEGER,
  final_xp_awarded INTEGER NOT NULL DEFAULT 0,
  badge_earned TEXT,

  UNIQUE (user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_wc_progress_challenge_score
  ON weekly_challenge_progress (challenge_id, correct_count DESC);
CREATE INDEX IF NOT EXISTS idx_wc_progress_user
  ON weekly_challenge_progress (user_id, last_played_at DESC);

-- =====================================================================
-- 5. Trigger : keep total_players in sync
-- =====================================================================
CREATE OR REPLACE FUNCTION bump_weekly_challenge_players()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE weekly_challenges
     SET total_players = total_players + 1,
         updated_at = NOW()
   WHERE id = NEW.challenge_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_bump_wc_players ON weekly_challenge_progress;
CREATE TRIGGER trg_bump_wc_players
  AFTER INSERT ON weekly_challenge_progress
  FOR EACH ROW EXECUTE FUNCTION bump_weekly_challenge_players();

-- =====================================================================
-- 6. RLS
-- =====================================================================
ALTER TABLE weekly_challenge_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_challenges       ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_challenge_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_challenge_progress  ENABLE ROW LEVEL SECURITY;

-- Themes : read-only for all clients (used in app UI to preview history)
DROP POLICY IF EXISTS "themes_read_all" ON weekly_challenge_themes;
CREATE POLICY "themes_read_all" ON weekly_challenge_themes
  FOR SELECT USING (TRUE);

-- Challenges : everyone can read (active/closed/archived)
DROP POLICY IF EXISTS "challenges_read_all" ON weekly_challenges;
CREATE POLICY "challenges_read_all" ON weekly_challenges
  FOR SELECT USING (status IN ('active','closed','archived'));

-- Questions : only readable while parent challenge is active or closed
DROP POLICY IF EXISTS "wc_questions_read_visible" ON weekly_challenge_questions;
CREATE POLICY "wc_questions_read_visible" ON weekly_challenge_questions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM weekly_challenges c
    WHERE c.id = challenge_id AND c.status IN ('active','closed')
  ));

-- Progress : users see/update only their own row, leaderboard goes via RPC
DROP POLICY IF EXISTS "wc_progress_own_select" ON weekly_challenge_progress;
DROP POLICY IF EXISTS "wc_progress_own_insert" ON weekly_challenge_progress;
DROP POLICY IF EXISTS "wc_progress_own_update" ON weekly_challenge_progress;
CREATE POLICY "wc_progress_own_select" ON weekly_challenge_progress
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "wc_progress_own_insert" ON weekly_challenge_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "wc_progress_own_update" ON weekly_challenge_progress
  FOR UPDATE USING (user_id = auth.uid());

-- =====================================================================
-- 7. Seed theme pool (30 themes for ~7 months of rotation)
-- =====================================================================
INSERT INTO weekly_challenge_themes (slug, label_fr, label_en, description_fr, description_en, emoji, color, target_category) VALUES
  ('automobile_brands',     'Marques automobiles',      'Car brands',              'Plonge dans l''histoire des grands constructeurs',         'Dive into the history of legendary car makers',          '🚗', '#ef4444', 'general'),
  ('country_japan',         'Le Japon',                  'Japan',                   'Culture, géographie et histoire du pays du soleil levant', 'Culture, geography and history of the land of the rising sun', '🇯🇵', '#dc2626', 'geography'),
  ('country_brazil',        'Le Brésil',                 'Brazil',                  'Découvre la samba, le foot et l''Amazonie',                'Discover samba, football and the Amazon',                '🇧🇷', '#16a34a', 'geography'),
  ('country_italy',         'L''Italie',                 'Italy',                   'De Rome à la Renaissance',                                 'From Rome to the Renaissance',                           '🇮🇹', '#16a34a', 'geography'),
  ('country_germany',       'L''Allemagne',              'Germany',                 'Histoire, culture et innovations allemandes',              'German history, culture and innovations',                '🇩🇪', '#facc15', 'geography'),
  ('country_egypt',         'L''Égypte',                 'Egypt',                   'Pharaons, pyramides et hiéroglyphes',                      'Pharaohs, pyramids and hieroglyphs',                     '🇪🇬', '#ca8a04', 'history'),
  ('country_australia',     'L''Australie',              'Australia',               'Faune, outback et culture aborigène',                      'Wildlife, outback and aboriginal culture',               '🇦🇺', '#0891b2', 'geography'),
  ('country_mexico',        'Le Mexique',                'Mexico',                  'Aztèques, tequila et cuisine épicée',                      'Aztecs, tequila and spicy cuisine',                      '🇲🇽', '#dc2626', 'geography'),
  ('sport_nba',             'La NBA',                    'The NBA',                 'Légendes du basket américain',                             'Legends of American basketball',                         '🏀', '#ea580c', 'sport'),
  ('sport_tour_france',     'Le Tour de France',         'Tour de France',          'La grande boucle dans tous ses détails',                   'The great loop in every detail',                         '🚴', '#facc15', 'sport'),
  ('sport_football_wc',     'La Coupe du Monde',         'FIFA World Cup',          'Histoire de la compétition reine',                          'History of the greatest tournament',                     '⚽', '#22c55e', 'sport'),
  ('sport_olympics',        'Les Jeux Olympiques',       'The Olympic Games',       'De l''antiquité à Paris 2024',                              'From antiquity to Paris 2024',                           '🏅', '#fbbf24', 'sport'),
  ('sport_tennis',          'Le tennis',                 'Tennis',                  'Grand Chelem, légendes et records',                        'Grand Slam, legends and records',                        '🎾', '#84cc16', 'sport'),
  ('decade_80s',            'Les années 80',             'The 80s',                 'Musique, films et culture pop des 80s',                    '80s music, movies and pop culture',                      '📼', '#ec4899', 'pop-culture'),
  ('decade_90s',            'Les années 90',             'The 90s',                 'L''âge d''or de la pop culture',                            'The golden age of pop culture',                          '💿', '#a855f7', 'pop-culture'),
  ('decade_2000s',          'Les années 2000',           'The 2000s',               'iPods, Friends et début d''Internet',                      'iPods, Friends and the early Internet',                  '📱', '#3b82f6', 'pop-culture'),
  ('topic_space',           'L''espace',                 'Space',                   'Planètes, étoiles et exploration spatiale',                'Planets, stars and space exploration',                   '🚀', '#1e40af', 'science'),
  ('topic_dinosaurs',       'Les dinosaures',            'Dinosaurs',               'Vie et extinction des géants préhistoriques',              'Life and extinction of prehistoric giants',              '🦖', '#65a30d', 'nature'),
  ('topic_mythology_greek', 'Mythologie grecque',        'Greek mythology',         'Dieux, héros et créatures de l''Olympe',                   'Gods, heroes and creatures of Olympus',                  '⚡', '#0ea5e9', 'history'),
  ('topic_world_wars',      'Les guerres mondiales',     'World Wars',              '1914-1945 : un demi-siècle qui a changé le monde',         '1914-1945: half a century that changed the world',       '🪖', '#737373', 'history'),
  ('topic_music_classical', 'Musique classique',         'Classical music',         'De Bach à Stravinsky',                                     'From Bach to Stravinsky',                                '🎻', '#7c3aed', 'music'),
  ('topic_music_rock',      'Rock & métal',              'Rock & metal',            'Histoire du rock, des Beatles à Metallica',                'History of rock, from Beatles to Metallica',             '🎸', '#dc2626', 'music'),
  ('topic_cuisine_world',   'Cuisines du monde',         'World cuisines',          'Plats emblématiques de chaque continent',                  'Iconic dishes from every continent',                     '🍜', '#f97316', 'general'),
  ('topic_wine',            'Le vin',                    'Wine',                    'Cépages, régions et œnologie',                             'Grapes, regions and winemaking',                         '🍷', '#991b1b', 'general'),
  ('topic_cinema_oscars',   'Les Oscars',                'The Oscars',              'Histoire et palmarès de la cérémonie',                     'History and winners of the ceremony',                    '🏆', '#fbbf24', 'cinema'),
  ('topic_cinema_disney',   'L''univers Disney',         'The Disney universe',     'Classiques d''animation et Pixar',                         'Classic animation and Pixar',                            '🏰', '#0ea5e9', 'cinema'),
  ('topic_inventions',      'Les grandes inventions',    'Great inventions',        'Découvertes qui ont changé l''humanité',                   'Discoveries that changed humanity',                      '💡', '#eab308', 'science'),
  ('topic_animals_wild',    'Animaux sauvages',          'Wild animals',            'Faune des cinq continents',                                'Wildlife from five continents',                          '🦁', '#ca8a04', 'animals'),
  ('topic_oceans',          'Les océans',                'The oceans',              'Vie marine et profondeurs abyssales',                      'Marine life and the deep sea',                           '🌊', '#0284c7', 'nature'),
  ('topic_capitals',        'Les capitales',             'World capitals',          'Toutes les capitales du monde et leurs secrets',           'World capitals and their secrets',                       '🌍', '#10b981', 'geography')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================================
-- 8. Helper RPCs
-- =====================================================================

-- Pick the next theme to use (least-recently-used, or never used)
CREATE OR REPLACE FUNCTION pick_next_weekly_theme()
RETURNS weekly_challenge_themes
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_theme weekly_challenge_themes;
BEGIN
  SELECT * INTO v_theme
  FROM weekly_challenge_themes
  WHERE is_active = TRUE
  ORDER BY last_used_at NULLS FIRST, RANDOM()
  LIMIT 1;
  RETURN v_theme;
END;
$$;

GRANT EXECUTE ON FUNCTION pick_next_weekly_theme TO service_role;

-- Leaderboard for a specific challenge
CREATE OR REPLACE FUNCTION get_weekly_challenge_leaderboard(
  p_challenge_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  correct_count INTEGER,
  current_position INTEGER,
  day_streak INTEGER,
  completed_at TIMESTAMPTZ,
  rank BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.user_id,
    u.username,
    u.avatar_url,
    p.correct_count,
    p.current_position,
    p.day_streak,
    p.completed_at,
    ROW_NUMBER() OVER (
      ORDER BY p.correct_count DESC,
               p.completed_at NULLS LAST,
               p.last_played_at
    ) AS rank
  FROM weekly_challenge_progress p
  JOIN users u ON u.id = p.user_id
  WHERE p.challenge_id = p_challenge_id
    AND u.username IS NOT NULL
  ORDER BY rank
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION get_weekly_challenge_leaderboard TO authenticated, anon, service_role;

-- Submit a single answer + update progress / streak atomically
CREATE OR REPLACE FUNCTION submit_weekly_answer(
  p_challenge_id UUID,
  p_position INTEGER,
  p_is_correct BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_today DATE := CURRENT_DATE;
  v_today_key TEXT := v_today::text;
  v_progress weekly_challenge_progress;
  v_today_count INTEGER;
  v_yesterday DATE := v_today - INTERVAL '1 day';
  v_played_yesterday BOOLEAN;
  v_new_streak INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  -- Lock or create the progress row
  SELECT * INTO v_progress
  FROM weekly_challenge_progress
  WHERE user_id = v_user_id AND challenge_id = p_challenge_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO weekly_challenge_progress (user_id, challenge_id)
    VALUES (v_user_id, p_challenge_id)
    RETURNING * INTO v_progress;
  END IF;

  -- Idempotency : refuse out-of-sequence answers
  IF p_position <> v_progress.current_position + 1 THEN
    RAISE EXCEPTION 'expected position %, got %', v_progress.current_position + 1, p_position;
  END IF;

  v_today_count := COALESCE((v_progress.daily_play_counts->>v_today_key)::int, 0);

  -- Streak update : +1 if played yesterday, reset to 1 if first play today
  IF (v_progress.daily_play_counts ? v_today_key) THEN
    v_new_streak := v_progress.day_streak;  -- already counted today
  ELSE
    v_played_yesterday := v_progress.daily_play_counts ? v_yesterday::text;
    v_new_streak := CASE WHEN v_played_yesterday THEN v_progress.day_streak + 1 ELSE 1 END;
  END IF;

  UPDATE weekly_challenge_progress SET
    current_position = current_position + 1,
    correct_count    = correct_count + CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    daily_play_counts = daily_play_counts || jsonb_build_object(v_today_key, v_today_count + 1),
    day_streak       = v_new_streak,
    best_day_streak  = GREATEST(best_day_streak, v_new_streak),
    last_played_at   = NOW(),
    completed_at     = CASE WHEN current_position + 1 >= 30 THEN NOW() ELSE completed_at END
  WHERE id = v_progress.id
  RETURNING * INTO v_progress;

  RETURN jsonb_build_object(
    'current_position', v_progress.current_position,
    'correct_count',    v_progress.correct_count,
    'day_streak',       v_progress.day_streak,
    'completed',        v_progress.completed_at IS NOT NULL,
    'today_count',      (v_progress.daily_play_counts->>v_today_key)::int
  );
END;
$$;

GRANT EXECUTE ON FUNCTION submit_weekly_answer TO authenticated;

DO $$
DECLARE
  v_themes INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_themes FROM weekly_challenge_themes;
  RAISE NOTICE 'Weekly challenges schema ready · % themes seeded', v_themes;
END $$;
