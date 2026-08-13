-- Reference table so a cron can compute per-continent collection completion.
CREATE TABLE IF NOT EXISTS public.geo_country (
  code text PRIMARY KEY,
  continent text NOT NULL
);

INSERT INTO public.geo_country(code, continent) VALUES
('al','europe'),('de','europe'),('ad','europe'),('at','europe'),('be','europe'),('by','europe'),('ba','europe'),('bg','europe'),('cy','europe'),('va','europe'),('hr','europe'),('dk','europe'),('es','europe'),('ee','europe'),('fi','europe'),('fr','europe'),('gr','europe'),('hu','europe'),('ie','europe'),('is','europe'),('it','europe'),('lv','europe'),('li','europe'),('lt','europe'),('lu','europe'),('mk','europe'),('mt','europe'),('md','europe'),('mc','europe'),('me','europe'),('no','europe'),('nl','europe'),('pl','europe'),('pt','europe'),('ro','europe'),('gb','europe'),('ru','europe'),('sm','europe'),('rs','europe'),('sk','europe'),('si','europe'),('se','europe'),('ch','europe'),('cz','europe'),('ua','europe'),('za','africa'),('dz','africa'),('ao','africa'),('bj','africa'),('bw','africa'),('bf','africa'),('bi','africa'),('cm','africa'),('km','africa'),('cg','africa'),('cd','africa'),('ci','africa'),('dj','africa'),('eg','africa'),('er','africa'),('sz','africa'),('et','africa'),('ga','africa'),('gm','africa'),('gh','africa'),('gn','africa'),('gq','africa'),('gw','africa'),('mu','africa'),('cv','africa'),('ke','africa'),('ls','africa'),('lr','africa'),('ly','africa'),('mg','africa'),('mw','africa'),('ml','africa'),('ma','africa'),('mr','africa'),('mz','africa'),('na','africa'),('ne','africa'),('ng','africa'),('ug','africa'),('cf','africa'),('rw','africa'),('st','africa'),('sn','africa'),('sc','africa'),('sl','africa'),('so','africa'),('sd','africa'),('ss','africa'),('tz','africa'),('td','africa'),('tg','africa'),('tn','africa'),('zm','africa'),('zw','africa'),('af','asia'),('sa','asia'),('am','asia'),('az','asia'),('bh','asia'),('bd','asia'),('bt','asia'),('mm','asia'),('bn','asia'),('kh','asia'),('cn','asia'),('kp','asia'),('kr','asia'),('ae','asia'),('ge','asia'),('in','asia'),('id','asia'),('iq','asia'),('ir','asia'),('il','asia'),('jp','asia'),('jo','asia'),('kz','asia'),('kg','asia'),('kw','asia'),('la','asia'),('lb','asia'),('my','asia'),('mv','asia'),('mn','asia'),('np','asia'),('om','asia'),('uz','asia'),('pk','asia'),('ph','asia'),('qa','asia'),('sg','asia'),('lk','asia'),('sy','asia'),('tj','asia'),('th','asia'),('tl','asia'),('tm','asia'),('tr','asia'),('vn','asia'),('ye','asia'),('ag','americas'),('ar','americas'),('bs','americas'),('bb','americas'),('bz','americas'),('bo','americas'),('br','americas'),('ca','americas'),('cl','americas'),('co','americas'),('cr','americas'),('cu','americas'),('dm','americas'),('ec','americas'),('us','americas'),('gd','americas'),('gt','americas'),('gy','americas'),('ht','americas'),('hn','americas'),('jm','americas'),('mx','americas'),('ni','americas'),('pa','americas'),('py','americas'),('pe','americas'),('do','americas'),('kn','americas'),('vc','americas'),('lc','americas'),('sv','americas'),('sr','americas'),('tt','americas'),('uy','americas'),('ve','americas'),('au','oceania'),('fj','oceania'),('mh','oceania'),('sb','oceania'),('ki','oceania'),('fm','oceania'),('nr','oceania'),('nz','oceania'),('pw','oceania'),('pg','oceania'),('ws','oceania'),('to','oceania'),('tv','oceania'),('vu','oceania')
ON CONFLICT (code) DO UPDATE SET continent = EXCLUDED.continent;

-- Nudge users 1-2 flags from completing a continent (weekly dedupe).
CREATE OR REPLACE FUNCTION public.scan_geo_almost_complete()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r RECORD; v_week text;
BEGIN
  v_week := to_char(date_trunc('week', now()), 'IYYY-IW');
  FOR r IN
    WITH totals AS (SELECT continent, count(*) AS tot FROM public.geo_country GROUP BY continent),
    caught AS (
      SELECT gc.user_id, k.continent, count(*) AS c
      FROM public.geo_collection gc JOIN public.geo_country k ON k.code = gc.country_code
      GROUP BY gc.user_id, k.continent
    )
    SELECT ca.user_id, (t.tot - ca.c) AS remaining
    FROM caught ca JOIN totals t ON t.continent = ca.continent
    JOIN public.users u ON u.id = ca.user_id AND u.push_token IS NOT NULL
    WHERE t.tot - ca.c BETWEEN 1 AND 2
  LOOP
    BEGIN
      INSERT INTO public.notification_dedupe(user_id, kind, ref) VALUES (r.user_id, 'geo_almost', v_week);
    EXCEPTION WHEN unique_violation THEN CONTINUE; END;
    PERFORM public.notify_user_if_enabled(r.user_id, 'geo_almost', jsonb_build_object('remaining', r.remaining::text), 'streak_warning');
  END LOOP;
END; $$;

GRANT EXECUTE ON FUNCTION public.scan_geo_almost_complete() TO service_role;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'scan-geo-almost') THEN PERFORM cron.unschedule('scan-geo-almost'); END IF;
END $$;
SELECT cron.schedule('scan-geo-almost', '0 18 * * *', $cron$ SELECT public.scan_geo_almost_complete(); $cron$);
