-- Migration: Add English questions for all categories
-- This adds English versions of quiz questions

-- HISTORY QUESTIONS (English)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, is_active, difficulty, explanation) VALUES
(
  'In what year did the French Revolution begin?',
  '1789', ARRAY['1776', '1804', '1815'],
  'history', true, 1,
  'The French Revolution began in 1789 with the storming of the Bastille on July 14.'
),
(
  'Who was the first Roman Emperor?',
  'Augustus', ARRAY['Julius Caesar', 'Nero', 'Caligula'],
  'history', true, 1,
  'Augustus (Octavian) became the first Roman Emperor in 27 BC.'
),
(
  'Which civilization built Machu Picchu?',
  'The Incas', ARRAY['The Mayas', 'The Aztecs', 'The Olmecs'],
  'history', true, 2,
  'Machu Picchu was built by the Incas in the 15th century.'
),
(
  'In what year did the Berlin Wall fall?',
  '1989', ARRAY['1991', '1987', '1985'],
  'history', true, 2,
  'The Berlin Wall fell on November 9, 1989.'
),
(
  'Which pharaoh built the Great Pyramid of Giza?',
  'Khufu', ARRAY['Ramses II', 'Tutankhamun', 'Khafre'],
  'history', true, 3,
  'The Great Pyramid was built for Pharaoh Khufu around 2560 BC.'
),
(
  'French Emperor who conquered much of Europe in the early 19th century. He was exiled to Elba and later St. Helena.',
  'Napoleon Bonaparte', ARRAY['Louis XIV', 'Charlemagne', 'Charles de Gaulle'],
  'history', true, 1,
  'Napoleon Bonaparte was one of the most significant military leaders in history.'
),
(
  'Queen of Egypt famous for her beauty and relationships with Julius Caesar and Mark Antony.',
  'Cleopatra', ARRAY['Nefertiti', 'Hatshepsut', 'Marie Antoinette'],
  'history', true, 1,
  'Cleopatra VII was the last active ruler of the Ptolemaic Kingdom of Egypt.'
),
(
  'German physicist who developed the theory of relativity and the equation E=mc².',
  'Albert Einstein', ARRAY['Isaac Newton', 'Nikola Tesla', 'Stephen Hawking'],
  'history', true, 1,
  'Einstein''s theories revolutionized our understanding of space, time, and energy.'
),
(
  'American civil rights activist famous for his "I Have a Dream" speech.',
  'Martin Luther King Jr.', ARRAY['Malcolm X', 'Rosa Parks', 'Nelson Mandela'],
  'history', true, 1,
  'MLK Jr. was a leader in the Civil Rights Movement and won the Nobel Peace Prize in 1964.'
),
(
  'Leader of the French Resistance during World War II who became the first President of the Fifth Republic.',
  'Charles de Gaulle', ARRAY['Jean Moulin', 'Philippe Pétain', 'Georges Clemenceau'],
  'history', true, 1,
  'De Gaulle led Free France during WWII and later founded the Fifth Republic.'
)
ON CONFLICT DO NOTHING;

-- GEOGRAPHY QUESTIONS (English)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, is_active, difficulty, explanation) VALUES
(
  'What is the capital of Australia?',
  'Canberra', ARRAY['Sydney', 'Melbourne', 'Brisbane'],
  'geography', true, 1,
  'Canberra has been the capital of Australia since 1913, chosen as a compromise between Sydney and Melbourne.'
),
(
  'What is the longest river in the world?',
  'The Nile', ARRAY['The Amazon', 'The Yangtze', 'The Mississippi'],
  'geography', true, 1,
  'The Nile measures approximately 6,650 km, making it the longest river in the world.'
),
(
  'Which country has the most time zones?',
  'France', ARRAY['Russia', 'United States', 'China'],
  'geography', true, 2,
  'Thanks to its overseas territories, France covers 12 time zones.'
),
(
  'What is the smallest country in the world?',
  'Vatican City', ARRAY['Monaco', 'San Marino', 'Liechtenstein'],
  'geography', true, 2,
  'Vatican City is only 0.44 km², making it the smallest state in the world.'
),
(
  'Which country has the most active volcanoes?',
  'Indonesia', ARRAY['Japan', 'United States', 'Iceland'],
  'geography', true, 3,
  'Indonesia has approximately 130 active volcanoes, the highest number in the world.'
),
(
  'Tallest mountain in the world, located in the Himalayas on the border between Nepal and Tibet.',
  'Mount Everest', ARRAY['K2', 'Mont Blanc', 'Kilimanjaro'],
  'geography', true, 1,
  'Mount Everest stands at 8,849 meters (29,032 feet).'
),
(
  'Longest river in Africa, flowing through 11 countries and emptying into the Mediterranean.',
  'The Nile', ARRAY['The Amazon', 'The Congo', 'The Niger'],
  'geography', true, 1,
  'The Nile is approximately 6,650 km long.'
),
(
  'Largest desert in the world, located in North Africa.',
  'The Sahara', ARRAY['The Gobi', 'The Atacama', 'The Kalahari'],
  'geography', true, 1,
  'The Sahara covers about 9 million square kilometers.'
),
(
  'Capital of Japan, one of the most populous cities in the world.',
  'Tokyo', ARRAY['Osaka', 'Kyoto', 'Yokohama'],
  'geography', true, 1,
  'Tokyo has a population of over 13 million people.'
),
(
  'Smallest country in the world, located in Rome and home to the Catholic Church.',
  'Vatican City', ARRAY['Monaco', 'San Marino', 'Liechtenstein'],
  'geography', true, 1,
  'Vatican City covers only 0.44 square kilometers.'
)
ON CONFLICT DO NOTHING;

-- SCIENCE QUESTIONS (English)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, is_active, difficulty, explanation) VALUES
(
  'What is the chemical symbol for gold?',
  'Au', ARRAY['Or', 'Ag', 'Fe'],
  'science', true, 1,
  'Au comes from the Latin word "aurum" meaning gold.'
),
(
  'How many planets are in our solar system?',
  '8', ARRAY['9', '7', '10'],
  'science', true, 1,
  'Since 2006, Pluto is no longer considered a planet, leaving 8 planets.'
),
(
  'Which organ produces insulin?',
  'The pancreas', ARRAY['The liver', 'The kidneys', 'The stomach'],
  'science', true, 2,
  'Insulin is produced by beta cells in the pancreas.'
),
(
  'What is the speed of light?',
  '300,000 km/s', ARRAY['150,000 km/s', '500,000 km/s', '1,000,000 km/s'],
  'science', true, 2,
  'Light travels at approximately 299,792 km/s in a vacuum.'
),
(
  'What is the most abundant element in the universe?',
  'Hydrogen', ARRAY['Helium', 'Oxygen', 'Carbon'],
  'science', true, 3,
  'Hydrogen makes up about 75% of the mass of the universe.'
),
(
  'Polish-French scientist, two-time Nobel laureate (Physics and Chemistry), pioneer in radioactivity research.',
  'Marie Curie', ARRAY['Rosalind Franklin', 'Ada Lovelace', 'Dorothy Hodgkin'],
  'science', true, 1,
  'Marie Curie discovered polonium and radium.'
),
(
  'English naturalist who developed the theory of evolution by natural selection.',
  'Charles Darwin', ARRAY['Gregor Mendel', 'Louis Pasteur', 'Alfred Wallace'],
  'science', true, 1,
  'Darwin published "On the Origin of Species" in 1859.'
),
(
  'Italian astronomer who championed heliocentrism and improved the telescope.',
  'Galileo', ARRAY['Copernicus', 'Kepler', 'Tycho Brahe'],
  'science', true, 2,
  'Galileo is often called the "father of modern observational astronomy."'
),
(
  'British physicist who formulated the laws of motion and universal gravitation.',
  'Isaac Newton', ARRAY['Albert Einstein', 'Galileo', 'Michael Faraday'],
  'science', true, 1,
  'Newton published his laws in "Principia Mathematica" in 1687.'
),
(
  'American inventor and businessman who created the light bulb and phonograph.',
  'Thomas Edison', ARRAY['Nikola Tesla', 'Alexander Graham Bell', 'Benjamin Franklin'],
  'science', true, 1,
  'Edison held over 1,000 US patents.'
)
ON CONFLICT DO NOTHING;

-- SPORTS QUESTIONS (English)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, is_active, difficulty, explanation) VALUES
(
  'In which sport is a shuttlecock used?',
  'Badminton', ARRAY['Tennis', 'Squash', 'Table Tennis'],
  'sports', true, 1,
  'The shuttlecock is used in badminton.'
),
(
  'How many players are on a football (soccer) team?',
  '11', ARRAY['10', '12', '9'],
  'sports', true, 1,
  'A football team has 11 players on the field.'
),
(
  'Which country has won the most FIFA World Cups?',
  'Brazil', ARRAY['Germany', 'Italy', 'Argentina'],
  'sports', true, 2,
  'Brazil has won 5 World Cups (1958, 1962, 1970, 1994, 2002).'
),
(
  'How long is an NBA basketball game?',
  '48 minutes', ARRAY['40 minutes', '60 minutes', '45 minutes'],
  'sports', true, 2,
  'An NBA game lasts 48 minutes, divided into 4 quarters of 12 minutes each.'
),
(
  'Who holds the 100m world record?',
  'Usain Bolt', ARRAY['Tyson Gay', 'Carl Lewis', 'Justin Gatlin'],
  'sports', true, 3,
  'Usain Bolt holds the world record at 9.58 seconds since 2009.'
),
(
  'Which player won the Ballon d''Or 2023?',
  'Lionel Messi', ARRAY['Erling Haaland', 'Kylian Mbappé', 'Karim Benzema'],
  'sports', true, 1,
  'Messi won his 8th Ballon d''Or in 2023.'
),
(
  'Which team won the Champions League 2024?',
  'Real Madrid', ARRAY['Manchester City', 'Bayern Munich', 'Barcelona'],
  'sports', true, 1,
  'Real Madrid won their record-extending 15th Champions League title.'
),
(
  'Belgian goalkeeper at Real Madrid, considered one of the best in the world.',
  'Thibaut Courtois', ARRAY['Jan Oblak', 'Marc-André ter Stegen', 'Alisson Becker'],
  'sports', true, 1,
  'Courtois won the FIFA Best Goalkeeper award in 2022.'
),
(
  'Croatian midfielder, Real Madrid playmaker, Ballon d''Or winner 2018.',
  'Luka Modrić', ARRAY['Toni Kroos', 'Casemiro', 'Ivan Rakitić'],
  'sports', true, 1,
  'Modrić won the Ballon d''Or after leading Croatia to the 2018 World Cup final.'
),
(
  'Dutch central defender, Liverpool captain who later moved to Bayern Munich.',
  'Virgil van Dijk', ARRAY['Matthijs de Ligt', 'Nathan Aké', 'Stefan de Vrij'],
  'sports', true, 1,
  'Van Dijk was named UEFA Men''s Player of the Year in 2019.'
)
ON CONFLICT DO NOTHING;

-- POP CULTURE / ENTERTAINMENT QUESTIONS (English)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, is_active, difficulty, explanation) VALUES
(
  'What is the highest-grossing film of all time?',
  'Avatar', ARRAY['Avengers: Endgame', 'Titanic', 'Star Wars'],
  'pop-culture', true, 1,
  'Avatar by James Cameron has grossed over $2.9 billion.'
),
(
  'Who sang "Thriller"?',
  'Michael Jackson', ARRAY['Prince', 'Madonna', 'Whitney Houston'],
  'pop-culture', true, 1,
  'Thriller by Michael Jackson is the best-selling album of all time.'
),
(
  'In which TV series do we find the Stark family?',
  'Game of Thrones', ARRAY['The Witcher', 'Vikings', 'The Last Kingdom'],
  'pop-culture', true, 2,
  'The Stark family is one of the great houses of Westeros in Game of Thrones.'
),
(
  'Which artist painted "The Starry Night"?',
  'Vincent van Gogh', ARRAY['Claude Monet', 'Pablo Picasso', 'Salvador Dalí'],
  'pop-culture', true, 2,
  'The Starry Night was painted by Van Gogh in 1889.'
),
(
  'In what year was the first iPhone released?',
  '2007', ARRAY['2005', '2008', '2010'],
  'pop-culture', true, 3,
  'The first iPhone was introduced by Steve Jobs on January 9, 2007.'
)
ON CONFLICT DO NOTHING;

-- MUSIC QUESTIONS (English)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, is_active, difficulty, explanation) VALUES
(
  'American singer known as the "King of Pop", famous for Thriller and legendary dance moves.',
  'Michael Jackson', ARRAY['Prince', 'Stevie Wonder', 'James Brown'],
  'music', true, 1,
  'Michael Jackson''s Thriller album sold over 70 million copies worldwide.'
),
(
  'Legendary British rock band with Freddie Mercury as lead singer.',
  'Queen', ARRAY['The Beatles', 'Led Zeppelin', 'Pink Floyd'],
  'music', true, 1,
  'Queen''s "Bohemian Rhapsody" is one of the most iconic rock songs ever.'
),
(
  'Deaf German composer who created Symphony No. 9 "Ode to Joy".',
  'Beethoven', ARRAY['Mozart', 'Bach', 'Chopin'],
  'music', true, 1,
  'Beethoven composed some of his greatest works while completely deaf.'
),
(
  'American singer known as "Queen B", former member of Destiny''s Child.',
  'Beyoncé', ARRAY['Rihanna', 'Alicia Keys', 'Whitney Houston'],
  'music', true, 1,
  'Beyoncé has won 32 Grammy Awards, more than any other artist.'
),
(
  'Legendary American rapper from Los Angeles, assassinated in 1996. Known for "California Love".',
  'Tupac Shakur', ARRAY['Notorious B.I.G.', 'Snoop Dogg', 'Dr. Dre'],
  'music', true, 2,
  'Tupac sold over 75 million records worldwide.'
)
ON CONFLICT DO NOTHING;

-- CINEMA QUESTIONS (English)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, is_active, difficulty, explanation) VALUES
(
  'American director known for Pulp Fiction, Kill Bill, and Django Unchained.',
  'Quentin Tarantino', ARRAY['Martin Scorsese', 'Christopher Nolan', 'Steven Spielberg'],
  'cinema', true, 1,
  'Tarantino has won two Academy Awards for Best Original Screenplay.'
),
(
  'American actor who plays Jack Dawson in Titanic and won an Oscar for The Revenant.',
  'Leonardo DiCaprio', ARRAY['Brad Pitt', 'Matt Damon', 'Tom Hanks'],
  'cinema', true, 1,
  'DiCaprio finally won his first Oscar in 2016 after multiple nominations.'
),
(
  'French actress who won an Oscar for her role in La Vie en Rose (The Passionate Life of Edith Piaf).',
  'Marion Cotillard', ARRAY['Audrey Tautou', 'Léa Seydoux', 'Sophie Marceau'],
  'cinema', true, 2,
  'Cotillard was the first French actress to win an Oscar since 1960.'
),
(
  'Iconic sci-fi character, father of Luke Skywalker in Star Wars.',
  'Darth Vader', ARRAY['Yoda', 'Obi-Wan Kenobi', 'Palpatine'],
  'cinema', true, 1,
  'The "I am your father" reveal is one of cinema''s most famous plot twists.'
),
(
  'Legendary Japanese director, creator of Spirited Away and My Neighbor Totoro.',
  'Hayao Miyazaki', ARRAY['Akira Kurosawa', 'Isao Takahata', 'Mamoru Hosoda'],
  'cinema', true, 2,
  'Miyazaki co-founded Studio Ghibli and won an Oscar for Spirited Away.'
)
ON CONFLICT DO NOTHING;

-- LITERATURE QUESTIONS (English)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, is_active, difficulty, explanation) VALUES
(
  '19th century French author who wrote Les Misérables and The Hunchback of Notre-Dame.',
  'Victor Hugo', ARRAY['Émile Zola', 'Alexandre Dumas', 'Gustave Flaubert'],
  'literature', true, 1,
  'Victor Hugo is considered one of the greatest French writers.'
),
(
  'British author who created the famous detective Sherlock Holmes.',
  'Arthur Conan Doyle', ARRAY['Agatha Christie', 'Edgar Allan Poe', 'Charles Dickens'],
  'literature', true, 1,
  'Conan Doyle wrote 56 short stories and 4 novels featuring Holmes.'
),
(
  'British author of the Harry Potter series who became a billionaire from her books.',
  'J.K. Rowling', ARRAY['J.R.R. Tolkien', 'C.S. Lewis', 'George R.R. Martin'],
  'literature', true, 1,
  'The Harry Potter series has sold over 500 million copies worldwide.'
),
(
  '16th century English playwright, author of Romeo and Juliet and Hamlet.',
  'William Shakespeare', ARRAY['Molière', 'Oscar Wilde', 'George Bernard Shaw'],
  'literature', true, 1,
  'Shakespeare wrote approximately 39 plays and 154 sonnets.'
),
(
  'French existentialist writer, author of The Stranger and The Plague, 1957 Nobel Prize winner.',
  'Albert Camus', ARRAY['Jean-Paul Sartre', 'Simone de Beauvoir', 'André Malraux'],
  'literature', true, 2,
  'Camus won the Nobel Prize in Literature at age 44.'
)
ON CONFLICT DO NOTHING;

-- TECHNOLOGY QUESTIONS (English)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, is_active, difficulty, explanation) VALUES
(
  'Co-founder of Apple, visionary who revolutionized the industry with the iPhone and Mac.',
  'Steve Jobs', ARRAY['Bill Gates', 'Elon Musk', 'Jeff Bezos'],
  'technology', true, 1,
  'Jobs co-founded Apple in 1976 and transformed multiple industries.'
),
(
  'Founder of Facebook/Meta, youngest billionaire in history at the time.',
  'Mark Zuckerberg', ARRAY['Jack Dorsey', 'Larry Page', 'Evan Spiegel'],
  'technology', true, 1,
  'Zuckerberg founded Facebook in his Harvard dorm room in 2004.'
),
(
  'South African entrepreneur, founder of Tesla and SpaceX, who acquired Twitter.',
  'Elon Musk', ARRAY['Jeff Bezos', 'Richard Branson', 'Peter Thiel'],
  'technology', true, 1,
  'Musk''s companies are pioneering electric vehicles and space exploration.'
),
(
  'British inventor of the World Wide Web in 1989.',
  'Tim Berners-Lee', ARRAY['Vint Cerf', 'Marc Andreessen', 'Larry Page'],
  'technology', true, 2,
  'Berners-Lee created the first web browser and web server.'
),
(
  'Co-founder of Microsoft with Bill Gates, investor in many sports teams.',
  'Paul Allen', ARRAY['Steve Ballmer', 'Satya Nadella', 'Steve Wozniak'],
  'technology', true, 2,
  'Allen owned the Seattle Seahawks and Portland Trail Blazers.'
)
ON CONFLICT DO NOTHING;

-- NATURE QUESTIONS (English)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, is_active, difficulty, explanation) VALUES
(
  'Largest animal on the planet, this marine mammal can reach 30 meters long.',
  'Blue whale', ARRAY['Orca', 'Sperm whale', 'Whale shark'],
  'nature', true, 1,
  'Blue whales can weigh up to 200 tons.'
),
(
  'Fastest land animal in the world, it can reach 120 km/h.',
  'Cheetah', ARRAY['Lion', 'Leopard', 'Tiger'],
  'nature', true, 1,
  'Cheetahs can accelerate from 0 to 100 km/h in just 3 seconds.'
),
(
  'Only mammal capable of true flight, it uses echolocation.',
  'Bat', ARRAY['Flying squirrel', 'Hummingbird', 'Flying lemur'],
  'nature', true, 2,
  'Bats make up about 20% of all classified mammal species.'
),
(
  'Largest tree in the world by volume, can live over 3000 years.',
  'Giant sequoia', ARRAY['Baobab', 'Eucalyptus', 'Oak'],
  'nature', true, 2,
  'The largest known giant sequoia is named General Sherman.'
),
(
  'Flightless bird, emblem of New Zealand, active at night.',
  'Kiwi', ARRAY['Penguin', 'Ostrich', 'Emu'],
  'nature', true, 2,
  'Kiwis are the only birds with nostrils at the end of their beaks.'
)
ON CONFLICT DO NOTHING;

-- GENERAL KNOWLEDGE QUESTIONS (English)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, is_active, difficulty, explanation) VALUES
(
  'Parisian monument built for the 1889 World''s Fair, symbol of France.',
  'The Eiffel Tower', ARRAY['Arc de Triomphe', 'Notre-Dame', 'The Louvre'],
  'general', true, 1,
  'The Eiffel Tower was originally criticized by artists and intellectuals.'
),
(
  'Statue gifted by France to the United States in 1886, located in New York.',
  'Statue of Liberty', ARRAY['Lincoln Memorial', 'Empire State Building', 'Washington Monument'],
  'general', true, 1,
  'The statue was designed by French sculptor Frédéric Auguste Bartholdi.'
),
(
  'Only surviving ancient wonder of the world, located in Egypt.',
  'Great Pyramid of Giza', ARRAY['Colosseum', 'Taj Mahal', 'Stonehenge'],
  'general', true, 1,
  'The Great Pyramid was the tallest man-made structure for over 3,800 years.'
),
(
  'Most popular card game in casinos, also known as "21".',
  'Blackjack', ARRAY['Poker', 'Roulette', 'Baccarat'],
  'general', true, 1,
  'The goal is to get cards totaling closer to 21 than the dealer without going over.'
),
(
  'Currency used in most European Union countries since 2002.',
  'The Euro', ARRAY['The Dollar', 'The Pound', 'The Franc'],
  'general', true, 1,
  'The Euro is used by 20 of the 27 EU member states.'
)
ON CONFLICT DO NOTHING;

-- FOOTBALL QUESTIONS (English)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, is_active, difficulty, explanation) VALUES
(
  'French forward at FC Barcelona, 2018 World Cup champion, nicknamed "Grizi".',
  'Antoine Griezmann', ARRAY['Olivier Giroud', 'Alexandre Lacazette', 'Karim Benzema'],
  'football', true, 1,
  'Griezmann scored 4 goals during France''s 2018 World Cup victory.'
),
(
  'Brazilian forward who played for Santos, Barcelona, and PSG, known for his dribbling skills.',
  'Neymar Jr', ARRAY['Vinícius Jr', 'Rodrygo', 'Raphinha'],
  'football', true, 1,
  'Neymar is the all-time leading scorer for the Brazilian national team.'
),
(
  'English midfielder who won the Champions League with Chelsea in 2021.',
  'Mason Mount', ARRAY['Phil Foden', 'Jack Grealish', 'Declan Rice'],
  'football', true, 2,
  'Chelsea beat Manchester City 1-0 in the 2021 Champions League final.'
),
(
  'French midfielder known as "N''Golo" who was key to Chelsea''s 2021 Champions League win.',
  'N''Golo Kanté', ARRAY['Paul Pogba', 'Eduardo Camavinga', 'Aurélien Tchouaméni'],
  'football', true, 1,
  'Kanté won back-to-back Premier League titles with Leicester and Chelsea.'
),
(
  'Norwegian striker who won the treble with Manchester City in 2023.',
  'Erling Haaland', ARRAY['Harry Kane', 'Robert Lewandowski', 'Marcus Rashford'],
  'football', true, 1,
  'Haaland scored 52 goals in his first season at Manchester City.'
),
(
  'Spanish midfielder considered one of the best passers in football history, played for Barcelona and Spain.',
  'Xavi Hernández', ARRAY['Andrés Iniesta', 'Sergio Busquets', 'David Silva'],
  'football', true, 1,
  'Xavi won the World Cup in 2010 and two European Championships.'
),
(
  'Portuguese defender who captained Real Madrid to multiple Champions League titles.',
  'Sergio Ramos', ARRAY['Pepe', 'Gerard Piqué', 'Raphaël Varane'],
  'football', true, 1,
  'Ramos scored crucial goals in two Champions League finals.'
),
(
  'Argentine forward who plays for Inter Miami after leaving Paris Saint-Germain.',
  'Lionel Messi', ARRAY['Luis Suárez', 'Sergio Busquets', 'Jordi Alba'],
  'football', true, 1,
  'Messi led Argentina to World Cup victory in 2022.'
),
(
  'French forward at Real Madrid, known for his incredible speed and skill.',
  'Kylian Mbappé', ARRAY['Ousmane Dembélé', 'Kingsley Coman', 'Marcus Thuram'],
  'football', true, 1,
  'Mbappé became a World Cup champion at just 19 years old in 2018.'
),
(
  'German goalkeeper who played for Bayern Munich and is considered one of the best ever.',
  'Manuel Neuer', ARRAY['Marc-André ter Stegen', 'Kevin Trapp', 'Bernd Leno'],
  'football', true, 1,
  'Neuer revolutionized the sweeper-keeper role in modern football.'
)
ON CONFLICT DO NOTHING;
