-- Migration: Add sample questions with Unsplash images
-- This adds questions with real images to test the image display feature

-- Insert new questions with images (French)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, image_url, image_credit, explanation) VALUES
(
  'Quel monument parisien est visible sur cette photo?',
  'La Tour Eiffel',
  ARRAY['L''Arc de Triomphe', 'Notre-Dame', 'Le Sacré-Cœur'],
  'geography',
  1,
  'fr',
  true,
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
  'Photo by Chris Karidis on Unsplash',
  'La Tour Eiffel, construite par Gustave Eiffel pour l''Exposition universelle de 1889, mesure 330 mètres de haut.'
),
(
  'Quel est cet animal emblématique de l''Australie?',
  'Le kangourou',
  ARRAY['Le koala', 'L''ornithorynque', 'Le wombat'],
  'animals',
  1,
  'fr',
  true,
  'https://images.unsplash.com/photo-1534307671554-9a6d81f4d629?w=800',
  'Photo by Photoholgic on Unsplash',
  'Le kangourou est le plus grand marsupial et peut faire des bonds de plus de 9 mètres.'
),
(
  'Quelle planète du système solaire possède ces célèbres anneaux?',
  'Saturne',
  ARRAY['Jupiter', 'Uranus', 'Neptune'],
  'science',
  1,
  'fr',
  true,
  'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800',
  'Photo by NASA on Unsplash',
  'Les anneaux de Saturne sont composés principalement de glace et de roches, et s''étendent sur 282 000 km.'
),
(
  'Quel sport se pratique sur ce terrain vert?',
  'Le football',
  ARRAY['Le rugby', 'Le cricket', 'Le hockey sur gazon'],
  'sports',
  1,
  'fr',
  true,
  'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800',
  'Photo by Vienna Reyes on Unsplash',
  'Le football est le sport le plus populaire au monde avec plus de 4 milliards de fans.'
),
(
  'Quel célèbre monument romain est représenté ici?',
  'Le Colisée',
  ARRAY['Le Panthéon', 'Le Forum romain', 'L''Arc de Constantin'],
  'history',
  1,
  'fr',
  true,
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
  'Photo by David Köhler on Unsplash',
  'Le Colisée, construit entre 70 et 80 après J.-C., pouvait accueillir jusqu''à 80 000 spectateurs.'
),
(
  'Quelle merveille du monde antique est encore visible à Gizeh?',
  'La Grande Pyramide',
  ARRAY['Le Phare d''Alexandrie', 'Le Colosse de Rhodes', 'Les Jardins de Babylone'],
  'history',
  2,
  'fr',
  true,
  'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800',
  'Photo by Simon Matzinger on Unsplash',
  'La Grande Pyramide de Gizeh est la seule des Sept Merveilles du monde antique encore existante.'
),
(
  'Quel célèbre joueur de football est surnommé "La Pulga"?',
  'Lionel Messi',
  ARRAY['Cristiano Ronaldo', 'Neymar', 'Kylian Mbappé'],
  'sports',
  1,
  'fr',
  true,
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
  'Photo by Chaos Soccer Gear on Unsplash',
  'Lionel Messi est surnommé "La Pulga" (la puce) en raison de sa petite taille et de son agilité.'
);

-- Insert new questions with images (English)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, image_url, image_credit, explanation) VALUES
(
  'What famous Parisian monument is shown in this photo?',
  'The Eiffel Tower',
  ARRAY['Arc de Triomphe', 'Notre-Dame', 'Sacré-Cœur'],
  'geography',
  1,
  'en',
  true,
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
  'Photo by Chris Karidis on Unsplash',
  'The Eiffel Tower, built by Gustave Eiffel for the 1889 World''s Fair, stands 330 meters tall.'
),
(
  'What is this iconic Australian animal?',
  'Kangaroo',
  ARRAY['Koala', 'Platypus', 'Wombat'],
  'animals',
  1,
  'en',
  true,
  'https://images.unsplash.com/photo-1534307671554-9a6d81f4d629?w=800',
  'Photo by Photoholgic on Unsplash',
  'The kangaroo is the largest marsupial and can jump over 9 meters in a single bound.'
),
(
  'Which planet in our solar system has these famous rings?',
  'Saturn',
  ARRAY['Jupiter', 'Uranus', 'Neptune'],
  'science',
  1,
  'en',
  true,
  'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800',
  'Photo by NASA on Unsplash',
  'Saturn''s rings are made mainly of ice and rock, and extend up to 282,000 km.'
),
(
  'What ancient Roman landmark is pictured here?',
  'The Colosseum',
  ARRAY['The Pantheon', 'Roman Forum', 'Arch of Constantine'],
  'history',
  1,
  'en',
  true,
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
  'Photo by David Köhler on Unsplash',
  'The Colosseum, built between 70-80 AD, could hold up to 80,000 spectators.'
),
(
  'Which ancient wonder of the world is still standing in Giza?',
  'The Great Pyramid',
  ARRAY['Lighthouse of Alexandria', 'Colossus of Rhodes', 'Hanging Gardens of Babylon'],
  'history',
  2,
  'en',
  true,
  'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800',
  'Photo by Simon Matzinger on Unsplash',
  'The Great Pyramid of Giza is the only one of the Seven Wonders of the Ancient World still standing.'
),
(
  'Which famous football player is nicknamed "La Pulga"?',
  'Lionel Messi',
  ARRAY['Cristiano Ronaldo', 'Neymar', 'Kylian Mbappé'],
  'sports',
  1,
  'en',
  true,
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
  'Photo by Chaos Soccer Gear on Unsplash',
  'Lionel Messi is nicknamed "La Pulga" (the flea) because of his small stature and agility.'
);
