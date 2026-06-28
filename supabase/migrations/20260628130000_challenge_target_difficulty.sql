-- Migration: niveau de difficulté par défi (rotation facile/moyen/difficile)
--
-- Les défis tournent désormais aussi sur la difficulté : un même thème peut
-- revenir en Facile (1), Moyen (2) ou Difficile (3). NULL = mixte (legacy).
-- generate-weekly-challenge alterne 1→2→3 et génère les questions au niveau visé.

ALTER TABLE weekly_challenges
  ADD COLUMN IF NOT EXISTS target_difficulty smallint
  CHECK (target_difficulty BETWEEN 1 AND 3);
