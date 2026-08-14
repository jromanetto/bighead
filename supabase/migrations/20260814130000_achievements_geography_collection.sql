-- Extend check_achievements with geography-collection requirement types + add the
-- achievements. A whitelist CHECK on requirement_type blocked new kinds; drop it
-- (the RPC ignores unknown types anyway).
ALTER TABLE public.achievements DROP CONSTRAINT IF EXISTS achievements_requirement_type_check;

CREATE OR REPLACE FUNCTION public.check_achievements(p_user_id uuid)
 RETURNS TABLE(achievement_code text, achievement_name text, achievement_icon text, xp_reward integer)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_user RECORD; v_achievement RECORD;
BEGIN
  SELECT * INTO v_user FROM users WHERE id = p_user_id;
  IF NOT FOUND THEN RETURN; END IF;
  FOR v_achievement IN
    SELECT a.* FROM achievements a
    WHERE NOT EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id)
  LOOP
    IF (
      (v_achievement.requirement_type = 'games_played' AND v_user.games_played >= v_achievement.requirement_value) OR
      (v_achievement.requirement_type = 'total_xp' AND v_user.total_xp >= v_achievement.requirement_value) OR
      (v_achievement.requirement_type = 'best_chain' AND v_user.best_chain >= v_achievement.requirement_value) OR
      (v_achievement.requirement_type = 'level_reached' AND v_user.level >= v_achievement.requirement_value) OR
      (v_achievement.requirement_type = 'perfect_games' AND v_user.perfect_games >= v_achievement.requirement_value) OR
      (v_achievement.requirement_type = 'first_game' AND v_user.games_played >= 1) OR
      (v_achievement.requirement_type = 'flags_caught' AND
        (SELECT count(*) FROM geo_collection WHERE user_id = p_user_id) >= v_achievement.requirement_value) OR
      (v_achievement.requirement_type = 'continents_completed' AND
        (SELECT count(*) FROM (
           SELECT k.continent FROM geo_collection gc JOIN geo_country k ON k.code = gc.country_code
           WHERE gc.user_id = p_user_id GROUP BY k.continent
           HAVING count(*) >= (SELECT count(*) FROM geo_country gk WHERE gk.continent = k.continent)
         ) done) >= v_achievement.requirement_value)
    ) THEN
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (p_user_id, v_achievement.id) ON CONFLICT DO NOTHING;
      UPDATE users SET total_xp = total_xp + v_achievement.xp_reward WHERE id = p_user_id;
      achievement_code := v_achievement.code; achievement_name := v_achievement.name;
      achievement_icon := v_achievement.icon; xp_reward := v_achievement.xp_reward;
      RETURN NEXT;
    END IF;
  END LOOP;
  RETURN;
END;
$function$;

INSERT INTO public.achievements (id, code, name, description, icon, category, requirement_type, requirement_value, xp_reward, is_secret)
SELECT gen_random_uuid(), v.code, v.name, v.description, v.icon, 'special', v.rt, v.rv, v.xp, false
FROM (VALUES
  ('geo_collector_10','Collectionneur','Attrape 10 drapeaux','🗺️','flags_caught',10,50),
  ('geo_collector_50','Globe-trotter','Attrape 50 drapeaux','🌍','flags_caught',50,150),
  ('geo_collector_100','Explorateur','Attrape 100 drapeaux','🧭','flags_caught',100,300),
  ('geo_collector_all','Tour du monde','Attrape les 194 drapeaux','🌐','flags_caught',194,1000),
  ('geo_continent_1','Premier continent','Complète un continent','🏆','continents_completed',1,100),
  ('geo_continent_all','Maître du monde','Complète les 5 continents','👑','continents_completed',5,2000)
) AS v(code,name,description,icon,rt,rv,xp)
WHERE NOT EXISTS (SELECT 1 FROM public.achievements a WHERE a.code = v.code);
