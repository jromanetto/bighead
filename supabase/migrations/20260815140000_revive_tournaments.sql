-- Tournaments were dead: get_tournament_questions read q.options, but 99.8% of
-- questions use correct_answer/wrong_answers (options NULL). Build options from
-- the new format so the full bank works, and add a weekly rotation cron.
CREATE OR REPLACE FUNCTION public.get_tournament_questions(p_tournament_id uuid)
RETURNS TABLE(question_order integer, question_id uuid, question_text text, player_name text, options jsonb, image_url text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp'
AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM tournament_participants WHERE tournament_id = p_tournament_id AND user_id = auth.uid()) THEN RETURN; END IF;
  RETURN QUERY
  SELECT tq.question_order, tq.question_id, q.question_text, q.player_name,
    COALESCE(q.options, sh.built) AS options, q.image_url
  FROM tournament_questions tq JOIN questions q ON q.id = tq.question_id
  CROSS JOIN LATERAL (
    SELECT jsonb_build_object('A',o[1],'B',o[2],'C',o[3],'D',o[4],
      'correct', CASE WHEN o[1]=q.correct_answer THEN 'A' WHEN o[2]=q.correct_answer THEN 'B' WHEN o[3]=q.correct_answer THEN 'C' ELSE 'D' END) AS built
    FROM (SELECT array_agg(a ORDER BY md5(tq.question_id::text || a)) AS o
          FROM unnest(array_prepend(q.correct_answer, q.wrong_answers[1:3])) AS a) shuffled
  ) sh
  WHERE tq.tournament_id = p_tournament_id ORDER BY tq.question_order;
END; $function$;

CREATE OR REPLACE FUNCTION public.rotate_weekly_tournament()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_new uuid; v_cat text; v_lang text := 'fr';
BEGIN
  UPDATE tournaments SET status='finished' WHERE status='active' AND end_date < now();
  IF EXISTS (SELECT 1 FROM tournaments WHERE status='active' AND end_date > now()) THEN RETURN; END IF;
  SELECT category INTO v_cat FROM questions
    WHERE language=v_lang AND is_active AND correct_answer IS NOT NULL AND array_length(wrong_answers,1) >= 3
    GROUP BY category HAVING count(*) >= 10 ORDER BY random() LIMIT 1;
  IF v_cat IS NULL THEN RETURN; END IF;
  INSERT INTO tournaments(name, description, category, status, questions_count, time_limit_seconds, start_date, end_date, prize_xp, language)
  VALUES ('Tournoi de la semaine','Tournoi hebdomadaire — '||v_cat, v_cat,'active',10,15,now(),now()+interval '7 days',500,v_lang)
  RETURNING id INTO v_new;
  INSERT INTO tournament_questions(tournament_id, question_id, question_order)
  SELECT v_new, id, (row_number() OVER (ORDER BY random()))::int
  FROM questions WHERE category=v_cat AND language=v_lang AND is_active AND correct_answer IS NOT NULL AND array_length(wrong_answers,1) >= 3
  ORDER BY random() LIMIT 10;
END; $$;
GRANT EXECUTE ON FUNCTION public.rotate_weekly_tournament() TO service_role;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM cron.job WHERE jobname='rotate-weekly-tournament') THEN PERFORM cron.unschedule('rotate-weekly-tournament'); END IF; END $$;
SELECT cron.schedule('rotate-weekly-tournament','0 6 * * *', $cron$ SELECT public.rotate_weekly_tournament(); $cron$);
SELECT public.rotate_weekly_tournament();
