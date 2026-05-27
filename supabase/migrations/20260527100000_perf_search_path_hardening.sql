-- Migration: SECURITY DEFINER search_path hardening
-- Adds explicit `SET search_path = public, pg_temp` to all SECURITY DEFINER
-- functions in `public` schema. Without this, a malicious user with write
-- access to a schema in the default search_path could shadow built-in or
-- internal functions and hijack execution under elevated privileges.
--
-- Reference: Supabase advisor "function_search_path_mutable"

ALTER FUNCTION public.award_xp(uuid, integer, text, jsonb, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.bump_weekly_challenge_players() SET search_path = public, pg_temp;
ALTER FUNCTION public.create_duel(uuid, text, integer, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_duel_questions(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_tournament_questions(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_weekly_challenge_leaderboard(uuid, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_weekly_leaderboard(integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.join_duel(varchar, uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.pick_next_weekly_theme() SET search_path = public, pg_temp;
ALTER FUNCTION public.submit_weekly_answer(uuid, integer, boolean) SET search_path = public, pg_temp;
ALTER FUNCTION public.update_user_stats_after_game() SET search_path = public, pg_temp;
