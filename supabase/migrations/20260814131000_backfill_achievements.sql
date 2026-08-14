-- The achievements system was never called (0 unlocks ever). Backfill existing
-- qualifying users with the push trigger disabled (no retroactive notification burst).
ALTER TABLE public.user_achievements DISABLE TRIGGER trg_achievement_unlocked_push;
DO $$ DECLARE u uuid; BEGIN
  FOR u IN SELECT id FROM public.users WHERE COALESCE(games_played,0) > 0 LOOP
    PERFORM public.check_achievements(u);
  END LOOP;
END $$;
ALTER TABLE public.user_achievements ENABLE TRIGGER trg_achievement_unlocked_push;
