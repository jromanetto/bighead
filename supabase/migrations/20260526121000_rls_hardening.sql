-- Migration: RLS hardening
--
-- Goals:
-- 1. Enable RLS on instagram_posts + reddit_posts (currently public-writable!)
-- 2. Convert leaderboard view from SECURITY DEFINER to security_invoker=on
-- 3. Tighten 5 INSERT policies that currently allow WITH CHECK (true)
--    to require auth.uid() = user_id (or equivalent column).

-- ============================================================
-- 1. instagram_posts + reddit_posts: enable RLS, service-only
-- ============================================================

ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reddit_posts ENABLE ROW LEVEL SECURITY;

-- Drop any pre-existing policies just in case
DROP POLICY IF EXISTS "Service role full access" ON public.instagram_posts;
DROP POLICY IF EXISTS "Service role full access" ON public.reddit_posts;

CREATE POLICY "Service role full access" ON public.instagram_posts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON public.reddit_posts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 2. leaderboard view: security_invoker
-- ============================================================

DROP VIEW IF EXISTS public.leaderboard;
CREATE VIEW public.leaderboard
WITH (security_invoker = on) AS
SELECT
  u.id,
  u.username,
  u.avatar_url,
  u.total_xp,
  u.level,
  u.games_played,
  u.best_chain,
  ROW_NUMBER() OVER (ORDER BY u.total_xp DESC) AS rank
FROM public.users u
WHERE u.username IS NOT NULL
  AND u.total_xp > 0;

GRANT SELECT ON public.leaderboard TO authenticated;
GRANT SELECT ON public.leaderboard TO anon;

-- ============================================================
-- 3. Tighten INSERT policies
-- ============================================================

-- answer_analytics
DROP POLICY IF EXISTS "Users can insert analytics" ON public.answer_analytics;
CREATE POLICY "Users can insert analytics" ON public.answer_analytics
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

-- app_feedback
DROP POLICY IF EXISTS "Users can insert feedback" ON public.app_feedback;
CREATE POLICY "Users can insert feedback" ON public.app_feedback
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
  );

-- friend_challenge_attempts (user FK = user_id, nullable for anonymous attempts)
-- Allow either: authenticated user matches user_id, OR anonymous attempt (user_id IS NULL)
DROP POLICY IF EXISTS "Anyone can submit attempts" ON public.friend_challenge_attempts;
CREATE POLICY "Users can submit attempts" ON public.friend_challenge_attempts
  FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NULL AND user_id IS NULL)
  );

-- game_answers: tied via game_id → games.user_id (no direct user_id column)
DROP POLICY IF EXISTS "Anyone can create game answers" ON public.game_answers;
CREATE POLICY "Users can create game answers" ON public.game_answers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.games g
      WHERE g.id = game_answers.game_id
        AND (
          (auth.uid() IS NOT NULL AND g.user_id = auth.uid())
          OR (auth.uid() IS NULL AND g.user_id IS NULL)
        )
    )
  );

-- games: user_id is the owner; allow anonymous (user_id IS NULL) too
DROP POLICY IF EXISTS "Anyone can create games" ON public.games;
CREATE POLICY "Users can create games" ON public.games
  FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NULL AND user_id IS NULL)
  );
