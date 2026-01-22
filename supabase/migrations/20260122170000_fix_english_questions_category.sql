-- Migration: Add English questions with proper format
-- Using the same format as existing working French questions

-- First, let's add a language column if it doesn't exist
ALTER TABLE questions ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fr';

-- Update existing questions to have French language
UPDATE questions SET language = 'fr' WHERE language IS NULL OR language = '';

-- Now insert English questions with language = 'en'
-- Using the exact same format as the working French questions

-- HISTORY QUESTIONS (English)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, is_active, difficulty, language) VALUES
('In what year did the French Revolution begin?', '1789', ARRAY['1776', '1804', '1815'], 'history', true, 1, 'en'),
('Who was the first Roman Emperor?', 'Augustus', ARRAY['Julius Caesar', 'Nero', 'Caligula'], 'history', true, 1, 'en'),
('Which civilization built Machu Picchu?', 'The Incas', ARRAY['The Mayas', 'The Aztecs', 'The Olmecs'], 'history', true, 2, 'en'),
('In what year did the Berlin Wall fall?', '1989', ARRAY['1991', '1987', '1985'], 'history', true, 2, 'en'),
('Which pharaoh built the Great Pyramid of Giza?', 'Khufu', ARRAY['Ramses II', 'Tutankhamun', 'Khafre'], 'history', true, 3, 'en'),
('Who developed the theory of relativity?', 'Albert Einstein', ARRAY['Isaac Newton', 'Nikola Tesla', 'Stephen Hawking'], 'history', true, 1, 'en'),
('Who gave the "I Have a Dream" speech?', 'Martin Luther King Jr.', ARRAY['Malcolm X', 'Rosa Parks', 'Nelson Mandela'], 'history', true, 1, 'en')
ON CONFLICT DO NOTHING;

-- GEOGRAPHY QUESTIONS (English)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, is_active, difficulty, language) VALUES
('What is the capital of Australia?', 'Canberra', ARRAY['Sydney', 'Melbourne', 'Brisbane'], 'geography', true, 1, 'en'),
('What is the longest river in the world?', 'The Nile', ARRAY['The Amazon', 'The Yangtze', 'The Mississippi'], 'geography', true, 1, 'en'),
('Which country has the most time zones?', 'France', ARRAY['Russia', 'United States', 'China'], 'geography', true, 2, 'en'),
('What is the smallest country in the world?', 'Vatican City', ARRAY['Monaco', 'San Marino', 'Liechtenstein'], 'geography', true, 2, 'en'),
('Which country has the most active volcanoes?', 'Indonesia', ARRAY['Japan', 'United States', 'Iceland'], 'geography', true, 3, 'en'),
('What is the largest desert in the world?', 'The Sahara', ARRAY['The Gobi', 'The Atacama', 'The Kalahari'], 'geography', true, 1, 'en'),
('What is the capital of Japan?', 'Tokyo', ARRAY['Osaka', 'Kyoto', 'Yokohama'], 'geography', true, 1, 'en')
ON CONFLICT DO NOTHING;

-- SCIENCE QUESTIONS (English)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, is_active, difficulty, language) VALUES
('What is the chemical symbol for gold?', 'Au', ARRAY['Or', 'Ag', 'Fe'], 'science', true, 1, 'en'),
('How many planets are in our solar system?', '8', ARRAY['9', '7', '10'], 'science', true, 1, 'en'),
('Which organ produces insulin?', 'The pancreas', ARRAY['The liver', 'The kidneys', 'The stomach'], 'science', true, 2, 'en'),
('What is the speed of light?', '300,000 km/s', ARRAY['150,000 km/s', '500,000 km/s', '1,000,000 km/s'], 'science', true, 2, 'en'),
('What is the most abundant element in the universe?', 'Hydrogen', ARRAY['Helium', 'Oxygen', 'Carbon'], 'science', true, 3, 'en'),
('Who developed the theory of evolution?', 'Charles Darwin', ARRAY['Gregor Mendel', 'Louis Pasteur', 'Alfred Wallace'], 'science', true, 1, 'en'),
('Who formulated the laws of motion?', 'Isaac Newton', ARRAY['Albert Einstein', 'Galileo', 'Michael Faraday'], 'science', true, 1, 'en')
ON CONFLICT DO NOTHING;

-- SPORTS/FOOTBALL QUESTIONS (English)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, is_active, difficulty, language) VALUES
('Which country has won the most FIFA World Cups?', 'Brazil', ARRAY['Germany', 'Italy', 'Argentina'], 'football', true, 1, 'en'),
('Who holds the 100m world record?', 'Usain Bolt', ARRAY['Tyson Gay', 'Carl Lewis', 'Justin Gatlin'], 'football', true, 2, 'en'),
('How many players are on a football team?', '11', ARRAY['10', '12', '9'], 'football', true, 1, 'en'),
('Which player won the Ballon d''Or 2023?', 'Lionel Messi', ARRAY['Erling Haaland', 'Kylian Mbappé', 'Karim Benzema'], 'football', true, 1, 'en'),
('Which team won the Champions League 2024?', 'Real Madrid', ARRAY['Manchester City', 'Bayern Munich', 'Barcelona'], 'football', true, 1, 'en'),
('Who scored in the 2018 World Cup final for France?', 'Kylian Mbappé', ARRAY['Antoine Griezmann', 'Paul Pogba', 'Olivier Giroud'], 'football', true, 1, 'en'),
('Which club did Lionel Messi join in 2023?', 'Inter Miami', ARRAY['Al-Hilal', 'PSG', 'Barcelona'], 'football', true, 1, 'en'),
('Who is known as CR7?', 'Cristiano Ronaldo', ARRAY['Neymar', 'Messi', 'Mbappé'], 'football', true, 1, 'en'),
('Which goalkeeper won the 2022 World Cup with Argentina?', 'Emiliano Martínez', ARRAY['Thibaut Courtois', 'Manuel Neuer', 'Alisson'], 'football', true, 2, 'en'),
('How long is an NBA basketball game?', '48 minutes', ARRAY['40 minutes', '60 minutes', '45 minutes'], 'football', true, 2, 'en')
ON CONFLICT DO NOTHING;

-- POP CULTURE QUESTIONS (English)
INSERT INTO questions (question_text, correct_answer, wrong_answers, category, is_active, difficulty, language) VALUES
('What is the highest-grossing film of all time?', 'Avatar', ARRAY['Avengers: Endgame', 'Titanic', 'Star Wars'], 'pop-culture', true, 1, 'en'),
('Who sang Thriller?', 'Michael Jackson', ARRAY['Prince', 'Madonna', 'Whitney Houston'], 'pop-culture', true, 1, 'en'),
('In which TV series do we find the Stark family?', 'Game of Thrones', ARRAY['The Witcher', 'Vikings', 'The Last Kingdom'], 'pop-culture', true, 2, 'en'),
('Which artist painted The Starry Night?', 'Vincent van Gogh', ARRAY['Claude Monet', 'Pablo Picasso', 'Salvador Dalí'], 'pop-culture', true, 2, 'en'),
('In what year was the first iPhone released?', '2007', ARRAY['2005', '2008', '2010'], 'pop-culture', true, 2, 'en'),
('Who created Facebook?', 'Mark Zuckerberg', ARRAY['Jack Dorsey', 'Larry Page', 'Elon Musk'], 'pop-culture', true, 1, 'en'),
('Which band has Freddie Mercury as lead singer?', 'Queen', ARRAY['The Beatles', 'Led Zeppelin', 'Pink Floyd'], 'pop-culture', true, 1, 'en')
ON CONFLICT DO NOTHING;
