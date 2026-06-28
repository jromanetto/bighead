-- Migration: ne JAMAIS activer un défi dont la génération a échoué (sinon défi
-- vide en prod). Critique avec la cadence 2 jours (génération quotidienne non
-- surveillée). Ajoute generation_status='ready' à la condition d'activation.

CREATE OR REPLACE FUNCTION activate_due_weekly_challenges()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE v_count INTEGER;
BEGIN
  UPDATE weekly_challenges
     SET status = 'active', updated_at = NOW()
   WHERE status = 'upcoming'
     AND generation_status = 'ready'
     AND start_date <= CURRENT_DATE;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END $$;
