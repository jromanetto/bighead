-- Migration: thème "La Grèce" + changement de stratégie difficulté
--
-- Nouvelle stratégie (remplace la rotation Facile/Moyen/Difficile par quiz) :
-- CHAQUE quiz hebdo = 20 questions, mix fixe 10 faciles / 7 moyennes / 3 difficiles,
-- DANS CET ORDRE (positions 1-10 faciles, 11-17 moyennes, 18-20 difficiles).
-- Côté edge function generate-weekly-challenge : prompt 10/7/3 + tri par difficulté
-- avant insert ; target_difficulty du défi = NULL (plus de niveau global, plus de badge).

INSERT INTO weekly_challenge_themes (slug, label_fr, label_en, description_fr, description_en, emoji, color, target_category, is_active)
VALUES ('country_greece','La Grèce','Greece',
  'Histoire, géographie, culture et mythologie de la Grèce','Greek history, geography, culture and mythology',
  '🇬🇷','#1E88E5','geography', true)
ON CONFLICT (slug) DO UPDATE SET is_active = true;
