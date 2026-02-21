-- Migration: Add 200 math questions (100 French + 100 English)
-- Topics: mental math, famous math facts, geometry, logic, number theory, stats, math history, patterns
-- Difficulty spread: 30% easy (1-2), 50% medium (3), 20% hard (4-5)

-- =============================================
-- FRENCH QUESTIONS (100)
-- =============================================

-- DIFFICULTY 1 (15 questions)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien font 7 x 8 ?',
  '56',
  ARRAY['54', '48', '63'],
  'sciences',
  1,
  'fr',
  true,
  '7 x 8 = 56. Un classique des tables de multiplication !'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien de côtés a un triangle ?',
  '3',
  ARRAY['4', '5', '6'],
  'sciences',
  1,
  'fr',
  true,
  'Le mot "triangle" vient du latin "tri" (trois) et "angulus" (angle).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le double de 25 ?',
  '50',
  ARRAY['45', '55', '40'],
  'sciences',
  1,
  'fr',
  true,
  '25 x 2 = 50.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien font 100 - 37 ?',
  '63',
  ARRAY['67', '73', '53'],
  'sciences',
  1,
  'fr',
  true,
  '100 - 37 = 63. Astuce : 100 - 40 + 3 = 63.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien y a-t-il de centimètres dans un mètre ?',
  '100',
  ARRAY['10', '1000', '50'],
  'sciences',
  1,
  'fr',
  true,
  'Le préfixe "centi" signifie centième, donc 1 m = 100 cm.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le résultat de 15 + 28 ?',
  '43',
  ARRAY['42', '44', '53'],
  'sciences',
  1,
  'fr',
  true,
  '15 + 28 = 43. On peut décomposer : 15 + 30 - 2 = 43.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle forme géométrique a 4 côtés égaux et 4 angles droits ?',
  'Le carré',
  ARRAY['Le rectangle', 'Le losange', 'Le trapèze'],
  'sciences',
  1,
  'fr',
  true,
  'Le carré est le seul quadrilatère avec 4 côtés égaux ET 4 angles droits.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien font 9 x 9 ?',
  '81',
  ARRAY['72', '89', '79'],
  'sciences',
  1,
  'fr',
  true,
  '9 x 9 = 81. Astuce : 9 x 10 - 9 = 81.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'La moitié de 64, c''est combien ?',
  '32',
  ARRAY['34', '28', '36'],
  'sciences',
  1,
  'fr',
  true,
  '64 / 2 = 32.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien font 12 x 5 ?',
  '60',
  ARRAY['55', '65', '50'],
  'sciences',
  1,
  'fr',
  true,
  '12 x 5 = 60. Astuce : 10 x 5 + 2 x 5 = 60.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien de faces a un dé classique ?',
  '6',
  ARRAY['4', '8', '12'],
  'sciences',
  1,
  'fr',
  true,
  'Un dé standard est un cube, et un cube a 6 faces.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel nombre vient juste après 999 ?',
  '1000',
  ARRAY['1001', '990', '9910'],
  'sciences',
  1,
  'fr',
  true,
  '999 + 1 = 1000.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien de minutes y a-t-il dans une heure ?',
  '60',
  ARRAY['100', '30', '90'],
  'sciences',
  1,
  'fr',
  true,
  'Une heure = 60 minutes = 3600 secondes.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus petit nombre premier ?',
  '2',
  ARRAY['1', '3', '0'],
  'sciences',
  1,
  'fr',
  true,
  '2 est le plus petit nombre premier, et le seul nombre premier pair !'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien font 50 + 50 + 50 ?',
  '150',
  ARRAY['100', '200', '155'],
  'sciences',
  1,
  'fr',
  true,
  '3 x 50 = 150.'
);

-- DIFFICULTY 2 (15 questions)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien font 25% de 200 ?',
  '50',
  ARRAY['25', '40', '75'],
  'sciences',
  2,
  'fr',
  true,
  '25% = un quart. 200 / 4 = 50.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le carré de 12 ?',
  '144',
  ARRAY['124', '132', '148'],
  'sciences',
  2,
  'fr',
  true,
  '12 x 12 = 144.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien d''angles a un hexagone ?',
  '6',
  ARRAY['5', '8', '7'],
  'sciences',
  2,
  'fr',
  true,
  'Le préfixe "hexa" signifie six. Un hexagone a 6 côtés et 6 angles.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le résultat de 3 puissance 4 (3⁴) ?',
  '81',
  ARRAY['64', '27', '12'],
  'sciences',
  2,
  'fr',
  true,
  '3⁴ = 3 x 3 x 3 x 3 = 81.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Par combien de chiffres commence le nombre Pi ?',
  '3,14',
  ARRAY['2,71', '1,61', '3,41'],
  'sciences',
  2,
  'fr',
  true,
  'Pi commence par 3,14159... C''est le rapport entre la circonférence et le diamètre d''un cercle.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien font 1/4 + 1/4 ?',
  '1/2',
  ARRAY['1/8', '2/8', '1/4'],
  'sciences',
  2,
  'fr',
  true,
  '1/4 + 1/4 = 2/4 = 1/2.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la somme des angles d''un triangle ?',
  '180°',
  ARRAY['90°', '360°', '270°'],
  'sciences',
  2,
  'fr',
  true,
  'La somme des angles intérieurs d''un triangle est toujours 180°.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien font 15% de 80 ?',
  '12',
  ARRAY['8', '15', '10'],
  'sciences',
  2,
  'fr',
  true,
  '15% de 80 = 0,15 x 80 = 12. Astuce : 10% = 8, 5% = 4, total = 12.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le périmètre d''un carré de côté 7 cm ?',
  '28 cm',
  ARRAY['14 cm', '49 cm', '21 cm'],
  'sciences',
  2,
  'fr',
  true,
  'Périmètre d''un carré = 4 x côté = 4 x 7 = 28 cm.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien vaut la racine carrée de 49 ?',
  '7',
  ARRAY['6', '8', '9'],
  'sciences',
  2,
  'fr',
  true,
  '√49 = 7 car 7 x 7 = 49.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Si tu lances un dé, quelle est la probabilité de tomber sur 6 ?',
  '1 chance sur 6',
  ARRAY['1 chance sur 3', '1 chance sur 2', '1 chance sur 12'],
  'sciences',
  2,
  'fr',
  true,
  'Un dé a 6 faces, chaque face a la même probabilité : 1/6.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Que vaut 2⁰ (2 puissance 0) ?',
  '1',
  ARRAY['0', '2', 'Indéfini'],
  'sciences',
  2,
  'fr',
  true,
  'Tout nombre (sauf 0) élevé à la puissance 0 vaut 1.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien font 0,5 x 0,5 ?',
  '0,25',
  ARRAY['0,1', '1', '0,50'],
  'sciences',
  2,
  'fr',
  true,
  '0,5 x 0,5 = 0,25. La moitié d''une moitié, c''est un quart !'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Un rectangle fait 8 cm de long et 3 cm de large. Quelle est son aire ?',
  '24 cm²',
  ARRAY['22 cm²', '11 cm²', '32 cm²'],
  'sciences',
  2,
  'fr',
  true,
  'Aire d''un rectangle = longueur x largeur = 8 x 3 = 24 cm².'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel nombre multiplié par lui-même donne 121 ?',
  '11',
  ARRAY['12', '10', '13'],
  'sciences',
  2,
  'fr',
  true,
  '11 x 11 = 121. 121 est un carré parfait.'
);

-- DIFFICULTY 3 (50 questions)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la suite de Fibonacci après 1, 1, 2, 3, 5, 8 ?',
  '13',
  ARRAY['11', '14', '10'],
  'sciences',
  3,
  'fr',
  true,
  'Chaque nombre de Fibonacci est la somme des deux précédents : 5 + 8 = 13.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien y a-t-il de nombres premiers entre 1 et 10 ?',
  '4',
  ARRAY['3', '5', '6'],
  'sciences',
  3,
  'fr',
  true,
  'Les nombres premiers entre 1 et 10 sont : 2, 3, 5 et 7.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel mathématicien grec est célèbre pour son théorème sur les triangles rectangles ?',
  'Pythagore',
  ARRAY['Euclide', 'Archimède', 'Thalès'],
  'sciences',
  3,
  'fr',
  true,
  'Le théorème de Pythagore : dans un triangle rectangle, a² + b² = c².'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien font 17 x 6 ?',
  '102',
  ARRAY['96', '108', '112'],
  'sciences',
  3,
  'fr',
  true,
  '17 x 6 = 102. Astuce : (20 x 6) - (3 x 6) = 120 - 18 = 102.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le nombre d''or (approximation) ?',
  '1,618',
  ARRAY['3,14', '2,718', '1,414'],
  'sciences',
  3,
  'fr',
  true,
  'Le nombre d''or (phi) ≈ 1,618. On le retrouve dans la nature, l''art et l''architecture.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est l''aire d''un triangle de base 10 cm et de hauteur 6 cm ?',
  '30 cm²',
  ARRAY['60 cm²', '16 cm²', '36 cm²'],
  'sciences',
  3,
  'fr',
  true,
  'Aire = (base x hauteur) / 2 = (10 x 6) / 2 = 30 cm².'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Comment appelle-t-on un polygone à 8 côtés ?',
  'Un octogone',
  ARRAY['Un heptagone', 'Un décagone', 'Un nonagone'],
  'sciences',
  3,
  'fr',
  true,
  'Le préfixe "octo" signifie huit. Les panneaux STOP sont des octogones !'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Si tu lances deux dés, quelle somme a le plus de chances de sortir ?',
  '7',
  ARRAY['6', '8', '12'],
  'sciences',
  3,
  'fr',
  true,
  '7 peut être obtenu de 6 façons différentes (1+6, 2+5, 3+4...), plus que toute autre somme.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien vaut la racine carrée de 169 ?',
  '13',
  ARRAY['11', '12', '14'],
  'sciences',
  3,
  'fr',
  true,
  '√169 = 13 car 13 x 13 = 169.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est 40% de 250 ?',
  '100',
  ARRAY['80', '125', '150'],
  'sciences',
  3,
  'fr',
  true,
  '40% de 250 = 0,4 x 250 = 100.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien de diagonales a un pentagone ?',
  '5',
  ARRAY['3', '7', '10'],
  'sciences',
  3,
  'fr',
  true,
  'Un pentagone a 5 diagonales. Formule : n(n-3)/2 = 5(5-3)/2 = 5.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Que vaut (-3) x (-4) ?',
  '12',
  ARRAY['-12', '-7', '7'],
  'sciences',
  3,
  'fr',
  true,
  'Moins fois moins = plus. (-3) x (-4) = 12.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel siècle le mathématicien Blaise Pascal a-t-il vécu ?',
  'XVIIe siècle',
  ARRAY['XVIe siècle', 'XVIIIe siècle', 'XIXe siècle'],
  'sciences',
  3,
  'fr',
  true,
  'Blaise Pascal (1623-1662) a vécu au XVIIe siècle. Il a inventé la Pascaline, une des premières calculatrices.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien font 999 + 999 ?',
  '1998',
  ARRAY['1988', '2008', '1899'],
  'sciences',
  3,
  'fr',
  true,
  '999 + 999 = 1998. Astuce : 1000 + 1000 - 2 = 1998.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Si un train roule à 120 km/h, quelle distance parcourt-il en 15 minutes ?',
  '30 km',
  ARRAY['15 km', '45 km', '60 km'],
  'sciences',
  3,
  'fr',
  true,
  '15 min = 1/4 d''heure. 120 / 4 = 30 km.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le PGCD (plus grand commun diviseur) de 12 et 18 ?',
  '6',
  ARRAY['3', '9', '12'],
  'sciences',
  3,
  'fr',
  true,
  'Les diviseurs de 12 : 1, 2, 3, 4, 6, 12. Les diviseurs de 18 : 1, 2, 3, 6, 9, 18. Le plus grand commun est 6.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien de sommets a un cube ?',
  '8',
  ARRAY['6', '4', '12'],
  'sciences',
  3,
  'fr',
  true,
  'Un cube a 8 sommets, 12 arêtes et 6 faces.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le résultat de 2⁸ ?',
  '256',
  ARRAY['128', '512', '64'],
  'sciences',
  3,
  'fr',
  true,
  '2⁸ = 256. C''est aussi le nombre de valeurs d''un octet en informatique !'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel type de nombre est 1/3 en écriture décimale ?',
  'Un nombre décimal périodique',
  ARRAY['Un nombre entier', 'Un nombre irrationnel', 'Un nombre fini'],
  'sciences',
  3,
  'fr',
  true,
  '1/3 = 0,3333... Le 3 se répète à l''infini, c''est un décimal périodique.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel angle forme les aiguilles d''une horloge à 3 heures pile ?',
  '90°',
  ARRAY['60°', '120°', '180°'],
  'sciences',
  3,
  'fr',
  true,
  'À 3h, l''aiguille des minutes est sur le 12 et celle des heures sur le 3 : elles forment un angle droit de 90°.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien font 3! (factorielle de 3) ?',
  '6',
  ARRAY['3', '9', '27'],
  'sciences',
  3,
  'fr',
  true,
  '3! = 3 x 2 x 1 = 6.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Dans un jeu de 52 cartes, quelle est la probabilité de tirer un as ?',
  '4 sur 52',
  ARRAY['1 sur 52', '2 sur 52', '13 sur 52'],
  'sciences',
  3,
  'fr',
  true,
  'Il y a 4 as dans un jeu de 52 cartes, donc la probabilité est 4/52 = 1/13.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Comment s''appelle un triangle avec tous ses côtés égaux ?',
  'Équilatéral',
  ARRAY['Isocèle', 'Scalène', 'Rectangle'],
  'sciences',
  3,
  'fr',
  true,
  'Équilatéral = 3 côtés égaux. Isocèle = 2 côtés égaux. Scalène = tous différents.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien de zéros a un million ?',
  '6',
  ARRAY['5', '7', '9'],
  'sciences',
  3,
  'fr',
  true,
  '1 000 000 a 6 zéros.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le volume d''un cube de côté 3 cm ?',
  '27 cm³',
  ARRAY['9 cm³', '18 cm³', '81 cm³'],
  'sciences',
  3,
  'fr',
  true,
  'Volume d''un cube = côté³ = 3³ = 27 cm³.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le résultat de 11 x 11 ?',
  '121',
  ARRAY['111', '131', '122'],
  'sciences',
  3,
  'fr',
  true,
  '11 x 11 = 121. Tous les carrés de nombres en "1" suivent un joli motif : 11² = 121, 111² = 12321.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Si une pizza est coupée en 8 parts et que tu en manges 3, quelle fraction reste-t-il ?',
  '5/8',
  ARRAY['3/8', '3/5', '5/3'],
  'sciences',
  3,
  'fr',
  true,
  '8/8 - 3/8 = 5/8 de la pizza restante.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Qui a inventé le système de coordonnées cartésiennes ?',
  'René Descartes',
  ARRAY['Isaac Newton', 'Blaise Pascal', 'Pierre de Fermat'],
  'sciences',
  3,
  'fr',
  true,
  'René Descartes a inventé le système de coordonnées (x, y). D''où le nom "cartésien" !'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien font 18² - 17² ?',
  '35',
  ARRAY['1', '17', '36'],
  'sciences',
  3,
  'fr',
  true,
  'Astuce : a² - b² = (a+b)(a-b). Donc 18² - 17² = (18+17)(18-17) = 35 x 1 = 35.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pourcentage représente 3 sur 4 ?',
  '75%',
  ARRAY['60%', '80%', '66%'],
  'sciences',
  3,
  'fr',
  true,
  '3/4 = 0,75 = 75%.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la somme des angles d''un quadrilatère ?',
  '360°',
  ARRAY['180°', '270°', '540°'],
  'sciences',
  3,
  'fr',
  true,
  'Un quadrilatère peut être divisé en 2 triangles. 2 x 180° = 360°.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien y a-t-il de combinaisons possibles pour un code à 4 chiffres (0-9) ?',
  '10 000',
  ARRAY['1 000', '9 999', '100 000'],
  'sciences',
  3,
  'fr',
  true,
  '10 x 10 x 10 x 10 = 10 000 combinaisons (de 0000 à 9999).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus petit multiple commun de 4 et 6 ?',
  '12',
  ARRAY['24', '6', '8'],
  'sciences',
  3,
  'fr',
  true,
  'Multiples de 4 : 4, 8, 12... Multiples de 6 : 6, 12... Le plus petit commun est 12.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Que signifie le symbole ≈ en maths ?',
  'Environ égal à',
  ARRAY['Strictement supérieur à', 'Différent de', 'Proportionnel à'],
  'sciences',
  3,
  'fr',
  true,
  '≈ signifie "approximativement égal à". Par exemple π ≈ 3,14.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien de litres font 2,5 m³ d''eau ?',
  '2 500 litres',
  ARRAY['250 litres', '25 litres', '25 000 litres'],
  'sciences',
  3,
  'fr',
  true,
  '1 m³ = 1000 litres. Donc 2,5 m³ = 2 500 litres.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Un nombre divisible par 2 et par 3 est forcément divisible par... ?',
  '6',
  ARRAY['5', '9', '12'],
  'sciences',
  3,
  'fr',
  true,
  'Si un nombre est divisible par 2 et par 3 (premiers entre eux), il est divisible par 2 x 3 = 6.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le résultat de la somme 1 + 2 + 3 + ... + 10 ?',
  '55',
  ARRAY['45', '50', '60'],
  'sciences',
  3,
  'fr',
  true,
  'Formule de Gauss : n(n+1)/2 = 10 x 11 / 2 = 55.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien d''arêtes a un cube ?',
  '12',
  ARRAY['8', '6', '10'],
  'sciences',
  3,
  'fr',
  true,
  'Un cube a 12 arêtes : 4 en haut, 4 en bas, et 4 verticales.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le 10e nombre de la suite de Fibonacci ?',
  '55',
  ARRAY['34', '89', '44'],
  'sciences',
  3,
  'fr',
  true,
  'La suite : 1, 1, 2, 3, 5, 8, 13, 21, 34, 55. Le 10e terme est 55.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien fait 125 x 8 ?',
  '1000',
  ARRAY['900', '1025', '800'],
  'sciences',
  3,
  'fr',
  true,
  '125 x 8 = 1000. Astuce utile : 1/8 = 0,125.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le nom du segment qui relie le centre d''un cercle à sa circonférence ?',
  'Le rayon',
  ARRAY['Le diamètre', 'La corde', 'La tangente'],
  'sciences',
  3,
  'fr',
  true,
  'Le rayon va du centre au bord. Le diamètre traverse tout le cercle (= 2 rayons).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien de faces a un icosaèdre ?',
  '20',
  ARRAY['12', '10', '8'],
  'sciences',
  3,
  'fr',
  true,
  'Le préfixe "icosa" vient du grec "eikosi" (vingt). Un icosaèdre a 20 faces triangulaires.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'La moyenne de 4, 8 et 12 est ?',
  '8',
  ARRAY['6', '10', '9'],
  'sciences',
  3,
  'fr',
  true,
  'Moyenne = (4 + 8 + 12) / 3 = 24 / 3 = 8.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le résultat de √2 arrondi au centième ?',
  '1,41',
  ARRAY['1,73', '1,22', '1,62'],
  'sciences',
  3,
  'fr',
  true,
  '√2 ≈ 1,41421... C''est un nombre irrationnel.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien de secondes y a-t-il dans une journée ?',
  '86 400',
  ARRAY['36 000', '43 200', '72 000'],
  'sciences',
  3,
  'fr',
  true,
  '24 heures x 60 minutes x 60 secondes = 86 400 secondes.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Si on plie une feuille de papier 7 fois, combien de couches obtient-on ?',
  '128',
  ARRAY['64', '14', '256'],
  'sciences',
  3,
  'fr',
  true,
  'Chaque pli double le nombre de couches : 2⁷ = 128 couches.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la formule de la circonférence d''un cercle ?',
  '2πr',
  ARRAY['πr²', 'πd²', '4πr'],
  'sciences',
  3,
  'fr',
  true,
  'Circonférence = 2πr (ou πd). L''aire, elle, c''est πr².'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Comment appelle-t-on un nombre qui ne peut pas s''écrire sous forme de fraction ?',
  'Un nombre irrationnel',
  ARRAY['Un nombre décimal', 'Un nombre premier', 'Un nombre entier'],
  'sciences',
  3,
  'fr',
  true,
  'Les nombres irrationnels (comme π ou √2) ont une écriture décimale infinie non périodique.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le résultat de 37 x 3 ?',
  '111',
  ARRAY['101', '113', '131'],
  'sciences',
  3,
  'fr',
  true,
  '37 x 3 = 111. Fait amusant : 37 x 6 = 222, 37 x 9 = 333, etc.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Si tu doubles un centime chaque jour pendant 10 jours, combien as-tu ?',
  '5,12 euros',
  ARRAY['0,10 euros', '1,00 euro', '10,24 euros'],
  'sciences',
  3,
  'fr',
  true,
  'Jour 1 : 0,01. Jour 2 : 0,02... Jour 10 : 2⁹ centimes = 512 centimes = 5,12 euros.'
);

-- DIFFICULTY 4 (15 questions)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel mathématicien a démontré qu''il existe une infinité de nombres premiers ?',
  'Euclide',
  ARRAY['Pythagore', 'Euler', 'Gauss'],
  'sciences',
  4,
  'fr',
  true,
  'Euclide a démontré vers 300 av. J.-C. qu''on ne peut pas lister tous les nombres premiers car il y en a une infinité.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien vaut la somme des 100 premiers entiers positifs ?',
  '5050',
  ARRAY['5000', '5100', '4950'],
  'sciences',
  4,
  'fr',
  true,
  'Gauss a trouvé cette astuce enfant : 100 x 101 / 2 = 5050.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le nombre e (constante d''Euler) arrondi au centième ?',
  '2,72',
  ARRAY['3,14', '1,62', '2,23'],
  'sciences',
  4,
  'fr',
  true,
  'e ≈ 2,71828... C''est la base du logarithme naturel.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien de faces a un dodécaèdre ?',
  '12',
  ARRAY['20', '10', '8'],
  'sciences',
  4,
  'fr',
  true,
  '"Dodéca" vient du grec pour douze. Un dodécaèdre a 12 faces pentagonales.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Que vaut 5! (factorielle de 5) ?',
  '120',
  ARRAY['60', '24', '720'],
  'sciences',
  4,
  'fr',
  true,
  '5! = 5 x 4 x 3 x 2 x 1 = 120.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Dans un triangle rectangle, si les deux côtés de l''angle droit mesurent 5 et 12, combien mesure l''hypoténuse ?',
  '13',
  ARRAY['17', '15', '14'],
  'sciences',
  4,
  'fr',
  true,
  'Par Pythagore : √(5² + 12²) = √(25 + 144) = √169 = 13.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus grand nombre premier à deux chiffres ?',
  '97',
  ARRAY['99', '93', '91'],
  'sciences',
  4,
  'fr',
  true,
  '97 est premier. 99 = 9 x 11, 93 = 3 x 31, 91 = 7 x 13.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien de façons peut-on ordonner 4 livres différents sur une étagère ?',
  '24',
  ARRAY['16', '12', '8'],
  'sciences',
  4,
  'fr',
  true,
  'C''est 4! = 4 x 3 x 2 x 1 = 24 arrangements possibles.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel mathématicien a posé les bases de la théorie des probabilités avec Pascal ?',
  'Pierre de Fermat',
  ARRAY['Descartes', 'Leibniz', 'Bernoulli'],
  'sciences',
  4,
  'fr',
  true,
  'Pascal et Fermat ont échangé des lettres en 1654 qui fondèrent la théorie des probabilités.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est l''aire d''un cercle de rayon 5 cm (en valeur exacte) ?',
  '25π cm²',
  ARRAY['10π cm²', '5π cm²', '50π cm²'],
  'sciences',
  4,
  'fr',
  true,
  'Aire = πr² = π x 5² = 25π cm² ≈ 78,5 cm².'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le 7e nombre premier ?',
  '17',
  ARRAY['13', '19', '15'],
  'sciences',
  4,
  'fr',
  true,
  'Les 7 premiers nombres premiers : 2, 3, 5, 7, 11, 13, 17.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien y a-t-il de façons de choisir 2 objets parmi 5 (combinaisons) ?',
  '10',
  ARRAY['20', '5', '25'],
  'sciences',
  4,
  'fr',
  true,
  'C(5,2) = 5! / (2! x 3!) = 10.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Que signifie le mot "algorithme" à l''origine ?',
  'Il vient du nom du mathématicien Al-Khwarizmi',
  ARRAY['Il vient du grec "arithmos" (nombre)', 'Il a été inventé par Alan Turing', 'Il vient du latin "calculus"'],
  'sciences',
  4,
  'fr',
  true,
  'Al-Khwarizmi (IXe siècle) est un mathématicien perse dont le nom latinisé a donné "algorithme".'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le résultat de log₁₀(1000) ?',
  '3',
  ARRAY['10', '100', '30'],
  'sciences',
  4,
  'fr',
  true,
  'log₁₀(1000) = 3 car 10³ = 1000.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien vaut 2¹⁰ ?',
  '1024',
  ARRAY['512', '2048', '1000'],
  'sciences',
  4,
  'fr',
  true,
  '2¹⁰ = 1024. C''est pour ça que 1 Ko ≈ 1024 octets en informatique.'
);

-- DIFFICULTY 5 (5 questions)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle conjecture non résolue affirme que tout nombre pair supérieur à 2 est la somme de deux nombres premiers ?',
  'La conjecture de Goldbach',
  ARRAY['La conjecture de Riemann', 'Le dernier théorème de Fermat', 'La conjecture de Collatz'],
  'sciences',
  5,
  'fr',
  true,
  'Formulée en 1742, la conjecture de Goldbach reste non prouvée malgré des siècles de recherche.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Qui a démontré le dernier théorème de Fermat en 1995 ?',
  'Andrew Wiles',
  ARRAY['Grigori Perelman', 'Terence Tao', 'John Nash'],
  'sciences',
  5,
  'fr',
  true,
  'Andrew Wiles a démontré en 1995 que xⁿ + yⁿ = zⁿ n''a pas de solution entière pour n > 2.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien de solides de Platon existe-t-il ?',
  '5',
  ARRAY['6', '7', '4'],
  'sciences',
  5,
  'fr',
  true,
  'Les 5 solides de Platon : tétraèdre, cube, octaèdre, dodécaèdre et icosaèdre.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la valeur de i² (où i est l''unité imaginaire) ?',
  '-1',
  ARRAY['1', '0', 'i'],
  'sciences',
  5,
  'fr',
  true,
  'Par définition, i = √(-1), donc i² = -1. C''est la base des nombres complexes.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle identité mathématique relie e, π, i, 1 et 0 en une seule équation ?',
  'L''identité d''Euler : e^(iπ) + 1 = 0',
  ARRAY['Le théorème de Pythagore', 'La formule de Gauss', 'L''équation de Diophante'],
  'sciences',
  5,
  'fr',
  true,
  'Souvent considérée comme la plus belle formule des maths, elle relie les 5 constantes fondamentales.'
);

-- =============================================
-- ENGLISH QUESTIONS (100)
-- =============================================

-- DIFFICULTY 1 (15 questions)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 7 x 8?',
  '56',
  ARRAY['54', '48', '63'],
  'sciences',
  1,
  'en',
  true,
  '7 x 8 = 56. A multiplication classic!'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many sides does a triangle have?',
  '3',
  ARRAY['4', '5', '6'],
  'sciences',
  1,
  'en',
  true,
  'The word "triangle" comes from Latin "tri" (three) and "angulus" (angle).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 100 - 37?',
  '63',
  ARRAY['67', '73', '53'],
  'sciences',
  1,
  'en',
  true,
  '100 - 37 = 63. Trick: 100 - 40 + 3 = 63.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is double of 25?',
  '50',
  ARRAY['45', '55', '40'],
  'sciences',
  1,
  'en',
  true,
  '25 x 2 = 50.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many centimeters are in a meter?',
  '100',
  ARRAY['10', '1000', '50'],
  'sciences',
  1,
  'en',
  true,
  'The prefix "centi" means hundredth, so 1 m = 100 cm.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What shape has 4 equal sides and 4 right angles?',
  'A square',
  ARRAY['A rectangle', 'A rhombus', 'A trapezoid'],
  'sciences',
  1,
  'en',
  true,
  'A square is the only quadrilateral with 4 equal sides AND 4 right angles.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 9 x 9?',
  '81',
  ARRAY['72', '89', '79'],
  'sciences',
  1,
  'en',
  true,
  '9 x 9 = 81. Trick: 9 x 10 - 9 = 81.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is half of 64?',
  '32',
  ARRAY['34', '28', '36'],
  'sciences',
  1,
  'en',
  true,
  '64 / 2 = 32.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many faces does a standard die have?',
  '6',
  ARRAY['4', '8', '12'],
  'sciences',
  1,
  'en',
  true,
  'A standard die is a cube, and a cube has 6 faces.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What number comes right after 999?',
  '1000',
  ARRAY['1001', '990', '9910'],
  'sciences',
  1,
  'en',
  true,
  '999 + 1 = 1000.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many minutes are in one hour?',
  '60',
  ARRAY['100', '30', '90'],
  'sciences',
  1,
  'en',
  true,
  'One hour = 60 minutes = 3,600 seconds.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the smallest prime number?',
  '2',
  ARRAY['1', '3', '0'],
  'sciences',
  1,
  'en',
  true,
  '2 is the smallest prime number, and the only even prime!'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 12 x 5?',
  '60',
  ARRAY['55', '65', '50'],
  'sciences',
  1,
  'en',
  true,
  '12 x 5 = 60. Trick: 10 x 5 + 2 x 5 = 60.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 15 + 28?',
  '43',
  ARRAY['42', '44', '53'],
  'sciences',
  1,
  'en',
  true,
  '15 + 28 = 43. You can break it down: 15 + 30 - 2 = 43.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 50 + 50 + 50?',
  '150',
  ARRAY['100', '200', '155'],
  'sciences',
  1,
  'en',
  true,
  '3 x 50 = 150.'
);

-- DIFFICULTY 2 (15 questions)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 25% of 200?',
  '50',
  ARRAY['25', '40', '75'],
  'sciences',
  2,
  'en',
  true,
  '25% means one quarter. 200 / 4 = 50.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 12 squared?',
  '144',
  ARRAY['124', '132', '148'],
  'sciences',
  2,
  'en',
  true,
  '12 x 12 = 144.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many angles does a hexagon have?',
  '6',
  ARRAY['5', '8', '7'],
  'sciences',
  2,
  'en',
  true,
  'The prefix "hexa" means six. A hexagon has 6 sides and 6 angles.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What do the first digits of Pi look like?',
  '3.14',
  ARRAY['2.71', '1.61', '3.41'],
  'sciences',
  2,
  'en',
  true,
  'Pi starts with 3.14159... It''s the ratio of a circle''s circumference to its diameter.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the sum of angles in a triangle?',
  '180 degrees',
  ARRAY['90 degrees', '360 degrees', '270 degrees'],
  'sciences',
  2,
  'en',
  true,
  'The interior angles of a triangle always add up to 180 degrees.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the perimeter of a square with side length 7 cm?',
  '28 cm',
  ARRAY['14 cm', '49 cm', '21 cm'],
  'sciences',
  2,
  'en',
  true,
  'Perimeter of a square = 4 x side = 4 x 7 = 28 cm.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the square root of 49?',
  '7',
  ARRAY['6', '8', '9'],
  'sciences',
  2,
  'en',
  true,
  'The square root of 49 is 7 because 7 x 7 = 49.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'If you roll a die, what is the probability of landing on 6?',
  '1 in 6',
  ARRAY['1 in 3', '1 in 2', '1 in 12'],
  'sciences',
  2,
  'en',
  true,
  'A die has 6 faces, each equally likely: probability is 1/6.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 2 to the power of 0?',
  '1',
  ARRAY['0', '2', 'Undefined'],
  'sciences',
  2,
  'en',
  true,
  'Any non-zero number raised to the power of 0 equals 1.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'A rectangle is 8 cm long and 3 cm wide. What is its area?',
  '24 cm squared',
  ARRAY['22 cm squared', '11 cm squared', '32 cm squared'],
  'sciences',
  2,
  'en',
  true,
  'Area of a rectangle = length x width = 8 x 3 = 24 cm squared.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 15% of 80?',
  '12',
  ARRAY['8', '15', '10'],
  'sciences',
  2,
  'en',
  true,
  '15% of 80 = 0.15 x 80 = 12. Trick: 10% = 8, 5% = 4, total = 12.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 0.5 x 0.5?',
  '0.25',
  ARRAY['0.1', '1', '0.50'],
  'sciences',
  2,
  'en',
  true,
  '0.5 x 0.5 = 0.25. Half of a half is a quarter!'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What number multiplied by itself gives 121?',
  '11',
  ARRAY['12', '10', '13'],
  'sciences',
  2,
  'en',
  true,
  '11 x 11 = 121. It''s a perfect square!'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 1/4 + 1/4?',
  '1/2',
  ARRAY['1/8', '2/8', '1/4'],
  'sciences',
  2,
  'en',
  true,
  '1/4 + 1/4 = 2/4 = 1/2.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 3 to the power of 4?',
  '81',
  ARRAY['64', '27', '12'],
  'sciences',
  2,
  'en',
  true,
  '3 to the power of 4 = 3 x 3 x 3 x 3 = 81.'
);

-- DIFFICULTY 3 (50 questions)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What comes next in the Fibonacci sequence: 1, 1, 2, 3, 5, 8, ...?',
  '13',
  ARRAY['11', '14', '10'],
  'sciences',
  3,
  'en',
  true,
  'Each Fibonacci number is the sum of the two before it: 5 + 8 = 13.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many prime numbers are there between 1 and 10?',
  '4',
  ARRAY['3', '5', '6'],
  'sciences',
  3,
  'en',
  true,
  'The primes between 1 and 10 are: 2, 3, 5, and 7.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Which ancient Greek mathematician is famous for his theorem about right triangles?',
  'Pythagoras',
  ARRAY['Euclid', 'Archimedes', 'Thales'],
  'sciences',
  3,
  'en',
  true,
  'The Pythagorean theorem: in a right triangle, a squared + b squared = c squared.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 17 x 6?',
  '102',
  ARRAY['96', '108', '112'],
  'sciences',
  3,
  'en',
  true,
  '17 x 6 = 102. Trick: (20 x 6) - (3 x 6) = 120 - 18 = 102.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the approximate value of the golden ratio?',
  '1.618',
  ARRAY['3.14', '2.718', '1.414'],
  'sciences',
  3,
  'en',
  true,
  'The golden ratio (phi) is approximately 1.618. It appears in nature, art, and architecture.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the area of a triangle with base 10 cm and height 6 cm?',
  '30 cm squared',
  ARRAY['60 cm squared', '16 cm squared', '36 cm squared'],
  'sciences',
  3,
  'en',
  true,
  'Area = (base x height) / 2 = (10 x 6) / 2 = 30 cm squared.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is an 8-sided polygon called?',
  'An octagon',
  ARRAY['A heptagon', 'A decagon', 'A nonagon'],
  'sciences',
  3,
  'en',
  true,
  'The prefix "octo" means eight. Stop signs are octagons!'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'When rolling two dice, which sum is most likely?',
  '7',
  ARRAY['6', '8', '12'],
  'sciences',
  3,
  'en',
  true,
  '7 can be made in 6 different ways (1+6, 2+5, 3+4...), more than any other sum.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the square root of 169?',
  '13',
  ARRAY['11', '12', '14'],
  'sciences',
  3,
  'en',
  true,
  'The square root of 169 is 13 because 13 x 13 = 169.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 40% of 250?',
  '100',
  ARRAY['80', '125', '150'],
  'sciences',
  3,
  'en',
  true,
  '40% of 250 = 0.4 x 250 = 100.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many diagonals does a pentagon have?',
  '5',
  ARRAY['3', '7', '10'],
  'sciences',
  3,
  'en',
  true,
  'A pentagon has 5 diagonals. Formula: n(n-3)/2 = 5(5-3)/2 = 5.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is (-3) x (-4)?',
  '12',
  ARRAY['-12', '-7', '7'],
  'sciences',
  3,
  'en',
  true,
  'A negative times a negative equals a positive. (-3) x (-4) = 12.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 999 + 999?',
  '1998',
  ARRAY['1988', '2008', '1899'],
  'sciences',
  3,
  'en',
  true,
  '999 + 999 = 1998. Trick: 1000 + 1000 - 2 = 1998.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'If a train travels at 120 km/h, how far does it go in 15 minutes?',
  '30 km',
  ARRAY['15 km', '45 km', '60 km'],
  'sciences',
  3,
  'en',
  true,
  '15 minutes = 1/4 hour. 120 / 4 = 30 km.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the GCD (greatest common divisor) of 12 and 18?',
  '6',
  ARRAY['3', '9', '12'],
  'sciences',
  3,
  'en',
  true,
  'Divisors of 12: 1, 2, 3, 4, 6, 12. Divisors of 18: 1, 2, 3, 6, 9, 18. Greatest common is 6.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many vertices does a cube have?',
  '8',
  ARRAY['6', '4', '12'],
  'sciences',
  3,
  'en',
  true,
  'A cube has 8 vertices, 12 edges, and 6 faces.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 2 to the power of 8?',
  '256',
  ARRAY['128', '512', '64'],
  'sciences',
  3,
  'en',
  true,
  '2 to the 8th = 256. That''s also the number of values in a byte!'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What angle do clock hands make at exactly 3 o''clock?',
  '90 degrees',
  ARRAY['60 degrees', '120 degrees', '180 degrees'],
  'sciences',
  3,
  'en',
  true,
  'At 3:00, the minute hand is on 12 and the hour hand is on 3, forming a right angle of 90 degrees.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 3! (3 factorial)?',
  '6',
  ARRAY['3', '9', '27'],
  'sciences',
  3,
  'en',
  true,
  '3! = 3 x 2 x 1 = 6.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'In a standard deck of 52 cards, what is the probability of drawing an ace?',
  '4 out of 52',
  ARRAY['1 out of 52', '2 out of 52', '13 out of 52'],
  'sciences',
  3,
  'en',
  true,
  'There are 4 aces in a 52-card deck, so the probability is 4/52 = 1/13.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What do you call a triangle with all sides equal?',
  'Equilateral',
  ARRAY['Isosceles', 'Scalene', 'Right'],
  'sciences',
  3,
  'en',
  true,
  'Equilateral = 3 equal sides. Isosceles = 2 equal sides. Scalene = all different.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many zeros are in one million?',
  '6',
  ARRAY['5', '7', '9'],
  'sciences',
  3,
  'en',
  true,
  '1,000,000 has 6 zeros.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the volume of a cube with side length 3 cm?',
  '27 cm cubed',
  ARRAY['9 cm cubed', '18 cm cubed', '81 cm cubed'],
  'sciences',
  3,
  'en',
  true,
  'Volume of a cube = side cubed = 3 cubed = 27 cm cubed.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 11 x 11?',
  '121',
  ARRAY['111', '131', '122'],
  'sciences',
  3,
  'en',
  true,
  '11 x 11 = 121. All squares of repunit numbers follow a neat pattern: 11 squared = 121, 111 squared = 12321.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'If a pizza is cut into 8 slices and you eat 3, what fraction is left?',
  '5/8',
  ARRAY['3/8', '3/5', '5/3'],
  'sciences',
  3,
  'en',
  true,
  '8/8 - 3/8 = 5/8 of the pizza remaining.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Who invented the Cartesian coordinate system?',
  'Rene Descartes',
  ARRAY['Isaac Newton', 'Blaise Pascal', 'Pierre de Fermat'],
  'sciences',
  3,
  'en',
  true,
  'Rene Descartes invented the (x, y) coordinate system. That is why it is called "Cartesian"!'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What percentage is 3 out of 4?',
  '75%',
  ARRAY['60%', '80%', '66%'],
  'sciences',
  3,
  'en',
  true,
  '3/4 = 0.75 = 75%.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the sum of angles in a quadrilateral?',
  '360 degrees',
  ARRAY['180 degrees', '270 degrees', '540 degrees'],
  'sciences',
  3,
  'en',
  true,
  'A quadrilateral can be divided into 2 triangles. 2 x 180 = 360 degrees.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many possible combinations are there for a 4-digit PIN code (0-9)?',
  '10,000',
  ARRAY['1,000', '9,999', '100,000'],
  'sciences',
  3,
  'en',
  true,
  '10 x 10 x 10 x 10 = 10,000 combinations (from 0000 to 9999).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the least common multiple of 4 and 6?',
  '12',
  ARRAY['24', '6', '8'],
  'sciences',
  3,
  'en',
  true,
  'Multiples of 4: 4, 8, 12... Multiples of 6: 6, 12... The smallest common one is 12.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many seconds are in a day?',
  '86,400',
  ARRAY['36,000', '43,200', '72,000'],
  'sciences',
  3,
  'en',
  true,
  '24 hours x 60 minutes x 60 seconds = 86,400 seconds.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'If you fold a piece of paper 7 times, how many layers do you get?',
  '128',
  ARRAY['64', '14', '256'],
  'sciences',
  3,
  'en',
  true,
  'Each fold doubles the layers: 2 to the 7th = 128 layers.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the formula for the circumference of a circle?',
  '2 x Pi x r',
  ARRAY['Pi x r squared', 'Pi x d squared', '4 x Pi x r'],
  'sciences',
  3,
  'en',
  true,
  'Circumference = 2 times Pi times r (or Pi times d). The area formula is Pi times r squared.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the sum of 1 + 2 + 3 + ... + 10?',
  '55',
  ARRAY['45', '50', '60'],
  'sciences',
  3,
  'en',
  true,
  'Gauss''s formula: n(n+1)/2 = 10 x 11 / 2 = 55.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many edges does a cube have?',
  '12',
  ARRAY['8', '6', '10'],
  'sciences',
  3,
  'en',
  true,
  'A cube has 12 edges: 4 on top, 4 on the bottom, and 4 vertical.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 125 x 8?',
  '1000',
  ARRAY['900', '1025', '800'],
  'sciences',
  3,
  'en',
  true,
  '125 x 8 = 1000. Handy to know: 1/8 = 0.125.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the name of the line segment from the center of a circle to its edge?',
  'Radius',
  ARRAY['Diameter', 'Chord', 'Tangent'],
  'sciences',
  3,
  'en',
  true,
  'The radius goes from center to edge. The diameter goes all the way across (= 2 radii).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many faces does an icosahedron have?',
  '20',
  ARRAY['12', '10', '8'],
  'sciences',
  3,
  'en',
  true,
  'The prefix "icosa" comes from the Greek "eikosi" (twenty). An icosahedron has 20 triangular faces.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the average of 4, 8, and 12?',
  '8',
  ARRAY['6', '10', '9'],
  'sciences',
  3,
  'en',
  true,
  'Average = (4 + 8 + 12) / 3 = 24 / 3 = 8.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the square root of 2, rounded to hundredths?',
  '1.41',
  ARRAY['1.73', '1.22', '1.62'],
  'sciences',
  3,
  'en',
  true,
  'The square root of 2 is approximately 1.41421... It is an irrational number.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'A number divisible by 2 and by 3 is always divisible by...?',
  '6',
  ARRAY['5', '9', '12'],
  'sciences',
  3,
  'en',
  true,
  'If a number is divisible by 2 and 3 (coprime), it is divisible by 2 x 3 = 6.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the 10th Fibonacci number?',
  '55',
  ARRAY['34', '89', '44'],
  'sciences',
  3,
  'en',
  true,
  'The sequence: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55. The 10th term is 55.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many liters are in 2.5 cubic meters of water?',
  '2,500 liters',
  ARRAY['250 liters', '25 liters', '25,000 liters'],
  'sciences',
  3,
  'en',
  true,
  '1 cubic meter = 1,000 liters. So 2.5 m cubed = 2,500 liters.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What does the symbol approximately-equal-to mean in math?',
  'Approximately equal to',
  ARRAY['Strictly greater than', 'Not equal to', 'Proportional to'],
  'sciences',
  3,
  'en',
  true,
  'The symbol means "approximately equal to". For example, Pi is approximately equal to 3.14.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 18 squared minus 17 squared?',
  '35',
  ARRAY['1', '17', '36'],
  'sciences',
  3,
  'en',
  true,
  'Trick: a squared minus b squared = (a+b)(a-b). So 18 squared - 17 squared = 35 x 1 = 35.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What do you call a number that cannot be expressed as a fraction?',
  'An irrational number',
  ARRAY['A decimal number', 'A prime number', 'A whole number'],
  'sciences',
  3,
  'en',
  true,
  'Irrational numbers (like Pi or the square root of 2) have infinite non-repeating decimals.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 37 x 3?',
  '111',
  ARRAY['101', '113', '131'],
  'sciences',
  3,
  'en',
  true,
  '37 x 3 = 111. Fun fact: 37 x 6 = 222, 37 x 9 = 333, and so on!'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'If you double a penny every day for 10 days, how much do you have?',
  '$5.12',
  ARRAY['$0.10', '$1.00', '$10.24'],
  'sciences',
  3,
  'en',
  true,
  'Day 1: $0.01. Day 2: $0.02... Day 10: 2 to the 9th cents = 512 cents = $5.12.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the median of the numbers 3, 7, 9, 15, 21?',
  '9',
  ARRAY['7', '11', '15'],
  'sciences',
  3,
  'en',
  true,
  'The median is the middle value when numbers are sorted. In 3, 7, 9, 15, 21 the middle is 9.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is a number called if it equals the sum of its proper divisors (like 6 = 1+2+3)?',
  'A perfect number',
  ARRAY['A prime number', 'A composite number', 'A triangular number'],
  'sciences',
  3,
  'en',
  true,
  '6 is the smallest perfect number: 1 + 2 + 3 = 6. The next one is 28.'
);

-- DIFFICULTY 4 (15 questions)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Which mathematician proved there are infinitely many prime numbers?',
  'Euclid',
  ARRAY['Pythagoras', 'Euler', 'Gauss'],
  'sciences',
  4,
  'en',
  true,
  'Euclid proved around 300 BC that you can never list all primes because there are infinitely many.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the sum of the first 100 positive integers?',
  '5050',
  ARRAY['5000', '5100', '4950'],
  'sciences',
  4,
  'en',
  true,
  'Gauss found this as a child: 100 x 101 / 2 = 5050.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is Euler''s number (e) rounded to the nearest hundredth?',
  '2.72',
  ARRAY['3.14', '1.62', '2.23'],
  'sciences',
  4,
  'en',
  true,
  'e is approximately 2.71828... It is the base of the natural logarithm.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many faces does a dodecahedron have?',
  '12',
  ARRAY['20', '10', '8'],
  'sciences',
  4,
  'en',
  true,
  '"Dodeca" comes from the Greek for twelve. A dodecahedron has 12 pentagonal faces.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 5! (5 factorial)?',
  '120',
  ARRAY['60', '24', '720'],
  'sciences',
  4,
  'en',
  true,
  '5! = 5 x 4 x 3 x 2 x 1 = 120.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'In a right triangle, if the two legs are 5 and 12, what is the hypotenuse?',
  '13',
  ARRAY['17', '15', '14'],
  'sciences',
  4,
  'en',
  true,
  'By the Pythagorean theorem: sqrt(5 squared + 12 squared) = sqrt(25 + 144) = sqrt(169) = 13.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the largest two-digit prime number?',
  '97',
  ARRAY['99', '93', '91'],
  'sciences',
  4,
  'en',
  true,
  '97 is prime. 99 = 9 x 11, 93 = 3 x 31, 91 = 7 x 13.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many ways can you arrange 4 different books on a shelf?',
  '24',
  ARRAY['16', '12', '8'],
  'sciences',
  4,
  'en',
  true,
  'That is 4! = 4 x 3 x 2 x 1 = 24 arrangements.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Which mathematician co-founded probability theory with Pascal?',
  'Pierre de Fermat',
  ARRAY['Descartes', 'Leibniz', 'Bernoulli'],
  'sciences',
  4,
  'en',
  true,
  'Pascal and Fermat exchanged letters in 1654 that laid the foundations of probability theory.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the exact area of a circle with radius 5 cm?',
  '25 Pi cm squared',
  ARRAY['10 Pi cm squared', '5 Pi cm squared', '50 Pi cm squared'],
  'sciences',
  4,
  'en',
  true,
  'Area = Pi x r squared = Pi x 25 = 25 Pi cm squared, which is about 78.5 cm squared.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the 7th prime number?',
  '17',
  ARRAY['13', '19', '15'],
  'sciences',
  4,
  'en',
  true,
  'The first 7 primes: 2, 3, 5, 7, 11, 13, 17.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many ways can you choose 2 items from 5 (combinations)?',
  '10',
  ARRAY['20', '5', '25'],
  'sciences',
  4,
  'en',
  true,
  'C(5,2) = 5! / (2! x 3!) = 10.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Where does the word "algorithm" originally come from?',
  'The mathematician Al-Khwarizmi',
  ARRAY['The Greek word "arithmos"', 'Alan Turing', 'The Latin word "calculus"'],
  'sciences',
  4,
  'en',
  true,
  'Al-Khwarizmi (9th century) was a Persian mathematician whose Latinized name gave us "algorithm".'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is log base 10 of 1000?',
  '3',
  ARRAY['10', '100', '30'],
  'sciences',
  4,
  'en',
  true,
  'log base 10 of 1000 = 3 because 10 cubed = 1000.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is 2 to the power of 10?',
  '1024',
  ARRAY['512', '2048', '1000'],
  'sciences',
  4,
  'en',
  true,
  '2 to the 10th = 1024. That is why 1 KB is roughly 1024 bytes in computing.'
);

-- DIFFICULTY 5 (5 questions)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Which unsolved conjecture states that every even integer greater than 2 is the sum of two primes?',
  'The Goldbach conjecture',
  ARRAY['The Riemann hypothesis', 'Fermat''s Last Theorem', 'The Collatz conjecture'],
  'sciences',
  5,
  'en',
  true,
  'Proposed in 1742, the Goldbach conjecture remains unproven despite centuries of effort.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Who proved Fermat''s Last Theorem in 1995?',
  'Andrew Wiles',
  ARRAY['Grigori Perelman', 'Terence Tao', 'John Nash'],
  'sciences',
  5,
  'en',
  true,
  'Andrew Wiles proved in 1995 that x^n + y^n = z^n has no integer solutions for n > 2.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many Platonic solids exist?',
  '5',
  ARRAY['6', '7', '4'],
  'sciences',
  5,
  'en',
  true,
  'The 5 Platonic solids are: tetrahedron, cube, octahedron, dodecahedron, and icosahedron.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is i squared, where i is the imaginary unit?',
  '-1',
  ARRAY['1', '0', 'i'],
  'sciences',
  5,
  'en',
  true,
  'By definition, i = sqrt(-1), so i squared = -1. This is the foundation of complex numbers.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Which famous identity links e, Pi, i, 1, and 0 in one equation?',
  'Euler''s identity: e^(i*Pi) + 1 = 0',
  ARRAY['The Pythagorean theorem', 'Gauss''s formula', 'Diophantine equation'],
  'sciences',
  5,
  'en',
  true,
  'Often called the most beautiful formula in math, it connects the 5 fundamental constants.'
);
