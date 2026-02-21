-- Migration: Add 200 science questions (100 French + 100 English)
-- Topics: Physics, Chemistry, Biology, Astronomy, Earth Science, Famous Scientists, Technology, Fun Facts
-- Difficulty spread: 30% easy (1-2), 50% medium (3), 20% hard (4-5)

-- =============================================
-- FRENCH QUESTIONS (100)
-- =============================================

-- FR - Difficulty 1 (15 questions)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel gaz les plantes absorbent-elles pendant la photosynthèse ?',
  'Le dioxyde de carbone',
  ARRAY['L''oxygène', 'L''azote', 'L''hydrogène'],
  'sciences',
  1,
  'fr',
  true,
  'Les plantes absorbent le CO2 et rejettent de l''oxygène grâce à la photosynthèse.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien de pattes possède un insecte ?',
  '6',
  ARRAY['4', '8', '10'],
  'sciences',
  1,
  'fr',
  true,
  'Tous les insectes possèdent exactement 6 pattes, c''est une de leurs caractéristiques principales.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Comment s''appelle la roche en fusion qui sort d''un volcan ?',
  'La lave',
  ARRAY['Le magma', 'Le basalte', 'Le granit'],
  'sciences',
  1,
  'fr',
  true,
  'Le magma s''appelle lave une fois qu''il sort à la surface du volcan.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus grand océan du monde ?',
  'L''océan Pacifique',
  ARRAY['L''océan Atlantique', 'L''océan Indien', 'L''océan Arctique'],
  'sciences',
  1,
  'fr',
  true,
  'L''océan Pacifique couvre environ 165 millions de km², soit un tiers de la surface terrestre.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le métal le plus léger ?',
  'Le lithium',
  ARRAY['L''aluminium', 'Le magnésium', 'Le titane'],
  'sciences',
  1,
  'fr',
  true,
  'Le lithium est si léger qu''il flotte sur l''eau. C''est le métal le moins dense.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel organe du corps humain produit l''insuline ?',
  'Le pancréas',
  ARRAY['Le foie', 'Les reins', 'L''estomac'],
  'sciences',
  1,
  'fr',
  true,
  'Le pancréas produit l''insuline qui régule le taux de sucre dans le sang.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la vitesse de la lumière approximativement ?',
  '300 000 km/s',
  ARRAY['150 000 km/s', '1 000 000 km/s', '30 000 km/s'],
  'sciences',
  1,
  'fr',
  true,
  'La lumière voyage à environ 299 792 km/s dans le vide.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le symbole chimique du fer ?',
  'Fe',
  ARRAY['Fr', 'Fi', 'Ir'],
  'sciences',
  1,
  'fr',
  true,
  'Fe vient du latin "ferrum" qui signifie fer.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel phénomène météo est causé par l''électricité dans les nuages ?',
  'L''éclair',
  ARRAY['L''arc-en-ciel', 'La grêle', 'Le brouillard'],
  'sciences',
  1,
  'fr',
  true,
  'Les éclairs sont des décharges électriques entre les nuages ou entre un nuage et le sol.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien de dents a un adulte normalement ?',
  '32',
  ARRAY['28', '36', '30'],
  'sciences',
  1,
  'fr',
  true,
  'Un adulte possède normalement 32 dents, incluant les 4 dents de sagesse.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel animal produit de la soie ?',
  'Le ver à soie',
  ARRAY['L''araignée', 'L''abeille', 'La chenille'],
  'sciences',
  1,
  'fr',
  true,
  'Le ver à soie (Bombyx mori) produit un fil de soie pour former son cocon.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la planète la plus grande du système solaire ?',
  'Jupiter',
  ARRAY['Saturne', 'Neptune', 'Uranus'],
  'sciences',
  1,
  'fr',
  true,
  'Jupiter est si grande qu''on pourrait y faire rentrer plus de 1 300 Terres.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Comment s''appelle le tube digestif qui relie la bouche à l''estomac ?',
  'L''œsophage',
  ARRAY['La trachée', 'Le larynx', 'Le pharynx'],
  'sciences',
  1,
  'fr',
  true,
  'L''œsophage mesure environ 25 cm et transporte la nourriture jusqu''à l''estomac.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel type de roche se forme à partir de lave refroidie ?',
  'Roche volcanique (ignée)',
  ARRAY['Roche sédimentaire', 'Roche métamorphique', 'Roche calcaire'],
  'sciences',
  1,
  'fr',
  true,
  'Les roches ignées se forment quand le magma ou la lave refroidit et se solidifie.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel scientifique a formulé la théorie de la relativité ?',
  'Albert Einstein',
  ARRAY['Isaac Newton', 'Niels Bohr', 'Stephen Hawking'],
  'sciences',
  1,
  'fr',
  true,
  'Einstein a publié sa théorie de la relativité restreinte en 1905 et générale en 1915.'
);

-- FR - Difficulty 2 (15 questions)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le nom de la plus petite unité du vivant ?',
  'La cellule',
  ARRAY['L''atome', 'La molécule', 'L''organe'],
  'sciences',
  2,
  'fr',
  true,
  'La cellule est la plus petite unité structurelle et fonctionnelle du vivant.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le point d''ébullition de l''eau au niveau de la mer ?',
  '100°C',
  ARRAY['90°C', '110°C', '120°C'],
  'sciences',
  2,
  'fr',
  true,
  'L''eau bout à 100°C (212°F) à pression atmosphérique standard au niveau de la mer.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle planète tourne sur elle-même en sens inverse des autres ?',
  'Vénus',
  ARRAY['Mars', 'Mercure', 'Uranus'],
  'sciences',
  2,
  'fr',
  true,
  'Vénus a une rotation rétrograde : le Soleil s''y lève à l''ouest et se couche à l''est.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel gaz est responsable de l''effet de serre ?',
  'Le dioxyde de carbone (CO2)',
  ARRAY['L''oxygène (O2)', 'L''azote (N2)', 'L''hélium (He)'],
  'sciences',
  2,
  'fr',
  true,
  'Le CO2 piège la chaleur dans l''atmosphère, contribuant au réchauffement climatique.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien d''os compose le squelette d''un bébé à la naissance ?',
  'Environ 300',
  ARRAY['Environ 206', 'Environ 150', 'Environ 400'],
  'sciences',
  2,
  'fr',
  true,
  'Un bébé naît avec environ 300 os, qui fusionnent pour n''en former que 206 à l''âge adulte.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est l''élément chimique le plus abondant dans l''univers ?',
  'L''hydrogène',
  ARRAY['L''hélium', 'L''oxygène', 'Le carbone'],
  'sciences',
  2,
  'fr',
  true,
  'L''hydrogène représente environ 75% de la masse de l''univers visible.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Qu''est-ce qu''un tsunami ?',
  'Une vague géante causée par un séisme sous-marin',
  ARRAY['Une tempête tropicale violente', 'Un tourbillon dans l''océan', 'Une marée exceptionnellement haute'],
  'sciences',
  2,
  'fr',
  true,
  'Les tsunamis sont provoqués par des tremblements de terre, éruptions volcaniques ou glissements de terrain sous-marins.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Qui a inventé le premier vaccin ?',
  'Edward Jenner',
  ARRAY['Louis Pasteur', 'Alexander Fleming', 'Robert Koch'],
  'sciences',
  2,
  'fr',
  true,
  'Jenner a développé le premier vaccin contre la variole en 1796 en utilisant le virus de la vaccine.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Comment s''appelle la couche d''ozone dans l''atmosphère ?',
  'La stratosphère',
  ARRAY['La troposphère', 'La mésosphère', 'La thermosphère'],
  'sciences',
  2,
  'fr',
  true,
  'La couche d''ozone se situe dans la stratosphère, entre 15 et 35 km d''altitude.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le diamètre approximatif de la Terre ?',
  '12 742 km',
  ARRAY['6 371 km', '40 075 km', '25 000 km'],
  'sciences',
  2,
  'fr',
  true,
  'Le diamètre de la Terre est d''environ 12 742 km à l''équateur.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel organe filtre le sang et produit l''urine ?',
  'Les reins',
  ARRAY['Le foie', 'La rate', 'La vessie'],
  'sciences',
  2,
  'fr',
  true,
  'Les reins filtrent environ 180 litres de sang par jour pour produire l''urine.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel phénomène explique pourquoi le ciel est bleu ?',
  'La diffusion de Rayleigh',
  ARRAY['La réfraction de la lumière', 'L''absorption atmosphérique', 'La réflexion des océans'],
  'sciences',
  2,
  'fr',
  true,
  'La diffusion de Rayleigh disperse davantage les courtes longueurs d''onde (bleu) que les longues.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Qu''est-ce que l''ADN ?',
  'L''acide désoxyribonucléique',
  ARRAY['L''acide dénaturé nucléique', 'L''acide dinitrogéné', 'L''acide double nucléotide'],
  'sciences',
  2,
  'fr',
  true,
  'L''ADN contient les instructions génétiques de tous les organismes vivants.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel inventeur est associé à l''ampoule électrique ?',
  'Thomas Edison',
  ARRAY['Nikola Tesla', 'Benjamin Franklin', 'Michael Faraday'],
  'sciences',
  2,
  'fr',
  true,
  'Edison a breveté l''ampoule à incandescence en 1879, rendant l''éclairage électrique pratique.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'De quoi est principalement composé le Soleil ?',
  'D''hydrogène et d''hélium',
  ARRAY['De fer et de nickel', 'D''oxygène et de carbone', 'De lave et de gaz'],
  'sciences',
  2,
  'fr',
  true,
  'Le Soleil est composé d''environ 73% d''hydrogène et 25% d''hélium.'
);

-- FR - Difficulty 3 (50 questions)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le nom du processus par lequel les cellules se divisent en deux ?',
  'La mitose',
  ARRAY['La méiose', 'La cytokinèse', 'L''apoptose'],
  'sciences',
  3,
  'fr',
  true,
  'La mitose produit deux cellules identiques, contrairement à la méiose qui produit des cellules reproductrices.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le numéro atomique de l''oxygène ?',
  '8',
  ARRAY['6', '12', '16'],
  'sciences',
  3,
  'fr',
  true,
  'L''oxygène a 8 protons dans son noyau, d''où son numéro atomique 8.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel type d''onde est le son ?',
  'Une onde mécanique longitudinale',
  ARRAY['Une onde électromagnétique', 'Une onde transversale', 'Une onde lumineuse'],
  'sciences',
  3,
  'fr',
  true,
  'Le son se propage par compression et dilatation de l''air, d''où son caractère longitudinal.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la distance entre la Terre et le Soleil ?',
  'Environ 150 millions de km',
  ARRAY['Environ 50 millions de km', 'Environ 300 millions de km', 'Environ 500 millions de km'],
  'sciences',
  3,
  'fr',
  true,
  'Cette distance, appelée unité astronomique (UA), est d''environ 149,6 millions de km.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus dur minéral naturel connu ?',
  'Le diamant',
  ARRAY['Le quartz', 'Le saphir', 'Le rubis'],
  'sciences',
  3,
  'fr',
  true,
  'Le diamant est au sommet de l''échelle de Mohs avec une dureté de 10.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien de temps met la lumière du Soleil pour atteindre la Terre ?',
  'Environ 8 minutes',
  ARRAY['Environ 1 minute', 'Environ 30 secondes', 'Environ 1 heure'],
  'sciences',
  3,
  'fr',
  true,
  'La lumière parcourt les 150 millions de km en environ 8 minutes et 20 secondes.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel scientifique a découvert la pénicilline ?',
  'Alexander Fleming',
  ARRAY['Louis Pasteur', 'Robert Koch', 'Joseph Lister'],
  'sciences',
  3,
  'fr',
  true,
  'Fleming a découvert par hasard la pénicilline en 1928 grâce à une moisissure.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le composant principal de l''air que nous respirons ?',
  'L''azote (78%)',
  ARRAY['L''oxygène (78%)', 'Le dioxyde de carbone (78%)', 'L''argon (78%)'],
  'sciences',
  3,
  'fr',
  true,
  'L''atmosphère est composée de 78% d''azote, 21% d''oxygène et 1% d''autres gaz.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien de paires de chromosomes possède un être humain ?',
  '23',
  ARRAY['22', '24', '46'],
  'sciences',
  3,
  'fr',
  true,
  'L''humain possède 23 paires (soit 46) de chromosomes dans chaque cellule.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel phénomène provoque les marées ?',
  'L''attraction gravitationnelle de la Lune et du Soleil',
  ARRAY['La rotation de la Terre', 'Le vent sur les océans', 'Les courants sous-marins'],
  'sciences',
  3,
  'fr',
  true,
  'La Lune est responsable d''environ 2/3 des marées, le Soleil du tiers restant.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le gaz noble le plus léger ?',
  'L''hélium',
  ARRAY['Le néon', 'L''argon', 'Le krypton'],
  'sciences',
  3,
  'fr',
  true,
  'L''hélium est le deuxième élément le plus léger après l''hydrogène et le plus léger des gaz nobles.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Comment s''appelle la couche la plus externe de la Terre ?',
  'La croûte terrestre',
  ARRAY['Le manteau', 'Le noyau externe', 'La lithosphère'],
  'sciences',
  3,
  'fr',
  true,
  'La croûte terrestre a une épaisseur de 5 à 70 km selon qu''elle est océanique ou continentale.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la formule chimique du sel de table ?',
  'NaCl',
  ARRAY['KCl', 'NaOH', 'CaCl2'],
  'sciences',
  3,
  'fr',
  true,
  'Le sel de table est du chlorure de sodium, composé d''un atome de sodium et un de chlore.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus long fleuve du monde ?',
  'Le Nil',
  ARRAY['L''Amazone', 'Le Yangtsé', 'Le Mississippi'],
  'sciences',
  3,
  'fr',
  true,
  'Le Nil mesure environ 6 650 km, bien que l''Amazone soit parfois considéré comme plus long.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le nom du premier satellite artificiel envoyé dans l''espace ?',
  'Spoutnik 1',
  ARRAY['Explorer 1', 'Vanguard 1', 'Luna 1'],
  'sciences',
  3,
  'fr',
  true,
  'Spoutnik 1 a été lancé par l''URSS le 4 octobre 1957.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le pH d''une solution neutre ?',
  '7',
  ARRAY['0', '14', '1'],
  'sciences',
  3,
  'fr',
  true,
  'Le pH 7 est neutre, en dessous c''est acide, au-dessus c''est basique (alcalin).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel organe est responsable de la production de bile ?',
  'Le foie',
  ARRAY['La vésicule biliaire', 'Le pancréas', 'L''estomac'],
  'sciences',
  3,
  'fr',
  true,
  'Le foie produit la bile, qui est ensuite stockée dans la vésicule biliaire.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la température du noyau terrestre ?',
  'Environ 5 500°C',
  ARRAY['Environ 1 000°C', 'Environ 10 000°C', 'Environ 3 000°C'],
  'sciences',
  3,
  'fr',
  true,
  'Le noyau interne de la Terre atteint environ 5 500°C, comparable à la surface du Soleil.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Qui a proposé la théorie de l''évolution par sélection naturelle ?',
  'Charles Darwin',
  ARRAY['Gregor Mendel', 'Jean-Baptiste Lamarck', 'Louis Pasteur'],
  'sciences',
  3,
  'fr',
  true,
  'Darwin a publié "L''Origine des espèces" en 1859, exposant sa théorie de la sélection naturelle.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est l''os le plus long du corps humain ?',
  'Le fémur',
  ARRAY['Le tibia', 'L''humérus', 'Le péroné'],
  'sciences',
  3,
  'fr',
  true,
  'Le fémur (os de la cuisse) représente environ un quart de la taille d''une personne.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le nom de la galaxie dans laquelle se trouve notre système solaire ?',
  'La Voie lactée',
  ARRAY['Andromède', 'Le Grand Nuage de Magellan', 'La galaxie du Triangle'],
  'sciences',
  3,
  'fr',
  true,
  'La Voie lactée est une galaxie spirale contenant entre 100 et 400 milliards d''étoiles.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le symbole chimique du sodium ?',
  'Na',
  ARRAY['So', 'Sd', 'No'],
  'sciences',
  3,
  'fr',
  true,
  'Na vient du latin "natrium", le nom ancien du sodium.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien de couches principales a l''atmosphère terrestre ?',
  '5',
  ARRAY['3', '4', '7'],
  'sciences',
  3,
  'fr',
  true,
  'Les 5 couches sont : troposphère, stratosphère, mésosphère, thermosphère et exosphère.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel physicien est connu pour ses lois du mouvement et de la gravitation ?',
  'Isaac Newton',
  ARRAY['Galilée', 'Johannes Kepler', 'Albert Einstein'],
  'sciences',
  3,
  'fr',
  true,
  'Newton a formulé ses trois lois du mouvement et la loi de la gravitation universelle dans les Principia (1687).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le principal constituant des os ?',
  'Le phosphate de calcium',
  ARRAY['Le fer', 'Le collagène pur', 'Le silicium'],
  'sciences',
  3,
  'fr',
  true,
  'Les os sont composés principalement de phosphate de calcium (hydroxyapatite) et de collagène.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la planète la plus chaude du système solaire ?',
  'Vénus',
  ARRAY['Mercure', 'Mars', 'Jupiter'],
  'sciences',
  3,
  'fr',
  true,
  'Vénus atteint 465°C en surface grâce à un effet de serre extrême, plus chaud que Mercure.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien de temps met la Terre pour faire le tour du Soleil ?',
  '365,25 jours',
  ARRAY['360 jours', '365 jours exactement', '366 jours'],
  'sciences',
  3,
  'fr',
  true,
  'C''est pourquoi on ajoute un jour tous les 4 ans (année bissextile) pour compenser le quart de jour.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le nom du processus par lequel l''eau passe de l''état liquide à gazeux ?',
  'L''évaporation',
  ARRAY['La condensation', 'La sublimation', 'La fusion'],
  'sciences',
  3,
  'fr',
  true,
  'L''évaporation se produit quand les molécules d''eau gagnent assez d''énergie pour passer en phase gazeuse.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle partie de l''œil contrôle la quantité de lumière qui y entre ?',
  'L''iris',
  ARRAY['La rétine', 'La cornée', 'Le cristallin'],
  'sciences',
  3,
  'fr',
  true,
  'L''iris ajuste la taille de la pupille pour réguler la lumière entrant dans l''œil.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel type de réaction chimique libère de l''énergie ?',
  'Une réaction exothermique',
  ARRAY['Une réaction endothermique', 'Une réaction neutre', 'Une réaction isotherme'],
  'sciences',
  3,
  'fr',
  true,
  'Les réactions exothermiques libèrent de la chaleur, comme la combustion du bois.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le nom de la force qui s''oppose au mouvement entre deux surfaces ?',
  'La friction (le frottement)',
  ARRAY['La gravité', 'L''inertie', 'La tension'],
  'sciences',
  3,
  'fr',
  true,
  'La friction ralentit les objets en mouvement et convertit l''énergie cinétique en chaleur.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle structure cellulaire contient l''ADN chez les eucaryotes ?',
  'Le noyau',
  ARRAY['La mitochondrie', 'Le ribosome', 'Le cytoplasme'],
  'sciences',
  3,
  'fr',
  true,
  'Le noyau cellulaire renferme l''ADN et contrôle les activités de la cellule.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est l''âge approximatif de la Terre ?',
  '4,5 milliards d''années',
  ARRAY['2 milliards d''années', '10 milliards d''années', '1 milliard d''années'],
  'sciences',
  3,
  'fr',
  true,
  'L''âge de la Terre est estimé à 4,54 milliards d''années grâce à la datation radiométrique.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Qu''est-ce que la photosynthèse produit en plus du glucose ?',
  'De l''oxygène',
  ARRAY['Du dioxyde de carbone', 'De l''azote', 'De l''hydrogène'],
  'sciences',
  3,
  'fr',
  true,
  'La photosynthèse transforme le CO2 et l''eau en glucose et en oxygène grâce à la lumière.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le métal liquide à température ambiante ?',
  'Le mercure',
  ARRAY['Le gallium', 'Le plomb', 'L''étain'],
  'sciences',
  3,
  'fr',
  true,
  'Le mercure fond à -39°C, ce qui le rend liquide à température ambiante.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Comment s''appellent les vaisseaux sanguins les plus fins du corps ?',
  'Les capillaires',
  ARRAY['Les artérioles', 'Les veinules', 'Les artères'],
  'sciences',
  3,
  'fr',
  true,
  'Les capillaires sont si fins qu''un seul globule rouge peut à peine y passer.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est l''unité de mesure de la force ?',
  'Le newton',
  ARRAY['Le joule', 'Le watt', 'Le pascal'],
  'sciences',
  3,
  'fr',
  true,
  'Le newton (N) mesure la force. 1 N est la force nécessaire pour accélérer 1 kg à 1 m/s².'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le nombre de Avogadro approximativement ?',
  '6,022 × 10²³',
  ARRAY['3,14 × 10²³', '1,602 × 10¹⁹', '9,8 × 10²³'],
  'sciences',
  3,
  'fr',
  true,
  'Le nombre d''Avogadro définit le nombre d''entités dans une mole de substance.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel instrument mesure la pression atmosphérique ?',
  'Le baromètre',
  ARRAY['Le thermomètre', 'L''hygromètre', 'L''anémomètre'],
  'sciences',
  3,
  'fr',
  true,
  'Le baromètre a été inventé par Evangelista Torricelli en 1643.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le nom de la théorie qui explique la dérive des continents ?',
  'La tectonique des plaques',
  ARRAY['La théorie de la relativité', 'La théorie de l''expansion', 'La théorie de la contraction'],
  'sciences',
  3,
  'fr',
  true,
  'La tectonique des plaques explique le mouvement des plaques lithosphériques sur le manteau terrestre.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la molécule responsable du transport de l''oxygène dans le sang ?',
  'L''hémoglobine',
  ARRAY['L''albumine', 'La myoglobine', 'La fibrine'],
  'sciences',
  3,
  'fr',
  true,
  'L''hémoglobine contient du fer qui se lie à l''oxygène dans les globules rouges.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel type de lentille est utilisé pour corriger la myopie ?',
  'Une lentille divergente (concave)',
  ARRAY['Une lentille convergente (convexe)', 'Une lentille plane', 'Une lentille bifocale'],
  'sciences',
  3,
  'fr',
  true,
  'La lentille divergente déplace le point focal vers l''arrière pour corriger la vision floue de loin.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel scientifique a découvert la radioactivité ?',
  'Henri Becquerel',
  ARRAY['Marie Curie', 'Pierre Curie', 'Wilhelm Röntgen'],
  'sciences',
  3,
  'fr',
  true,
  'Becquerel a découvert la radioactivité en 1896 en étudiant les sels d''uranium.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le composé chimique responsable de la rouille ?',
  'L''oxyde de fer (Fe2O3)',
  ARRAY['Le sulfate de fer', 'Le carbonate de fer', 'Le chlorure de fer'],
  'sciences',
  3,
  'fr',
  true,
  'La rouille se forme quand le fer réagit avec l''oxygène et l''eau.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la plus petite particule d''un élément chimique ?',
  'L''atome',
  ARRAY['La molécule', 'L''électron', 'Le proton'],
  'sciences',
  3,
  'fr',
  true,
  'L''atome est la plus petite unité d''un élément qui conserve ses propriétés chimiques.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel satellite naturel de Jupiter est le plus grand du système solaire ?',
  'Ganymède',
  ARRAY['Europe', 'Callisto', 'Io'],
  'sciences',
  3,
  'fr',
  true,
  'Ganymède est plus grand que Mercure, avec un diamètre de 5 268 km.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Comment appelle-t-on un animal qui mange à la fois des plantes et de la viande ?',
  'Un omnivore',
  ARRAY['Un herbivore', 'Un carnivore', 'Un détritivore'],
  'sciences',
  3,
  'fr',
  true,
  'Les omnivores comme l''ours, le porc et l''humain ont un régime alimentaire mixte.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le principe de conservation fondamental en physique lié à la masse et l''énergie ?',
  'E = mc²',
  ARRAY['F = ma', 'PV = nRT', 'V = IR'],
  'sciences',
  3,
  'fr',
  true,
  'L''équation d''Einstein montre que masse et énergie sont interchangeables.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus grand désert du monde ?',
  'L''Antarctique',
  ARRAY['Le Sahara', 'Le désert de Gobi', 'Le désert d''Arabie'],
  'sciences',
  3,
  'fr',
  true,
  'L''Antarctique est un désert froid de 14 millions de km², recevant très peu de précipitations.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le nom de la première femme à avoir reçu un prix Nobel ?',
  'Marie Curie',
  ARRAY['Rosalind Franklin', 'Dorothy Hodgkin', 'Irène Joliot-Curie'],
  'sciences',
  3,
  'fr',
  true,
  'Marie Curie a reçu le prix Nobel de physique en 1903, puis de chimie en 1911.'
);

-- FR - Difficulty 4 (13 questions)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le nom de la particule subatomique sans charge électrique ?',
  'Le neutron',
  ARRAY['Le proton', 'L''électron', 'Le photon'],
  'sciences',
  4,
  'fr',
  true,
  'Le neutron a été découvert par James Chadwick en 1932. Il stabilise le noyau atomique.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la constante de Planck approximativement ?',
  '6,626 × 10⁻³⁴ J·s',
  ARRAY['9,109 × 10⁻³¹ J·s', '1,602 × 10⁻¹⁹ J·s', '3,14 × 10⁻³⁴ J·s'],
  'sciences',
  4,
  'fr',
  true,
  'La constante de Planck relie l''énergie d''un photon à sa fréquence (E = hν).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le nom du cycle biogéochimique impliquant le carbone entre l''atmosphère, les océans et la biosphère ?',
  'Le cycle du carbone',
  ARRAY['Le cycle de l''azote', 'Le cycle de l''eau', 'Le cycle du phosphore'],
  'sciences',
  4,
  'fr',
  true,
  'Le cycle du carbone régule le CO2 atmosphérique via la photosynthèse, la respiration et la sédimentation.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le nom de l''effet par lequel la fréquence d''une onde change quand sa source se déplace ?',
  'L''effet Doppler',
  ARRAY['L''effet Compton', 'L''effet Zeeman', 'L''effet photoélectrique'],
  'sciences',
  4,
  'fr',
  true,
  'L''effet Doppler explique pourquoi une sirène semble plus aiguë à l''approche et plus grave en s''éloignant.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le principe d''incertitude formulé par Heisenberg ?',
  'On ne peut pas connaître simultanément la position et la vitesse exactes d''une particule',
  ARRAY['L''énergie d''un système isolé est toujours conservée', 'Toute réaction a une réaction égale et opposée', 'La lumière se comporte à la fois comme onde et particule'],
  'sciences',
  4,
  'fr',
  true,
  'Ce principe fondamental de la mécanique quantique a été formulé en 1927.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel organite cellulaire est surnommé la "centrale énergétique" de la cellule ?',
  'La mitochondrie',
  ARRAY['Le chloroplaste', 'Le ribosome', 'L''appareil de Golgi'],
  'sciences',
  4,
  'fr',
  true,
  'Les mitochondries produisent l''ATP, la molécule énergétique de la cellule, par respiration cellulaire.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la différence entre une étoile à neutrons et un trou noir ?',
  'Un trou noir a une gravité si forte que même la lumière ne peut s''en échapper',
  ARRAY['Une étoile à neutrons est plus massive qu''un trou noir', 'Un trou noir émet de la lumière visible', 'Les étoiles à neutrons n''existent que dans la théorie'],
  'sciences',
  4,
  'fr',
  true,
  'Si l''étoile en fin de vie dépasse 3 masses solaires, elle s''effondre en trou noir plutôt qu''en étoile à neutrons.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le nombre quantique principal associé à la 3ème couche électronique ?',
  '3',
  ARRAY['2', '4', '6'],
  'sciences',
  4,
  'fr',
  true,
  'Le nombre quantique principal n correspond au numéro de la couche : n=1 (K), n=2 (L), n=3 (M).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel phénomène géologique se produit à une zone de subduction ?',
  'Une plaque tectonique plonge sous une autre',
  ARRAY['Deux plaques s''éloignent l''une de l''autre', 'Deux plaques glissent latéralement', 'Du magma remonte à la surface sans collision'],
  'sciences',
  4,
  'fr',
  true,
  'La subduction crée des fosses océaniques et des chaînes volcaniques comme la Ceinture de Feu du Pacifique.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le processus de fusion nucléaire qui alimente le Soleil ?',
  'La fusion de l''hydrogène en hélium',
  ARRAY['La fission de l''uranium', 'La fusion de l''hélium en carbone', 'La combustion d''hydrogène'],
  'sciences',
  4,
  'fr',
  true,
  'Le Soleil convertit 600 millions de tonnes d''hydrogène en hélium chaque seconde.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le nom de la liaison chimique entre atomes partageant des électrons ?',
  'La liaison covalente',
  ARRAY['La liaison ionique', 'La liaison métallique', 'La liaison hydrogène'],
  'sciences',
  4,
  'fr',
  true,
  'Dans une liaison covalente, les atomes partagent des paires d''électrons pour atteindre la stabilité.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel phénomène est à l''origine des aurores boréales ?',
  'L''interaction entre le vent solaire et le champ magnétique terrestre',
  ARRAY['La réfraction de la lumière dans les cristaux de glace', 'La réflexion de la lumière lunaire dans l''atmosphère', 'Les éclairs dans la haute atmosphère'],
  'sciences',
  4,
  'fr',
  true,
  'Les particules chargées du vent solaire excitent les atomes d''azote et d''oxygène, produisant de la lumière.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel type d''ARN transporte les acides aminés vers le ribosome ?',
  'L''ARN de transfert (ARNt)',
  ARRAY['L''ARN messager (ARNm)', 'L''ARN ribosomique (ARNr)', 'L''ARN interférent'],
  'sciences',
  4,
  'fr',
  true,
  'L''ARNt reconnaît les codons de l''ARNm et apporte l''acide aminé correspondant pour la synthèse protéique.'
);

-- FR - Difficulty 5 (7 questions)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le nom du boson responsable de la masse des particules élémentaires ?',
  'Le boson de Higgs',
  ARRAY['Le graviton', 'Le gluon', 'Le photon'],
  'sciences',
  5,
  'fr',
  true,
  'Le boson de Higgs a été découvert au CERN en 2012, confirmant le modèle standard de la physique.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la valeur approximative de la constante gravitationnelle G ?',
  '6,674 × 10⁻¹¹ N·m²/kg²',
  ARRAY['9,8 N·m²/kg²', '3,0 × 10⁸ N·m²/kg²', '1,38 × 10⁻²³ N·m²/kg²'],
  'sciences',
  5,
  'fr',
  true,
  'G est la constante de la loi de gravitation universelle de Newton, mesurée par Cavendish en 1798.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel phénomène quantique permet à une particule de traverser une barrière d''énergie normalement infranchissable ?',
  'L''effet tunnel',
  ARRAY['La superposition quantique', 'L''intrication quantique', 'La décohérence'],
  'sciences',
  5,
  'fr',
  true,
  'L''effet tunnel est essentiel au fonctionnement des diodes tunnel et à la fusion stellaire.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le processus par lequel les étoiles massives terminent leur vie ?',
  'Supernova',
  ARRAY['Nova', 'Nébuleuse planétaire', 'Naine blanche'],
  'sciences',
  5,
  'fr',
  true,
  'Les étoiles de plus de 8 masses solaires explosent en supernova, laissant une étoile à neutrons ou un trou noir.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le nom de la technique de modification génétique utilisant une protéine Cas9 ?',
  'CRISPR-Cas9',
  ARRAY['PCR', 'Électrophorèse', 'Clonage moléculaire'],
  'sciences',
  5,
  'fr',
  true,
  'CRISPR-Cas9 permet de couper et modifier l''ADN avec une précision sans précédent.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel scientifique a proposé le modèle planétaire de l''atome avec un noyau central ?',
  'Ernest Rutherford',
  ARRAY['Niels Bohr', 'J.J. Thomson', 'Erwin Schrödinger'],
  'sciences',
  5,
  'fr',
  true,
  'L''expérience de la feuille d''or de Rutherford (1911) a révélé que l''atome a un noyau dense.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la longueur de Planck, considérée comme la plus petite distance mesurable ?',
  '1,616 × 10⁻³⁵ mètre',
  ARRAY['1,0 × 10⁻¹⁰ mètre', '9,11 × 10⁻³¹ mètre', '5,39 × 10⁻⁴⁴ mètre'],
  'sciences',
  5,
  'fr',
  true,
  'La longueur de Planck est la limite théorique en dessous de laquelle l''espace-temps perd son sens classique.'
);

-- =============================================
-- ENGLISH QUESTIONS (100)
-- =============================================

-- EN - Difficulty 1 (15 questions)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What gas do humans exhale that plants need to survive?',
  'Carbon dioxide',
  ARRAY['Oxygen', 'Nitrogen', 'Hydrogen'],
  'sciences',
  1,
  'en',
  true,
  'Humans breathe out CO2, which plants use during photosynthesis to make food.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the closest star to Earth?',
  'The Sun',
  ARRAY['Alpha Centauri', 'Sirius', 'Proxima Centauri'],
  'sciences',
  1,
  'en',
  true,
  'The Sun is about 93 million miles away, while the next nearest star is over 4 light-years away.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the boiling point of water at sea level?',
  '100°C (212°F)',
  ARRAY['90°C (194°F)', '110°C (230°F)', '80°C (176°F)'],
  'sciences',
  1,
  'en',
  true,
  'Water boils at 100°C at standard atmospheric pressure at sea level.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many legs does a spider have?',
  '8',
  ARRAY['6', '10', '12'],
  'sciences',
  1,
  'en',
  true,
  'Spiders are arachnids, not insects, and all arachnids have 8 legs.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What planet is known as the Red Planet?',
  'Mars',
  ARRAY['Venus', 'Jupiter', 'Mercury'],
  'sciences',
  1,
  'en',
  true,
  'Mars appears red due to iron oxide (rust) on its surface.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the hardest natural substance on Earth?',
  'Diamond',
  ARRAY['Quartz', 'Titanium', 'Sapphire'],
  'sciences',
  1,
  'en',
  true,
  'Diamond is rated 10 on the Mohs hardness scale, the highest possible rating.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Which organ pumps blood throughout the body?',
  'The heart',
  ARRAY['The lungs', 'The liver', 'The kidneys'],
  'sciences',
  1,
  'en',
  true,
  'The human heart beats about 100,000 times per day, pumping around 7,500 liters of blood.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What force keeps us on the ground?',
  'Gravity',
  ARRAY['Magnetism', 'Friction', 'Air pressure'],
  'sciences',
  1,
  'en',
  true,
  'Gravity is the force of attraction between objects with mass. Earth''s gravity accelerates objects at 9.8 m/s².'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the chemical formula for water?',
  'H2O',
  ARRAY['CO2', 'NaCl', 'O2'],
  'sciences',
  1,
  'en',
  true,
  'Water is made of 2 hydrogen atoms bonded to 1 oxygen atom.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the largest planet in our solar system?',
  'Jupiter',
  ARRAY['Saturn', 'Neptune', 'Uranus'],
  'sciences',
  1,
  'en',
  true,
  'Jupiter is so large that over 1,300 Earths could fit inside it.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What do caterpillars turn into?',
  'Butterflies (or moths)',
  ARRAY['Beetles', 'Dragonflies', 'Bees'],
  'sciences',
  1,
  'en',
  true,
  'Caterpillars undergo metamorphosis inside a chrysalis to become butterflies.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the largest ocean on Earth?',
  'The Pacific Ocean',
  ARRAY['The Atlantic Ocean', 'The Indian Ocean', 'The Arctic Ocean'],
  'sciences',
  1,
  'en',
  true,
  'The Pacific Ocean covers about 165 million square kilometers, more than all land combined.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What kind of rock comes from a volcano?',
  'Igneous rock',
  ARRAY['Sedimentary rock', 'Metamorphic rock', 'Limestone'],
  'sciences',
  1,
  'en',
  true,
  'Igneous rocks form when molten lava or magma cools and solidifies.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Which scientist discovered gravity after watching an apple fall?',
  'Isaac Newton',
  ARRAY['Albert Einstein', 'Galileo Galilei', 'Archimedes'],
  'sciences',
  1,
  'en',
  true,
  'The apple story may be partly legend, but Newton did develop the law of universal gravitation.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the chemical symbol for gold?',
  'Au',
  ARRAY['Go', 'Gd', 'Ag'],
  'sciences',
  1,
  'en',
  true,
  'Au comes from the Latin word "aurum" meaning gold.'
);

-- EN - Difficulty 2 (15 questions)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is DNA an abbreviation for?',
  'Deoxyribonucleic acid',
  ARRAY['Dinitrogen acid', 'Deoxyribo-nuclear acid', 'Dinucleotide acid'],
  'sciences',
  2,
  'en',
  true,
  'DNA carries the genetic instructions for the development and function of living organisms.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the speed of light approximately?',
  '300,000 km/s',
  ARRAY['150,000 km/s', '1,000,000 km/s', '30,000 km/s'],
  'sciences',
  2,
  'en',
  true,
  'Light travels at approximately 299,792 km/s in a vacuum.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the most abundant gas in Earth''s atmosphere?',
  'Nitrogen (78%)',
  ARRAY['Oxygen (78%)', 'Carbon dioxide (78%)', 'Argon (78%)'],
  'sciences',
  2,
  'en',
  true,
  'The atmosphere is about 78% nitrogen, 21% oxygen, and 1% other gases.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What measures earthquakes on a numerical scale?',
  'The Richter scale',
  ARRAY['The Beaufort scale', 'The Kelvin scale', 'The Fujita scale'],
  'sciences',
  2,
  'en',
  true,
  'The Richter scale measures earthquake magnitude. Each whole number increase represents 10x more amplitude.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Who invented the first practical light bulb?',
  'Thomas Edison',
  ARRAY['Nikola Tesla', 'Benjamin Franklin', 'Michael Faraday'],
  'sciences',
  2,
  'en',
  true,
  'Edison patented the practical incandescent light bulb in 1879.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the smallest unit of life?',
  'The cell',
  ARRAY['The atom', 'The molecule', 'The organ'],
  'sciences',
  2,
  'en',
  true,
  'Cells are the smallest structural and functional units of living organisms.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many chromosomes do humans have?',
  '46',
  ARRAY['23', '48', '44'],
  'sciences',
  2,
  'en',
  true,
  'Humans have 23 pairs (46 total) of chromosomes in each cell.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What causes tides on Earth?',
  'The gravitational pull of the Moon and Sun',
  ARRAY['Earth''s rotation', 'Wind over the oceans', 'Underwater currents'],
  'sciences',
  2,
  'en',
  true,
  'The Moon is responsible for about 2/3 of tidal forces, with the Sun contributing the rest.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the most abundant element in the universe?',
  'Hydrogen',
  ARRAY['Helium', 'Oxygen', 'Carbon'],
  'sciences',
  2,
  'en',
  true,
  'Hydrogen makes up about 75% of the visible mass of the universe.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What layer of the atmosphere contains the ozone layer?',
  'The stratosphere',
  ARRAY['The troposphere', 'The mesosphere', 'The thermosphere'],
  'sciences',
  2,
  'en',
  true,
  'The ozone layer sits in the stratosphere, about 15-35 km above Earth''s surface.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Who developed the first vaccine?',
  'Edward Jenner',
  ARRAY['Louis Pasteur', 'Alexander Fleming', 'Robert Koch'],
  'sciences',
  2,
  'en',
  true,
  'Jenner created the first vaccine against smallpox in 1796 using the cowpox virus.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the Sun mainly made of?',
  'Hydrogen and helium',
  ARRAY['Iron and nickel', 'Oxygen and carbon', 'Magma and gas'],
  'sciences',
  2,
  'en',
  true,
  'The Sun is approximately 73% hydrogen and 25% helium.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Which planet rotates in the opposite direction to most other planets?',
  'Venus',
  ARRAY['Mars', 'Mercury', 'Neptune'],
  'sciences',
  2,
  'en',
  true,
  'Venus has retrograde rotation, meaning the Sun rises in the west and sets in the east there.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many bones does a newborn baby have?',
  'About 300',
  ARRAY['About 206', 'About 150', 'About 400'],
  'sciences',
  2,
  'en',
  true,
  'A baby is born with about 300 bones that fuse together into 206 bones by adulthood.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What phenomenon explains why the sky is blue?',
  'Rayleigh scattering',
  ARRAY['Light refraction', 'Atmospheric absorption', 'Ocean reflection'],
  'sciences',
  2,
  'en',
  true,
  'Rayleigh scattering disperses shorter wavelengths (blue) more than longer ones (red).'
);

-- EN - Difficulty 3 (50 questions)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the process by which cells divide into two identical copies?',
  'Mitosis',
  ARRAY['Meiosis', 'Cytokinesis', 'Apoptosis'],
  'sciences',
  3,
  'en',
  true,
  'Mitosis produces two genetically identical daughter cells, unlike meiosis which produces reproductive cells.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the atomic number of carbon?',
  '6',
  ARRAY['8', '12', '14'],
  'sciences',
  3,
  'en',
  true,
  'Carbon has 6 protons in its nucleus. It is the basis of all organic chemistry.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What type of wave is sound?',
  'A mechanical longitudinal wave',
  ARRAY['An electromagnetic wave', 'A transverse wave', 'A light wave'],
  'sciences',
  3,
  'en',
  true,
  'Sound travels through compression and rarefaction of air molecules.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How long does it take for sunlight to reach Earth?',
  'About 8 minutes',
  ARRAY['About 1 minute', 'About 30 seconds', 'About 1 hour'],
  'sciences',
  3,
  'en',
  true,
  'Light travels the 150 million km from the Sun to Earth in about 8 minutes and 20 seconds.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Who discovered penicillin?',
  'Alexander Fleming',
  ARRAY['Louis Pasteur', 'Robert Koch', 'Joseph Lister'],
  'sciences',
  3,
  'en',
  true,
  'Fleming accidentally discovered penicillin in 1928 when mold contaminated his bacterial cultures.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the chemical formula for table salt?',
  'NaCl',
  ARRAY['KCl', 'NaOH', 'CaCl2'],
  'sciences',
  3,
  'en',
  true,
  'Table salt is sodium chloride, made of one sodium atom and one chlorine atom.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the pH of a neutral solution?',
  '7',
  ARRAY['0', '14', '1'],
  'sciences',
  3,
  'en',
  true,
  'A pH of 7 is neutral, below 7 is acidic, and above 7 is basic (alkaline).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What organ produces bile?',
  'The liver',
  ARRAY['The gallbladder', 'The pancreas', 'The stomach'],
  'sciences',
  3,
  'en',
  true,
  'The liver produces bile, which is then stored in the gallbladder until needed for digestion.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the approximate temperature of Earth''s core?',
  'About 5,500°C',
  ARRAY['About 1,000°C', 'About 10,000°C', 'About 3,000°C'],
  'sciences',
  3,
  'en',
  true,
  'Earth''s inner core reaches about 5,500°C, similar to the surface temperature of the Sun.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Who proposed the theory of evolution by natural selection?',
  'Charles Darwin',
  ARRAY['Gregor Mendel', 'Jean-Baptiste Lamarck', 'Louis Pasteur'],
  'sciences',
  3,
  'en',
  true,
  'Darwin published "On the Origin of Species" in 1859, laying out his theory of natural selection.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the longest bone in the human body?',
  'The femur',
  ARRAY['The tibia', 'The humerus', 'The fibula'],
  'sciences',
  3,
  'en',
  true,
  'The femur (thighbone) is roughly a quarter of a person''s height.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What galaxy do we live in?',
  'The Milky Way',
  ARRAY['Andromeda', 'The Large Magellanic Cloud', 'The Triangulum Galaxy'],
  'sciences',
  3,
  'en',
  true,
  'The Milky Way is a spiral galaxy containing between 100 and 400 billion stars.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the name of the first artificial satellite launched into space?',
  'Sputnik 1',
  ARRAY['Explorer 1', 'Vanguard 1', 'Luna 1'],
  'sciences',
  3,
  'en',
  true,
  'Sputnik 1 was launched by the Soviet Union on October 4, 1957.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the hottest planet in our solar system?',
  'Venus',
  ARRAY['Mercury', 'Mars', 'Jupiter'],
  'sciences',
  3,
  'en',
  true,
  'Venus reaches 465°C due to a runaway greenhouse effect, hotter than Mercury despite being farther from the Sun.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is a metal that is liquid at room temperature?',
  'Mercury',
  ARRAY['Gallium', 'Lead', 'Tin'],
  'sciences',
  3,
  'en',
  true,
  'Mercury melts at -39°C, making it liquid at room temperature.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many layers does Earth''s atmosphere have?',
  '5',
  ARRAY['3', '4', '7'],
  'sciences',
  3,
  'en',
  true,
  'The 5 layers are: troposphere, stratosphere, mesosphere, thermosphere, and exosphere.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the unit of measurement for force?',
  'The newton',
  ARRAY['The joule', 'The watt', 'The pascal'],
  'sciences',
  3,
  'en',
  true,
  'One newton is the force needed to accelerate 1 kg at 1 m/s².'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What instrument measures atmospheric pressure?',
  'A barometer',
  ARRAY['A thermometer', 'A hygrometer', 'An anemometer'],
  'sciences',
  3,
  'en',
  true,
  'The barometer was invented by Evangelista Torricelli in 1643.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What part of the eye controls how much light enters?',
  'The iris',
  ARRAY['The retina', 'The cornea', 'The lens'],
  'sciences',
  3,
  'en',
  true,
  'The iris adjusts the size of the pupil to regulate the amount of light entering the eye.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What type of chemical reaction releases energy?',
  'An exothermic reaction',
  ARRAY['An endothermic reaction', 'A neutral reaction', 'An isothermal reaction'],
  'sciences',
  3,
  'en',
  true,
  'Exothermic reactions release heat, like the combustion of wood or gasoline.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the name of the force that opposes motion between two surfaces?',
  'Friction',
  ARRAY['Gravity', 'Inertia', 'Tension'],
  'sciences',
  3,
  'en',
  true,
  'Friction slows down moving objects and converts kinetic energy into heat.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What cell structure contains DNA in eukaryotes?',
  'The nucleus',
  ARRAY['The mitochondria', 'The ribosome', 'The cytoplasm'],
  'sciences',
  3,
  'en',
  true,
  'The nucleus houses DNA and controls the cell''s activities.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How old is the Earth approximately?',
  '4.5 billion years',
  ARRAY['2 billion years', '10 billion years', '1 billion years'],
  'sciences',
  3,
  'en',
  true,
  'Earth''s age is estimated at 4.54 billion years through radiometric dating.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What theory explains the movement of Earth''s continental plates?',
  'Plate tectonics',
  ARRAY['Continental drift theory alone', 'The theory of relativity', 'The expansion theory'],
  'sciences',
  3,
  'en',
  true,
  'Plate tectonics explains how lithospheric plates move on Earth''s mantle.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What molecule carries oxygen in the blood?',
  'Hemoglobin',
  ARRAY['Albumin', 'Myoglobin', 'Fibrin'],
  'sciences',
  3,
  'en',
  true,
  'Hemoglobin contains iron that binds to oxygen in red blood cells.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the largest desert in the world?',
  'Antarctica',
  ARRAY['The Sahara', 'The Gobi Desert', 'The Arabian Desert'],
  'sciences',
  3,
  'en',
  true,
  'Antarctica is a cold desert of 14 million km², receiving very little precipitation.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the chemical symbol for sodium?',
  'Na',
  ARRAY['So', 'Sd', 'No'],
  'sciences',
  3,
  'en',
  true,
  'Na comes from the Latin "natrium," the old name for sodium.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the smallest particle of a chemical element?',
  'An atom',
  ARRAY['A molecule', 'An electron', 'A proton'],
  'sciences',
  3,
  'en',
  true,
  'An atom is the smallest unit of an element that retains its chemical properties.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Which moon of Jupiter is the largest in the solar system?',
  'Ganymede',
  ARRAY['Europa', 'Callisto', 'Io'],
  'sciences',
  3,
  'en',
  true,
  'Ganymede is larger than Mercury, with a diameter of 5,268 km.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is an animal called if it eats both plants and meat?',
  'An omnivore',
  ARRAY['A herbivore', 'A carnivore', 'A detritivore'],
  'sciences',
  3,
  'en',
  true,
  'Omnivores like bears, pigs, and humans have a mixed diet of plants and animals.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What famous equation relates mass and energy?',
  'E = mc²',
  ARRAY['F = ma', 'PV = nRT', 'V = IR'],
  'sciences',
  3,
  'en',
  true,
  'Einstein''s equation shows that mass and energy are interchangeable.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What are the thinnest blood vessels in the body called?',
  'Capillaries',
  ARRAY['Arterioles', 'Venules', 'Arteries'],
  'sciences',
  3,
  'en',
  true,
  'Capillaries are so thin that only a single red blood cell can pass through at a time.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the approximate value of Avogadro''s number?',
  '6.022 x 10²³',
  ARRAY['3.14 x 10²³', '1.602 x 10¹⁹', '9.8 x 10²³'],
  'sciences',
  3,
  'en',
  true,
  'Avogadro''s number defines the number of entities in one mole of a substance.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What compound causes rust?',
  'Iron oxide (Fe2O3)',
  ARRAY['Iron sulfate', 'Iron carbonate', 'Iron chloride'],
  'sciences',
  3,
  'en',
  true,
  'Rust forms when iron reacts with oxygen and water in a process called oxidation.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is Earth''s outermost layer called?',
  'The crust',
  ARRAY['The mantle', 'The outer core', 'The lithosphere'],
  'sciences',
  3,
  'en',
  true,
  'Earth''s crust is 5-70 km thick, depending on whether it is oceanic or continental.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What process converts water from liquid to gas?',
  'Evaporation',
  ARRAY['Condensation', 'Sublimation', 'Melting'],
  'sciences',
  3,
  'en',
  true,
  'Evaporation occurs when water molecules gain enough energy to escape into the gas phase.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Who discovered radioactivity?',
  'Henri Becquerel',
  ARRAY['Marie Curie', 'Pierre Curie', 'Wilhelm Röntgen'],
  'sciences',
  3,
  'en',
  true,
  'Becquerel discovered radioactivity in 1896 while studying uranium salts.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How long does it take Earth to orbit the Sun?',
  '365.25 days',
  ARRAY['360 days', '365 days exactly', '366 days'],
  'sciences',
  3,
  'en',
  true,
  'The extra quarter day is why we add a leap day every 4 years.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the main component of bones?',
  'Calcium phosphate',
  ARRAY['Iron', 'Pure collagen', 'Silicon'],
  'sciences',
  3,
  'en',
  true,
  'Bones are mainly composed of calcium phosphate (hydroxyapatite) and collagen.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What does photosynthesis produce besides glucose?',
  'Oxygen',
  ARRAY['Carbon dioxide', 'Nitrogen', 'Hydrogen'],
  'sciences',
  3,
  'en',
  true,
  'Photosynthesis converts CO2 and water into glucose and oxygen using light energy.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the distance between the Earth and the Sun called?',
  'An astronomical unit (AU)',
  ARRAY['A light-year', 'A parsec', 'A solar mile'],
  'sciences',
  3,
  'en',
  true,
  'One AU is approximately 150 million km (93 million miles).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Which physicist formulated the laws of motion and universal gravitation?',
  'Isaac Newton',
  ARRAY['Galileo Galilei', 'Johannes Kepler', 'Albert Einstein'],
  'sciences',
  3,
  'en',
  true,
  'Newton published his three laws of motion and the law of universal gravitation in the Principia (1687).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What type of lens corrects nearsightedness (myopia)?',
  'A diverging (concave) lens',
  ARRAY['A converging (convex) lens', 'A flat lens', 'A bifocal lens'],
  'sciences',
  3,
  'en',
  true,
  'Diverging lenses shift the focal point backward to correct blurry distance vision.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What organ filters the blood and produces urine?',
  'The kidneys',
  ARRAY['The liver', 'The spleen', 'The bladder'],
  'sciences',
  3,
  'en',
  true,
  'The kidneys filter about 180 liters of blood per day to produce urine.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the approximate diameter of Earth?',
  '12,742 km',
  ARRAY['6,371 km', '40,075 km', '25,000 km'],
  'sciences',
  3,
  'en',
  true,
  'Earth''s diameter at the equator is approximately 12,742 km.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What noble gas is the lightest?',
  'Helium',
  ARRAY['Neon', 'Argon', 'Krypton'],
  'sciences',
  3,
  'en',
  true,
  'Helium is the second lightest element overall (after hydrogen) and the lightest noble gas.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How many pairs of chromosomes do humans have?',
  '23',
  ARRAY['22', '24', '46'],
  'sciences',
  3,
  'en',
  true,
  'Humans have 23 pairs (46 total) of chromosomes. The 23rd pair determines biological sex.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the name of the process by which plants make their own food?',
  'Photosynthesis',
  ARRAY['Respiration', 'Fermentation', 'Transpiration'],
  'sciences',
  3,
  'en',
  true,
  'Photosynthesis uses light energy to convert CO2 and water into glucose and oxygen.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the longest river in the world?',
  'The Nile',
  ARRAY['The Amazon', 'The Yangtze', 'The Mississippi'],
  'sciences',
  3,
  'en',
  true,
  'The Nile stretches about 6,650 km, though the Amazon is sometimes claimed as longer.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Who was the first woman to win a Nobel Prize?',
  'Marie Curie',
  ARRAY['Rosalind Franklin', 'Dorothy Hodgkin', 'Irène Joliot-Curie'],
  'sciences',
  3,
  'en',
  true,
  'Marie Curie won the Nobel Prize in Physics in 1903, then in Chemistry in 1911.'
);

-- EN - Difficulty 4 (13 questions)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the name of the subatomic particle with no electric charge?',
  'The neutron',
  ARRAY['The proton', 'The electron', 'The photon'],
  'sciences',
  4,
  'en',
  true,
  'The neutron was discovered by James Chadwick in 1932 and helps stabilize the atomic nucleus.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the approximate value of Planck''s constant?',
  '6.626 x 10⁻³⁴ J·s',
  ARRAY['9.109 x 10⁻³¹ J·s', '1.602 x 10⁻¹⁹ J·s', '3.14 x 10⁻³⁴ J·s'],
  'sciences',
  4,
  'en',
  true,
  'Planck''s constant relates a photon''s energy to its frequency (E = hv).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What effect describes the change in frequency of a wave when its source moves?',
  'The Doppler effect',
  ARRAY['The Compton effect', 'The Zeeman effect', 'The photoelectric effect'],
  'sciences',
  4,
  'en',
  true,
  'The Doppler effect explains why a siren sounds higher-pitched as it approaches and lower as it moves away.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What does Heisenberg''s uncertainty principle state?',
  'You cannot simultaneously know the exact position and momentum of a particle',
  ARRAY['Energy is always conserved in an isolated system', 'Every action has an equal and opposite reaction', 'Light behaves as both a wave and a particle'],
  'sciences',
  4,
  'en',
  true,
  'This fundamental principle of quantum mechanics was formulated in 1927.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What cell organelle is called the "powerhouse of the cell"?',
  'The mitochondria',
  ARRAY['The chloroplast', 'The ribosome', 'The Golgi apparatus'],
  'sciences',
  4,
  'en',
  true,
  'Mitochondria produce ATP, the cell''s energy currency, through cellular respiration.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What geological process occurs at a subduction zone?',
  'One tectonic plate dives beneath another',
  ARRAY['Two plates move apart', 'Two plates slide laterally', 'Magma rises without plate collision'],
  'sciences',
  4,
  'en',
  true,
  'Subduction creates ocean trenches and volcanic chains like the Pacific Ring of Fire.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What nuclear process powers the Sun?',
  'Hydrogen fusion into helium',
  ARRAY['Uranium fission', 'Helium fusion into carbon', 'Hydrogen combustion'],
  'sciences',
  4,
  'en',
  true,
  'The Sun converts 600 million tons of hydrogen into helium every second.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What type of chemical bond involves the sharing of electrons between atoms?',
  'A covalent bond',
  ARRAY['An ionic bond', 'A metallic bond', 'A hydrogen bond'],
  'sciences',
  4,
  'en',
  true,
  'In a covalent bond, atoms share electron pairs to achieve stability.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What phenomenon causes the northern lights (aurora borealis)?',
  'Solar wind interacting with Earth''s magnetic field',
  ARRAY['Light refraction in ice crystals', 'Moonlight reflection in the atmosphere', 'Lightning in the upper atmosphere'],
  'sciences',
  4,
  'en',
  true,
  'Charged particles from the solar wind excite nitrogen and oxygen atoms, producing colored light.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What type of RNA carries amino acids to the ribosome?',
  'Transfer RNA (tRNA)',
  ARRAY['Messenger RNA (mRNA)', 'Ribosomal RNA (rRNA)', 'Interfering RNA (siRNA)'],
  'sciences',
  4,
  'en',
  true,
  'tRNA recognizes mRNA codons and delivers the corresponding amino acid for protein synthesis.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the principal quantum number for the third electron shell?',
  '3',
  ARRAY['2', '4', '6'],
  'sciences',
  4,
  'en',
  true,
  'The principal quantum number n corresponds to the shell: n=1 (K), n=2 (L), n=3 (M).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the biogeochemical cycle that regulates atmospheric CO2?',
  'The carbon cycle',
  ARRAY['The nitrogen cycle', 'The water cycle', 'The phosphorus cycle'],
  'sciences',
  4,
  'en',
  true,
  'The carbon cycle regulates CO2 through photosynthesis, respiration, and sedimentation.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What distinguishes a black hole from a neutron star?',
  'A black hole''s gravity is so strong that even light cannot escape',
  ARRAY['A neutron star is more massive than a black hole', 'A black hole emits visible light', 'Neutron stars only exist in theory'],
  'sciences',
  4,
  'en',
  true,
  'Stars exceeding about 3 solar masses at end of life collapse into black holes rather than neutron stars.'
);

-- EN - Difficulty 5 (7 questions)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What boson is responsible for giving elementary particles their mass?',
  'The Higgs boson',
  ARRAY['The graviton', 'The gluon', 'The photon'],
  'sciences',
  5,
  'en',
  true,
  'The Higgs boson was discovered at CERN in 2012, confirming the Standard Model of physics.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the approximate value of the gravitational constant G?',
  '6.674 x 10⁻¹¹ N·m²/kg²',
  ARRAY['9.8 N·m²/kg²', '3.0 x 10⁸ N·m²/kg²', '1.38 x 10⁻²³ N·m²/kg²'],
  'sciences',
  5,
  'en',
  true,
  'G is the constant in Newton''s law of universal gravitation, first measured by Cavendish in 1798.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What quantum phenomenon allows a particle to pass through an energy barrier it classically could not?',
  'Quantum tunneling',
  ARRAY['Quantum superposition', 'Quantum entanglement', 'Decoherence'],
  'sciences',
  5,
  'en',
  true,
  'Quantum tunneling is essential for tunnel diodes and stellar nuclear fusion.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'How do massive stars end their lives?',
  'In a supernova explosion',
  ARRAY['As a nova', 'As a planetary nebula', 'As a white dwarf'],
  'sciences',
  5,
  'en',
  true,
  'Stars over 8 solar masses explode as supernovae, leaving behind neutron stars or black holes.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What gene-editing technique uses Cas9 protein?',
  'CRISPR-Cas9',
  ARRAY['PCR', 'Gel electrophoresis', 'Molecular cloning'],
  'sciences',
  5,
  'en',
  true,
  'CRISPR-Cas9 allows precise cutting and editing of DNA sequences.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Which scientist proposed the nuclear model of the atom?',
  'Ernest Rutherford',
  ARRAY['Niels Bohr', 'J.J. Thomson', 'Erwin Schrödinger'],
  'sciences',
  5,
  'en',
  true,
  'Rutherford''s gold foil experiment (1911) revealed the atom has a dense central nucleus.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'What is the Planck length, considered the smallest meaningful distance?',
  '1.616 x 10⁻³⁵ meters',
  ARRAY['1.0 x 10⁻¹⁰ meters', '9.11 x 10⁻³¹ meters', '5.39 x 10⁻⁴⁴ meters'],
  'sciences',
  5,
  'en',
  true,
  'The Planck length is the theoretical limit below which spacetime loses its classical meaning.'
);
