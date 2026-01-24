-- Seed Questions for Adventure Mode
-- 11 categories × ~20 questions each = ~220 questions
-- Run this in your Supabase SQL Editor

-- =====================================================
-- SYSTÈME DE DIFFICULTÉ
-- =====================================================
-- difficulty 1 = Très facile (Coton, Carton) - âge 6+
-- difficulty 2 = Facile (Bois, Bronze) - âge 8+
-- difficulty 3 = Moyen (Argent, Gold) - âge 12+
-- difficulty 4 = Difficile (Platinium, Titane) - âge 14+
-- difficulty 5 = Très difficile (Diamant, Mythique, Légendaire) - âge 16+
-- =====================================================

-- =====================================================
-- CULTURE GÉNÉRALE
-- =====================================================
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active) VALUES
('culture_generale', 1, 'Quelle est la capitale de la France ?', 'Paris', ARRAY['Lyon', 'Marseille', 'Bordeaux'], 'fr', true),
('culture_generale', 1, 'Combien y a-t-il de continents sur Terre ?', '7', ARRAY['5', '6', '8'], 'fr', true),
('culture_generale', 1, 'Quelle est la couleur du soleil ?', 'Jaune', ARRAY['Rouge', 'Orange', 'Blanc'], 'fr', true),
('culture_generale', 1, 'Combien de jours y a-t-il dans une semaine ?', '7', ARRAY['5', '6', '8'], 'fr', true),
('culture_generale', 2, 'Qui a peint La Joconde ?', 'Léonard de Vinci', ARRAY['Michel-Ange', 'Raphaël', 'Picasso'], 'fr', true),
('culture_generale', 2, 'Quelle est la monnaie utilisée au Japon ?', 'Yen', ARRAY['Yuan', 'Won', 'Dollar'], 'fr', true),
('culture_generale', 2, 'Quel est le plus grand océan du monde ?', 'Océan Pacifique', ARRAY['Océan Atlantique', 'Océan Indien', 'Océan Arctique'], 'fr', true),
('culture_generale', 3, 'En quelle année l''homme a-t-il marché sur la Lune pour la première fois ?', '1969', ARRAY['1965', '1971', '1973'], 'fr', true),
('culture_generale', 3, 'Quel est l''élément chimique le plus abondant dans l''univers ?', 'Hydrogène', ARRAY['Hélium', 'Oxygène', 'Carbone'], 'fr', true),
('culture_generale', 3, 'Combien d''os compte le corps humain adulte ?', '206', ARRAY['186', '226', '256'], 'fr', true),
('culture_generale', 4, 'Quelle est la vitesse de la lumière en km/s ?', '300 000 km/s', ARRAY['150 000 km/s', '450 000 km/s', '600 000 km/s'], 'fr', true),
('culture_generale', 4, 'Qui a écrit "Les Misérables" ?', 'Victor Hugo', ARRAY['Émile Zola', 'Gustave Flaubert', 'Honoré de Balzac'], 'fr', true),
('culture_generale', 4, 'Quel pays a le plus grand nombre d''habitants ?', 'Chine', ARRAY['Inde', 'États-Unis', 'Indonésie'], 'fr', true),
('culture_generale', 5, 'Quelle est la formule chimique de l''eau ?', 'H2O', ARRAY['CO2', 'NaCl', 'O2'], 'fr', true),
('culture_generale', 5, 'En quelle année la Révolution française a-t-elle commencé ?', '1789', ARRAY['1776', '1792', '1804'], 'fr', true),
('culture_generale', 5, 'Quel est le plus long fleuve du monde ?', 'Le Nil', ARRAY['L''Amazone', 'Le Yangtsé', 'Le Mississippi'], 'fr', true),
('culture_generale', 2, 'Quelle planète est surnommée la planète rouge ?', 'Mars', ARRAY['Vénus', 'Jupiter', 'Saturne'], 'fr', true),
('culture_generale', 2, 'Quel animal est le symbole de l''Australie ?', 'Kangourou', ARRAY['Koala', 'Émeu', 'Ornithorynque'], 'fr', true),
('culture_generale', 3, 'Combien de cordes a une guitare classique ?', '6', ARRAY['4', '5', '8'], 'fr', true),
('culture_generale', 3, 'Quel est le plus petit pays du monde ?', 'Vatican', ARRAY['Monaco', 'Saint-Marin', 'Liechtenstein'], 'fr', true);

-- =====================================================
-- HISTOIRE
-- =====================================================
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active) VALUES
('histoire', 1, 'Qui était le roi de France surnommé le Roi Soleil ?', 'Louis XIV', ARRAY['Louis XV', 'Louis XVI', 'François Ier'], 'fr', true),
('histoire', 1, 'En quelle année a eu lieu la chute du mur de Berlin ?', '1989', ARRAY['1987', '1991', '1985'], 'fr', true),
('histoire', 1, 'Qui a découvert l''Amérique en 1492 ?', 'Christophe Colomb', ARRAY['Amerigo Vespucci', 'Marco Polo', 'Vasco de Gama'], 'fr', true),
('histoire', 2, 'Quelle était la capitale de l''Empire romain ?', 'Rome', ARRAY['Athènes', 'Constantinople', 'Alexandrie'], 'fr', true),
('histoire', 2, 'Qui était le premier président des États-Unis ?', 'George Washington', ARRAY['Thomas Jefferson', 'Abraham Lincoln', 'John Adams'], 'fr', true),
('histoire', 2, 'En quelle année a commencé la Première Guerre mondiale ?', '1914', ARRAY['1912', '1916', '1918'], 'fr', true),
('histoire', 3, 'Qui était Cléopâtre ?', 'Reine d''Égypte', ARRAY['Reine de Grèce', 'Impératrice romaine', 'Reine de Perse'], 'fr', true),
('histoire', 3, 'Quelle civilisation a construit les pyramides de Gizeh ?', 'Égyptienne', ARRAY['Maya', 'Aztèque', 'Romaine'], 'fr', true),
('histoire', 3, 'En quelle année Napoléon est-il devenu empereur ?', '1804', ARRAY['1799', '1806', '1810'], 'fr', true),
('histoire', 4, 'Quelle bataille a mis fin à l''Empire de Napoléon ?', 'Waterloo', ARRAY['Austerlitz', 'Trafalgar', 'Iéna'], 'fr', true),
('histoire', 4, 'Qui a été le dernier roi de France ?', 'Louis-Philippe Ier', ARRAY['Charles X', 'Louis XVIII', 'Napoléon III'], 'fr', true),
('histoire', 4, 'En quelle année la Seconde Guerre mondiale s''est-elle terminée ?', '1945', ARRAY['1943', '1944', '1946'], 'fr', true),
('histoire', 5, 'Qui était Jules César ?', 'Un général et homme d''État romain', ARRAY['Un philosophe grec', 'Un empereur byzantin', 'Un roi franc'], 'fr', true),
('histoire', 5, 'Quelle révolution a eu lieu en Russie en 1917 ?', 'Révolution bolchevique', ARRAY['Révolution de Février', 'Révolution industrielle', 'Révolution culturelle'], 'fr', true),
('histoire', 5, 'Qui a signé la Déclaration d''indépendance américaine ?', 'Les Pères fondateurs', ARRAY['Le roi George III', 'Napoléon', 'Louis XVI'], 'fr', true),
('histoire', 2, 'Quel empire Alexandre le Grand a-t-il conquis ?', 'Empire perse', ARRAY['Empire romain', 'Empire égyptien', 'Empire chinois'], 'fr', true),
('histoire', 3, 'En quelle année Jeanne d''Arc a-t-elle été brûlée ?', '1431', ARRAY['1420', '1450', '1412'], 'fr', true),
('histoire', 3, 'Qui a inventé l''imprimerie ?', 'Gutenberg', ARRAY['Léonard de Vinci', 'Galilée', 'Copernic'], 'fr', true),
('histoire', 4, 'Quel traité a mis fin à la Première Guerre mondiale ?', 'Traité de Versailles', ARRAY['Traité de Paris', 'Traité de Vienne', 'Traité de Berlin'], 'fr', true),
('histoire', 4, 'Qui était Martin Luther King ?', 'Un militant des droits civiques', ARRAY['Un président américain', 'Un pasteur allemand', 'Un scientifique'], 'fr', true);

-- =====================================================
-- GÉOGRAPHIE
-- =====================================================
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active) VALUES
('geographie', 1, 'Quelle est la capitale de l''Italie ?', 'Rome', ARRAY['Milan', 'Naples', 'Florence'], 'fr', true),
('geographie', 1, 'Quel est le plus grand pays du monde ?', 'Russie', ARRAY['Canada', 'Chine', 'États-Unis'], 'fr', true),
('geographie', 1, 'Dans quel continent se trouve l''Égypte ?', 'Afrique', ARRAY['Asie', 'Europe', 'Moyen-Orient'], 'fr', true),
('geographie', 2, 'Quelle est la capitale de l''Australie ?', 'Canberra', ARRAY['Sydney', 'Melbourne', 'Perth'], 'fr', true),
('geographie', 2, 'Quel fleuve traverse Paris ?', 'La Seine', ARRAY['La Loire', 'Le Rhône', 'La Garonne'], 'fr', true),
('geographie', 2, 'Combien d''états composent les États-Unis ?', '50', ARRAY['48', '52', '45'], 'fr', true),
('geographie', 3, 'Quelle est la plus haute montagne du monde ?', 'Everest', ARRAY['K2', 'Mont Blanc', 'Kilimandjaro'], 'fr', true),
('geographie', 3, 'Dans quel pays se trouve le Machu Picchu ?', 'Pérou', ARRAY['Bolivie', 'Équateur', 'Chili'], 'fr', true),
('geographie', 3, 'Quelle mer borde la côte sud de la France ?', 'Méditerranée', ARRAY['Atlantique', 'Manche', 'Adriatique'], 'fr', true),
('geographie', 4, 'Quelle est la capitale du Canada ?', 'Ottawa', ARRAY['Toronto', 'Montréal', 'Vancouver'], 'fr', true),
('geographie', 4, 'Quel désert est le plus grand du monde ?', 'Sahara', ARRAY['Gobi', 'Atacama', 'Kalahari'], 'fr', true),
('geographie', 4, 'Combien de pays composent l''Union européenne (2024) ?', '27', ARRAY['25', '28', '30'], 'fr', true),
('geographie', 5, 'Quelle est la capitale de la Nouvelle-Zélande ?', 'Wellington', ARRAY['Auckland', 'Christchurch', 'Queenstown'], 'fr', true),
('geographie', 5, 'Quel pays a la plus longue frontière avec la France ?', 'Brésil', ARRAY['Espagne', 'Belgique', 'Allemagne'], 'fr', true),
('geographie', 5, 'Dans quel océan se trouve Madagascar ?', 'Indien', ARRAY['Atlantique', 'Pacifique', 'Austral'], 'fr', true),
('geographie', 2, 'Quelle est la capitale de l''Espagne ?', 'Madrid', ARRAY['Barcelone', 'Séville', 'Valence'], 'fr', true),
('geographie', 2, 'Quel pays est surnommé le pays du Soleil Levant ?', 'Japon', ARRAY['Chine', 'Corée du Sud', 'Vietnam'], 'fr', true),
('geographie', 3, 'Quelle est la capitale de la Thaïlande ?', 'Bangkok', ARRAY['Phuket', 'Chiang Mai', 'Pattaya'], 'fr', true),
('geographie', 3, 'Quel est le plus grand lac d''Europe ?', 'Lac Ladoga', ARRAY['Lac Léman', 'Lac de Constance', 'Lac Balaton'], 'fr', true),
('geographie', 4, 'Dans quel pays se trouve la tour de Pise ?', 'Italie', ARRAY['France', 'Espagne', 'Grèce'], 'fr', true);

-- =====================================================
-- SCIENCES
-- =====================================================
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active) VALUES
('sciences', 1, 'Quelle planète est la plus proche du Soleil ?', 'Mercure', ARRAY['Vénus', 'Mars', 'Terre'], 'fr', true),
('sciences', 1, 'Quel gaz respirons-nous principalement ?', 'Oxygène', ARRAY['Azote', 'Dioxyde de carbone', 'Hydrogène'], 'fr', true),
('sciences', 1, 'Combien de planètes composent notre système solaire ?', '8', ARRAY['7', '9', '10'], 'fr', true),
('sciences', 2, 'Quel est le symbole chimique de l''or ?', 'Au', ARRAY['Or', 'Ag', 'Fe'], 'fr', true),
('sciences', 2, 'Quelle est la température d''ébullition de l''eau ?', '100°C', ARRAY['90°C', '110°C', '120°C'], 'fr', true),
('sciences', 2, 'Quel organe pompe le sang dans notre corps ?', 'Le cœur', ARRAY['Les poumons', 'Le foie', 'Les reins'], 'fr', true),
('sciences', 3, 'Qu''est-ce que l''ADN ?', 'Acide désoxyribonucléique', ARRAY['Acide ribonucléique', 'Protéine', 'Enzyme'], 'fr', true),
('sciences', 3, 'Quelle force nous maintient sur Terre ?', 'La gravité', ARRAY['Le magnétisme', 'L''électricité', 'La friction'], 'fr', true),
('sciences', 3, 'Quel scientifique a découvert la pénicilline ?', 'Alexander Fleming', ARRAY['Louis Pasteur', 'Marie Curie', 'Albert Einstein'], 'fr', true),
('sciences', 4, 'Quelle est la plus petite particule de matière ?', 'Quark', ARRAY['Atome', 'Électron', 'Proton'], 'fr', true),
('sciences', 4, 'Combien de chromosomes possède un être humain ?', '46', ARRAY['44', '48', '42'], 'fr', true),
('sciences', 4, 'Qu''est-ce qu''un trou noir ?', 'Une région de l''espace où la gravité est si forte que rien ne peut s''en échapper', ARRAY['Une étoile morte', 'Un tunnel spatial', 'Une planète sombre'], 'fr', true),
('sciences', 5, 'Quelle est la théorie d''Einstein la plus célèbre ?', 'La relativité', ARRAY['La mécanique quantique', 'Le Big Bang', 'L''évolution'], 'fr', true),
('sciences', 5, 'Quel élément compose principalement le Soleil ?', 'Hydrogène', ARRAY['Hélium', 'Oxygène', 'Carbone'], 'fr', true),
('sciences', 5, 'Qu''est-ce que la photosynthèse ?', 'Processus par lequel les plantes convertissent la lumière en énergie', ARRAY['Respiration des plantes', 'Reproduction végétale', 'Croissance des racines'], 'fr', true),
('sciences', 2, 'Quel est le plus grand organe du corps humain ?', 'La peau', ARRAY['Le foie', 'Les poumons', 'L''intestin'], 'fr', true),
('sciences', 2, 'Quelle est la planète la plus grande du système solaire ?', 'Jupiter', ARRAY['Saturne', 'Uranus', 'Neptune'], 'fr', true),
('sciences', 3, 'Qui a découvert la radioactivité ?', 'Henri Becquerel', ARRAY['Marie Curie', 'Pierre Curie', 'Ernest Rutherford'], 'fr', true),
('sciences', 3, 'Qu''est-ce qu''un tsunami ?', 'Une vague géante causée par un séisme sous-marin', ARRAY['Un ouragan', 'Une tornade marine', 'Un raz-de-marée normal'], 'fr', true),
('sciences', 4, 'Quelle est l''unité de mesure de la force ?', 'Newton', ARRAY['Joule', 'Watt', 'Pascal'], 'fr', true);

-- =====================================================
-- SPORT
-- =====================================================
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active) VALUES
('sport', 1, 'Combien de joueurs composent une équipe de football ?', '11', ARRAY['9', '10', '12'], 'fr', true),
('sport', 1, 'Dans quel sport utilise-t-on une raquette et un volant ?', 'Badminton', ARRAY['Tennis', 'Squash', 'Ping-pong'], 'fr', true),
('sport', 1, 'Quelle est la couleur du maillot jaune du Tour de France ?', 'Jaune', ARRAY['Vert', 'Rouge', 'Blanc'], 'fr', true),
('sport', 2, 'Qui a remporté le plus de Ballons d''Or ?', 'Lionel Messi', ARRAY['Cristiano Ronaldo', 'Michel Platini', 'Johan Cruyff'], 'fr', true),
('sport', 2, 'Dans quel pays les Jeux Olympiques modernes ont-ils été créés ?', 'Grèce', ARRAY['France', 'États-Unis', 'Angleterre'], 'fr', true),
('sport', 2, 'Combien de sets faut-il gagner pour remporter un match de tennis en Grand Chelem (hommes) ?', '3', ARRAY['2', '4', '5'], 'fr', true),
('sport', 3, 'Quel pays a remporté le plus de Coupes du monde de football ?', 'Brésil', ARRAY['Allemagne', 'Italie', 'Argentine'], 'fr', true),
('sport', 3, 'Quelle est la distance d''un marathon ?', '42,195 km', ARRAY['40 km', '45 km', '50 km'], 'fr', true),
('sport', 3, 'Qui est le meilleur buteur de l''histoire de la Ligue des Champions ?', 'Cristiano Ronaldo', ARRAY['Lionel Messi', 'Robert Lewandowski', 'Karim Benzema'], 'fr', true),
('sport', 4, 'Quel joueur de tennis a remporté le plus de titres du Grand Chelem ?', 'Novak Djokovic', ARRAY['Roger Federer', 'Rafael Nadal', 'Pete Sampras'], 'fr', true),
('sport', 4, 'En quelle année la France a-t-elle remporté sa première Coupe du monde ?', '1998', ARRAY['1984', '2000', '2006'], 'fr', true),
('sport', 4, 'Quel est le record du monde du 100m ?', '9,58 secondes', ARRAY['9,69 secondes', '9,72 secondes', '9,63 secondes'], 'fr', true),
('sport', 5, 'Qui détient le record du monde du 100m ?', 'Usain Bolt', ARRAY['Tyson Gay', 'Yohan Blake', 'Justin Gatlin'], 'fr', true),
('sport', 5, 'Quel basketteur a marqué le plus de points en NBA ?', 'LeBron James', ARRAY['Kareem Abdul-Jabbar', 'Michael Jordan', 'Kobe Bryant'], 'fr', true),
('sport', 5, 'Combien de joueurs composent une équipe de rugby à XV ?', '15', ARRAY['13', '11', '17'], 'fr', true),
('sport', 2, 'Quel sport pratique Tiger Woods ?', 'Golf', ARRAY['Tennis', 'Cricket', 'Polo'], 'fr', true),
('sport', 2, 'Dans quel sport le terme "ace" est-il utilisé ?', 'Tennis', ARRAY['Golf', 'Badminton', 'Volleyball'], 'fr', true),
('sport', 3, 'Quel club a remporté le plus de Ligues des Champions ?', 'Real Madrid', ARRAY['AC Milan', 'Liverpool', 'Bayern Munich'], 'fr', true),
('sport', 3, 'Combien de temps dure un match de football ?', '90 minutes', ARRAY['80 minutes', '100 minutes', '120 minutes'], 'fr', true),
('sport', 4, 'Quel nageur a remporté le plus de médailles olympiques ?', 'Michael Phelps', ARRAY['Mark Spitz', 'Ryan Lochte', 'Ian Thorpe'], 'fr', true);

-- =====================================================
-- POP CULTURE
-- =====================================================
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active) VALUES
('pop_culture', 1, 'Qui chante "Bad Guy" ?', 'Billie Eilish', ARRAY['Ariana Grande', 'Taylor Swift', 'Dua Lipa'], 'fr', true),
('pop_culture', 1, 'Quel est le nom de la chanteuse de la Reine des Neiges ?', 'Elsa', ARRAY['Anna', 'Rapunzel', 'Moana'], 'fr', true),
('pop_culture', 1, 'Quel réseau social utilise un logo d''oiseau bleu ?', 'Twitter/X', ARRAY['Facebook', 'Instagram', 'TikTok'], 'fr', true),
('pop_culture', 2, 'Qui est Harry Potter ?', 'Un sorcier', ARRAY['Un vampire', 'Un super-héros', 'Un extraterrestre'], 'fr', true),
('pop_culture', 2, 'Quel groupe a chanté "Bohemian Rhapsody" ?', 'Queen', ARRAY['The Beatles', 'Led Zeppelin', 'Pink Floyd'], 'fr', true),
('pop_culture', 2, 'Qui interprète Iron Man dans les films Marvel ?', 'Robert Downey Jr.', ARRAY['Chris Evans', 'Chris Hemsworth', 'Mark Ruffalo'], 'fr', true),
('pop_culture', 3, 'Quelle série met en scène des dragons et le Trône de Fer ?', 'Game of Thrones', ARRAY['The Witcher', 'Vikings', 'The Last Kingdom'], 'fr', true),
('pop_culture', 3, 'Qui a créé la saga Star Wars ?', 'George Lucas', ARRAY['Steven Spielberg', 'James Cameron', 'Peter Jackson'], 'fr', true),
('pop_culture', 3, 'Quel rappeur français a sorti l''album "JEFE" ?', 'Ninho', ARRAY['Jul', 'PNL', 'Nekfeu'], 'fr', true),
('pop_culture', 4, 'Quel film a remporté l''Oscar du meilleur film en 2020 ?', 'Parasite', ARRAY['1917', 'Joker', 'Once Upon a Time in Hollywood'], 'fr', true),
('pop_culture', 4, 'Qui est le créateur de Mickey Mouse ?', 'Walt Disney', ARRAY['Pixar', 'Warner Bros', 'DreamWorks'], 'fr', true),
('pop_culture', 4, 'Quel groupe de K-pop est le plus populaire au monde ?', 'BTS', ARRAY['BLACKPINK', 'EXO', 'TWICE'], 'fr', true),
('pop_culture', 5, 'Quel acteur joue le Joker dans "The Dark Knight" ?', 'Heath Ledger', ARRAY['Joaquin Phoenix', 'Jack Nicholson', 'Jared Leto'], 'fr', true),
('pop_culture', 5, 'Quelle série Netflix parle d''un jeu mortel coréen ?', 'Squid Game', ARRAY['Alice in Borderland', 'Sweet Home', 'Kingdom'], 'fr', true),
('pop_culture', 5, 'Qui a réalisé le film "Inception" ?', 'Christopher Nolan', ARRAY['Denis Villeneuve', 'Ridley Scott', 'David Fincher'], 'fr', true),
('pop_culture', 2, 'Quel super-héros vient de Krypton ?', 'Superman', ARRAY['Batman', 'Spider-Man', 'Flash'], 'fr', true),
('pop_culture', 2, 'Quelle chanteuse est surnommée "Queen B" ?', 'Beyoncé', ARRAY['Rihanna', 'Lady Gaga', 'Britney Spears'], 'fr', true),
('pop_culture', 3, 'Quel film raconte l''histoire du Titanic ?', 'Titanic', ARRAY['The Poseidon Adventure', 'A Night to Remember', 'Waterworld'], 'fr', true),
('pop_culture', 3, 'Qui joue Jack Sparrow dans Pirates des Caraïbes ?', 'Johnny Depp', ARRAY['Orlando Bloom', 'Javier Bardem', 'Geoffrey Rush'], 'fr', true),
('pop_culture', 4, 'Quelle série raconte la vie de Pablo Escobar ?', 'Narcos', ARRAY['Breaking Bad', 'Ozark', 'Power'], 'fr', true);

-- =====================================================
-- JEUX VIDÉO
-- =====================================================
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active) VALUES
('jeux_video', 1, 'Quel est le personnage principal de Mario ?', 'Mario', ARRAY['Luigi', 'Peach', 'Bowser'], 'fr', true),
('jeux_video', 1, 'Quel jeu met en scène des blocs qui tombent ?', 'Tetris', ARRAY['Pac-Man', 'Snake', 'Pong'], 'fr', true),
('jeux_video', 1, 'Quelle console a créé Nintendo en 2017 ?', 'Switch', ARRAY['Wii U', '3DS', 'GameCube'], 'fr', true),
('jeux_video', 2, 'Quel jeu de battle royale est gratuit et très populaire ?', 'Fortnite', ARRAY['PUBG', 'Apex Legends', 'Call of Duty Warzone'], 'fr', true),
('jeux_video', 2, 'Dans quel jeu construit-on des maisons avec des blocs ?', 'Minecraft', ARRAY['Roblox', 'Terraria', 'Lego Worlds'], 'fr', true),
('jeux_video', 2, 'Quel est le nom du héros de Zelda ?', 'Link', ARRAY['Zelda', 'Ganon', 'Epona'], 'fr', true),
('jeux_video', 3, 'Quel studio a créé GTA V ?', 'Rockstar Games', ARRAY['Ubisoft', 'EA Games', 'Activision'], 'fr', true),
('jeux_video', 3, 'Quel jeu de foot est publié chaque année par EA ?', 'FIFA/EA FC', ARRAY['PES', 'Football Manager', 'FIFA Street'], 'fr', true),
('jeux_video', 3, 'Dans quel jeu incarne-t-on Kratos ?', 'God of War', ARRAY['Devil May Cry', 'Darksiders', 'Bayonetta'], 'fr', true),
('jeux_video', 4, 'Quel jeu de From Software est connu pour sa difficulté ?', 'Dark Souls', ARRAY['Assassin''s Creed', 'The Witcher', 'Skyrim'], 'fr', true),
('jeux_video', 4, 'Quelle est la mascotte de Sega ?', 'Sonic', ARRAY['Mario', 'Crash Bandicoot', 'Spyro'], 'fr', true),
('jeux_video', 4, 'Quel jeu multijoueur met en scène des champions avec des compétences uniques ?', 'League of Legends', ARRAY['Dota 2', 'Overwatch', 'Valorant'], 'fr', true),
('jeux_video', 5, 'En quelle année le premier PlayStation est-il sorti ?', '1994', ARRAY['1992', '1996', '1998'], 'fr', true),
('jeux_video', 5, 'Quel jeu a popularisé le genre "souls-like" ?', 'Demon''s Souls', ARRAY['Dark Souls', 'Bloodborne', 'Sekiro'], 'fr', true),
('jeux_video', 5, 'Quel studio a créé The Last of Us ?', 'Naughty Dog', ARRAY['Santa Monica', 'Insomniac', 'Sucker Punch'], 'fr', true),
('jeux_video', 2, 'Quel Pokémon est le plus connu ?', 'Pikachu', ARRAY['Évoli', 'Dracaufeu', 'Mewtwo'], 'fr', true),
('jeux_video', 2, 'Quel jeu se joue avec des cartes et des monstres ?', 'Hearthstone', ARRAY['Magic Arena', 'Gwent', 'Yu-Gi-Oh'], 'fr', true),
('jeux_video', 3, 'Quel jeu de simulation de vie est très populaire ?', 'Les Sims', ARRAY['Animal Crossing', 'Stardew Valley', 'Second Life'], 'fr', true),
('jeux_video', 3, 'Quel est le jeu le plus vendu de tous les temps ?', 'Minecraft', ARRAY['GTA V', 'Tetris', 'Wii Sports'], 'fr', true),
('jeux_video', 4, 'Quel jeu de tir est connu pour Counter-Strike ?', 'CS:GO/CS2', ARRAY['Valorant', 'Rainbow Six', 'Call of Duty'], 'fr', true);

-- =====================================================
-- CINÉMA & SÉRIES
-- =====================================================
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active) VALUES
('cinema', 1, 'Quel film raconte l''histoire d''un lion nommé Simba ?', 'Le Roi Lion', ARRAY['Madagascar', 'Kung Fu Panda', 'Zootopia'], 'fr', true),
('cinema', 1, 'Qui joue Spider-Man dans les films récents ?', 'Tom Holland', ARRAY['Andrew Garfield', 'Tobey Maguire', 'Miles Morales'], 'fr', true),
('cinema', 1, 'Quel film met en scène des jouets qui prennent vie ?', 'Toy Story', ARRAY['Cars', 'Monstres et Cie', 'Là-haut'], 'fr', true),
('cinema', 2, 'Qui réalise les films Avengers ?', 'Les frères Russo', ARRAY['Joss Whedon', 'James Gunn', 'Taika Waititi'], 'fr', true),
('cinema', 2, 'Quelle série parle de chimie et de drogue ?', 'Breaking Bad', ARRAY['Narcos', 'Ozark', 'Better Call Saul'], 'fr', true),
('cinema', 2, 'Quel acteur joue dans Fast & Furious et Jumanji ?', 'Dwayne Johnson', ARRAY['Vin Diesel', 'Jason Statham', 'Paul Walker'], 'fr', true),
('cinema', 3, 'Quel film a remporté 11 Oscars en 2004 ?', 'Le Seigneur des Anneaux : Le Retour du Roi', ARRAY['Titanic', 'Ben-Hur', 'La La Land'], 'fr', true),
('cinema', 3, 'Quelle série Netflix met en scène Eleven ?', 'Stranger Things', ARRAY['The OA', 'Dark', 'Black Mirror'], 'fr', true),
('cinema', 3, 'Qui joue le personnage de Wolverine ?', 'Hugh Jackman', ARRAY['Chris Hemsworth', 'Ryan Reynolds', 'Liam Hemsworth'], 'fr', true),
('cinema', 4, 'Quel film de 1994 se déroule dans une prison ?', 'Les Évadés', ARRAY['Le Silence des agneaux', 'Pulp Fiction', 'Forrest Gump'], 'fr', true),
('cinema', 4, 'Qui a réalisé Pulp Fiction ?', 'Quentin Tarantino', ARRAY['Martin Scorsese', 'Francis Ford Coppola', 'Steven Spielberg'], 'fr', true),
('cinema', 4, 'Quelle série HBO parle de zombies ?', 'The Walking Dead', ARRAY['Game of Thrones', 'The Last of Us', 'Fear the Walking Dead'], 'fr', true),
('cinema', 5, 'Quel est le film le plus rentable de tous les temps ?', 'Avatar', ARRAY['Avengers: Endgame', 'Titanic', 'Star Wars: Le Réveil de la Force'], 'fr', true),
('cinema', 5, 'Qui a réalisé "Le Parrain" ?', 'Francis Ford Coppola', ARRAY['Martin Scorsese', 'Brian De Palma', 'Sergio Leone'], 'fr', true),
('cinema', 5, 'Quelle actrice a joué dans "Léon" et "Black Swan" ?', 'Natalie Portman', ARRAY['Scarlett Johansson', 'Anne Hathaway', 'Mila Kunis'], 'fr', true),
('cinema', 2, 'Quel héros porte un masque noir et une cape ?', 'Batman', ARRAY['Zorro', 'The Phantom', 'Spawn'], 'fr', true),
('cinema', 2, 'Quelle série se passe dans un hôpital ?', 'Grey''s Anatomy', ARRAY['House', 'The Good Doctor', 'ER'], 'fr', true),
('cinema', 3, 'Qui joue James Bond depuis 2006 ?', 'Daniel Craig', ARRAY['Pierce Brosnan', 'Timothy Dalton', 'Sean Connery'], 'fr', true),
('cinema', 3, 'Quel film de Pixar parle de poissons ?', 'Le Monde de Nemo', ARRAY['Shark Tale', 'La Petite Sirène', 'Ponyo'], 'fr', true),
('cinema', 4, 'Quelle série raconte l''histoire de Walter White ?', 'Breaking Bad', ARRAY['Ozark', 'Narcos', 'Better Call Saul'], 'fr', true);

-- =====================================================
-- MUSIQUE
-- =====================================================
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active) VALUES
('musique', 1, 'Qui chante "Shape of You" ?', 'Ed Sheeran', ARRAY['Justin Bieber', 'Shawn Mendes', 'Bruno Mars'], 'fr', true),
('musique', 1, 'Quel instrument a des touches noires et blanches ?', 'Piano', ARRAY['Guitare', 'Violon', 'Flûte'], 'fr', true),
('musique', 1, 'Combien de cordes a un violon ?', '4', ARRAY['3', '5', '6'], 'fr', true),
('musique', 2, 'Qui est le "Roi de la Pop" ?', 'Michael Jackson', ARRAY['Elvis Presley', 'Prince', 'Madonna'], 'fr', true),
('musique', 2, 'Quel groupe britannique a chanté "Yellow" ?', 'Coldplay', ARRAY['Oasis', 'Radiohead', 'Muse'], 'fr', true),
('musique', 2, 'Quelle chanteuse a sorti "Hello" en 2015 ?', 'Adele', ARRAY['Rihanna', 'Beyoncé', 'Lady Gaga'], 'fr', true),
('musique', 3, 'Qui a composé "La Neuvième Symphonie" ?', 'Beethoven', ARRAY['Mozart', 'Bach', 'Chopin'], 'fr', true),
('musique', 3, 'Quel rappeur américain est surnommé "Slim Shady" ?', 'Eminem', ARRAY['50 Cent', 'Dr. Dre', 'Snoop Dogg'], 'fr', true),
('musique', 3, 'Quel groupe a chanté "Stairway to Heaven" ?', 'Led Zeppelin', ARRAY['Pink Floyd', 'The Rolling Stones', 'The Who'], 'fr', true),
('musique', 4, 'En quelle année est sorti "Thriller" de Michael Jackson ?', '1982', ARRAY['1980', '1984', '1986'], 'fr', true),
('musique', 4, 'Qui a chanté "Je t''aime... moi non plus" ?', 'Serge Gainsbourg et Jane Birkin', ARRAY['Johnny Hallyday', 'Michel Polnareff', 'Claude François'], 'fr', true),
('musique', 4, 'Quel artiste a vendu le plus d''albums dans le monde ?', 'The Beatles', ARRAY['Elvis Presley', 'Michael Jackson', 'Elton John'], 'fr', true),
('musique', 5, 'Quel compositeur était sourd ?', 'Beethoven', ARRAY['Mozart', 'Bach', 'Vivaldi'], 'fr', true),
('musique', 5, 'Quelle chanteuse française a sorti "La Vie en Rose" ?', 'Édith Piaf', ARRAY['Dalida', 'Barbara', 'Françoise Hardy'], 'fr', true),
('musique', 5, 'Quel groupe de rock a le plus de Grammy Awards ?', 'U2', ARRAY['The Rolling Stones', 'Led Zeppelin', 'Foo Fighters'], 'fr', true),
('musique', 2, 'Qui chante "Despacito" ?', 'Luis Fonsi', ARRAY['Daddy Yankee', 'J Balvin', 'Bad Bunny'], 'fr', true),
('musique', 2, 'Quel groupe a chanté "We Will Rock You" ?', 'Queen', ARRAY['AC/DC', 'Kiss', 'Guns N'' Roses'], 'fr', true),
('musique', 3, 'Qui est le chanteur principal de Coldplay ?', 'Chris Martin', ARRAY['Bono', 'Thom Yorke', 'Matt Bellamy'], 'fr', true),
('musique', 3, 'Quel rappeur français a sorti "Bande organisée" ?', 'Jul', ARRAY['Ninho', 'PNL', 'Nekfeu'], 'fr', true),
('musique', 4, 'Quelle chanteuse a sorti "Born This Way" ?', 'Lady Gaga', ARRAY['Katy Perry', 'Britney Spears', 'Christina Aguilera'], 'fr', true);

-- =====================================================
-- TECHNOLOGIE
-- =====================================================
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active) VALUES
('technologie', 1, 'Quel est le moteur de recherche le plus utilisé ?', 'Google', ARRAY['Bing', 'Yahoo', 'DuckDuckGo'], 'fr', true),
('technologie', 1, 'Quelle entreprise fabrique l''iPhone ?', 'Apple', ARRAY['Samsung', 'Google', 'Microsoft'], 'fr', true),
('technologie', 1, 'Que signifie "Wi-Fi" ?', 'Wireless Fidelity', ARRAY['Wired Fidelity', 'Wide Frequency', 'World Internet'], 'fr', true),
('technologie', 2, 'Qui a fondé Facebook ?', 'Mark Zuckerberg', ARRAY['Elon Musk', 'Jeff Bezos', 'Bill Gates'], 'fr', true),
('technologie', 2, 'Quel système d''exploitation est un pingouin ?', 'Linux', ARRAY['Windows', 'macOS', 'Android'], 'fr', true),
('technologie', 2, 'Quelle entreprise a créé Windows ?', 'Microsoft', ARRAY['Apple', 'IBM', 'Intel'], 'fr', true),
('technologie', 3, 'Qu''est-ce que l''IA ?', 'Intelligence Artificielle', ARRAY['Internet Avancé', 'Interface Automatique', 'Information Assistée'], 'fr', true),
('technologie', 3, 'Qui a créé Tesla ?', 'Elon Musk', ARRAY['Jeff Bezos', 'Bill Gates', 'Steve Jobs'], 'fr', true),
('technologie', 3, 'Quel langage de programmation a créé Python ?', 'Guido van Rossum', ARRAY['Dennis Ritchie', 'James Gosling', 'Bjarne Stroustrup'], 'fr', true),
('technologie', 4, 'Qu''est-ce que la blockchain ?', 'Une technologie de registre distribué', ARRAY['Un type de cryptage', 'Un réseau social', 'Un système d''exploitation'], 'fr', true),
('technologie', 4, 'En quelle année le premier iPhone est-il sorti ?', '2007', ARRAY['2005', '2009', '2010'], 'fr', true),
('technologie', 4, 'Quelle entreprise possède YouTube ?', 'Google', ARRAY['Facebook', 'Amazon', 'Microsoft'], 'fr', true),
('technologie', 5, 'Qu''est-ce que ChatGPT ?', 'Un modèle de langage IA', ARRAY['Un réseau social', 'Un jeu vidéo', 'Un moteur de recherche'], 'fr', true),
('technologie', 5, 'Quel est le langage le plus utilisé pour le web ?', 'JavaScript', ARRAY['Python', 'Java', 'C++'], 'fr', true),
('technologie', 5, 'Qu''est-ce que le cloud computing ?', 'Informatique dématérialisée', ARRAY['Un type de météo', 'Un jeu vidéo', 'Un réseau social'], 'fr', true),
('technologie', 2, 'Quel réseau social utilise des stories qui disparaissent ?', 'Snapchat', ARRAY['Facebook', 'Twitter', 'LinkedIn'], 'fr', true),
('technologie', 2, 'Quelle est la monnaie virtuelle la plus connue ?', 'Bitcoin', ARRAY['Ethereum', 'Dogecoin', 'Litecoin'], 'fr', true),
('technologie', 3, 'Qui a créé Amazon ?', 'Jeff Bezos', ARRAY['Elon Musk', 'Mark Zuckerberg', 'Larry Page'], 'fr', true),
('technologie', 3, 'Quelle application permet de faire des appels vidéo ?', 'Zoom', ARRAY['Slack', 'Discord', 'Teams'], 'fr', true),
('technologie', 4, 'Qu''est-ce qu''un algorithme ?', 'Une suite d''instructions', ARRAY['Un virus', 'Un programme', 'Un fichier'], 'fr', true);

-- =====================================================
-- LOGO
-- =====================================================
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active) VALUES
('logo', 1, 'Quelle marque a un logo en forme de pomme croquée ?', 'Apple', ARRAY['Samsung', 'Huawei', 'LG'], 'fr', true),
('logo', 1, 'Quelle marque de sport a un logo en forme de virgule ?', 'Nike', ARRAY['Adidas', 'Puma', 'Reebok'], 'fr', true),
('logo', 1, 'Quelle chaîne de fast-food a un logo avec un M jaune ?', 'McDonald''s', ARRAY['Burger King', 'KFC', 'Subway'], 'fr', true),
('logo', 2, 'Quelle marque automobile a un logo en forme d''étoile à trois branches ?', 'Mercedes-Benz', ARRAY['BMW', 'Audi', 'Volkswagen'], 'fr', true),
('logo', 2, 'Quelle marque de café a une sirène dans son logo ?', 'Starbucks', ARRAY['Costa Coffee', 'Dunkin'' Donuts', 'Tim Hortons'], 'fr', true),
('logo', 2, 'Quelle marque de sport a trois bandes dans son logo ?', 'Adidas', ARRAY['Nike', 'Puma', 'Under Armour'], 'fr', true),
('logo', 3, 'Quelle marque automobile a quatre anneaux dans son logo ?', 'Audi', ARRAY['BMW', 'Mercedes', 'Volkswagen'], 'fr', true),
('logo', 3, 'Quelle entreprise a un oiseau bleu comme logo ?', 'Twitter/X', ARRAY['Facebook', 'Instagram', 'LinkedIn'], 'fr', true),
('logo', 3, 'Quelle marque de luxe a un logo avec deux C entrelacés ?', 'Chanel', ARRAY['Gucci', 'Louis Vuitton', 'Dior'], 'fr', true),
('logo', 4, 'Quelle entreprise de streaming a un logo rouge avec un N ?', 'Netflix', ARRAY['Hulu', 'Amazon Prime', 'Disney+'], 'fr', true),
('logo', 4, 'Quelle marque automobile a un taureau dans son logo ?', 'Lamborghini', ARRAY['Ferrari', 'Porsche', 'Maserati'], 'fr', true),
('logo', 4, 'Quelle marque de mode a un crocodile dans son logo ?', 'Lacoste', ARRAY['Ralph Lauren', 'Tommy Hilfiger', 'Hugo Boss'], 'fr', true),
('logo', 5, 'Quelle entreprise a un logo arc-en-ciel en forme de pomme ?', 'Apple (ancien logo)', ARRAY['Google', 'Microsoft', 'IBM'], 'fr', true),
('logo', 5, 'Quelle marque de voiture a un cheval cabré noir sur fond jaune ?', 'Ferrari', ARRAY['Porsche', 'Lamborghini', 'Maserati'], 'fr', true),
('logo', 5, 'Quelle entreprise technologique a un logo avec quatre carrés colorés ?', 'Microsoft', ARRAY['Google', 'IBM', 'Intel'], 'fr', true),
('logo', 2, 'Quelle marque de soda a un logo rouge et blanc ?', 'Coca-Cola', ARRAY['Pepsi', 'Fanta', 'Sprite'], 'fr', true),
('logo', 2, 'Quelle application de musique a un logo vert ?', 'Spotify', ARRAY['Apple Music', 'Deezer', 'Tidal'], 'fr', true),
('logo', 3, 'Quelle marque de voiture a un lion dans son logo ?', 'Peugeot', ARRAY['Renault', 'Citroën', 'Fiat'], 'fr', true),
('logo', 3, 'Quelle application de messagerie a un logo vert avec un téléphone ?', 'WhatsApp', ARRAY['Telegram', 'Signal', 'Messenger'], 'fr', true),
('logo', 4, 'Quelle entreprise a un logo avec un A et une flèche en dessous ?', 'Amazon', ARRAY['Alibaba', 'eBay', 'Walmart'], 'fr', true);

-- =====================================================
-- QUESTIONS SUPPLÉMENTAIRES
-- =====================================================

-- Culture Générale (suite)
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active) VALUES
('culture_generale', 1, 'Quel animal est le roi de la jungle ?', 'Lion', ARRAY['Tigre', 'Éléphant', 'Gorille'], 'fr', true),
('culture_generale', 1, 'De quelle couleur est une banane mûre ?', 'Jaune', ARRAY['Verte', 'Rouge', 'Orange'], 'fr', true),
('culture_generale', 2, 'Combien de pattes a une araignée ?', '8', ARRAY['6', '10', '4'], 'fr', true),
('culture_generale', 2, 'Quel est le plus grand mammifère du monde ?', 'Baleine bleue', ARRAY['Éléphant', 'Girafe', 'Requin'], 'fr', true),
('culture_generale', 3, 'Quelle est la capitale du Portugal ?', 'Lisbonne', ARRAY['Madrid', 'Porto', 'Barcelone'], 'fr', true),
('culture_generale', 3, 'Combien de faces a un cube ?', '6', ARRAY['4', '8', '12'], 'fr', true),
('culture_generale', 4, 'Quel est le plus grand désert chaud du monde ?', 'Sahara', ARRAY['Gobi', 'Kalahari', 'Mojave'], 'fr', true),
('culture_generale', 4, 'Quelle est la planète la plus chaude du système solaire ?', 'Vénus', ARRAY['Mercure', 'Mars', 'Jupiter'], 'fr', true),
('culture_generale', 5, 'En quelle année est tombé l''Empire romain d''Occident ?', '476', ARRAY['395', '410', '510'], 'fr', true),
('culture_generale', 5, 'Quel philosophe a écrit "Le Contrat Social" ?', 'Jean-Jacques Rousseau', ARRAY['Voltaire', 'Montesquieu', 'Diderot'], 'fr', true);

-- Histoire (suite)
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active) VALUES
('histoire', 1, 'Comment s''appelait le grand bateau qui a coulé en 1912 ?', 'Titanic', ARRAY['Olympic', 'Britannic', 'Lusitania'], 'fr', true),
('histoire', 1, 'Quel président américain a aboli l''esclavage ?', 'Abraham Lincoln', ARRAY['George Washington', 'Thomas Jefferson', 'Theodore Roosevelt'], 'fr', true),
('histoire', 2, 'Quelle reine d''Angleterre a régné le plus longtemps ?', 'Élisabeth II', ARRAY['Victoria', 'Élisabeth Ire', 'Marie Ire'], 'fr', true),
('histoire', 2, 'En quelle année a eu lieu la bataille de Marignan ?', '1515', ARRAY['1492', '1530', '1450'], 'fr', true),
('histoire', 3, 'Qui était le premier empereur de Chine ?', 'Qin Shi Huang', ARRAY['Confucius', 'Sun Tzu', 'Liu Bang'], 'fr', true),
('histoire', 3, 'Quelle guerre a duré de 1337 à 1453 ?', 'Guerre de Cent Ans', ARRAY['Guerre de Trente Ans', 'Guerre des Roses', 'Guerre de Sept Ans'], 'fr', true),
('histoire', 4, 'Quel empire a construit le Colisée ?', 'Empire romain', ARRAY['Empire grec', 'Empire byzantin', 'Empire perse'], 'fr', true),
('histoire', 4, 'En quelle année a été signée la Déclaration des droits de l''homme ?', '1789', ARRAY['1776', '1791', '1804'], 'fr', true),
('histoire', 5, 'Quel pharaon est représenté par le Sphinx de Gizeh ?', 'Khéphren', ARRAY['Khéops', 'Mykérinos', 'Toutânkhamon'], 'fr', true),
('histoire', 5, 'Quelle civilisation a inventé l''écriture cunéiforme ?', 'Sumérienne', ARRAY['Égyptienne', 'Babylonienne', 'Phénicienne'], 'fr', true);

-- Géographie (suite)
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active) VALUES
('geographie', 1, 'Quel pays a la forme d''une botte ?', 'Italie', ARRAY['France', 'Espagne', 'Grèce'], 'fr', true),
('geographie', 1, 'Quelle est la capitale du Royaume-Uni ?', 'Londres', ARRAY['Paris', 'Berlin', 'Dublin'], 'fr', true),
('geographie', 2, 'Quel est le plus long fleuve d''Europe ?', 'Volga', ARRAY['Danube', 'Rhin', 'Loire'], 'fr', true),
('geographie', 2, 'Dans quel pays se trouve le mont Fuji ?', 'Japon', ARRAY['Chine', 'Corée du Sud', 'Népal'], 'fr', true),
('geographie', 3, 'Quelle est la capitale de l''Argentine ?', 'Buenos Aires', ARRAY['Santiago', 'Lima', 'Montevideo'], 'fr', true),
('geographie', 3, 'Quel détroit sépare l''Europe de l''Afrique ?', 'Gibraltar', ARRAY['Bosphore', 'Béring', 'Magellan'], 'fr', true),
('geographie', 4, 'Quel est le plus petit continent ?', 'Océanie', ARRAY['Europe', 'Antarctique', 'Amérique du Sud'], 'fr', true),
('geographie', 4, 'Quelle est la capitale de la Mongolie ?', 'Oulan-Bator', ARRAY['Pékin', 'Almaty', 'Irkoutsk'], 'fr', true),
('geographie', 5, 'Quel pays possède le plus de fuseaux horaires ?', 'France', ARRAY['Russie', 'États-Unis', 'Chine'], 'fr', true),
('geographie', 5, 'Quelle île est la plus grande du monde ?', 'Groenland', ARRAY['Madagascar', 'Bornéo', 'Nouvelle-Guinée'], 'fr', true);

-- Sciences (suite)
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active) VALUES
('sciences', 1, 'Quel est le métal le plus commun sur Terre ?', 'Fer', ARRAY['Aluminium', 'Cuivre', 'Or'], 'fr', true),
('sciences', 1, 'Combien de couleurs a un arc-en-ciel ?', '7', ARRAY['5', '6', '8'], 'fr', true),
('sciences', 2, 'Quel animal pond des œufs et allaite ses petits ?', 'Ornithorynque', ARRAY['Crocodile', 'Dauphin', 'Chauve-souris'], 'fr', true),
('sciences', 2, 'Quel est le seul métal liquide à température ambiante ?', 'Mercure', ARRAY['Plomb', 'Étain', 'Gallium'], 'fr', true),
('sciences', 3, 'Quelle est la vitesse du son dans l''air ?', '340 m/s', ARRAY['300 m/s', '400 m/s', '500 m/s'], 'fr', true),
('sciences', 3, 'Quel gaz les plantes absorbent-elles ?', 'Dioxyde de carbone', ARRAY['Oxygène', 'Azote', 'Hydrogène'], 'fr', true),
('sciences', 4, 'Quelle particule a une charge négative ?', 'Électron', ARRAY['Proton', 'Neutron', 'Quark'], 'fr', true),
('sciences', 4, 'Combien de groupes sanguins principaux existe-t-il ?', '4', ARRAY['3', '5', '6'], 'fr', true),
('sciences', 5, 'Quelle est la masse approximative du Soleil par rapport à la Terre ?', '333 000 fois', ARRAY['100 000 fois', '500 000 fois', '1 million de fois'], 'fr', true),
('sciences', 5, 'Quel élément a le numéro atomique 1 ?', 'Hydrogène', ARRAY['Hélium', 'Lithium', 'Carbone'], 'fr', true);

-- Sport (suite)
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active) VALUES
('sport', 1, 'Dans quel sport lance-t-on une balle orange dans un panier ?', 'Basketball', ARRAY['Volleyball', 'Handball', 'Football'], 'fr', true),
('sport', 1, 'Combien de trous y a-t-il sur un parcours de golf standard ?', '18', ARRAY['9', '12', '21'], 'fr', true),
('sport', 2, 'Quel pays a inventé le judo ?', 'Japon', ARRAY['Chine', 'Corée', 'Vietnam'], 'fr', true),
('sport', 2, 'Combien de temps dure un mi-temps au football ?', '45 minutes', ARRAY['30 minutes', '40 minutes', '50 minutes'], 'fr', true),
('sport', 3, 'Quel sport se joue à Roland-Garros ?', 'Tennis', ARRAY['Golf', 'Rugby', 'Cricket'], 'fr', true),
('sport', 3, 'Quelle équipe de NBA a remporté le plus de titres ?', 'Boston Celtics', ARRAY['Los Angeles Lakers', 'Chicago Bulls', 'Golden State Warriors'], 'fr', true),
('sport', 4, 'Quel boxeur est surnommé "The Greatest" ?', 'Muhammad Ali', ARRAY['Mike Tyson', 'Floyd Mayweather', 'George Foreman'], 'fr', true),
('sport', 4, 'En quelle année les Jeux Olympiques modernes ont-ils été créés ?', '1896', ARRAY['1900', '1888', '1904'], 'fr', true),
('sport', 5, 'Quel pilote F1 a le plus de titres mondiaux ?', 'Michael Schumacher / Lewis Hamilton', ARRAY['Ayrton Senna', 'Sebastian Vettel', 'Alain Prost'], 'fr', true),
('sport', 5, 'Quelle équipe a remporté la première Coupe du monde de football ?', 'Uruguay', ARRAY['Brésil', 'Argentine', 'Italie'], 'fr', true);

-- Pop Culture (suite)
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active) VALUES
('pop_culture', 1, 'Quel personnage vit dans un ananas sous la mer ?', 'Bob l''éponge', ARRAY['Patrick', 'Carlo', 'Sandy'], 'fr', true),
('pop_culture', 1, 'Comment s''appelle le bonhomme de neige dans La Reine des Neiges ?', 'Olaf', ARRAY['Sven', 'Kristoff', 'Hans'], 'fr', true),
('pop_culture', 2, 'Quel groupe a chanté "Thriller" ?', 'Michael Jackson', ARRAY['Prince', 'Madonna', 'Whitney Houston'], 'fr', true),
('pop_culture', 2, 'Dans quel film y a-t-il des minions jaunes ?', 'Moi, Moche et Méchant', ARRAY['Shrek', 'Zootopia', 'Les Indestructibles'], 'fr', true),
('pop_culture', 3, 'Qui joue le rôle de Sherlock Holmes dans la série BBC ?', 'Benedict Cumberbatch', ARRAY['Robert Downey Jr.', 'Jonny Lee Miller', 'Henry Cavill'], 'fr', true),
('pop_culture', 3, 'Quel rappeur a sorti l''album "Scorpion" ?', 'Drake', ARRAY['Kendrick Lamar', 'Travis Scott', 'Post Malone'], 'fr', true),
('pop_culture', 4, 'Quel film Disney a une chanson appelée "Libérée, Délivrée" ?', 'La Reine des Neiges', ARRAY['Raiponce', 'Vaiana', 'Encanto'], 'fr', true),
('pop_culture', 4, 'Qui a créé les personnages de Marvel ?', 'Stan Lee', ARRAY['Walt Disney', 'Jack Kirby', 'Bob Kane'], 'fr', true),
('pop_culture', 5, 'Quel acteur joue dans "Interstellar" et "The Dark Knight" ?', 'Matthew McConaughey / Christian Bale', ARRAY['Leonardo DiCaprio', 'Tom Hardy', 'Jake Gyllenhaal'], 'fr', true),
('pop_culture', 5, 'Quelle série est basée sur les livres de George R.R. Martin ?', 'Game of Thrones', ARRAY['The Witcher', 'Lord of the Rings', 'Wheel of Time'], 'fr', true);

-- Jeux Vidéo (suite)
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active) VALUES
('jeux_video', 1, 'Quel personnage mange des fantômes après avoir mangé une super pastille ?', 'Pac-Man', ARRAY['Mario', 'Sonic', 'Kirby'], 'fr', true),
('jeux_video', 1, 'Quel jeu permet de capturer des créatures dans des Pokéballs ?', 'Pokémon', ARRAY['Digimon', 'Yu-Gi-Oh', 'Monster Hunter'], 'fr', true),
('jeux_video', 2, 'Quel est le nom du plombier vert, frère de Mario ?', 'Luigi', ARRAY['Wario', 'Waluigi', 'Toad'], 'fr', true),
('jeux_video', 2, 'Dans quel jeu construit-on et défend-on contre des zombies ?', 'Plants vs Zombies', ARRAY['Left 4 Dead', 'Resident Evil', 'Dead Rising'], 'fr', true),
('jeux_video', 3, 'Quel jeu met en scène un chasseur de monstres nommé Geralt ?', 'The Witcher', ARRAY['God of War', 'Dark Souls', 'Skyrim'], 'fr', true),
('jeux_video', 3, 'Quelle console portable Nintendo a deux écrans ?', 'Nintendo DS', ARRAY['Game Boy', 'PSP', 'Switch Lite'], 'fr', true),
('jeux_video', 4, 'Quel jeu de Blizzard met en scène des héros comme Tracer et Reinhardt ?', 'Overwatch', ARRAY['World of Warcraft', 'StarCraft', 'Diablo'], 'fr', true),
('jeux_video', 4, 'En quelle année est sorti le premier Minecraft ?', '2011', ARRAY['2009', '2013', '2015'], 'fr', true),
('jeux_video', 5, 'Quel jeu a introduit le concept de "Battle Royale" sur mobile ?', 'PUBG Mobile', ARRAY['Fortnite', 'Free Fire', 'Call of Duty Mobile'], 'fr', true),
('jeux_video', 5, 'Quel studio japonais a créé Final Fantasy ?', 'Square Enix', ARRAY['Capcom', 'Konami', 'Bandai Namco'], 'fr', true);

-- Cinéma (suite)
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active) VALUES
('cinema', 1, 'Quel animal est Simba ?', 'Lion', ARRAY['Tigre', 'Panthère', 'Guépard'], 'fr', true),
('cinema', 1, 'Comment s''appelle le robot jaune dans Star Wars ?', 'C-3PO', ARRAY['R2-D2', 'BB-8', 'K-2SO'], 'fr', true),
('cinema', 2, 'Quel acteur joue Indiana Jones ?', 'Harrison Ford', ARRAY['Tom Hanks', 'Mel Gibson', 'Russell Crowe'], 'fr', true),
('cinema', 2, 'Dans quel film peut-on voir la phrase "Je suis ton père" ?', 'Star Wars', ARRAY['Le Seigneur des Anneaux', 'Harry Potter', 'Matrix'], 'fr', true),
('cinema', 3, 'Qui réalise les films "Kill Bill" ?', 'Quentin Tarantino', ARRAY['Martin Scorsese', 'David Fincher', 'Christopher Nolan'], 'fr', true),
('cinema', 3, 'Quel film a pour héros un ogre vert ?', 'Shrek', ARRAY['Monstres et Cie', 'L''Âge de Glace', 'Madagascar'], 'fr', true),
('cinema', 4, 'Quel acteur joue le Joker dans "Joker" (2019) ?', 'Joaquin Phoenix', ARRAY['Heath Ledger', 'Jared Leto', 'Jack Nicholson'], 'fr', true),
('cinema', 4, 'Quel film de Pixar parle d''émotions colorées ?', 'Vice-Versa', ARRAY['Soul', 'Coco', 'Luca'], 'fr', true),
('cinema', 5, 'Quel réalisateur a fait "2001 : L''Odyssée de l''espace" ?', 'Stanley Kubrick', ARRAY['Steven Spielberg', 'Ridley Scott', 'James Cameron'], 'fr', true),
('cinema', 5, 'Quel film a remporté l''Oscar du meilleur film en 1994 ?', 'Forrest Gump', ARRAY['Pulp Fiction', 'Les Évadés', 'Le Roi Lion'], 'fr', true);

-- Musique (suite)
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active) VALUES
('musique', 1, 'Quel instrument a des touches noires et blanches ?', 'Piano', ARRAY['Guitare', 'Violon', 'Flûte'], 'fr', true),
('musique', 1, 'Qui chante "Blinding Lights" ?', 'The Weeknd', ARRAY['Bruno Mars', 'Justin Bieber', 'Post Malone'], 'fr', true),
('musique', 2, 'Quel groupe a chanté "Smells Like Teen Spirit" ?', 'Nirvana', ARRAY['Pearl Jam', 'Soundgarden', 'Alice in Chains'], 'fr', true),
('musique', 2, 'Quelle chanteuse est connue pour "Rolling in the Deep" ?', 'Adele', ARRAY['Amy Winehouse', 'Rihanna', 'Beyoncé'], 'fr', true),
('musique', 3, 'Quel musicien classique était sourd ?', 'Beethoven', ARRAY['Mozart', 'Bach', 'Chopin'], 'fr', true),
('musique', 3, 'Quel groupe britannique a vendu le plus d''albums ?', 'The Beatles', ARRAY['Queen', 'Pink Floyd', 'Led Zeppelin'], 'fr', true),
('musique', 4, 'En quelle année est mort Elvis Presley ?', '1977', ARRAY['1975', '1980', '1982'], 'fr', true),
('musique', 4, 'Quel rappeur français a sorti "Booba 92i" ?', 'Booba', ARRAY['Kaaris', 'Rohff', 'Lacrim'], 'fr', true),
('musique', 5, 'Quel opéra de Mozart parle d''un séducteur espagnol ?', 'Don Giovanni', ARRAY['Le Nozze di Figaro', 'La Flûte Enchantée', 'Così fan tutte'], 'fr', true),
('musique', 5, 'Quelle chanteuse a le plus de Grammy Awards ?', 'Beyoncé', ARRAY['Taylor Swift', 'Adele', 'Alicia Keys'], 'fr', true);

-- Technologie (suite)
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active) VALUES
('technologie', 1, 'Quel appareil permet de prendre des photos avec un téléphone ?', 'Appareil photo', ARRAY['GPS', 'Bluetooth', 'NFC'], 'fr', true),
('technologie', 1, 'Comment appelle-t-on un programme malveillant ?', 'Virus', ARRAY['Application', 'Logiciel', 'Système'], 'fr', true),
('technologie', 2, 'Quelle entreprise a créé le système Android ?', 'Google', ARRAY['Apple', 'Microsoft', 'Samsung'], 'fr', true),
('technologie', 2, 'Qu''est-ce qu''un selfie ?', 'Photo de soi-même', ARRAY['Message vocal', 'Vidéo courte', 'GIF animé'], 'fr', true),
('technologie', 3, 'Quel site permet de partager des vidéos courtes ?', 'TikTok', ARRAY['Facebook', 'Twitter', 'LinkedIn'], 'fr', true),
('technologie', 3, 'Qui a fondé SpaceX ?', 'Elon Musk', ARRAY['Jeff Bezos', 'Richard Branson', 'Bill Gates'], 'fr', true),
('technologie', 4, 'Qu''est-ce qu''une API ?', 'Interface de programmation', ARRAY['Un type de virus', 'Un réseau social', 'Un langage de programmation'], 'fr', true),
('technologie', 4, 'En quelle année a été créé Google ?', '1998', ARRAY['1995', '2000', '2004'], 'fr', true),
('technologie', 5, 'Qu''est-ce que le machine learning ?', 'Apprentissage automatique', ARRAY['Un type de hardware', 'Un langage de programmation', 'Un système d''exploitation'], 'fr', true),
('technologie', 5, 'Quel protocole sécurise les connexions web ?', 'HTTPS', ARRAY['HTTP', 'FTP', 'SMTP'], 'fr', true);

-- Logo (suite)
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active) VALUES
('logo', 1, 'Quelle marque de jouets a des briques colorées ?', 'LEGO', ARRAY['Playmobil', 'Hasbro', 'Mattel'], 'fr', true),
('logo', 1, 'Quelle marque de chips a un logo avec un personnage moustachu ?', 'Pringles', ARRAY['Lay''s', 'Doritos', 'Ruffles'], 'fr', true),
('logo', 2, 'Quelle marque de voiture a un logo bleu et blanc en hélice ?', 'BMW', ARRAY['Mercedes', 'Audi', 'Volkswagen'], 'fr', true),
('logo', 2, 'Quelle marque de téléphone a un logo en forme de fruit mordu ?', 'Apple', ARRAY['Samsung', 'Huawei', 'Xiaomi'], 'fr', true),
('logo', 3, 'Quelle marque de luxe a un logo avec un cavalier ?', 'Hermès', ARRAY['Gucci', 'Prada', 'Burberry'], 'fr', true),
('logo', 3, 'Quelle marque automobile a un logo en forme de losange ?', 'Renault', ARRAY['Peugeot', 'Citroën', 'Fiat'], 'fr', true),
('logo', 4, 'Quelle entreprise tech a un logo en forme de fenêtre ?', 'Microsoft', ARRAY['Google', 'Apple', 'IBM'], 'fr', true),
('logo', 4, 'Quelle marque de montres suisses a une couronne dans son logo ?', 'Rolex', ARRAY['Omega', 'Tag Heuer', 'Patek Philippe'], 'fr', true),
('logo', 5, 'Quelle compagnie aérienne a un logo avec un kangourou ?', 'Qantas', ARRAY['Emirates', 'Singapore Airlines', 'Air New Zealand'], 'fr', true),
('logo', 5, 'Quelle marque de voiture électrique a un logo en forme de T stylisé ?', 'Tesla', ARRAY['Rivian', 'Lucid', 'Polestar'], 'fr', true);

-- =====================================================
-- QUESTIONS AVEC IMAGES
-- =====================================================

-- Drapeaux (Géographie)
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active, image_url) VALUES
('geographie', 1, 'À quel pays appartient ce drapeau ?', 'France', ARRAY['Belgique', 'Italie', 'Pays-Bas'], 'fr', true, 'https://flagcdn.com/w320/fr.png'),
('geographie', 1, 'À quel pays appartient ce drapeau ?', 'Allemagne', ARRAY['Belgique', 'Autriche', 'Suisse'], 'fr', true, 'https://flagcdn.com/w320/de.png'),
('geographie', 1, 'À quel pays appartient ce drapeau ?', 'Italie', ARRAY['Mexique', 'Irlande', 'Côte d''Ivoire'], 'fr', true, 'https://flagcdn.com/w320/it.png'),
('geographie', 1, 'À quel pays appartient ce drapeau ?', 'Espagne', ARRAY['Portugal', 'Andorre', 'Monaco'], 'fr', true, 'https://flagcdn.com/w320/es.png'),
('geographie', 1, 'À quel pays appartient ce drapeau ?', 'Royaume-Uni', ARRAY['Australie', 'Nouvelle-Zélande', 'Fidji'], 'fr', true, 'https://flagcdn.com/w320/gb.png'),
('geographie', 2, 'À quel pays appartient ce drapeau ?', 'Japon', ARRAY['Corée du Sud', 'Chine', 'Vietnam'], 'fr', true, 'https://flagcdn.com/w320/jp.png'),
('geographie', 2, 'À quel pays appartient ce drapeau ?', 'Brésil', ARRAY['Argentine', 'Colombie', 'Venezuela'], 'fr', true, 'https://flagcdn.com/w320/br.png'),
('geographie', 2, 'À quel pays appartient ce drapeau ?', 'Canada', ARRAY['États-Unis', 'Australie', 'Nouvelle-Zélande'], 'fr', true, 'https://flagcdn.com/w320/ca.png'),
('geographie', 2, 'À quel pays appartient ce drapeau ?', 'Australie', ARRAY['Nouvelle-Zélande', 'Royaume-Uni', 'Fidji'], 'fr', true, 'https://flagcdn.com/w320/au.png'),
('geographie', 2, 'À quel pays appartient ce drapeau ?', 'Mexique', ARRAY['Italie', 'Irlande', 'Hongrie'], 'fr', true, 'https://flagcdn.com/w320/mx.png'),
('geographie', 3, 'À quel pays appartient ce drapeau ?', 'Suède', ARRAY['Finlande', 'Norvège', 'Danemark'], 'fr', true, 'https://flagcdn.com/w320/se.png'),
('geographie', 3, 'À quel pays appartient ce drapeau ?', 'Norvège', ARRAY['Islande', 'Danemark', 'Finlande'], 'fr', true, 'https://flagcdn.com/w320/no.png'),
('geographie', 3, 'À quel pays appartient ce drapeau ?', 'Grèce', ARRAY['Israël', 'Uruguay', 'Argentine'], 'fr', true, 'https://flagcdn.com/w320/gr.png'),
('geographie', 3, 'À quel pays appartient ce drapeau ?', 'Turquie', ARRAY['Tunisie', 'Algérie', 'Pakistan'], 'fr', true, 'https://flagcdn.com/w320/tr.png'),
('geographie', 3, 'À quel pays appartient ce drapeau ?', 'Inde', ARRAY['Niger', 'Irlande', 'Côte d''Ivoire'], 'fr', true, 'https://flagcdn.com/w320/in.png'),
('geographie', 4, 'À quel pays appartient ce drapeau ?', 'Indonésie', ARRAY['Monaco', 'Pologne', 'Singapour'], 'fr', true, 'https://flagcdn.com/w320/id.png'),
('geographie', 4, 'À quel pays appartient ce drapeau ?', 'Afrique du Sud', ARRAY['Lesotho', 'Namibie', 'Zimbabwe'], 'fr', true, 'https://flagcdn.com/w320/za.png'),
('geographie', 4, 'À quel pays appartient ce drapeau ?', 'Corée du Sud', ARRAY['Japon', 'Taïwan', 'Vietnam'], 'fr', true, 'https://flagcdn.com/w320/kr.png'),
('geographie', 4, 'À quel pays appartient ce drapeau ?', 'Argentine', ARRAY['Uruguay', 'Guatemala', 'Honduras'], 'fr', true, 'https://flagcdn.com/w320/ar.png'),
('geographie', 5, 'À quel pays appartient ce drapeau ?', 'Kazakhstan', ARRAY['Ouzbékistan', 'Turkménistan', 'Kirghizistan'], 'fr', true, 'https://flagcdn.com/w320/kz.png'),
('geographie', 5, 'À quel pays appartient ce drapeau ?', 'Bhoutan', ARRAY['Népal', 'Sri Lanka', 'Bangladesh'], 'fr', true, 'https://flagcdn.com/w320/bt.png'),
('geographie', 5, 'À quel pays appartient ce drapeau ?', 'Népal', ARRAY['Bhoutan', 'Tibet', 'Bangladesh'], 'fr', true, 'https://flagcdn.com/w320/np.png'),
('geographie', 5, 'À quel pays appartient ce drapeau ?', 'Mozambique', ARRAY['Angola', 'Zambie', 'Zimbabwe'], 'fr', true, 'https://flagcdn.com/w320/mz.png');

-- Logos célèbres
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active, image_url) VALUES
('logo', 1, 'Quelle marque est représentée par ce logo ?', 'Apple', ARRAY['Samsung', 'Huawei', 'Xiaomi'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/200px-Apple_logo_black.svg.png'),
('logo', 1, 'Quelle marque est représentée par ce logo ?', 'Nike', ARRAY['Adidas', 'Puma', 'Reebok'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/200px-Logo_NIKE.svg.png'),
('logo', 1, 'Quelle marque est représentée par ce logo ?', 'McDonald''s', ARRAY['Burger King', 'KFC', 'Wendy''s'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/200px-McDonald%27s_Golden_Arches.svg.png'),
('logo', 2, 'Quelle marque est représentée par ce logo ?', 'Adidas', ARRAY['Nike', 'Puma', 'Under Armour'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/200px-Adidas_Logo.svg.png'),
('logo', 2, 'Quelle marque est représentée par ce logo ?', 'Mercedes-Benz', ARRAY['BMW', 'Audi', 'Volkswagen'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/200px-Mercedes-Logo.svg.png'),
('logo', 2, 'Quelle marque est représentée par ce logo ?', 'BMW', ARRAY['Mercedes', 'Audi', 'Volkswagen'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/200px-BMW.svg.png'),
('logo', 2, 'Quelle marque est représentée par ce logo ?', 'Audi', ARRAY['BMW', 'Mercedes', 'Volkswagen'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi-Logo_2016.svg/200px-Audi-Logo_2016.svg.png'),
('logo', 3, 'Quelle marque est représentée par ce logo ?', 'Starbucks', ARRAY['Costa Coffee', 'Dunkin', 'Peet''s Coffee'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/200px-Starbucks_Corporation_Logo_2011.svg.png'),
('logo', 3, 'Quelle marque est représentée par ce logo ?', 'Ferrari', ARRAY['Lamborghini', 'Porsche', 'Maserati'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d1/Ferrari-Logo.svg/200px-Ferrari-Logo.svg.png'),
('logo', 3, 'Quelle marque est représentée par ce logo ?', 'Lamborghini', ARRAY['Ferrari', 'Porsche', 'Bugatti'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Lamborghini_Logo.svg/200px-Lamborghini_Logo.svg.png'),
('logo', 3, 'Quelle marque est représentée par ce logo ?', 'Porsche', ARRAY['Ferrari', 'Lamborghini', 'Aston Martin'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Porsche_logo.svg/200px-Porsche_logo.svg.png'),
('logo', 4, 'Quelle marque est représentée par ce logo ?', 'Chanel', ARRAY['Gucci', 'Louis Vuitton', 'Dior'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Chanel_logo-no_words.svg/200px-Chanel_logo-no_words.svg.png'),
('logo', 4, 'Quelle marque est représentée par ce logo ?', 'Rolex', ARRAY['Omega', 'Tag Heuer', 'Cartier'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/en/thumb/9/95/Rolex_logo.svg/200px-Rolex_logo.svg.png'),
('logo', 4, 'Quelle marque est représentée par ce logo ?', 'Lacoste', ARRAY['Ralph Lauren', 'Tommy Hilfiger', 'Hugo Boss'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/en/thumb/2/22/Lacoste_logo.svg/200px-Lacoste_logo.svg.png'),
('logo', 5, 'Quelle marque est représentée par ce logo ?', 'Bentley', ARRAY['Rolls-Royce', 'Aston Martin', 'Jaguar'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Bentley_logo.svg/200px-Bentley_logo.svg.png'),
('logo', 5, 'Quelle marque est représentée par ce logo ?', 'Maserati', ARRAY['Ferrari', 'Alfa Romeo', 'Lancia'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/Maserati_logo.svg/200px-Maserati_logo.svg.png');

-- Monuments et lieux (Géographie avec images)
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active, image_url) VALUES
('geographie', 1, 'Dans quelle ville se trouve ce monument ?', 'Paris', ARRAY['Londres', 'Rome', 'New York'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/200px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg'),
('geographie', 2, 'Dans quel pays se trouve ce monument ?', 'Italie', ARRAY['France', 'Grèce', 'Espagne'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/300px-Colosseo_2020.jpg'),
('geographie', 2, 'Dans quelle ville se trouve ce monument ?', 'New York', ARRAY['Paris', 'Londres', 'Sydney'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Statue_of_Liberty_7.jpg/200px-Statue_of_Liberty_7.jpg'),
('geographie', 3, 'Dans quel pays se trouve ce monument ?', 'Inde', ARRAY['Pakistan', 'Bangladesh', 'Iran'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Taj_Mahal%2C_Agra%2C_India_edit3.jpg/300px-Taj_Mahal%2C_Agra%2C_India_edit3.jpg'),
('geographie', 3, 'Dans quel pays se trouve ce monument ?', 'Chine', ARRAY['Japon', 'Corée', 'Mongolie'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/300px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg'),
('geographie', 3, 'Dans quel pays se trouve ce monument ?', 'Brésil', ARRAY['Argentine', 'Portugal', 'Mexique'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Christ_the_Redeemer_-_Cristo_Redentor.jpg/200px-Christ_the_Redeemer_-_Cristo_Redentor.jpg'),
('geographie', 4, 'Dans quel pays se trouve ce monument ?', 'Australie', ARRAY['Nouvelle-Zélande', 'Singapour', 'Malaisie'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Sydney_Opera_House_Sails.jpg/300px-Sydney_Opera_House_Sails.jpg'),
('geographie', 4, 'Dans quel pays se trouve ce monument ?', 'Égypte', ARRAY['Soudan', 'Libye', 'Jordanie'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kheops-Pyramid.jpg/300px-Kheops-Pyramid.jpg'),
('geographie', 5, 'Dans quel pays se trouve ce monument ?', 'Pérou', ARRAY['Bolivie', 'Équateur', 'Colombie'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Machu_Picchu%2C_Peru.jpg/300px-Machu_Picchu%2C_Peru.jpg'),
('geographie', 5, 'Dans quel pays se trouve ce site ?', 'Jordanie', ARRAY['Égypte', 'Israël', 'Syrie'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/The_Monastery%2C_Petra%2C_Jordan.jpg/200px-The_Monastery%2C_Petra%2C_Jordan.jpg');

-- Personnages célèbres (Pop Culture / Histoire)
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active, image_url) VALUES
('histoire', 2, 'Qui est ce personnage historique ?', 'Napoléon Bonaparte', ARRAY['Louis XIV', 'Charlemagne', 'Jules César'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg/200px-Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg'),
('histoire', 3, 'Qui est ce personnage historique ?', 'Albert Einstein', ARRAY['Isaac Newton', 'Nikola Tesla', 'Thomas Edison'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/200px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg'),
('histoire', 3, 'Qui est ce personnage historique ?', 'Marie Curie', ARRAY['Ada Lovelace', 'Florence Nightingale', 'Rosalind Franklin'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Marie_Curie_c1920.jpg/200px-Marie_Curie_c1920.jpg'),
('histoire', 4, 'Qui est ce personnage historique ?', 'Winston Churchill', ARRAY['Charles de Gaulle', 'Franklin Roosevelt', 'Joseph Staline'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Sir_Winston_Churchill_-_19086236948.jpg/200px-Sir_Winston_Churchill_-_19086236948.jpg'),
('pop_culture', 2, 'Qui est cet acteur ?', 'Leonardo DiCaprio', ARRAY['Brad Pitt', 'Tom Cruise', 'Matt Damon'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Leonardo_Dicaprio_Cannes_2019.jpg/200px-Leonardo_Dicaprio_Cannes_2019.jpg'),
('pop_culture', 2, 'Qui est cette chanteuse ?', 'Taylor Swift', ARRAY['Ariana Grande', 'Selena Gomez', 'Demi Lovato'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/191125_Taylor_Swift_at_the_2019_American_Music_Awards_%28cropped%29.png/200px-191125_Taylor_Swift_at_the_2019_American_Music_Awards_%28cropped%29.png'),
('sport', 2, 'Qui est ce footballeur ?', 'Lionel Messi', ARRAY['Cristiano Ronaldo', 'Neymar', 'Kylian Mbappé'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Lionel_Messi_20180626.jpg/200px-Lionel_Messi_20180626.jpg'),
('sport', 2, 'Qui est ce footballeur ?', 'Cristiano Ronaldo', ARRAY['Lionel Messi', 'Neymar', 'Robert Lewandowski'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cristiano_Ronaldo_2018.jpg/200px-Cristiano_Ronaldo_2018.jpg'),
('sport', 3, 'Qui est ce sportif ?', 'Michael Jordan', ARRAY['LeBron James', 'Kobe Bryant', 'Shaquille O''Neal'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Michael_Jordan_in_2014.jpg/200px-Michael_Jordan_in_2014.jpg'),
('sport', 3, 'Qui est ce tennisman ?', 'Roger Federer', ARRAY['Rafael Nadal', 'Novak Djokovic', 'Andy Murray'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/R_federer.jpg/200px-R_federer.jpg');

-- Jeux vidéo avec images
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active, image_url) VALUES
('jeux_video', 1, 'Quel est ce personnage de jeu vidéo ?', 'Mario', ARRAY['Luigi', 'Wario', 'Toad'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/MarioNSMBUDeluxe.png/200px-MarioNSMBUDeluxe.png'),
('jeux_video', 1, 'Quel est ce personnage de jeu vidéo ?', 'Sonic', ARRAY['Knuckles', 'Tails', 'Shadow'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Sonic_Art_Assets_DVD_-_Sonic_The_Hedgehog_-_1.png/200px-Sonic_Art_Assets_DVD_-_Sonic_The_Hedgehog_-_1.png'),
('jeux_video', 2, 'Quel est ce personnage de jeu vidéo ?', 'Pikachu', ARRAY['Raichu', 'Pichu', 'Mimiqui'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a6/Pok%C3%A9mon_Pikachu_art.png/200px-Pok%C3%A9mon_Pikachu_art.png'),
('jeux_video', 2, 'Quel est ce personnage de jeu vidéo ?', 'Link', ARRAY['Zelda', 'Ganondorf', 'Epona'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/en/thumb/3/39/Link_from_The_Legend_of_Zelda_Tears_of_the_Kingdom_key_art.png/200px-Link_from_The_Legend_of_Zelda_Tears_of_the_Kingdom_key_art.png'),
('jeux_video', 3, 'De quel jeu vient ce personnage ?', 'Minecraft', ARRAY['Roblox', 'Terraria', 'Fortnite'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Steve_%28Minecraft%29.png/200px-Steve_%28Minecraft%29.png'),
('jeux_video', 3, 'Quel est ce personnage de jeu vidéo ?', 'Kratos', ARRAY['Dante', 'Geralt', 'Joel'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/en/thumb/2/22/Kratos_%28God_of_War_2018%29.png/200px-Kratos_%28God_of_War_2018%29.png');

-- Sciences avec images
INSERT INTO questions (category, difficulty, question_text, correct_answer, wrong_answers, language, is_active, image_url) VALUES
('sciences', 1, 'Quelle est cette planète ?', 'Saturne', ARRAY['Jupiter', 'Uranus', 'Neptune'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/300px-Saturn_during_Equinox.jpg'),
('sciences', 1, 'Quelle est cette planète ?', 'Mars', ARRAY['Mercure', 'Vénus', 'Jupiter'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/200px-OSIRIS_Mars_true_color.jpg'),
('sciences', 2, 'Quelle est cette planète ?', 'Jupiter', ARRAY['Saturne', 'Neptune', 'Uranus'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Jupiter_and_its_shrunken_Great_Red_Spot.jpg/200px-Jupiter_and_its_shrunken_Great_Red_Spot.jpg'),
('sciences', 2, 'Quel est cet animal ?', 'Dauphin', ARRAY['Baleine', 'Orque', 'Requin'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Tursiops_truncatus_01.jpg/300px-Tursiops_truncatus_01.jpg'),
('sciences', 3, 'Quel est cet organe ?', 'Cœur', ARRAY['Poumon', 'Foie', 'Rein'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Diagram_of_the_human_heart_%28cropped%29.svg/200px-Diagram_of_the_human_heart_%28cropped%29.svg.png'),
('sciences', 3, 'Quel est cet animal ?', 'Méduse', ARRAY['Pieuvre', 'Anémone', 'Étoile de mer'], 'fr', true, 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Jelly_cc11.jpg/200px-Jelly_cc11.jpg');

-- Update min_age for questions based on difficulty
UPDATE questions SET min_age = 6 WHERE difficulty = 1;
UPDATE questions SET min_age = 8 WHERE difficulty = 2;
UPDATE questions SET min_age = 12 WHERE difficulty = 3;
UPDATE questions SET min_age = 14 WHERE difficulty = 4;
UPDATE questions SET min_age = 16 WHERE difficulty = 5;
