-- Performance: wrap auth.uid()/auth.role() in (SELECT ...) so PostgreSQL
-- evaluates them ONCE per query instead of per row.
-- Audit-flagged: 58 auth_rls_initplan warnings on public schema.
-- Semantics identical: (SELECT auth.uid()) returns the same uuid as auth.uid().

BEGIN;

-- answer_analytics . Users can insert analytics
DROP POLICY IF EXISTS "Users can insert analytics" ON public.answer_analytics;
CREATE POLICY "Users can insert analytics" ON public.answer_analytics
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid()))));

-- answer_analytics . Users can view own analytics
DROP POLICY IF EXISTS "Users can view own analytics" ON public.answer_analytics;
CREATE POLICY "Users can view own analytics" ON public.answer_analytics
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((((SELECT auth.uid()) = user_id) OR (user_id IS NULL)));

-- app_feedback . Service role can read all feedback
DROP POLICY IF EXISTS "Service role can read all feedback" ON public.app_feedback;
CREATE POLICY "Service role can read all feedback" ON public.app_feedback
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((SELECT auth.role()) = 'service_role'::text));

-- app_feedback . Users can insert feedback
DROP POLICY IF EXISTS "Users can insert feedback" ON public.app_feedback;
CREATE POLICY "Users can insert feedback" ON public.app_feedback
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid()))));

-- challenge_attempts . Authenticated users can create attempts
DROP POLICY IF EXISTS "Authenticated users can create attempts" ON public.challenge_attempts;
CREATE POLICY "Authenticated users can create attempts" ON public.challenge_attempts
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK (((SELECT auth.uid()) IS NOT NULL));

-- challenges . Authenticated users can create challenges
DROP POLICY IF EXISTS "Authenticated users can create challenges" ON public.challenges;
CREATE POLICY "Authenticated users can create challenges" ON public.challenges
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK (((SELECT auth.uid()) IS NOT NULL));

-- daily_survival_results . Users can insert own daily survival results
DROP POLICY IF EXISTS "Users can insert own daily survival results" ON public.daily_survival_results;
CREATE POLICY "Users can insert own daily survival results" ON public.daily_survival_results
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK (((SELECT auth.uid()) = user_id));

-- daily_survival_results . Users can view own daily survival results
DROP POLICY IF EXISTS "Users can view own daily survival results" ON public.daily_survival_results;
CREATE POLICY "Users can view own daily survival results" ON public.daily_survival_results
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((SELECT auth.uid()) = user_id));

-- duel_rounds . Users can insert duel rounds
DROP POLICY IF EXISTS "Users can insert duel rounds" ON public.duel_rounds;
CREATE POLICY "Users can insert duel rounds" ON public.duel_rounds
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM duels
  WHERE ((duels.id = duel_rounds.duel_id) AND ((duels.host_id = (SELECT auth.uid())) OR (duels.guest_id = (SELECT auth.uid())))))));

-- duel_rounds . Users can update duel rounds
DROP POLICY IF EXISTS "Users can update duel rounds" ON public.duel_rounds;
CREATE POLICY "Users can update duel rounds" ON public.duel_rounds
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((EXISTS ( SELECT 1
   FROM duels
  WHERE ((duels.id = duel_rounds.duel_id) AND ((duels.host_id = (SELECT auth.uid())) OR (duels.guest_id = (SELECT auth.uid())))))));

-- duel_rounds . Users can view duel rounds
DROP POLICY IF EXISTS "Users can view duel rounds" ON public.duel_rounds;
CREATE POLICY "Users can view duel rounds" ON public.duel_rounds
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM duels
  WHERE ((duels.id = duel_rounds.duel_id) AND ((duels.host_id = (SELECT auth.uid())) OR (duels.guest_id = (SELECT auth.uid())))))));

-- duels . Users can create duels
DROP POLICY IF EXISTS "Users can create duels" ON public.duels;
CREATE POLICY "Users can create duels" ON public.duels
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK (((SELECT auth.uid()) = host_id));

-- duels . Users can update their duels
DROP POLICY IF EXISTS "Users can update their duels" ON public.duels;
CREATE POLICY "Users can update their duels" ON public.duels
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((((SELECT auth.uid()) = host_id) OR ((SELECT auth.uid()) = guest_id)));

-- duels . Users can view duels they participate in
DROP POLICY IF EXISTS "Users can view duels they participate in" ON public.duels;
CREATE POLICY "Users can view duels they participate in" ON public.duels
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((((SELECT auth.uid()) = host_id) OR ((SELECT auth.uid()) = guest_id) OR (status = 'waiting'::text)));

-- friend_challenge_attempts . Users can submit attempts
DROP POLICY IF EXISTS "Users can submit attempts" ON public.friend_challenge_attempts;
CREATE POLICY "Users can submit attempts" ON public.friend_challenge_attempts
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK (((((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid()))) OR (((SELECT auth.uid()) IS NULL) AND (user_id IS NULL))));

-- friend_challenges . Users can create challenges
DROP POLICY IF EXISTS "Users can create challenges" ON public.friend_challenges;
CREATE POLICY "Users can create challenges" ON public.friend_challenges
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK (((SELECT auth.uid()) = creator_id));

-- game_answers . Game answers follow game visibility
DROP POLICY IF EXISTS "Game answers follow game visibility" ON public.game_answers;
CREATE POLICY "Game answers follow game visibility" ON public.game_answers
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM games g
  WHERE ((g.id = game_answers.game_id) AND (((SELECT auth.uid()) = g.user_id) OR (g.user_id IS NULL))))));

-- game_answers . Users can create game answers
DROP POLICY IF EXISTS "Users can create game answers" ON public.game_answers;
CREATE POLICY "Users can create game answers" ON public.game_answers
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((EXISTS ( SELECT 1
   FROM games g
  WHERE ((g.id = game_answers.game_id) AND ((((SELECT auth.uid()) IS NOT NULL) AND (g.user_id = (SELECT auth.uid()))) OR (((SELECT auth.uid()) IS NULL) AND (g.user_id IS NULL)))))));

-- game_results . Users can insert own results
DROP POLICY IF EXISTS "Users can insert own results" ON public.game_results;
CREATE POLICY "Users can insert own results" ON public.game_results
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK (((SELECT auth.uid()) = user_id));

-- game_results . Users can view own results
DROP POLICY IF EXISTS "Users can view own results" ON public.game_results;
CREATE POLICY "Users can view own results" ON public.game_results
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((SELECT auth.uid()) = user_id));

-- games . Users can create games
DROP POLICY IF EXISTS "Users can create games" ON public.games;
CREATE POLICY "Users can create games" ON public.games
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK (((((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid()))) OR (((SELECT auth.uid()) IS NULL) AND (user_id IS NULL))));

-- games . Users can view own games
DROP POLICY IF EXISTS "Users can view own games" ON public.games;
CREATE POLICY "Users can view own games" ON public.games
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((((SELECT auth.uid()) = user_id) OR (user_id IS NULL)));

-- instagram_posts . Service role full access
DROP POLICY IF EXISTS "Service role full access" ON public.instagram_posts;
CREATE POLICY "Service role full access" ON public.instagram_posts
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((SELECT auth.role()) = 'service_role'::text))
  WITH CHECK (((SELECT auth.role()) = 'service_role'::text));

-- notification_preferences . notification_prefs_insert_own
DROP POLICY IF EXISTS "notification_prefs_insert_own" ON public.notification_preferences;
CREATE POLICY "notification_prefs_insert_own" ON public.notification_preferences
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK (((SELECT auth.uid()) = user_id));

-- notification_preferences . notification_prefs_select_own
DROP POLICY IF EXISTS "notification_prefs_select_own" ON public.notification_preferences;
CREATE POLICY "notification_prefs_select_own" ON public.notification_preferences
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((SELECT auth.uid()) = user_id));

-- notification_preferences . notification_prefs_update_own
DROP POLICY IF EXISTS "notification_prefs_update_own" ON public.notification_preferences;
CREATE POLICY "notification_prefs_update_own" ON public.notification_preferences
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING (((SELECT auth.uid()) = user_id))
  WITH CHECK (((SELECT auth.uid()) = user_id));

-- player_skill . Users can insert own skill
DROP POLICY IF EXISTS "Users can insert own skill" ON public.player_skill;
CREATE POLICY "Users can insert own skill" ON public.player_skill
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK (((SELECT auth.uid()) = user_id));

-- player_skill . Users can update own skill
DROP POLICY IF EXISTS "Users can update own skill" ON public.player_skill;
CREATE POLICY "Users can update own skill" ON public.player_skill
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING (((SELECT auth.uid()) = user_id));

-- player_skill . Users can view own skill
DROP POLICY IF EXISTS "Users can view own skill" ON public.player_skill;
CREATE POLICY "Users can view own skill" ON public.player_skill
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((SELECT auth.uid()) = user_id));

-- reddit_posts . Service role full access
DROP POLICY IF EXISTS "Service role full access" ON public.reddit_posts;
CREATE POLICY "Service role full access" ON public.reddit_posts
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((SELECT auth.role()) = 'service_role'::text))
  WITH CHECK (((SELECT auth.role()) = 'service_role'::text));

-- referral_codes . referral_codes_select_own
DROP POLICY IF EXISTS "referral_codes_select_own" ON public.referral_codes;
CREATE POLICY "referral_codes_select_own" ON public.referral_codes
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((SELECT auth.uid()) = user_id));

-- referrals . referrals_select_own
DROP POLICY IF EXISTS "referrals_select_own" ON public.referrals;
CREATE POLICY "referrals_select_own" ON public.referrals
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((((SELECT auth.uid()) = referrer_user_id) OR ((SELECT auth.uid()) = referee_user_id)));

-- streak_freezes . Users can view own streak freezes
DROP POLICY IF EXISTS "Users can view own streak freezes" ON public.streak_freezes;
CREATE POLICY "Users can view own streak freezes" ON public.streak_freezes
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((SELECT auth.uid()) = user_id));

-- tournament_participants . Users can join tournaments
DROP POLICY IF EXISTS "Users can join tournaments" ON public.tournament_participants;
CREATE POLICY "Users can join tournaments" ON public.tournament_participants
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK (((SELECT auth.uid()) = user_id));

-- tournament_participants . Users can update own participation
DROP POLICY IF EXISTS "Users can update own participation" ON public.tournament_participants;
CREATE POLICY "Users can update own participation" ON public.tournament_participants
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING (((SELECT auth.uid()) = user_id));

-- tournament_questions . Tournament questions viewable by participants
DROP POLICY IF EXISTS "Tournament questions viewable by participants" ON public.tournament_questions;
CREATE POLICY "Tournament questions viewable by participants" ON public.tournament_questions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((EXISTS ( SELECT 1
   FROM tournament_participants
  WHERE ((tournament_participants.tournament_id = tournament_questions.tournament_id) AND (tournament_participants.user_id = (SELECT auth.uid()))))));

-- user_achievements . Users can insert own achievements
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;
CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK (((SELECT auth.uid()) = user_id));

-- user_cached_questions . Users can manage own cache
DROP POLICY IF EXISTS "Users can manage own cache" ON public.user_cached_questions;
CREATE POLICY "Users can manage own cache" ON public.user_cached_questions
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (((SELECT auth.uid()) = user_id));

-- user_category_stats . Users can insert own stats
DROP POLICY IF EXISTS "Users can insert own stats" ON public.user_category_stats;
CREATE POLICY "Users can insert own stats" ON public.user_category_stats
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK (((SELECT auth.uid()) = user_id));

-- user_category_stats . Users can update own stats
DROP POLICY IF EXISTS "Users can update own stats" ON public.user_category_stats;
CREATE POLICY "Users can update own stats" ON public.user_category_stats
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING (((SELECT auth.uid()) = user_id));

-- user_category_stats . Users can view own stats
DROP POLICY IF EXISTS "Users can view own stats" ON public.user_category_stats;
CREATE POLICY "Users can view own stats" ON public.user_category_stats
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((SELECT auth.uid()) = user_id));

-- user_daily_challenges . User daily challenges insertable by owner
DROP POLICY IF EXISTS "User daily challenges insertable by owner" ON public.user_daily_challenges;
CREATE POLICY "User daily challenges insertable by owner" ON public.user_daily_challenges
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK (((SELECT auth.uid()) = user_id));

-- user_daily_challenges . User daily challenges viewable by owner
DROP POLICY IF EXISTS "User daily challenges viewable by owner" ON public.user_daily_challenges;
CREATE POLICY "User daily challenges viewable by owner" ON public.user_daily_challenges
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((SELECT auth.uid()) = user_id));

-- user_lifelines . lifelines_insert_own
DROP POLICY IF EXISTS "lifelines_insert_own" ON public.user_lifelines;
CREATE POLICY "lifelines_insert_own" ON public.user_lifelines
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK ((user_id = (SELECT auth.uid())));

-- user_lifelines . lifelines_select_own
DROP POLICY IF EXISTS "lifelines_select_own" ON public.user_lifelines;
CREATE POLICY "lifelines_select_own" ON public.user_lifelines
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING ((user_id = (SELECT auth.uid())));

-- user_lifelines . lifelines_update_own
DROP POLICY IF EXISTS "lifelines_update_own" ON public.user_lifelines;
CREATE POLICY "lifelines_update_own" ON public.user_lifelines
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING ((user_id = (SELECT auth.uid())))
  WITH CHECK ((user_id = (SELECT auth.uid())));

-- user_questions_seen . Users can insert own seen questions
DROP POLICY IF EXISTS "Users can insert own seen questions" ON public.user_questions_seen;
CREATE POLICY "Users can insert own seen questions" ON public.user_questions_seen
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK (((SELECT auth.uid()) = user_id));

-- user_questions_seen . Users can update own seen questions
DROP POLICY IF EXISTS "Users can update own seen questions" ON public.user_questions_seen;
CREATE POLICY "Users can update own seen questions" ON public.user_questions_seen
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING (((SELECT auth.uid()) = user_id));

-- user_questions_seen . Users can view own seen questions
DROP POLICY IF EXISTS "Users can view own seen questions" ON public.user_questions_seen;
CREATE POLICY "Users can view own seen questions" ON public.user_questions_seen
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((SELECT auth.uid()) = user_id));

-- user_settings . Users can insert own settings
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
CREATE POLICY "Users can insert own settings" ON public.user_settings
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK (((SELECT auth.uid()) = user_id));

-- user_settings . Users can update own settings
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
CREATE POLICY "Users can update own settings" ON public.user_settings
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING (((SELECT auth.uid()) = user_id));

-- user_settings . Users can view own settings
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
CREATE POLICY "Users can view own settings" ON public.user_settings
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((SELECT auth.uid()) = user_id));

-- users . Users can insert own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK (((SELECT auth.uid()) = id));

-- users . Users can update own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING (((SELECT auth.uid()) = id));

-- weekly_challenge_progress . wc_progress_own_insert
DROP POLICY IF EXISTS "wc_progress_own_insert" ON public.weekly_challenge_progress;
CREATE POLICY "wc_progress_own_insert" ON public.weekly_challenge_progress
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK ((user_id = (SELECT auth.uid())));

-- weekly_challenge_progress . wc_progress_own_select
DROP POLICY IF EXISTS "wc_progress_own_select" ON public.weekly_challenge_progress;
CREATE POLICY "wc_progress_own_select" ON public.weekly_challenge_progress
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING ((user_id = (SELECT auth.uid())));

-- weekly_challenge_progress . wc_progress_own_update
DROP POLICY IF EXISTS "wc_progress_own_update" ON public.weekly_challenge_progress;
CREATE POLICY "wc_progress_own_update" ON public.weekly_challenge_progress
  AS PERMISSIVE
  FOR UPDATE
  TO public
  USING ((user_id = (SELECT auth.uid())));

-- xp_transactions . users_view_own_xp_tx
DROP POLICY IF EXISTS "users_view_own_xp_tx" ON public.xp_transactions;
CREATE POLICY "users_view_own_xp_tx" ON public.xp_transactions
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (((SELECT auth.uid()) = user_id));

COMMIT;