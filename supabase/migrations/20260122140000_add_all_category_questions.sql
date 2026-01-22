-- Migration: Add questions for all categories
-- Format: "Qui est-ce?" style quiz questions

-- HISTORY QUESTIONS
INSERT INTO questions (question_text, player_name, options, category, is_active, correct_answer, wrong_answers, difficulty) VALUES
(
  'Empereur français qui a conquis une grande partie de l''Europe au début du 19ème siècle. Il a été exilé sur l''île d''Elbe puis Sainte-Hélène.',
  'Napoléon Bonaparte',
  '{"A": "Louis XIV", "B": "Napoléon Bonaparte", "C": "Charlemagne", "D": "Charles de Gaulle", "correct": "B"}'::jsonb,
  'history', true, 'Napoléon Bonaparte', ARRAY['Louis XIV', 'Charlemagne', 'Charles de Gaulle'], 1
),
(
  'Reine d''Égypte célèbre pour sa beauté et ses relations avec Jules César et Marc Antoine.',
  'Cléopâtre',
  '{"A": "Néfertiti", "B": "Cléopâtre", "C": "Hatchepsout", "D": "Marie-Antoinette", "correct": "B"}'::jsonb,
  'history', true, 'Cléopâtre', ARRAY['Néfertiti', 'Hatchepsout', 'Marie-Antoinette'], 1
),
(
  'Leader de la Résistance française pendant la Seconde Guerre mondiale, il est devenu le premier président de la Ve République.',
  'Charles de Gaulle',
  '{"A": "Charles de Gaulle", "B": "Jean Moulin", "C": "Philippe Pétain", "D": "Georges Clemenceau", "correct": "A"}'::jsonb,
  'history', true, 'Charles de Gaulle', ARRAY['Jean Moulin', 'Philippe Pétain', 'Georges Clemenceau'], 1
),
(
  'Physicien allemand qui a développé la théorie de la relativité et l''équation E=mc².',
  'Albert Einstein',
  '{"A": "Isaac Newton", "B": "Nikola Tesla", "C": "Albert Einstein", "D": "Stephen Hawking", "correct": "C"}'::jsonb,
  'history', true, 'Albert Einstein', ARRAY['Isaac Newton', 'Nikola Tesla', 'Stephen Hawking'], 1
),
(
  'Militant américain des droits civiques, célèbre pour son discours "I Have a Dream".',
  'Martin Luther King Jr.',
  '{"A": "Malcolm X", "B": "Rosa Parks", "C": "Nelson Mandela", "D": "Martin Luther King Jr.", "correct": "D"}'::jsonb,
  'history', true, 'Martin Luther King Jr.', ARRAY['Malcolm X', 'Rosa Parks', 'Nelson Mandela'], 1
),

-- SCIENCE QUESTIONS
(
  'Scientifique polonaise naturalisée française, deux fois lauréate du prix Nobel (physique et chimie), pionnière dans la recherche sur la radioactivité.',
  'Marie Curie',
  '{"A": "Marie Curie", "B": "Rosalind Franklin", "C": "Ada Lovelace", "D": "Dorothy Hodgkin", "correct": "A"}'::jsonb,
  'science', true, 'Marie Curie', ARRAY['Rosalind Franklin', 'Ada Lovelace', 'Dorothy Hodgkin'], 1
),
(
  'Naturaliste anglais qui a développé la théorie de l''évolution par la sélection naturelle.',
  'Charles Darwin',
  '{"A": "Gregor Mendel", "B": "Charles Darwin", "C": "Louis Pasteur", "D": "Alfred Wallace", "correct": "B"}'::jsonb,
  'science', true, 'Charles Darwin', ARRAY['Gregor Mendel', 'Louis Pasteur', 'Alfred Wallace'], 1
),
(
  'Astronome italien qui a défendu l''héliocentrisme et inventé des améliorations du télescope.',
  'Galilée',
  '{"A": "Copernic", "B": "Kepler", "C": "Galilée", "D": "Tycho Brahe", "correct": "C"}'::jsonb,
  'science', true, 'Galilée', ARRAY['Copernic', 'Kepler', 'Tycho Brahe'], 2
),
(
  'Physicien britannique qui a formulé les lois du mouvement et la gravitation universelle.',
  'Isaac Newton',
  '{"A": "Albert Einstein", "B": "Isaac Newton", "C": "Galilée", "D": "Michael Faraday", "correct": "B"}'::jsonb,
  'science', true, 'Isaac Newton', ARRAY['Albert Einstein', 'Galilée', 'Michael Faraday'], 1
),
(
  'Inventeur et homme d''affaires américain, il a créé l''ampoule électrique et le phonographe.',
  'Thomas Edison',
  '{"A": "Nikola Tesla", "B": "Alexander Graham Bell", "C": "Thomas Edison", "D": "Benjamin Franklin", "correct": "C"}'::jsonb,
  'science', true, 'Thomas Edison', ARRAY['Nikola Tesla', 'Alexander Graham Bell', 'Benjamin Franklin'], 1
),

-- GEOGRAPHY QUESTIONS
(
  'Plus haute montagne du monde située dans l''Himalaya, à la frontière entre le Népal et le Tibet.',
  'Everest',
  '{"A": "K2", "B": "Mont Blanc", "C": "Kilimandjaro", "D": "Everest", "correct": "D"}'::jsonb,
  'geography', true, 'Everest', ARRAY['K2', 'Mont Blanc', 'Kilimandjaro'], 1
),
(
  'Plus long fleuve d''Afrique, il traverse 11 pays et se jette dans la Méditerranée.',
  'Le Nil',
  '{"A": "Le Nil", "B": "L''Amazone", "C": "Le Congo", "D": "Le Niger", "correct": "A"}'::jsonb,
  'geography', true, 'Le Nil', ARRAY['L''Amazone', 'Le Congo', 'Le Niger'], 1
),
(
  'Désert le plus grand du monde, situé en Afrique du Nord.',
  'Le Sahara',
  '{"A": "Le Gobi", "B": "Le Sahara", "C": "L''Atacama", "D": "Le Kalahari", "correct": "B"}'::jsonb,
  'geography', true, 'Le Sahara', ARRAY['Le Gobi', 'L''Atacama', 'Le Kalahari'], 1
),
(
  'Capitale du Japon, l''une des villes les plus peuplées au monde.',
  'Tokyo',
  '{"A": "Osaka", "B": "Kyoto", "C": "Tokyo", "D": "Yokohama", "correct": "C"}'::jsonb,
  'geography', true, 'Tokyo', ARRAY['Osaka', 'Kyoto', 'Yokohama'], 1
),
(
  'Plus petit pays du monde, situé à Rome et siège de l''Église catholique.',
  'Le Vatican',
  '{"A": "Monaco", "B": "Saint-Marin", "C": "Liechtenstein", "D": "Le Vatican", "correct": "D"}'::jsonb,
  'geography', true, 'Le Vatican', ARRAY['Monaco', 'Saint-Marin', 'Liechtenstein'], 1
),

-- MUSIC QUESTIONS
(
  'Chanteur américain surnommé le "King of Pop", connu pour Thriller et ses pas de danse légendaires.',
  'Michael Jackson',
  '{"A": "Prince", "B": "Michael Jackson", "C": "Stevie Wonder", "D": "James Brown", "correct": "B"}'::jsonb,
  'music', true, 'Michael Jackson', ARRAY['Prince', 'Stevie Wonder', 'James Brown'], 1
),
(
  'Groupe de rock britannique légendaire avec Freddie Mercury comme chanteur principal.',
  'Queen',
  '{"A": "The Beatles", "B": "Led Zeppelin", "C": "Queen", "D": "Pink Floyd", "correct": "C"}'::jsonb,
  'music', true, 'Queen', ARRAY['The Beatles', 'Led Zeppelin', 'Pink Floyd'], 1
),
(
  'Compositeur allemand sourd qui a créé la Symphonie n°9 "Ode à la joie".',
  'Beethoven',
  '{"A": "Mozart", "B": "Bach", "C": "Beethoven", "D": "Chopin", "correct": "C"}'::jsonb,
  'music', true, 'Beethoven', ARRAY['Mozart', 'Bach', 'Chopin'], 1
),
(
  'Chanteuse américaine surnommée "Queen B", ancienne membre des Destiny''s Child.',
  'Beyoncé',
  '{"A": "Rihanna", "B": "Beyoncé", "C": "Alicia Keys", "D": "Whitney Houston", "correct": "B"}'::jsonb,
  'music', true, 'Beyoncé', ARRAY['Rihanna', 'Alicia Keys', 'Whitney Houston'], 1
),
(
  'Rappeur américain légendaire de Los Angeles, assassiné en 1996. Auteur de "California Love".',
  'Tupac Shakur',
  '{"A": "Notorious B.I.G.", "B": "Tupac Shakur", "C": "Snoop Dogg", "D": "Dr. Dre", "correct": "B"}'::jsonb,
  'music', true, 'Tupac Shakur', ARRAY['Notorious B.I.G.', 'Snoop Dogg', 'Dr. Dre'], 2
),

-- CINEMA QUESTIONS
(
  'Réalisateur américain connu pour Pulp Fiction, Kill Bill et Django Unchained.',
  'Quentin Tarantino',
  '{"A": "Quentin Tarantino", "B": "Martin Scorsese", "C": "Christopher Nolan", "D": "Steven Spielberg", "correct": "A"}'::jsonb,
  'cinema', true, 'Quentin Tarantino', ARRAY['Martin Scorsese', 'Christopher Nolan', 'Steven Spielberg'], 1
),
(
  'Acteur américain qui joue Jack Dawson dans Titanic et a reçu un Oscar pour The Revenant.',
  'Leonardo DiCaprio',
  '{"A": "Brad Pitt", "B": "Leonardo DiCaprio", "C": "Matt Damon", "D": "Tom Hanks", "correct": "B"}'::jsonb,
  'cinema', true, 'Leonardo DiCaprio', ARRAY['Brad Pitt', 'Matt Damon', 'Tom Hanks'], 1
),
(
  'Actrice française oscarisée pour son rôle dans La Môme (La Vie en Rose).',
  'Marion Cotillard',
  '{"A": "Audrey Tautou", "B": "Léa Seydoux", "C": "Marion Cotillard", "D": "Sophie Marceau", "correct": "C"}'::jsonb,
  'cinema', true, 'Marion Cotillard', ARRAY['Audrey Tautou', 'Léa Seydoux', 'Sophie Marceau'], 2
),
(
  'Personnage de science-fiction iconique, père de Luke Skywalker dans Star Wars.',
  'Dark Vador',
  '{"A": "Yoda", "B": "Dark Vador", "C": "Obi-Wan Kenobi", "D": "Palpatine", "correct": "B"}'::jsonb,
  'cinema', true, 'Dark Vador', ARRAY['Yoda', 'Obi-Wan Kenobi', 'Palpatine'], 1
),
(
  'Réalisateur japonais légendaire, créateur de Spirited Away et Mon voisin Totoro.',
  'Hayao Miyazaki',
  '{"A": "Akira Kurosawa", "B": "Hayao Miyazaki", "C": "Isao Takahata", "D": "Mamoru Hosoda", "correct": "B"}'::jsonb,
  'cinema', true, 'Hayao Miyazaki', ARRAY['Akira Kurosawa', 'Isao Takahata', 'Mamoru Hosoda'], 2
),

-- LITERATURE QUESTIONS
(
  'Auteur français du 19ème siècle, il a écrit Les Misérables et Notre-Dame de Paris.',
  'Victor Hugo',
  '{"A": "Émile Zola", "B": "Victor Hugo", "C": "Alexandre Dumas", "D": "Gustave Flaubert", "correct": "B"}'::jsonb,
  'literature', true, 'Victor Hugo', ARRAY['Émile Zola', 'Alexandre Dumas', 'Gustave Flaubert'], 1
),
(
  'Écrivain britannique, créateur du célèbre détective Sherlock Holmes.',
  'Arthur Conan Doyle',
  '{"A": "Agatha Christie", "B": "Arthur Conan Doyle", "C": "Edgar Allan Poe", "D": "Charles Dickens", "correct": "B"}'::jsonb,
  'literature', true, 'Arthur Conan Doyle', ARRAY['Agatha Christie', 'Edgar Allan Poe', 'Charles Dickens'], 1
),
(
  'Auteure britannique de la saga Harry Potter, devenue milliardaire grâce à ses livres.',
  'J.K. Rowling',
  '{"A": "J.R.R. Tolkien", "B": "J.K. Rowling", "C": "C.S. Lewis", "D": "George R.R. Martin", "correct": "B"}'::jsonb,
  'literature', true, 'J.K. Rowling', ARRAY['J.R.R. Tolkien', 'C.S. Lewis', 'George R.R. Martin'], 1
),
(
  'Dramaturge anglais du 16ème siècle, auteur de Romeo et Juliette et Hamlet.',
  'William Shakespeare',
  '{"A": "Molière", "B": "William Shakespeare", "C": "Oscar Wilde", "D": "George Bernard Shaw", "correct": "B"}'::jsonb,
  'literature', true, 'William Shakespeare', ARRAY['Molière', 'Oscar Wilde', 'George Bernard Shaw'], 1
),
(
  'Écrivain français existentialiste, auteur de L''Étranger et La Peste, Prix Nobel 1957.',
  'Albert Camus',
  '{"A": "Jean-Paul Sartre", "B": "Albert Camus", "C": "Simone de Beauvoir", "D": "André Malraux", "correct": "B"}'::jsonb,
  'literature', true, 'Albert Camus', ARRAY['Jean-Paul Sartre', 'Simone de Beauvoir', 'André Malraux'], 2
),

-- TECHNOLOGY QUESTIONS
(
  'Co-fondateur d''Apple, visionnaire qui a révolutionné l''industrie avec l''iPhone et le Mac.',
  'Steve Jobs',
  '{"A": "Steve Jobs", "B": "Bill Gates", "C": "Elon Musk", "D": "Jeff Bezos", "correct": "A"}'::jsonb,
  'technology', true, 'Steve Jobs', ARRAY['Bill Gates', 'Elon Musk', 'Jeff Bezos'], 1
),
(
  'Fondateur de Facebook/Meta, plus jeune milliardaire de l''histoire à son époque.',
  'Mark Zuckerberg',
  '{"A": "Jack Dorsey", "B": "Mark Zuckerberg", "C": "Larry Page", "D": "Evan Spiegel", "correct": "B"}'::jsonb,
  'technology', true, 'Mark Zuckerberg', ARRAY['Jack Dorsey', 'Larry Page', 'Evan Spiegel'], 1
),
(
  'Entrepreneur sud-africain, fondateur de Tesla et SpaceX, récemment acquéreur de Twitter.',
  'Elon Musk',
  '{"A": "Jeff Bezos", "B": "Richard Branson", "C": "Elon Musk", "D": "Peter Thiel", "correct": "C"}'::jsonb,
  'technology', true, 'Elon Musk', ARRAY['Jeff Bezos', 'Richard Branson', 'Peter Thiel'], 1
),
(
  'Inventeur britannique du World Wide Web en 1989.',
  'Tim Berners-Lee',
  '{"A": "Vint Cerf", "B": "Tim Berners-Lee", "C": "Marc Andreessen", "D": "Larry Page", "correct": "B"}'::jsonb,
  'technology', true, 'Tim Berners-Lee', ARRAY['Vint Cerf', 'Marc Andreessen', 'Larry Page'], 2
),
(
  'Co-fondateur de Microsoft avec Bill Gates, il a investi dans de nombreuses équipes sportives.',
  'Paul Allen',
  '{"A": "Steve Ballmer", "B": "Paul Allen", "C": "Satya Nadella", "D": "Steve Wozniak", "correct": "B"}'::jsonb,
  'technology', true, 'Paul Allen', ARRAY['Steve Ballmer', 'Satya Nadella', 'Steve Wozniak'], 2
),

-- NATURE QUESTIONS
(
  'Plus grand animal de la planète, ce mammifère marin peut atteindre 30 mètres de long.',
  'La baleine bleue',
  '{"A": "L''orque", "B": "La baleine bleue", "C": "Le cachalot", "D": "Le requin baleine", "correct": "B"}'::jsonb,
  'nature', true, 'La baleine bleue', ARRAY['L''orque', 'Le cachalot', 'Le requin baleine'], 1
),
(
  'Félin le plus rapide du monde, il peut atteindre 120 km/h.',
  'Le guépard',
  '{"A": "Le lion", "B": "Le léopard", "C": "Le guépard", "D": "Le tigre", "correct": "C"}'::jsonb,
  'nature', true, 'Le guépard', ARRAY['Le lion', 'Le léopard', 'Le tigre'], 1
),
(
  'Seul mammifère capable de voler naturellement, il utilise l''écholocation.',
  'La chauve-souris',
  '{"A": "L''écureuil volant", "B": "La chauve-souris", "C": "Le colibri", "D": "Le lémur volant", "correct": "B"}'::jsonb,
  'nature', true, 'La chauve-souris', ARRAY['L''écureuil volant', 'Le colibri', 'Le lémur volant'], 2
),
(
  'Plus grand arbre du monde en volume, il peut vivre plus de 3000 ans.',
  'Le séquoia géant',
  '{"A": "Le baobab", "B": "Le séquoia géant", "C": "L''eucalyptus", "D": "Le chêne", "correct": "B"}'::jsonb,
  'nature', true, 'Le séquoia géant', ARRAY['Le baobab', 'L''eucalyptus', 'Le chêne'], 2
),
(
  'Oiseau incapable de voler, emblème de la Nouvelle-Zélande, actif la nuit.',
  'Le kiwi',
  '{"A": "Le manchot", "B": "L''autruche", "C": "Le kiwi", "D": "L''émeu", "correct": "C"}'::jsonb,
  'nature', true, 'Le kiwi', ARRAY['Le manchot', 'L''autruche', 'L''émeu'], 2
),

-- GENERAL CULTURE QUESTIONS
(
  'Monument parisien construit pour l''Exposition universelle de 1889, symbole de la France.',
  'La Tour Eiffel',
  '{"A": "L''Arc de Triomphe", "B": "La Tour Eiffel", "C": "Notre-Dame", "D": "Le Louvre", "correct": "B"}'::jsonb,
  'general', true, 'La Tour Eiffel', ARRAY['L''Arc de Triomphe', 'Notre-Dame', 'Le Louvre'], 1
),
(
  'Statue offerte par la France aux États-Unis en 1886, située à New York.',
  'La Statue de la Liberté',
  '{"A": "Le Lincoln Memorial", "B": "La Statue de la Liberté", "C": "L''Empire State Building", "D": "Le Washington Monument", "correct": "B"}'::jsonb,
  'general', true, 'La Statue de la Liberté', ARRAY['Le Lincoln Memorial', 'L''Empire State Building', 'Le Washington Monument'], 1
),
(
  'Merveille du monde antique, seule à être encore debout aujourd''hui, située en Égypte.',
  'La Grande Pyramide de Gizeh',
  '{"A": "Le Colisée", "B": "La Grande Pyramide de Gizeh", "C": "Le Taj Mahal", "D": "Stonehenge", "correct": "B"}'::jsonb,
  'general', true, 'La Grande Pyramide de Gizeh', ARRAY['Le Colisée', 'Le Taj Mahal', 'Stonehenge'], 1
),
(
  'Jeu de cartes le plus joué dans les casinos, aussi appelé "21".',
  'Le Blackjack',
  '{"A": "Le Poker", "B": "Le Blackjack", "C": "La Roulette", "D": "Le Baccarat", "correct": "B"}'::jsonb,
  'general', true, 'Le Blackjack', ARRAY['Le Poker', 'La Roulette', 'Le Baccarat'], 1
),
(
  'Monnaie utilisée dans la majorité des pays de l''Union européenne depuis 2002.',
  'L''Euro',
  '{"A": "Le Dollar", "B": "L''Euro", "C": "La Livre", "D": "Le Franc", "correct": "B"}'::jsonb,
  'general', true, 'L''Euro', ARRAY['Le Dollar', 'La Livre', 'Le Franc'], 1
)
ON CONFLICT DO NOTHING;

-- Add more football questions
INSERT INTO questions (question_text, player_name, options, category, is_active, correct_answer, wrong_answers, difficulty) VALUES
(
  'Attaquant français du FC Barcelone, champion du monde 2018, surnommé "Grizi".',
  'Antoine Griezmann',
  '{"A": "Antoine Griezmann", "B": "Olivier Giroud", "C": "Alexandre Lacazette", "D": "Karim Benzema", "correct": "A"}'::jsonb,
  'football', true, 'Antoine Griezmann', ARRAY['Olivier Giroud', 'Alexandre Lacazette', 'Karim Benzema'], 1
),
(
  'Attaquant brésilien passé par Santos, Barcelone et PSG, connu pour ses dribbles et ses blessures.',
  'Neymar Jr',
  '{"A": "Vinícius Jr", "B": "Neymar Jr", "C": "Rodrygo", "D": "Raphinha", "correct": "B"}'::jsonb,
  'football', true, 'Neymar Jr', ARRAY['Vinícius Jr', 'Rodrygo', 'Raphinha'], 1
),
(
  'Gardien belge du Real Madrid, considéré comme l''un des meilleurs au monde.',
  'Thibaut Courtois',
  '{"A": "Jan Oblak", "B": "Thibaut Courtois", "C": "Marc-André ter Stegen", "D": "Alisson Becker", "correct": "B"}'::jsonb,
  'football', true, 'Thibaut Courtois', ARRAY['Jan Oblak', 'Marc-André ter Stegen', 'Alisson Becker'], 1
),
(
  'Milieu de terrain croate, meneur de jeu du Real Madrid, Ballon d''Or 2018.',
  'Luka Modrić',
  '{"A": "Toni Kroos", "B": "Luka Modrić", "C": "Casemiro", "D": "Ivan Rakitić", "correct": "B"}'::jsonb,
  'football', true, 'Luka Modrić', ARRAY['Toni Kroos', 'Casemiro', 'Ivan Rakitić'], 1
),
(
  'Défenseur central néerlandais, capitaine de Liverpool puis passé au Bayern Munich.',
  'Virgil van Dijk',
  '{"A": "Virgil van Dijk", "B": "Matthijs de Ligt", "C": "Nathan Aké", "D": "Stefan de Vrij", "correct": "A"}'::jsonb,
  'football', true, 'Virgil van Dijk', ARRAY['Matthijs de Ligt', 'Nathan Aké', 'Stefan de Vrij'], 1
)
ON CONFLICT DO NOTHING;
