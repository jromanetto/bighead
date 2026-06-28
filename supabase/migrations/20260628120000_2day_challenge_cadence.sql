-- Migration: passage à une cadence de défis tous les 2 jours
--
-- Avant : 1 défi themed/semaine (fenêtre 7 j). Génération dim 23h30, clôture
-- dim 23h. Désormais : 1 défi tous les 2 jours (fenêtre 2 j), rotation auto.
--
-- Côté edge functions (déployées séparément) :
--   - generate-weekly-challenge : fenêtre 2 j (end = start+1), start = prochain
--     créneau libre, tampon QUEUE_BUFFER=3 défis "upcoming" d'avance.
--   - close-weekly-challenge : ne clôture que les défis EXPIRÉS (end_date < today),
--     pour pouvoir tourner quotidiennement sans clôturer un défi en cours.
--
-- Crons (séquence quotidienne propre : génère la veille → clôture → active) :
--   close   : tous les jours 00:01  (avant l'activation, pas de chevauchement)
--   activate: tous les jours 00:05  (inchangé)
--   generate: tous les jours 23:30  (remplit le tampon)

SELECT cron.schedule('close-weekly-challenge', '1 0 * * *', $$
  SELECT net.http_post(
    url := 'https://dqhhpoxqrtlmhosrsdxp.supabase.co/functions/v1/close-weekly-challenge',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || public.get_cron_secret()),
    body := '{}'::jsonb
  );
$$);

SELECT cron.schedule('generate-weekly-challenge', '30 23 * * *', $$
  SELECT net.http_post(
    url := 'https://dqhhpoxqrtlmhosrsdxp.supabase.co/functions/v1/generate-weekly-challenge',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || public.get_cron_secret()),
    body := '{}'::jsonb,
    timeout_milliseconds := 240000
  );
$$);
