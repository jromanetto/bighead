-- BIGHEAD Initial Schema
-- Run this in Supabase SQL Editor

-- ===========================================
-- ENABLE EXTENSIONS
-- ===========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- USERS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ===========================================
-- CATEGORIES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (public read)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

-- ===========================================
-- QUESTIONS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 3),
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  wrong_answers TEXT[] NOT NULL,
  explanation TEXT,
  language TEXT DEFAULT 'fr',
  times_played INTEGER DEFAULT 0,
  times_correct INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_active ON public.questions(is_active) WHERE is_active = true;

-- Enable RLS (public read)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions are viewable by everyone"
  ON public.questions FOR SELECT
  USING (is_active = true);

-- ===========================================
-- GAMES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  mode TEXT NOT NULL CHECK (mode IN ('chain_solo', 'chain_duel', 'party')),
  score INTEGER NOT NULL DEFAULT 0,
  max_chain INTEGER DEFAULT 1,
  questions_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user games
CREATE INDEX IF NOT EXISTS idx_games_user ON public.games(user_id);
CREATE INDEX IF NOT EXISTS idx_games_created ON public.games(created_at DESC);

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Anyone can insert games (for guest mode)
CREATE POLICY "Anyone can create games"
  ON public.games FOR INSERT
  WITH CHECK (true);

-- Users can view their own games
CREATE POLICY "Users can view own games"
  ON public.games FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- ===========================================
-- GAME ANSWERS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.game_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL,
  player_name TEXT,
  is_correct BOOLEAN NOT NULL,
  answer_time_ms INTEGER,
  chain_multiplier INTEGER DEFAULT 1,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for game answers
CREATE INDEX IF NOT EXISTS idx_game_answers_game ON public.game_answers(game_id);

-- Enable RLS
ALTER TABLE public.game_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create game answers"
  ON public.game_answers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Game answers follow game visibility"
  ON public.game_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.games g
      WHERE g.id = game_id
      AND (auth.uid() = g.user_id OR g.user_id IS NULL)
    )
  );

-- ===========================================
-- CHALLENGES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  creator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  question_ids UUID[] NOT NULL,
  mode TEXT DEFAULT 'chain_solo',
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for challenge lookup
CREATE INDEX IF NOT EXISTS idx_challenges_code ON public.challenges(code);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenges are viewable by everyone"
  ON public.challenges FOR SELECT
  USING (expires_at > NOW());

CREATE POLICY "Authenticated users can create challenges"
  ON public.challenges FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ===========================================
-- CHALLENGE ATTEMPTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.challenge_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  game_id UUID REFERENCES public.games(id) ON DELETE SET NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.challenge_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenge attempts are viewable by everyone"
  ON public.challenge_attempts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create attempts"
  ON public.challenge_attempts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ===========================================
-- USER CATEGORY STATS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.user_category_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  questions_played INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  best_chain INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- Enable RLS
ALTER TABLE public.user_category_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats"
  ON public.user_category_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON public.user_category_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON public.user_category_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ===========================================
-- LEADERBOARD VIEW
-- ===========================================
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  u.id,
  u.username,
  u.avatar_url,
  u.total_xp,
  u.level,
  u.games_played,
  RANK() OVER (ORDER BY u.total_xp DESC) as rank
FROM public.users u
WHERE u.total_xp > 0
ORDER BY u.total_xp DESC
LIMIT 100;

-- ===========================================
-- FUNCTIONS
-- ===========================================

-- Function to generate random challenge code
CREATE OR REPLACE FUNCTION generate_challenge_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update user stats after a game
CREATE OR REPLACE FUNCTION update_user_stats_after_game()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user totals
  IF NEW.user_id IS NOT NULL THEN
    UPDATE public.users
    SET
      total_xp = total_xp + NEW.score,
      games_played = games_played + 1,
      level = GREATEST(1, FLOOR(SQRT(total_xp / 100)) + 1),
      updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating user stats
DROP TRIGGER IF EXISTS on_game_created ON public.games;
CREATE TRIGGER on_game_created
  AFTER INSERT ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_after_game();

-- Function to update question stats
CREATE OR REPLACE FUNCTION update_question_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.questions
  SET
    times_played = times_played + 1,
    times_correct = times_correct + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END
  WHERE id = NEW.question_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating question stats
DROP TRIGGER IF EXISTS on_answer_created ON public.game_answers;
CREATE TRIGGER on_answer_created
  AFTER INSERT ON public.game_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_question_stats();

-- ===========================================
-- HANDLE NEW USER SIGNUP
-- ===========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Player_' || substr(NEW.id::text, 1, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
