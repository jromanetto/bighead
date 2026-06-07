-- Bug fix: daily quiz was returning empty for new days.
--
-- Root cause: get_or_create_daily_questions_v2 (and v1) inserts into
-- daily_questions lazily on first call of the day, but the function
-- wasn't SECURITY DEFINER. Authenticated callers hit RLS on
-- daily_questions and the INSERT failed silently → function returned
-- an empty array → app's daily screen showed empty state.
--
-- Fix: mark both daily-fetch RPCs as SECURITY DEFINER + lock search_path.

ALTER FUNCTION public.get_or_create_daily_questions_v2(date, text) SECURITY DEFINER;
ALTER FUNCTION public.get_or_create_daily_questions_v2(date, text) SET search_path = public, pg_temp;

ALTER FUNCTION public.get_or_create_daily_question(date, text) SECURITY DEFINER;
ALTER FUNCTION public.get_or_create_daily_question(date, text) SET search_path = public, pg_temp;
