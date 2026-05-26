-- Performance: cover FK columns with indexes
-- Audit-flagged: 17 unindexed foreign keys
-- Behavior unchanged; speeds up joins, ON DELETE/UPDATE cascade lookups, and FK-filtered queries.

CREATE INDEX IF NOT EXISTS idx_app_feedback_user_id
  ON public.app_feedback(user_id);

CREATE INDEX IF NOT EXISTS idx_challenge_attempts_challenge_id
  ON public.challenge_attempts(challenge_id);

CREATE INDEX IF NOT EXISTS idx_challenge_attempts_user_id
  ON public.challenge_attempts(user_id);

CREATE INDEX IF NOT EXISTS idx_challenge_attempts_game_id
  ON public.challenge_attempts(game_id);

CREATE INDEX IF NOT EXISTS idx_challenges_game_id
  ON public.challenges(game_id);

CREATE INDEX IF NOT EXISTS idx_challenges_creator_id
  ON public.challenges(creator_id);

CREATE INDEX IF NOT EXISTS idx_daily_challenges_question_id
  ON public.daily_challenges(question_id);

CREATE INDEX IF NOT EXISTS idx_daily_questions_question_id
  ON public.daily_questions(question_id);

CREATE INDEX IF NOT EXISTS idx_duel_rounds_question_id
  ON public.duel_rounds(question_id);

CREATE INDEX IF NOT EXISTS idx_duels_winner_id
  ON public.duels(winner_id);

CREATE INDEX IF NOT EXISTS idx_friend_challenge_attempts_user_id
  ON public.friend_challenge_attempts(user_id);

CREATE INDEX IF NOT EXISTS idx_game_answers_question_id
  ON public.game_answers(question_id);

CREATE INDEX IF NOT EXISTS idx_tournament_questions_question_id
  ON public.tournament_questions(question_id);

CREATE INDEX IF NOT EXISTS idx_user_daily_challenges_challenge_id
  ON public.user_daily_challenges(challenge_id);

CREATE INDEX IF NOT EXISTS idx_weekly_challenge_questions_archived_question_id_fr
  ON public.weekly_challenge_questions(archived_question_id_fr);

CREATE INDEX IF NOT EXISTS idx_weekly_challenge_questions_archived_question_id_en
  ON public.weekly_challenge_questions(archived_question_id_en);

CREATE INDEX IF NOT EXISTS idx_weekly_challenges_theme_slug
  ON public.weekly_challenges(theme_slug);
