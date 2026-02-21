-- Migration: Add 200 French geography questions
-- Date: 2026-02-21
-- Difficulty spread: 30% easy (1-2), 50% medium (3), 20% hard (4-5)
-- Topics: capitales, fleuves, montagnes, océans, pays, continents, drapeaux, population, superficies, records géographiques

-- =============================================
-- EASY (difficulty 1) — 30 questions
-- =============================================

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus grand désert chaud du monde ?',
  'Le Sahara',
  ARRAY['Le désert de Gobi', 'Le désert d''Arabie', 'Le désert du Kalahari'],
  'geographie',
  1,
  'fr',
  true,
  'Le Sahara couvre environ 9 millions de km², soit presque la taille des États-Unis !'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale du Canada ?',
  'Ottawa',
  ARRAY['Toronto', 'Montréal', 'Vancouver'],
  'geographie',
  1,
  'fr',
  true,
  'Ottawa est la capitale fédérale du Canada, même si Toronto est la plus grande ville.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Combien d''océans y a-t-il sur Terre ?',
  '5',
  ARRAY['3', '4', '7'],
  'geographie',
  1,
  'fr',
  true,
  'Les 5 océans sont le Pacifique, l''Atlantique, l''Indien, l''Arctique et l''Antarctique (ou Austral).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus long fleuve du monde ?',
  'Le Nil',
  ARRAY['L''Amazone', 'Le Mississippi', 'Le Yangtsé'],
  'geographie',
  1,
  'fr',
  true,
  'Le Nil mesure environ 6 650 km, bien que l''Amazone le dispute selon les mesures.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Sur quel continent se trouve le Brésil ?',
  'Amérique du Sud',
  ARRAY['Amérique du Nord', 'Afrique', 'Europe'],
  'geographie',
  1,
  'fr',
  true,
  'Le Brésil est le plus grand pays d''Amérique du Sud et le 5e plus grand au monde.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la plus haute montagne du monde ?',
  'L''Everest',
  ARRAY['Le K2', 'Le Mont Blanc', 'Le Kilimandjaro'],
  'geographie',
  1,
  'fr',
  true,
  'L''Everest culmine à 8 849 mètres dans l''Himalaya, à la frontière Népal-Chine.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus petit continent ?',
  'L''Océanie',
  ARRAY['L''Europe', 'L''Antarctique', 'L''Amérique du Sud'],
  'geographie',
  1,
  'fr',
  true,
  'L''Océanie (ou Australie comme continent) est le plus petit avec environ 8,5 millions de km².'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays est surnommé le « pays du Soleil-Levant » ?',
  'Le Japon',
  ARRAY['La Chine', 'La Corée du Sud', 'La Thaïlande'],
  'geographie',
  1,
  'fr',
  true,
  'Le nom japonais du Japon, Nihon, signifie littéralement « origine du soleil ».'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale de l''Australie ?',
  'Canberra',
  ARRAY['Sydney', 'Melbourne', 'Brisbane'],
  'geographie',
  1,
  'fr',
  true,
  'Canberra a été choisie comme capitale de compromis entre Sydney et Melbourne.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel océan borde la côte ouest de la France ?',
  'L''océan Atlantique',
  ARRAY['L''océan Pacifique', 'L''océan Indien', 'La mer Méditerranée'],
  'geographie',
  1,
  'fr',
  true,
  'L''Atlantique borde la façade ouest de la France, de la Bretagne au Pays basque.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le continent le plus peuplé ?',
  'L''Asie',
  ARRAY['L''Afrique', 'L''Europe', 'L''Amérique du Nord'],
  'geographie',
  1,
  'fr',
  true,
  'L''Asie abrite plus de 4,7 milliards d''habitants, soit environ 60% de la population mondiale.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale du Mexique ?',
  'Mexico',
  ARRAY['Cancún', 'Guadalajara', 'Monterrey'],
  'geographie',
  1,
  'fr',
  true,
  'Mexico est l''une des plus grandes villes du monde avec plus de 21 millions d''habitants dans son agglomération.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus grand pays d''Afrique ?',
  'L''Algérie',
  ARRAY['Le Congo', 'Le Soudan', 'La Libye'],
  'geographie',
  1,
  'fr',
  true,
  'L''Algérie couvre 2,38 millions de km², devenant le plus grand pays d''Afrique après la division du Soudan en 2011.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel fleuve traverse Londres ?',
  'La Tamise',
  ARRAY['La Seine', 'Le Rhin', 'Le Danube'],
  'geographie',
  1,
  'fr',
  true,
  'La Tamise (Thames) fait 346 km et est le principal fleuve du sud de l''Angleterre.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle île est la plus grande du monde ?',
  'Le Groenland',
  ARRAY['Madagascar', 'Bornéo', 'La Nouvelle-Guinée'],
  'geographie',
  1,
  'fr',
  true,
  'Le Groenland fait 2,16 millions de km². L''Australie est plus grande mais considérée comme un continent.'
);

-- =============================================
-- EASY (difficulty 2) — 30 questions
-- =============================================

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale de la Turquie ?',
  'Ankara',
  ARRAY['Istanbul', 'Izmir', 'Antalya'],
  'geographie',
  2,
  'fr',
  true,
  'Ankara est la capitale depuis 1923, même si Istanbul est la ville la plus connue et la plus peuplée.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays a le plus grand nombre d''habitants ?',
  'L''Inde',
  ARRAY['La Chine', 'Les États-Unis', 'L''Indonésie'],
  'geographie',
  2,
  'fr',
  true,
  'L''Inde a dépassé la Chine en 2023 pour devenir le pays le plus peuplé avec plus de 1,4 milliard d''habitants.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel détroit sépare l''Europe de l''Afrique ?',
  'Le détroit de Gibraltar',
  ARRAY['Le détroit de Bab-el-Mandeb', 'Le Bosphore', 'Le détroit de Messine'],
  'geographie',
  2,
  'fr',
  true,
  'Le détroit de Gibraltar ne fait que 14 km de large à son point le plus étroit, entre l''Espagne et le Maroc.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus grand lac d''Afrique ?',
  'Le lac Victoria',
  ARRAY['Le lac Tanganyika', 'Le lac Malawi', 'Le lac Tchad'],
  'geographie',
  2,
  'fr',
  true,
  'Le lac Victoria fait 68 000 km² et est bordé par le Kenya, la Tanzanie et l''Ouganda.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle chaîne de montagnes sépare la France de l''Espagne ?',
  'Les Pyrénées',
  ARRAY['Les Alpes', 'Le Jura', 'Les Vosges'],
  'geographie',
  2,
  'fr',
  true,
  'Les Pyrénées s''étendent sur 430 km de l''Atlantique à la Méditerranée.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale du Brésil ?',
  'Brasília',
  ARRAY['Rio de Janeiro', 'São Paulo', 'Salvador'],
  'geographie',
  2,
  'fr',
  true,
  'Brasília a été construite en 4 ans et est devenue capitale en 1960, remplaçant Rio de Janeiro.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays est traversé par l''équateur ET le méridien de Greenwich ?',
  'Le Ghana',
  ARRAY['Le Nigeria', 'Le Cameroun', 'La Côte d''Ivoire'],
  'geographie',
  2,
  'fr',
  true,
  'Le Ghana est le seul pays au monde traversé à la fois par l''équateur (approximativement) et le méridien de Greenwich.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus petit pays du monde ?',
  'Le Vatican',
  ARRAY['Monaco', 'Saint-Marin', 'Le Liechtenstein'],
  'geographie',
  2,
  'fr',
  true,
  'Le Vatican ne fait que 0,44 km² et compte environ 800 habitants.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle mer est la plus salée du monde ?',
  'La mer Morte',
  ARRAY['La mer Rouge', 'La mer Caspienne', 'La mer Méditerranée'],
  'geographie',
  2,
  'fr',
  true,
  'La mer Morte a une salinité d''environ 34%, soit presque 10 fois plus que l''océan.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale de la Thaïlande ?',
  'Bangkok',
  ARRAY['Phuket', 'Chiang Mai', 'Pattaya'],
  'geographie',
  2,
  'fr',
  true,
  'Le nom complet de Bangkok en thaï est le plus long nom de ville au monde avec 168 lettres !'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le fleuve le plus long d''Europe ?',
  'La Volga',
  ARRAY['Le Danube', 'Le Rhin', 'La Loire'],
  'geographie',
  2,
  'fr',
  true,
  'La Volga fait 3 530 km et se jette dans la mer Caspienne. Elle traverse la Russie européenne.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays a la forme d''un hexagone ?',
  'La France',
  ARRAY['L''Espagne', 'L''Allemagne', 'La Pologne'],
  'geographie',
  2,
  'fr',
  true,
  'La France métropolitaine est souvent appelée « l''Hexagone » en raison de sa forme géométrique approximative.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale de l''Égypte ?',
  'Le Caire',
  ARRAY['Alexandrie', 'Louxor', 'Assouan'],
  'geographie',
  2,
  'fr',
  true,
  'Le Caire est la plus grande ville d''Afrique et du monde arabe avec plus de 20 millions d''habitants.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays insulaire est le plus peuplé du monde ?',
  'L''Indonésie',
  ARRAY['Le Japon', 'Les Philippines', 'Le Royaume-Uni'],
  'geographie',
  2,
  'fr',
  true,
  'L''Indonésie compte plus de 275 millions d''habitants répartis sur plus de 17 000 îles.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le point le plus bas sur terre (émergé) ?',
  'La mer Morte',
  ARRAY['La vallée de la Mort', 'Le lac Assal', 'La dépression de Turfan'],
  'geographie',
  2,
  'fr',
  true,
  'Les rives de la mer Morte sont à environ 430 mètres sous le niveau de la mer.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale de l''Argentine ?',
  'Buenos Aires',
  ARRAY['Santiago', 'Montevideo', 'Lima'],
  'geographie',
  2,
  'fr',
  true,
  'Buenos Aires signifie « bons airs » et compte environ 15 millions d''habitants dans son agglomération.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays possède le plus de fuseaux horaires ?',
  'La France',
  ARRAY['La Russie', 'Les États-Unis', 'Le Royaume-Uni'],
  'geographie',
  2,
  'fr',
  true,
  'Grâce à ses territoires d''outre-mer, la France couvre 12 fuseaux horaires, devant la Russie (11).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle montagne est la plus haute d''Afrique ?',
  'Le Kilimandjaro',
  ARRAY['Le mont Kenya', 'Le Ras Dashan', 'Le mont Cameroun'],
  'geographie',
  2,
  'fr',
  true,
  'Le Kilimandjaro culmine à 5 895 m en Tanzanie. C''est un volcan endormi.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel canal relie la mer Méditerranée à la mer Rouge ?',
  'Le canal de Suez',
  ARRAY['Le canal de Panama', 'Le canal de Corinthe', 'Le canal de Kiel'],
  'geographie',
  2,
  'fr',
  true,
  'Le canal de Suez fait 193 km et a été inauguré en 1869, évitant le contournement de l''Afrique.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus grand archipel du monde ?',
  'L''Indonésie',
  ARRAY['Les Philippines', 'Le Japon', 'Les Maldives'],
  'geographie',
  2,
  'fr',
  true,
  'L''Indonésie est composée de plus de 17 000 îles, dont seulement 6 000 sont habitées.'
);

-- =============================================
-- MEDIUM (difficulty 3) — 100 questions
-- =============================================

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale du Myanmar (Birmanie) ?',
  'Naypyidaw',
  ARRAY['Rangoun', 'Mandalay', 'Bago'],
  'geographie',
  3,
  'fr',
  true,
  'Naypyidaw a remplacé Rangoun comme capitale en 2006. C''est une ville entièrement construite pour être capitale.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays est surnommé « le pays aux mille lacs » ?',
  'La Finlande',
  ARRAY['La Suède', 'Le Canada', 'La Norvège'],
  'geographie',
  3,
  'fr',
  true,
  'La Finlande compte en réalité environ 188 000 lacs ! Le surnom est donc très modeste.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus long mur construit par l''homme ?',
  'La Grande Muraille de Chine',
  ARRAY['Le mur d''Hadrien', 'Le mur de Berlin', 'La ligne Maginot'],
  'geographie',
  3,
  'fr',
  true,
  'La Grande Muraille mesure environ 21 000 km au total avec toutes ses ramifications.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle ville est surnommée « la Perle de l''Orient » ?',
  'Hong Kong',
  ARRAY['Singapour', 'Shanghai', 'Dubaï'],
  'geographie',
  3,
  'fr',
  true,
  'Hong Kong est surnommée ainsi pour sa beauté naturelle et son port spectaculaire.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel fleuve traverse le plus grand nombre de capitales européennes ?',
  'Le Danube',
  ARRAY['Le Rhin', 'La Seine', 'La Volga'],
  'geographie',
  3,
  'fr',
  true,
  'Le Danube traverse 4 capitales : Vienne, Bratislava, Budapest et Belgrade.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays d''Amérique du Sud n''a pas de côte maritime ?',
  'La Bolivie',
  ARRAY['Le Paraguay', 'L''Uruguay', 'L''Équateur'],
  'geographie',
  3,
  'fr',
  true,
  'La Bolivie et le Paraguay sont les deux seuls pays enclavés d''Amérique du Sud.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus grand lac d''eau douce du monde par superficie ?',
  'Le lac Supérieur',
  ARRAY['Le lac Baïkal', 'Le lac Victoria', 'Le lac Huron'],
  'geographie',
  3,
  'fr',
  true,
  'Le lac Supérieur fait 82 100 km², soit plus grand que la République tchèque.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale du Maroc ?',
  'Rabat',
  ARRAY['Casablanca', 'Marrakech', 'Fès'],
  'geographie',
  3,
  'fr',
  true,
  'Rabat est la capitale administrative, tandis que Casablanca est la capitale économique du Maroc.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays a le plus de voisins frontaliers ?',
  'La Chine',
  ARRAY['La Russie', 'Le Brésil', 'L''Allemagne'],
  'geographie',
  3,
  'fr',
  true,
  'La Chine partage ses frontières avec 14 pays, à égalité avec la Russie.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel volcan a détruit Pompéi en 79 après J.-C. ?',
  'Le Vésuve',
  ARRAY['L''Etna', 'Le Stromboli', 'Le Piton de la Fournaise'],
  'geographie',
  3,
  'fr',
  true,
  'Le Vésuve, près de Naples, est toujours considéré comme l''un des volcans les plus dangereux au monde.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la ville la plus peuplée d''Afrique ?',
  'Lagos',
  ARRAY['Le Caire', 'Kinshasa', 'Johannesburg'],
  'geographie',
  3,
  'fr',
  true,
  'Lagos, au Nigeria, dépasse 15 millions d''habitants et continue de croître rapidement.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays produit le plus de café au monde ?',
  'Le Brésil',
  ARRAY['La Colombie', 'Le Vietnam', 'L''Éthiopie'],
  'geographie',
  3,
  'fr',
  true,
  'Le Brésil est le premier producteur mondial de café depuis plus de 150 ans.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus haut sommet des Alpes ?',
  'Le Mont Blanc',
  ARRAY['Le Cervin', 'La Jungfrau', 'Le Mont Rose'],
  'geographie',
  3,
  'fr',
  true,
  'Le Mont Blanc culmine à 4 808 m à la frontière franco-italienne.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays est le plus grand producteur de pétrole au monde ?',
  'Les États-Unis',
  ARRAY['L''Arabie saoudite', 'La Russie', 'L''Irak'],
  'geographie',
  3,
  'fr',
  true,
  'Les États-Unis sont devenus le premier producteur mondial grâce au pétrole de schiste.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la monnaie officielle du Japon ?',
  'Le yen',
  ARRAY['Le won', 'Le yuan', 'Le ringgit'],
  'geographie',
  3,
  'fr',
  true,
  'Le yen (¥) est la troisième monnaie la plus échangée au monde après le dollar et l''euro.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays est le seul à être traversé à la fois par l''équateur et un tropique ?',
  'Le Brésil',
  ARRAY['L''Indonésie', 'La Colombie', 'Le Kenya'],
  'geographie',
  3,
  'fr',
  true,
  'Le Brésil est traversé par l''équateur au nord et le tropique du Capricorne au sud.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la plus grande île de la Méditerranée ?',
  'La Sicile',
  ARRAY['La Sardaigne', 'Chypre', 'La Corse'],
  'geographie',
  3,
  'fr',
  true,
  'La Sicile fait 25 711 km², suivie de la Sardaigne (24 090 km²).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays d''Asie était autrefois appelé Ceylan ?',
  'Le Sri Lanka',
  ARRAY['Le Népal', 'Le Bangladesh', 'Le Cambodge'],
  'geographie',
  3,
  'fr',
  true,
  'Ceylan est devenu Sri Lanka en 1972 lors de son changement de constitution.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus profond lac du monde ?',
  'Le lac Baïkal',
  ARRAY['Le lac Tanganyika', 'Le lac Supérieur', 'La mer Caspienne'],
  'geographie',
  3,
  'fr',
  true,
  'Le lac Baïkal en Sibérie atteint 1 642 m de profondeur et contient 20% de l''eau douce mondiale.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale du Vietnam ?',
  'Hanoï',
  ARRAY['Hô Chi Minh-Ville', 'Da Nang', 'Hué'],
  'geographie',
  3,
  'fr',
  true,
  'Hanoï est la capitale du Vietnam depuis la réunification en 1976, bien que Hô Chi Minh-Ville soit plus grande.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays d''Europe a la plus grande superficie ?',
  'La France',
  ARRAY['L''Espagne', 'L''Allemagne', 'La Suède'],
  'geographie',
  3,
  'fr',
  true,
  'La France métropolitaine fait 551 695 km², en excluant la Russie qui est aussi en Asie.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel fleuve traverse Budapest ?',
  'Le Danube',
  ARRAY['La Vistule', 'L''Elbe', 'Le Rhin'],
  'geographie',
  3,
  'fr',
  true,
  'Le Danube sépare Budapest en deux : Buda sur la rive ouest et Pest sur la rive est.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays africain était autrefois appelé Abyssinie ?',
  'L''Éthiopie',
  ARRAY['Le Soudan', 'L''Érythrée', 'La Somalie'],
  'geographie',
  3,
  'fr',
  true,
  'L''Éthiopie est l''un des rares pays africains à n''avoir jamais été colonisé.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus grand pays d''Amérique du Sud ?',
  'Le Brésil',
  ARRAY['L''Argentine', 'Le Pérou', 'La Colombie'],
  'geographie',
  3,
  'fr',
  true,
  'Le Brésil fait 8,5 millions de km², soit presque la moitié de l''Amérique du Sud.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale de la Nouvelle-Zélande ?',
  'Wellington',
  ARRAY['Auckland', 'Christchurch', 'Queenstown'],
  'geographie',
  3,
  'fr',
  true,
  'Wellington est la capitale la plus australe du monde (si l''on exclut l''Antarctique).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel désert se trouve en Mongolie et en Chine ?',
  'Le désert de Gobi',
  ARRAY['Le désert du Taklamakan', 'Le désert du Thar', 'Le désert du Karakoum'],
  'geographie',
  3,
  'fr',
  true,
  'Le Gobi est un désert froid où les températures peuvent descendre à -40°C en hiver.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays possède la plus longue côte au monde ?',
  'Le Canada',
  ARRAY['L''Indonésie', 'La Norvège', 'L''Australie'],
  'geographie',
  3,
  'fr',
  true,
  'Le Canada possède 243 000 km de côtes grâce à ses innombrables îles arctiques.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la plus petite république d''Europe ?',
  'Saint-Marin',
  ARRAY['Le Liechtenstein', 'Andorre', 'Malte'],
  'geographie',
  3,
  'fr',
  true,
  'Saint-Marin fait seulement 61 km² et prétend être le plus ancien État souverain du monde (fondé en 301).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays d''Asie du Sud-Est est le seul à n''avoir jamais été colonisé ?',
  'La Thaïlande',
  ARRAY['Le Vietnam', 'Le Cambodge', 'Le Laos'],
  'geographie',
  3,
  'fr',
  true,
  'La Thaïlande (anciennement Siam) a servi de zone tampon entre les empires britannique et français.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus haut sommet d''Amérique du Nord ?',
  'Le Denali',
  ARRAY['Le mont Logan', 'Le mont Whitney', 'Le mont Rainier'],
  'geographie',
  3,
  'fr',
  true,
  'Le Denali (anciennement mont McKinley) en Alaska culmine à 6 190 m.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale du Pérou ?',
  'Lima',
  ARRAY['Cusco', 'Arequipa', 'Quito'],
  'geographie',
  3,
  'fr',
  true,
  'Lima est une ville désertique de 10 millions d''habitants située sur la côte Pacifique.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays est le plus grand producteur de diamants ?',
  'La Russie',
  ARRAY['Le Botswana', 'L''Afrique du Sud', 'Le Congo'],
  'geographie',
  3,
  'fr',
  true,
  'La Russie produit environ 30% des diamants bruts mondiaux, principalement en Yakoutie (Sibérie).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus long fleuve d''Amérique du Sud ?',
  'L''Amazone',
  ARRAY['Le Paraná', 'L''Orénoque', 'Le São Francisco'],
  'geographie',
  3,
  'fr',
  true,
  'L''Amazone fait environ 6 400 km et son débit est le plus important au monde.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle ville est bâtie sur 14 îles reliées par 57 ponts ?',
  'Stockholm',
  ARRAY['Venise', 'Amsterdam', 'Bruges'],
  'geographie',
  3,
  'fr',
  true,
  'Stockholm, la capitale suédoise, est surnommée la « Venise du Nord ».'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays abrite le plus grand récif corallien du monde ?',
  'L''Australie',
  ARRAY['L''Indonésie', 'Les Philippines', 'Les Maldives'],
  'geographie',
  3,
  'fr',
  true,
  'La Grande Barrière de corail fait 2 300 km et est visible depuis l''espace.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale de la Colombie ?',
  'Bogotá',
  ARRAY['Medellín', 'Cali', 'Cartagena'],
  'geographie',
  3,
  'fr',
  true,
  'Bogotá est située à 2 640 m d''altitude, ce qui en fait l''une des capitales les plus hautes du monde.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays européen a la plus grande population ?',
  'L''Allemagne',
  ARRAY['La France', 'Le Royaume-Uni', 'L''Italie'],
  'geographie',
  3,
  'fr',
  true,
  'L''Allemagne compte environ 84 millions d''habitants, loin devant la France (68 millions).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le point culminant de l''Océanie ?',
  'Le Puncak Jaya',
  ARRAY['Le mont Cook', 'Le mont Kosciuszko', 'Le Mauna Kea'],
  'geographie',
  3,
  'fr',
  true,
  'Le Puncak Jaya (4 884 m) se trouve en Papouasie indonésienne (Nouvelle-Guinée).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus grand pays d''Amérique centrale ?',
  'Le Nicaragua',
  ARRAY['Le Honduras', 'Le Guatemala', 'Le Panama'],
  'geographie',
  3,
  'fr',
  true,
  'Le Nicaragua fait 130 370 km², suivi du Honduras (112 492 km²).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale du Pakistan ?',
  'Islamabad',
  ARRAY['Karachi', 'Lahore', 'Rawalpindi'],
  'geographie',
  3,
  'fr',
  true,
  'Islamabad est une capitale planifiée inaugurée en 1967, Karachi étant l''ancienne capitale.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays est le plus grand exportateur de bananes ?',
  'L''Équateur',
  ARRAY['La Colombie', 'Le Costa Rica', 'Les Philippines'],
  'geographie',
  3,
  'fr',
  true,
  'L''Équateur exporte environ 6 millions de tonnes de bananes par an, soit un quart du marché mondial.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle chaîne de montagnes traverse l''Amérique du Sud du nord au sud ?',
  'La Cordillère des Andes',
  ARRAY['Les Rocheuses', 'L''Himalaya', 'L''Atlas'],
  'geographie',
  3,
  'fr',
  true,
  'Les Andes font 7 000 km de long, c''est la plus longue chaîne de montagnes continentale du monde.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays abrite les chutes Victoria ?',
  'Le Zimbabwe',
  ARRAY['L''Afrique du Sud', 'Le Kenya', 'La Tanzanie'],
  'geographie',
  3,
  'fr',
  true,
  'Les chutes Victoria sont à la frontière Zimbabwe-Zambie et font 1,7 km de large.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays européen possède le plus d''îles ?',
  'La Suède',
  ARRAY['La Norvège', 'La Grèce', 'La Finlande'],
  'geographie',
  3,
  'fr',
  true,
  'La Suède compte environ 267 570 îles, dont seulement un millier sont habitées.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale de l''Éthiopie ?',
  'Addis-Abeba',
  ARRAY['Nairobi', 'Khartoum', 'Mogadiscio'],
  'geographie',
  3,
  'fr',
  true,
  'Addis-Abeba signifie « nouvelle fleur » en amharique et abrite le siège de l''Union africaine.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus petit pays d''Asie ?',
  'Les Maldives',
  ARRAY['Singapour', 'Le Bahreïn', 'Brunei'],
  'geographie',
  3,
  'fr',
  true,
  'Les Maldives font 298 km² répartis sur 1 192 îles coralliennes, dont 80% sont à moins d''1 m au-dessus de la mer.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le fleuve qui traverse Rome ?',
  'Le Tibre',
  ARRAY['Le Pô', 'L''Arno', 'L''Adige'],
  'geographie',
  3,
  'fr',
  true,
  'Le Tibre fait 405 km et la légende dit que Romulus et Rémus y furent abandonnés.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la plus haute cascade du monde ?',
  'Le Salto Ángel',
  ARRAY['Les chutes du Niagara', 'Les chutes Victoria', 'Les chutes d''Iguazú'],
  'geographie',
  3,
  'fr',
  true,
  'Le Salto Ángel (Kerepakupai Vená) au Venezuela fait 979 m de chute, soit 15 fois les chutes du Niagara.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays a pour capitale Reykjavik ?',
  'L''Islande',
  ARRAY['La Norvège', 'Le Danemark', 'La Finlande'],
  'geographie',
  3,
  'fr',
  true,
  'Reykjavik est la capitale la plus septentrionale du monde (hors micro-États).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la langue officielle du Brésil ?',
  'Le portugais',
  ARRAY['L''espagnol', 'Le brésilien', 'L''anglais'],
  'geographie',
  3,
  'fr',
  true,
  'Le Brésil est le seul pays lusophone d''Amérique, héritage de la colonisation portugaise.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays abrite le Machu Picchu ?',
  'Le Pérou',
  ARRAY['La Bolivie', 'L''Équateur', 'La Colombie'],
  'geographie',
  3,
  'fr',
  true,
  'Le Machu Picchu est une cité inca perchée à 2 430 m d''altitude, redécouverte en 1911.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle mer intérieure est partagée entre l''Europe et l''Asie ?',
  'La mer Noire',
  ARRAY['La mer Caspienne', 'La mer d''Aral', 'La mer Morte'],
  'geographie',
  3,
  'fr',
  true,
  'La mer Noire est bordée par 6 pays : Turquie, Bulgarie, Roumanie, Ukraine, Russie et Géorgie.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays d''Afrique est le plus peuplé ?',
  'Le Nigeria',
  ARRAY['L''Éthiopie', 'L''Égypte', 'Le Congo'],
  'geographie',
  3,
  'fr',
  true,
  'Le Nigeria compte plus de 220 millions d''habitants et devrait devenir le 3e pays le plus peuplé vers 2050.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le nom du détroit entre la France et l''Angleterre ?',
  'Le Pas-de-Calais',
  ARRAY['La Manche', 'Le détroit de Dover', 'Le canal Saint-Georges'],
  'geographie',
  3,
  'fr',
  true,
  'Le Pas-de-Calais fait 33,3 km de large. La Manche est la mer elle-même, pas le détroit.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale de la Corée du Sud ?',
  'Séoul',
  ARRAY['Busan', 'Incheon', 'Daegu'],
  'geographie',
  3,
  'fr',
  true,
  'Séoul et son agglomération rassemblent près de la moitié de la population sud-coréenne.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays possède la forêt amazonienne la plus grande ?',
  'Le Brésil',
  ARRAY['Le Pérou', 'La Colombie', 'Le Venezuela'],
  'geographie',
  3,
  'fr',
  true,
  'Le Brésil possède environ 60% de la forêt amazonienne, qui couvre 5,5 millions de km² au total.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle ville est située sur deux continents ?',
  'Istanbul',
  ARRAY['Le Caire', 'Moscou', 'Athènes'],
  'geographie',
  3,
  'fr',
  true,
  'Istanbul est à cheval sur l''Europe et l''Asie, séparées par le détroit du Bosphore.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus grand pays du Moyen-Orient ?',
  'L''Arabie saoudite',
  ARRAY['L''Iran', 'L''Irak', 'La Turquie'],
  'geographie',
  3,
  'fr',
  true,
  'L''Arabie saoudite couvre 2,15 millions de km², soit environ 4 fois la France.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays a le PIB le plus élevé en Afrique ?',
  'Le Nigeria',
  ARRAY['L''Afrique du Sud', 'L''Égypte', 'Le Kenya'],
  'geographie',
  3,
  'fr',
  true,
  'Le Nigeria est la première économie d''Afrique grâce notamment à ses ressources pétrolières.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle île française est située dans l''océan Indien ?',
  'La Réunion',
  ARRAY['La Guadeloupe', 'La Martinique', 'La Nouvelle-Calédonie'],
  'geographie',
  3,
  'fr',
  true,
  'La Réunion est un département français d''outre-mer situé à 700 km à l''est de Madagascar.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays abrite le désert d''Atacama, le plus aride du monde ?',
  'Le Chili',
  ARRAY['Le Pérou', 'L''Argentine', 'La Bolivie'],
  'geographie',
  3,
  'fr',
  true,
  'Certaines zones du désert d''Atacama n''ont pas reçu de pluie depuis plus de 500 ans.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale du Nigeria ?',
  'Abuja',
  ARRAY['Lagos', 'Port Harcourt', 'Ibadan'],
  'geographie',
  3,
  'fr',
  true,
  'Abuja a remplacé Lagos comme capitale en 1991 pour des raisons de centralité géographique.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le seul pays au monde qui porte le nom d''un élément chimique ?',
  'L''Argentine',
  ARRAY['Le Chili', 'Le Brésil', 'Le Pérou'],
  'geographie',
  3,
  'fr',
  true,
  'Argentina vient de « argentum » (argent en latin), car les explorateurs espagnols y cherchaient de l''argent.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la plus grande péninsule du monde ?',
  'La péninsule arabique',
  ARRAY['La péninsule indienne', 'La Scandinavie', 'La péninsule ibérique'],
  'geographie',
  3,
  'fr',
  true,
  'La péninsule arabique fait environ 3 millions de km² et comprend 7 pays.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale de Cuba ?',
  'La Havane',
  ARRAY['Santiago', 'Trinidad', 'Varadero'],
  'geographie',
  3,
  'fr',
  true,
  'La Havane est célèbre pour ses voitures américaines des années 1950 qui circulent encore.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays scandinave n''est pas membre de l''UE ?',
  'La Norvège',
  ARRAY['La Suède', 'Le Danemark', 'La Finlande'],
  'geographie',
  3,
  'fr',
  true,
  'La Norvège a rejeté l''adhésion à l''UE par référendum en 1972 et en 1994.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le volcan le plus actif d''Europe ?',
  'L''Etna',
  ARRAY['Le Vésuve', 'Le Stromboli', 'L''Eyjafjallajökull'],
  'geographie',
  3,
  'fr',
  true,
  'L''Etna en Sicile est en activité quasi permanente et culmine à environ 3 357 m.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays abrite le fjord le plus long d''Europe ?',
  'La Norvège',
  ARRAY['L''Islande', 'Le Danemark', 'La Suède'],
  'geographie',
  3,
  'fr',
  true,
  'Le Sognefjord fait 204 km de long et jusqu''à 1 308 m de profondeur.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le deuxième plus grand pays du monde ?',
  'Le Canada',
  ARRAY['La Chine', 'Les États-Unis', 'Le Brésil'],
  'geographie',
  3,
  'fr',
  true,
  'Le Canada fait 9,98 millions de km² mais n''a que 40 millions d''habitants.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle ville est connue comme « la Cité interdite » ?',
  'Pékin',
  ARRAY['Tokyo', 'Shanghai', 'Séoul'],
  'geographie',
  3,
  'fr',
  true,
  'La Cité interdite à Pékin fut le palais impérial chinois pendant 500 ans (1420-1912).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus petit pays d''Amérique du Sud ?',
  'Le Suriname',
  ARRAY['L''Uruguay', 'La Guyane', 'L''Équateur'],
  'geographie',
  3,
  'fr',
  true,
  'Le Suriname fait 163 821 km² et est le seul pays d''Amérique du Sud où le néerlandais est langue officielle.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays possède le plus de sites classés au patrimoine mondial de l''UNESCO ?',
  'L''Italie',
  ARRAY['La Chine', 'La France', 'L''Espagne'],
  'geographie',
  3,
  'fr',
  true,
  'L''Italie détient le record avec 59 sites UNESCO, suivie de la Chine (57).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel fleuve traverse Le Caire ?',
  'Le Nil',
  ARRAY['L''Euphrate', 'Le Tigre', 'Le Jourdain'],
  'geographie',
  3,
  'fr',
  true,
  'Le Nil traverse Le Caire et se jette dans la Méditerranée par son célèbre delta.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la plus grande ville du Maghreb ?',
  'Casablanca',
  ARRAY['Alger', 'Tunis', 'Marrakech'],
  'geographie',
  3,
  'fr',
  true,
  'Casablanca compte environ 4 millions d''habitants et est le poumon économique du Maroc.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le pays le plus visité au monde ?',
  'La France',
  ARRAY['L''Espagne', 'Les États-Unis', 'L''Italie'],
  'geographie',
  3,
  'fr',
  true,
  'La France accueille environ 90 millions de touristes par an, devant l''Espagne.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale de l''Irak ?',
  'Bagdad',
  ARRAY['Bassora', 'Mossoul', 'Erbil'],
  'geographie',
  3,
  'fr',
  true,
  'Bagdad fut la capitale du califat abbasside et un des plus grands centres intellectuels du monde médiéval.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus petit État d''Afrique continentale ?',
  'La Gambie',
  ARRAY['Le Swaziland', 'Le Lesotho', 'Djibouti'],
  'geographie',
  3,
  'fr',
  true,
  'La Gambie fait 11 295 km² et est entièrement enclavée dans le Sénégal, sauf sa façade maritime.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays est le plus grand producteur de riz au monde ?',
  'La Chine',
  ARRAY['L''Inde', 'Le Bangladesh', 'La Thaïlande'],
  'geographie',
  3,
  'fr',
  true,
  'La Chine produit environ 210 millions de tonnes de riz par an, suivie de l''Inde.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale de l''Iran ?',
  'Téhéran',
  ARRAY['Ispahan', 'Chiraz', 'Tabriz'],
  'geographie',
  3,
  'fr',
  true,
  'Téhéran est une mégapole de 9 millions d''habitants située au pied de la chaîne de l''Alborz.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays a pour drapeau une feuille d''érable rouge ?',
  'Le Canada',
  ARRAY['Les États-Unis', 'La Norvège', 'Le Japon'],
  'geographie',
  3,
  'fr',
  true,
  'Le drapeau actuel du Canada avec la feuille d''érable a été adopté en 1965.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays européen est une monarchie constitutionnelle et un grand-duché ?',
  'Le Luxembourg',
  ARRAY['La Belgique', 'Les Pays-Bas', 'Le Liechtenstein'],
  'geographie',
  3,
  'fr',
  true,
  'Le Luxembourg est le seul grand-duché au monde, dirigé par un Grand-Duc.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays possède la ville de Tombouctou ?',
  'Le Mali',
  ARRAY['Le Niger', 'Le Burkina Faso', 'La Mauritanie'],
  'geographie',
  3,
  'fr',
  true,
  'Tombouctou fut un grand centre intellectuel et commercial au Moyen Âge, classé UNESCO.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la monnaie utilisée au Royaume-Uni ?',
  'La livre sterling',
  ARRAY['L''euro', 'Le dollar', 'Le franc'],
  'geographie',
  3,
  'fr',
  true,
  'La livre sterling (GBP) est la plus ancienne monnaie encore en usage, depuis le VIIIe siècle.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel archipel volcanique se trouve au large du Sénégal ?',
  'Le Cap-Vert',
  ARRAY['Les Canaries', 'Madère', 'Les Açores'],
  'geographie',
  3,
  'fr',
  true,
  'Le Cap-Vert est un archipel de 10 îles situé à 570 km au large de Dakar.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus grand pays sans littoral (enclavé) du monde ?',
  'Le Kazakhstan',
  ARRAY['La Mongolie', 'Le Tchad', 'L''Éthiopie'],
  'geographie',
  3,
  'fr',
  true,
  'Le Kazakhstan fait 2,7 millions de km² et n''a aucun accès direct à l''océan mondial.'
);

-- =============================================
-- HARD (difficulty 4) — 25 questions
-- =============================================

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale du Bhoutan ?',
  'Thimphou',
  ARRAY['Katmandou', 'Dacca', 'Vientiane'],
  'geographie',
  4,
  'fr',
  true,
  'Thimphou est l''une des rares capitales au monde sans feux de signalisation.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus long fleuve d''Asie ?',
  'Le Yangtsé',
  ARRAY['Le Mékong', 'Le Gange', 'L''Indus'],
  'geographie',
  4,
  'fr',
  true,
  'Le Yangtsé (Chang Jiang) fait 6 300 km et est le 3e plus long fleuve du monde.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays a pour capitale Oulan-Bator ?',
  'La Mongolie',
  ARRAY['Le Kazakhstan', 'Le Kirghizistan', 'Le Turkménistan'],
  'geographie',
  4,
  'fr',
  true,
  'Oulan-Bator est la capitale la plus froide du monde avec une température annuelle moyenne de -1°C.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le point le plus profond des océans ?',
  'La fosse des Mariannes',
  ARRAY['La fosse de Porto Rico', 'La fosse des Tonga', 'La fosse du Japon'],
  'geographie',
  4,
  'fr',
  true,
  'La fosse des Mariannes atteint 10 994 m au Challenger Deep, dans le Pacifique.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays d''Asie centrale a pour capitale Achgabat ?',
  'Le Turkménistan',
  ARRAY['L''Ouzbékistan', 'Le Tadjikistan', 'Le Kirghizistan'],
  'geographie',
  4,
  'fr',
  true,
  'Achgabat détient le record Guinness de la plus grande concentration de bâtiments en marbre blanc.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays possède la plus grande réserve de lithium au monde ?',
  'La Bolivie',
  ARRAY['L''Australie', 'Le Chili', 'L''Argentine'],
  'geographie',
  4,
  'fr',
  true,
  'Le salar d''Uyuni en Bolivie contient environ 21 millions de tonnes de lithium.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale de la Papouasie-Nouvelle-Guinée ?',
  'Port Moresby',
  ARRAY['Suva', 'Honiara', 'Apia'],
  'geographie',
  4,
  'fr',
  true,
  'La Papouasie-Nouvelle-Guinée est le pays avec le plus de langues au monde (plus de 800).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel lac constitue la plus grande réserve d''eau douce d''Afrique ?',
  'Le lac Tanganyika',
  ARRAY['Le lac Victoria', 'Le lac Malawi', 'Le lac Tchad'],
  'geographie',
  4,
  'fr',
  true,
  'Le lac Tanganyika est le 2e plus profond au monde (1 470 m) et contient 18% de l''eau douce mondiale de surface.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la seule mer au monde sans côte ?',
  'La mer des Sargasses',
  ARRAY['La mer Morte', 'La mer Caspienne', 'La mer d''Aral'],
  'geographie',
  4,
  'fr',
  true,
  'La mer des Sargasses, dans l''Atlantique Nord, est délimitée par des courants océaniques et non par des terres.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays d''Afrique possède le lac Volta, l''un des plus grands lacs artificiels du monde ?',
  'Le Ghana',
  ARRAY['Le Nigeria', 'Le Cameroun', 'La Côte d''Ivoire'],
  'geographie',
  4,
  'fr',
  true,
  'Le lac Volta fait 8 502 km² et a été créé en 1965 par le barrage d''Akosombo.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale du Laos ?',
  'Vientiane',
  ARRAY['Luang Prabang', 'Savannakhet', 'Phnom Penh'],
  'geographie',
  4,
  'fr',
  true,
  'Vientiane est la seule capitale d''Asie du Sud-Est située sur le Mékong.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus haut volcan actif d''Europe ?',
  'L''Etna',
  ARRAY['Le Vésuve', 'Le Stromboli', 'Le Teide'],
  'geographie',
  4,
  'fr',
  true,
  'L''Etna culmine à environ 3 357 m mais sa hauteur varie constamment selon les éruptions.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus grand delta du monde ?',
  'Le delta du Gange-Brahmapoutre',
  ARRAY['Le delta du Mékong', 'Le delta du Nil', 'Le delta du Mississippi'],
  'geographie',
  4,
  'fr',
  true,
  'Le delta du Gange-Brahmapoutre couvre 105 000 km² au Bangladesh et en Inde.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays a pour capitale Bichkek ?',
  'Le Kirghizistan',
  ARRAY['Le Kazakhstan', 'Le Tadjikistan', 'L''Ouzbékistan'],
  'geographie',
  4,
  'fr',
  true,
  'Bichkek s''appelait Frounzé à l''époque soviétique, du nom d''un général bolchevique.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays africain a pour monnaie le birr ?',
  'L''Éthiopie',
  ARRAY['Le Kenya', 'La Tanzanie', 'Le Soudan'],
  'geographie',
  4,
  'fr',
  true,
  'Le birr éthiopien tire son nom du mot amharique signifiant « argent ».'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle île volcanique de l''Atlantique est le territoire habité le plus isolé au monde ?',
  'Tristan da Cunha',
  ARRAY['Sainte-Hélène', 'L''île de l''Ascension', 'L''île de Pâques'],
  'geographie',
  4,
  'fr',
  true,
  'Tristan da Cunha est à 2 810 km de la côte la plus proche (Afrique du Sud) et compte environ 250 habitants.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel détroit sépare l''Asie de l''Amérique du Nord ?',
  'Le détroit de Béring',
  ARRAY['Le détroit de Malacca', 'Le détroit de Formose', 'Le détroit de Torres'],
  'geographie',
  4,
  'fr',
  true,
  'Le détroit de Béring ne fait que 82 km de large entre la Russie et l''Alaska.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays est le plus grand producteur mondial d''or ?',
  'La Chine',
  ARRAY['L''Australie', 'La Russie', 'L''Afrique du Sud'],
  'geographie',
  4,
  'fr',
  true,
  'La Chine est le premier producteur d''or depuis 2007 avec environ 370 tonnes par an.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale de l''Érythrée ?',
  'Asmara',
  ARRAY['Addis-Abeba', 'Djibouti', 'Mogadiscio'],
  'geographie',
  4,
  'fr',
  true,
  'Asmara est surnommée « la petite Rome » pour son architecture coloniale italienne Art déco.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus haut plateau du monde ?',
  'Le plateau du Tibet',
  ARRAY['L''Altiplano', 'Le plateau éthiopien', 'Le plateau du Deccan'],
  'geographie',
  4,
  'fr',
  true,
  'Le plateau du Tibet a une altitude moyenne de 4 500 m et est surnommé « le toit du monde ».'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays abrite les ruines de Persépolis ?',
  'L''Iran',
  ARRAY['L''Irak', 'La Turquie', 'L''Égypte'],
  'geographie',
  4,
  'fr',
  true,
  'Persépolis était la capitale de l''Empire perse achéménide, fondée vers 518 av. J.-C. par Darius Ier.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le fleuve le plus long d''Afrique de l''Ouest ?',
  'Le Niger',
  ARRAY['Le Sénégal', 'La Volta', 'Le Gambie'],
  'geographie',
  4,
  'fr',
  true,
  'Le Niger fait 4 184 km et traverse la Guinée, le Mali, le Niger et le Nigeria.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale du Suriname ?',
  'Paramaribo',
  ARRAY['Georgetown', 'Cayenne', 'Bogotá'],
  'geographie',
  4,
  'fr',
  true,
  'Paramaribo a un centre-ville colonial néerlandais classé au patrimoine mondial de l''UNESCO.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays a le taux d''alphabétisation le plus élevé au monde ?',
  'L''Andorre',
  ARRAY['La Finlande', 'Le Japon', 'La Norvège'],
  'geographie',
  4,
  'fr',
  true,
  'L''Andorre atteint 100% d''alphabétisation grâce à son système éducatif gratuit et obligatoire.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle mer est en fait le plus grand lac du monde ?',
  'La mer Caspienne',
  ARRAY['La mer Morte', 'La mer d''Aral', 'Le lac Baïkal'],
  'geographie',
  4,
  'fr',
  true,
  'La mer Caspienne fait 371 000 km² et est bordée par 5 pays : Russie, Kazakhstan, Turkménistan, Iran et Azerbaïdjan.'
);

-- =============================================
-- HARD (difficulty 5) — 15 questions
-- =============================================

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays possède l''enclave de Cabinda, séparée du reste de son territoire par le Congo ?',
  'L''Angola',
  ARRAY['Le Congo-Brazzaville', 'Le Gabon', 'Le Cameroun'],
  'geographie',
  5,
  'fr',
  true,
  'Cabinda est une province angolaise riche en pétrole, enclavée entre le Congo-Brazzaville et la RDC.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le seul pays dont le drapeau n''est pas rectangulaire ?',
  'Le Népal',
  ARRAY['La Suisse', 'Le Vatican', 'Le Bhoutan'],
  'geographie',
  5,
  'fr',
  true,
  'Le drapeau du Népal est composé de deux triangles superposés, symbolisant l''Himalaya.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le nom de la faille tectonique qui traverse l''Afrique de l''Est ?',
  'Le Rift est-africain',
  ARRAY['La faille de San Andreas', 'La fosse du Mariana', 'La dorsale médio-atlantique'],
  'geographie',
  5,
  'fr',
  true,
  'Le Rift est-africain fait 6 000 km et pourrait un jour séparer la Corne de l''Afrique du continent.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale du Vanuatu ?',
  'Port-Vila',
  ARRAY['Suva', 'Nouméa', 'Honiara'],
  'geographie',
  5,
  'fr',
  true,
  'Le Vanuatu est un archipel mélanésien de 83 îles dans le Pacifique Sud.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le pays le plus densément peuplé du monde (hors micro-États) ?',
  'Le Bangladesh',
  ARRAY['L''Inde', 'Le Japon', 'Les Philippines'],
  'geographie',
  5,
  'fr',
  true,
  'Le Bangladesh a une densité de plus de 1 200 hab/km² sur un territoire grand comme un quart de la France.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays d''Océanie a pour capitale Nuku''alofa ?',
  'Les Tonga',
  ARRAY['Les Samoa', 'Les Fidji', 'Tuvalu'],
  'geographie',
  5,
  'fr',
  true,
  'Les Tonga sont le dernier royaume polynésien et l''un des premiers pays au monde à voir le lever du soleil.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays possède le plus grand nombre de pyramides au monde ?',
  'Le Soudan',
  ARRAY['L''Égypte', 'Le Mexique', 'Le Guatemala'],
  'geographie',
  5,
  'fr',
  true,
  'Le Soudan compte environ 255 pyramides nubiennes, contre 138 en Égypte.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus long système de grottes au monde ?',
  'Mammoth Cave',
  ARRAY['La grotte de Postojna', 'Les grottes de Carlsbad', 'Le gouffre de Krubera'],
  'geographie',
  5,
  'fr',
  true,
  'Mammoth Cave dans le Kentucky fait plus de 680 km de galeries explorées.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays abrite le lac Titicaca, le plus haut lac navigable du monde ?',
  'Le Pérou',
  ARRAY['La Bolivie', 'L''Équateur', 'La Colombie'],
  'geographie',
  5,
  'fr',
  true,
  'Le lac Titicaca est à 3 812 m d''altitude à la frontière Pérou-Bolivie. Les deux pays le partagent.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale de Djibouti ?',
  'Djibouti',
  ARRAY['Asmara', 'Mogadiscio', 'Hargeisa'],
  'geographie',
  5,
  'fr',
  true,
  'Djibouti la ville est aussi le nom du pays. C''est un point stratégique à l''entrée de la mer Rouge.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays est le seul au monde à avoir un océan qui porte le même nom que lui ?',
  'L''Inde',
  ARRAY['L''Australie', 'L''Atlantique', 'Le Pacifique'],
  'geographie',
  5,
  'fr',
  true,
  'L''océan Indien doit son nom à l''Inde qui domine sa rive nord.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le pays avec la plus faible densité de population au monde ?',
  'La Mongolie',
  ARRAY['La Namibie', 'L''Australie', 'L''Islande'],
  'geographie',
  5,
  'fr',
  true,
  'La Mongolie n''a que 2 habitants par km² en moyenne, sur un territoire 3 fois grand comme la France.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus ancien parc national du monde ?',
  'Yellowstone',
  ARRAY['Le Serengeti', 'Le Grand Canyon', 'Les Galápagos'],
  'geographie',
  5,
  'fr',
  true,
  'Yellowstone a été créé en 1872 aux États-Unis, posant les bases de la conservation mondiale.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays du Pacifique a le plus haut risque de disparaître sous les eaux à cause du changement climatique ?',
  'Tuvalu',
  ARRAY['Les Maldives', 'Kiribati', 'Les îles Marshall'],
  'geographie',
  5,
  'fr',
  true,
  'Tuvalu a un point culminant de seulement 4,6 m et sa population de 11 000 habitants est très menacée.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus grand glacier d''Europe hors calotte polaire ?',
  'Le Vatnajökull',
  ARRAY['Le glacier d''Aletsch', 'Le Jostedalsbreen', 'Le Mer de Glace'],
  'geographie',
  5,
  'fr',
  true,
  'Le Vatnajökull en Islande fait 7 900 km² et peut atteindre 1 000 m d''épaisseur.'
);

-- =============================================
-- QUESTIONS SUPPLEMENTAIRES (40 pour atteindre 200)
-- =============================================

-- Difficulty 1 - Supplementaires (8)

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale de la Chine ?',
  'Pékin',
  ARRAY['Shanghai', 'Hong Kong', 'Canton'],
  'geographie',
  1,
  'fr',
  true,
  'Pékin (Beijing) signifie « capitale du Nord » en mandarin.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays est célèbre pour ses tulipes et ses moulins à vent ?',
  'Les Pays-Bas',
  ARRAY['La Belgique', 'Le Danemark', 'L''Allemagne'],
  'geographie',
  1,
  'fr',
  true,
  'Les Pays-Bas cultivent des milliards de tulipes chaque année et sont le premier exportateur mondial de fleurs.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus grand continent du monde ?',
  'L''Asie',
  ARRAY['L''Afrique', 'L''Amérique du Nord', 'L''Europe'],
  'geographie',
  1,
  'fr',
  true,
  'L''Asie couvre 44,6 millions de km², soit environ 30% de la surface terrestre.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale de la Russie ?',
  'Moscou',
  ARRAY['Saint-Pétersbourg', 'Kiev', 'Minsk'],
  'geographie',
  1,
  'fr',
  true,
  'Moscou est la ville la plus peuplée d''Europe avec plus de 12 millions d''habitants.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus petit océan du monde ?',
  'L''océan Arctique',
  ARRAY['L''océan Indien', 'L''océan Atlantique', 'L''océan Antarctique'],
  'geographie',
  1,
  'fr',
  true,
  'L''océan Arctique fait 14 millions de km² et est en grande partie recouvert de glace.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays a pour capitale Lisbonne ?',
  'Le Portugal',
  ARRAY['L''Espagne', 'L''Italie', 'La Grèce'],
  'geographie',
  1,
  'fr',
  true,
  'Lisbonne est la capitale la plus occidentale d''Europe continentale.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le fleuve qui traverse l''Égypte ?',
  'Le Nil',
  ARRAY['Le Tigre', 'L''Euphrate', 'Le Congo'],
  'geographie',
  1,
  'fr',
  true,
  'Le Nil est le fleuve le plus long du monde et a permis le développement de la civilisation égyptienne.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Sur quel continent se trouve l''Inde ?',
  'L''Asie',
  ARRAY['L''Afrique', 'L''Europe', 'L''Océanie'],
  'geographie',
  1,
  'fr',
  true,
  'L''Inde occupe la majeure partie du sous-continent indien, en Asie du Sud.'
);

-- Difficulty 2 - Supplementaires (7)

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays européen a la capitale la plus haute en altitude ?',
  'L''Espagne',
  ARRAY['La Suisse', 'L''Autriche', 'L''Andorre'],
  'geographie',
  2,
  'fr',
  true,
  'Madrid est à 667 m d''altitude, ce qui en fait la capitale la plus haute de l''UE.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus grand pays d''Asie du Sud-Est ?',
  'L''Indonésie',
  ARRAY['La Thaïlande', 'Le Myanmar', 'Les Philippines'],
  'geographie',
  2,
  'fr',
  true,
  'L''Indonésie fait 1,9 million de km², s''étalant sur 5 000 km d''est en ouest.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la plus grande ville de Suisse ?',
  'Zurich',
  ARRAY['Genève', 'Berne', 'Bâle'],
  'geographie',
  2,
  'fr',
  true,
  'Zurich est la plus grande ville de Suisse (420 000 habitants), bien que Berne soit la capitale.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays a la plus grande forêt tropicale du monde ?',
  'Le Brésil',
  ARRAY['Le Congo', 'L''Indonésie', 'La Colombie'],
  'geographie',
  2,
  'fr',
  true,
  'L''Amazonie brésilienne couvre environ 3,3 millions de km² de forêt tropicale.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale de la Grèce ?',
  'Athènes',
  ARRAY['Thessalonique', 'Le Pirée', 'Héraklion'],
  'geographie',
  2,
  'fr',
  true,
  'Athènes est l''une des plus anciennes villes du monde, habitée depuis plus de 3 000 ans.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle chaîne de montagnes traverse le nord du Maroc ?',
  'Le Rif',
  ARRAY['L''Atlas', 'Le Hoggar', 'Le Tibesti'],
  'geographie',
  2,
  'fr',
  true,
  'Le Rif est une chaîne montagneuse côtière au nord du Maroc, face à la Méditerranée.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le pays le plus peuplé d''Europe ?',
  'La Russie',
  ARRAY['L''Allemagne', 'La France', 'Le Royaume-Uni'],
  'geographie',
  2,
  'fr',
  true,
  'La partie européenne de la Russie compte environ 110 millions d''habitants.'
);

-- Difficulty 3 - Supplementaires (10)

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le seul pays d''Amérique centrale bordé par l''Atlantique et le Pacifique ?',
  'Le Panama',
  ARRAY['Le Costa Rica', 'Le Honduras', 'Le Guatemala'],
  'geographie',
  3,
  'fr',
  true,
  'En fait, plusieurs pays d''Amérique centrale ont deux côtes, mais le Panama est célèbre pour son canal qui les relie.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus haut sommet d''Amérique du Sud ?',
  'L''Aconcagua',
  ARRAY['Le Chimborazo', 'Le Cotopaxi', 'L''Ojos del Salado'],
  'geographie',
  3,
  'fr',
  true,
  'L''Aconcagua en Argentine culmine à 6 961 m, c''est le plus haut sommet hors Asie.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays abrite le plus grand nombre de lacs dans le monde ?',
  'Le Canada',
  ARRAY['La Finlande', 'La Suède', 'La Russie'],
  'geographie',
  3,
  'fr',
  true,
  'Le Canada possède environ 60% de tous les lacs du monde, soit plus de 2 millions de lacs.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale de la Tanzanie ?',
  'Dodoma',
  ARRAY['Dar es Salaam', 'Arusha', 'Zanzibar'],
  'geographie',
  3,
  'fr',
  true,
  'Dodoma est la capitale officielle depuis 1996, mais Dar es Salaam reste le centre économique.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le pays le plus montagneux d''Europe ?',
  'La Suisse',
  ARRAY['L''Autriche', 'La Norvège', 'L''Italie'],
  'geographie',
  3,
  'fr',
  true,
  'Environ 60% du territoire suisse est couvert par les Alpes.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays africain a deux capitales (législative et exécutive) ?',
  'L''Afrique du Sud',
  ARRAY['Le Nigeria', 'Le Kenya', 'La Tanzanie'],
  'geographie',
  3,
  'fr',
  true,
  'L''Afrique du Sud a 3 capitales : Pretoria (exécutive), Le Cap (législative) et Bloemfontein (judiciaire).'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays du Golfe persique est le plus petit ?',
  'Le Bahreïn',
  ARRAY['Le Qatar', 'Le Koweït', 'Les Émirats arabes unis'],
  'geographie',
  3,
  'fr',
  true,
  'Le Bahreïn est un archipel de 780 km² relié à l''Arabie saoudite par un pont de 25 km.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel fleuve sépare les États-Unis du Mexique ?',
  'Le Rio Grande',
  ARRAY['Le Colorado', 'Le Mississippi', 'Le Missouri'],
  'geographie',
  3,
  'fr',
  true,
  'Le Rio Grande (appelé Río Bravo au Mexique) fait 3 051 km et forme une frontière naturelle.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays produit le plus de chocolat au monde ?',
  'La Côte d''Ivoire',
  ARRAY['Le Ghana', 'La Belgique', 'La Suisse'],
  'geographie',
  3,
  'fr',
  true,
  'La Côte d''Ivoire produit environ 40% du cacao mondial, bien que la Belgique soit célèbre pour la transformation.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays est surnommé « l''île-continent » ?',
  'L''Australie',
  ARRAY['Madagascar', 'Le Groenland', 'La Nouvelle-Zélande'],
  'geographie',
  3,
  'fr',
  true,
  'L''Australie est à la fois le plus petit continent et le sixième plus grand pays du monde.'
);

-- Difficulty 4 - Supplementaires (8)

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale du Mozambique ?',
  'Maputo',
  ARRAY['Beira', 'Nampula', 'Lusaka'],
  'geographie',
  4,
  'fr',
  true,
  'Maputo s''appelait Lourenço Marques pendant la colonisation portugaise.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays abrite le lac Balatón, le plus grand lac d''Europe centrale ?',
  'La Hongrie',
  ARRAY['La République tchèque', 'L''Autriche', 'La Roumanie'],
  'geographie',
  4,
  'fr',
  true,
  'Le lac Balatón fait 592 km² et est surnommé « la mer hongroise ».'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus haut sommet du Japon ?',
  'Le mont Fuji',
  ARRAY['Le mont Kita', 'Le mont Hotaka', 'Le mont Aino'],
  'geographie',
  4,
  'fr',
  true,
  'Le mont Fuji culmine à 3 776 m et est un volcan actif qui n''a pas fait éruption depuis 1707.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le seul pays au monde traversé par le 180e méridien (ligne de changement de date) ?',
  'Les Fidji',
  ARRAY['Les Tonga', 'La Nouvelle-Zélande', 'Kiribati'],
  'geographie',
  4,
  'fr',
  true,
  'Le 180e méridien traverse les îles Fidji, ce qui crée des situations de décalage horaire amusantes.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale de la Birmanie (Myanmar) avant Naypyidaw ?',
  'Rangoun',
  ARRAY['Mandalay', 'Bago', 'Mawlamyine'],
  'geographie',
  4,
  'fr',
  true,
  'Rangoun (Yangon) fut la capitale de 1948 à 2006 et reste la plus grande ville du pays.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays possède la plus longue frontière terrestre avec la France ?',
  'Le Brésil',
  ARRAY['L''Espagne', 'La Belgique', 'L''Italie'],
  'geographie',
  4,
  'fr',
  true,
  'La Guyane française partage 730 km de frontière avec le Brésil, contre 623 km avec l''Espagne.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le pays avec le plus de langues officielles en Europe ?',
  'La Suisse',
  ARRAY['La Belgique', 'Le Luxembourg', 'La Finlande'],
  'geographie',
  4,
  'fr',
  true,
  'La Suisse a 4 langues officielles : allemand, français, italien et romanche.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays d''Amérique du Sud est le seul à avoir l''anglais comme langue officielle ?',
  'Le Guyana',
  ARRAY['Le Suriname', 'Le Belize', 'Trinité-et-Tobago'],
  'geographie',
  4,
  'fr',
  true,
  'Le Guyana est un ancien territoire britannique et fait partie du Commonwealth.'
);

-- Difficulty 5 - Supplementaires (7)

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le plus petit pays d''Afrique continentale par population ?',
  'L''Eswatini',
  ARRAY['Djibouti', 'La Gambie', 'Le Lesotho'],
  'geographie',
  5,
  'fr',
  true,
  'L''Eswatini (ancien Swaziland) compte environ 1,2 million d''habitants.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la capitale des Îles Salomon ?',
  'Honiara',
  ARRAY['Port-Vila', 'Suva', 'Nuku''alofa'],
  'geographie',
  5,
  'fr',
  true,
  'Les Îles Salomon sont un archipel de 992 îles dans le Pacifique Sud, théâtre de combats en 1942-43.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays possède l''île de Socotra, connue pour ses arbres dragon ?',
  'Le Yémen',
  ARRAY['Oman', 'La Somalie', 'Djibouti'],
  'geographie',
  5,
  'fr',
  true,
  'L''île de Socotra est surnommée « les Galápagos de l''océan Indien » pour sa biodiversité unique.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel est le seul pays d''Asie dont le nom commence par Q ?',
  'Le Qatar',
  ARRAY['Le Kirghizistan', 'Le Kazakhstan', 'Le Koweït'],
  'geographie',
  5,
  'fr',
  true,
  'Le Qatar est une péninsule de 11 586 km² qui s''avance dans le golfe Persique.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays d''Océanie est le moins peuplé (hors territoires) ?',
  'Nauru',
  ARRAY['Tuvalu', 'Palaos', 'Les îles Marshall'],
  'geographie',
  5,
  'fr',
  true,
  'Nauru compte environ 10 000 habitants sur 21 km², c''est aussi la plus petite république du monde.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quel pays africain est enclavé à l''intérieur de l''Afrique du Sud ?',
  'Le Lesotho',
  ARRAY['L''Eswatini', 'Le Botswana', 'Le Mozambique'],
  'geographie',
  5,
  'fr',
  true,
  'Le Lesotho est entièrement entouré par l''Afrique du Sud. C''est le pays avec l''altitude la plus élevée en moyenne.'
);

INSERT INTO questions (question_text, correct_answer, wrong_answers, category, difficulty, language, is_active, explanation)
VALUES (
  'Quelle est la plus grande ville du monde par superficie ?',
  'Hulunbuir',
  ARRAY['Tokyo', 'New York', 'Pékin'],
  'geographie',
  5,
  'fr',
  true,
  'Hulunbuir en Mongolie intérieure (Chine) couvre 263 953 km², soit la moitié de la France.'
);
