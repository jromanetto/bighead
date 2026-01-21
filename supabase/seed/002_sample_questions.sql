-- BIGHEAD Sample Questions for Testing
-- These are just a few sample questions. The full dataset will be generated via AI.

-- Get category IDs
DO $$
DECLARE
  history_id UUID;
  geography_id UUID;
  science_id UUID;
  sports_id UUID;
  popculture_id UUID;
BEGIN
  SELECT id INTO history_id FROM public.categories WHERE slug = 'history';
  SELECT id INTO geography_id FROM public.categories WHERE slug = 'geography';
  SELECT id INTO science_id FROM public.categories WHERE slug = 'science';
  SELECT id INTO sports_id FROM public.categories WHERE slug = 'sports';
  SELECT id INTO popculture_id FROM public.categories WHERE slug = 'pop-culture';

  -- HISTORY QUESTIONS
  INSERT INTO public.questions (category_id, difficulty, question_text, correct_answer, wrong_answers, explanation) VALUES
  (history_id, 1, 'En quelle année a eu lieu la Révolution française?', '1789', ARRAY['1776', '1804', '1815'], 'La Révolution française a débuté en 1789 avec la prise de la Bastille le 14 juillet.'),
  (history_id, 1, 'Qui était le premier empereur romain?', 'Auguste', ARRAY['Jules César', 'Néron', 'Caligula'], 'Auguste (Octave) est devenu le premier empereur romain en 27 av. J.-C.'),
  (history_id, 2, 'Quelle civilisation a construit Machu Picchu?', 'Les Incas', ARRAY['Les Mayas', 'Les Aztèques', 'Les Olmèques'], 'Machu Picchu a été construit par les Incas au 15ème siècle.'),
  (history_id, 2, 'En quelle année le mur de Berlin est-il tombé?', '1989', ARRAY['1991', '1987', '1985'], 'Le mur de Berlin est tombé le 9 novembre 1989.'),
  (history_id, 3, 'Quel pharaon a construit la Grande Pyramide de Gizeh?', 'Khéops', ARRAY['Ramsès II', 'Toutânkhamon', 'Khéphren'], 'La Grande Pyramide a été construite pour le pharaon Khéops vers 2560 av. J.-C.');

  -- GEOGRAPHY QUESTIONS
  INSERT INTO public.questions (category_id, difficulty, question_text, correct_answer, wrong_answers, explanation) VALUES
  (geography_id, 1, 'Quelle est la capitale de l''Australie?', 'Canberra', ARRAY['Sydney', 'Melbourne', 'Brisbane'], 'Canberra est la capitale de l''Australie depuis 1913, choisie comme compromis entre Sydney et Melbourne.'),
  (geography_id, 1, 'Quel est le plus long fleuve du monde?', 'Le Nil', ARRAY['L''Amazone', 'Le Yangtsé', 'Le Mississippi'], 'Le Nil mesure environ 6 650 km, ce qui en fait le plus long fleuve du monde.'),
  (geography_id, 2, 'Quel pays a le plus de fuseaux horaires?', 'La France', ARRAY['La Russie', 'Les États-Unis', 'La Chine'], 'Grâce à ses territoires d''outre-mer, la France couvre 12 fuseaux horaires.'),
  (geography_id, 2, 'Quel est le plus petit pays du monde?', 'Le Vatican', ARRAY['Monaco', 'Saint-Marin', 'Liechtenstein'], 'Le Vatican ne fait que 0,44 km², ce qui en fait le plus petit État du monde.'),
  (geography_id, 3, 'Quel pays possède le plus de volcans actifs?', 'L''Indonésie', ARRAY['Le Japon', 'Les États-Unis', 'L''Islande'], 'L''Indonésie compte environ 130 volcans actifs, le plus grand nombre au monde.');

  -- SCIENCE QUESTIONS
  INSERT INTO public.questions (category_id, difficulty, question_text, correct_answer, wrong_answers, explanation) VALUES
  (science_id, 1, 'Quel est le symbole chimique de l''or?', 'Au', ARRAY['Or', 'Ag', 'Fe'], 'Au vient du latin "aurum" qui signifie or.'),
  (science_id, 1, 'Combien de planètes y a-t-il dans notre système solaire?', '8', ARRAY['9', '7', '10'], 'Depuis 2006, Pluton n''est plus considérée comme une planète, il en reste donc 8.'),
  (science_id, 2, 'Quel organe produit l''insuline?', 'Le pancréas', ARRAY['Le foie', 'Les reins', 'L''estomac'], 'L''insuline est produite par les cellules bêta du pancréas.'),
  (science_id, 2, 'Quelle est la vitesse de la lumière?', '300 000 km/s', ARRAY['150 000 km/s', '500 000 km/s', '1 000 000 km/s'], 'La lumière voyage à environ 299 792 km/s dans le vide.'),
  (science_id, 3, 'Quel est l''élément le plus abondant dans l''univers?', 'L''hydrogène', ARRAY['L''hélium', 'L''oxygène', 'Le carbone'], 'L''hydrogène représente environ 75% de la masse de l''univers.');

  -- SPORTS QUESTIONS
  INSERT INTO public.questions (category_id, difficulty, question_text, correct_answer, wrong_answers, explanation) VALUES
  (sports_id, 1, 'Dans quel sport utilise-t-on un volant?', 'Le badminton', ARRAY['Le tennis', 'Le squash', 'Le ping-pong'], 'Le volant (ou shuttlecock) est utilisé en badminton.'),
  (sports_id, 1, 'Combien de joueurs y a-t-il dans une équipe de football?', '11', ARRAY['10', '12', '9'], 'Une équipe de football compte 11 joueurs sur le terrain.'),
  (sports_id, 2, 'Quel pays a gagné le plus de Coupes du Monde de football?', 'Le Brésil', ARRAY['L''Allemagne', 'L''Italie', 'L''Argentine'], 'Le Brésil a remporté 5 Coupes du Monde (1958, 1962, 1970, 1994, 2002).'),
  (sports_id, 2, 'Quelle est la durée d''un match de basket NBA?', '48 minutes', ARRAY['40 minutes', '60 minutes', '45 minutes'], 'Un match NBA dure 48 minutes, divisé en 4 quarts-temps de 12 minutes.'),
  (sports_id, 3, 'Qui détient le record du 100m?', 'Usain Bolt', ARRAY['Tyson Gay', 'Carl Lewis', 'Justin Gatlin'], 'Usain Bolt détient le record du monde en 9,58 secondes depuis 2009.');

  -- POP CULTURE QUESTIONS
  INSERT INTO public.questions (category_id, difficulty, question_text, correct_answer, wrong_answers, explanation) VALUES
  (popculture_id, 1, 'Quel est le film le plus rentable de tous les temps?', 'Avatar', ARRAY['Avengers: Endgame', 'Titanic', 'Star Wars'], 'Avatar de James Cameron a généré plus de 2,9 milliards de dollars.'),
  (popculture_id, 1, 'Qui a chanté "Thriller"?', 'Michael Jackson', ARRAY['Prince', 'Madonna', 'Whitney Houston'], 'Thriller de Michael Jackson est l''album le plus vendu de tous les temps.'),
  (popculture_id, 2, 'Dans quelle série trouve-t-on la famille Stark?', 'Game of Thrones', ARRAY['The Witcher', 'Vikings', 'The Last Kingdom'], 'La famille Stark est l''une des grandes maisons de Westeros dans Game of Thrones.'),
  (popculture_id, 2, 'Quel artiste a peint "La Nuit étoilée"?', 'Vincent van Gogh', ARRAY['Claude Monet', 'Pablo Picasso', 'Salvador Dalí'], 'La Nuit étoilée a été peinte par Van Gogh en 1889.'),
  (popculture_id, 3, 'En quelle année est sorti le premier iPhone?', '2007', ARRAY['2005', '2008', '2010'], 'Le premier iPhone a été présenté par Steve Jobs le 9 janvier 2007.');

END $$;
