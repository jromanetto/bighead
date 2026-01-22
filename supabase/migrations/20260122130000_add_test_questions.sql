-- Migration: Add test questions for daily challenge
-- The daily challenge function expects questions with specific columns

-- Ensure questions table has required columns for daily challenges
ALTER TABLE questions ADD COLUMN IF NOT EXISTS player_name TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS options JSONB;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'football';

-- Insert test questions for daily challenges (BIGHEAD - Football player quiz)
-- Including correct_answer and wrong_answers to satisfy NOT NULL constraints
INSERT INTO questions (question_text, player_name, options, category, is_active, correct_answer, wrong_answers, difficulty)
VALUES
  (
    'Ce joueur français a marqué en finale de Coupe du Monde 2018. Il évolue au Real Madrid et est considéré comme l''un des meilleurs joueurs au monde.',
    'Kylian Mbappé',
    '{"A": "Kylian Mbappé", "B": "Antoine Griezmann", "C": "Ousmane Dembélé", "D": "Marcus Thuram", "correct": "A"}'::jsonb,
    'football',
    true,
    'Kylian Mbappé',
    ARRAY['Antoine Griezmann', 'Ousmane Dembélé', 'Marcus Thuram'],
    1
  ),
  (
    'Légende argentine, il a remporté la Coupe du Monde 2022 au Qatar. Il a joué au FC Barcelone pendant plus de 20 ans avant de rejoindre le PSG puis l''Inter Miami.',
    'Lionel Messi',
    '{"A": "Diego Maradona", "B": "Lionel Messi", "C": "Sergio Agüero", "D": "Angel Di Maria", "correct": "B"}'::jsonb,
    'football',
    true,
    'Lionel Messi',
    ARRAY['Diego Maradona', 'Sergio Agüero', 'Angel Di Maria'],
    1
  ),
  (
    'Attaquant norvégien au physique imposant, il a explosé à Dortmund avant de rejoindre Manchester City où il marque à une cadence impressionnante.',
    'Erling Haaland',
    '{"A": "Robert Lewandowski", "B": "Harry Kane", "C": "Erling Haaland", "D": "Martin Ødegaard", "correct": "C"}'::jsonb,
    'football',
    true,
    'Erling Haaland',
    ARRAY['Robert Lewandowski', 'Harry Kane', 'Martin Ødegaard'],
    1
  ),
  (
    'Milieu de terrain anglais, il a été le capitaine emblématique du Real Madrid pendant de nombreuses années et a remporté plusieurs Ligues des Champions.',
    'David Beckham',
    '{"A": "Steven Gerrard", "B": "Frank Lampard", "C": "Wayne Rooney", "D": "David Beckham", "correct": "D"}'::jsonb,
    'football',
    true,
    'David Beckham',
    ARRAY['Steven Gerrard', 'Frank Lampard', 'Wayne Rooney'],
    2
  ),
  (
    'Gardien légendaire italien, il a joué toute sa carrière à la Juventus et détient le record d''invincibilité en Serie A.',
    'Gianluigi Buffon',
    '{"A": "Gianluigi Buffon", "B": "Iker Casillas", "C": "Manuel Neuer", "D": "Thibaut Courtois", "correct": "A"}'::jsonb,
    'football',
    true,
    'Gianluigi Buffon',
    ARRAY['Iker Casillas', 'Manuel Neuer', 'Thibaut Courtois'],
    2
  ),
  (
    'Ce joueur portugais est considéré comme l''un des meilleurs de l''histoire. Il a marqué plus de 800 buts en carrière et joué au Real Madrid, Manchester United et Juventus.',
    'Cristiano Ronaldo',
    '{"A": "Luis Figo", "B": "Cristiano Ronaldo", "C": "Nani", "D": "Ricardo Quaresma", "correct": "B"}'::jsonb,
    'football',
    true,
    'Cristiano Ronaldo',
    ARRAY['Luis Figo', 'Nani', 'Ricardo Quaresma'],
    1
  ),
  (
    'Défenseur central espagnol, il a formé un duo légendaire avec Piqué au FC Barcelone et en équipe nationale.',
    'Carles Puyol',
    '{"A": "Sergio Ramos", "B": "Gerard Piqué", "C": "Carles Puyol", "D": "Jordi Alba", "correct": "C"}'::jsonb,
    'football',
    true,
    'Carles Puyol',
    ARRAY['Sergio Ramos', 'Gerard Piqué', 'Jordi Alba'],
    2
  ),
  (
    'Milieu de terrain brésilien au jeu spectaculaire, il était connu pour ses gestes techniques et son sourire permanent sur le terrain.',
    'Ronaldinho',
    '{"A": "Kaká", "B": "Rivaldo", "C": "Ronaldinho", "D": "Neymar", "correct": "C"}'::jsonb,
    'football',
    true,
    'Ronaldinho',
    ARRAY['Kaká', 'Rivaldo', 'Neymar'],
    1
  ),
  (
    'Attaquant français, il a remporté la Coupe du Monde 1998 avec les Bleus et joué au Real Madrid où il formait un duo redoutable avec Zidane.',
    'Zinédine Zidane',
    '{"A": "Thierry Henry", "B": "Zinédine Zidane", "C": "David Trezeguet", "D": "Patrick Vieira", "correct": "B"}'::jsonb,
    'football',
    true,
    'Zinédine Zidane',
    ARRAY['Thierry Henry', 'David Trezeguet', 'Patrick Vieira'],
    1
  ),
  (
    'Attaquant ivoirien surnommé "Drogba", il est devenu une légende de Chelsea où il a marqué des buts décisifs notamment en finale de Ligue des Champions 2012.',
    'Didier Drogba',
    '{"A": "Didier Drogba", "B": "Samuel Eto''o", "C": "Yaya Touré", "D": "Emmanuel Adebayor", "correct": "A"}'::jsonb,
    'football',
    true,
    'Didier Drogba',
    ARRAY['Samuel Eto''o', 'Yaya Touré', 'Emmanuel Adebayor'],
    1
  )
ON CONFLICT DO NOTHING;
