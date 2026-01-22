-- Migration: Weekly Tournament System
-- Automated weekly competitions with rankings

-- ============================================
-- TOURNAMENT TABLES
-- ============================================

-- Tournaments
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'finished')),
  questions_count INTEGER NOT NULL DEFAULT 10,
  time_limit_seconds INTEGER DEFAULT 20,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  prize_xp INTEGER DEFAULT 500,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tournament participants
CREATE TABLE IF NOT EXISTS tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  total_time_ms INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  rank INTEGER,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

-- Tournament questions (pre-selected for each tournament)
CREATE TABLE IF NOT EXISTS tournament_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id),
  question_order INTEGER NOT NULL,
  UNIQUE(tournament_id, question_order)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_dates ON tournaments(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user ON tournament_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_score ON tournament_participants(score DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tournaments are viewable by everyone" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Tournament participants viewable" ON tournament_participants FOR SELECT USING (true);
CREATE POLICY "Users can join tournaments" ON tournament_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own participation" ON tournament_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Tournament questions viewable by participants" ON tournament_questions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tournament_participants
    WHERE tournament_participants.tournament_id = tournament_questions.tournament_id
    AND tournament_participants.user_id = auth.uid()
  )
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Get current/upcoming tournament
CREATE OR REPLACE FUNCTION get_current_tournament()
RETURNS TABLE (
  tournament_id UUID,
  tournament_name TEXT,
  tournament_description TEXT,
  tournament_category TEXT,
  tournament_status TEXT,
  questions_count INTEGER,
  time_limit_seconds INTEGER,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  prize_xp INTEGER,
  participants_count BIGINT,
  user_participated BOOLEAN,
  user_rank INTEGER,
  user_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    t.description,
    t.category,
    t.status,
    t.questions_count,
    t.time_limit_seconds,
    t.start_date,
    t.end_date,
    t.prize_xp,
    (SELECT COUNT(*) FROM tournament_participants WHERE tournament_participants.tournament_id = t.id),
    EXISTS (
      SELECT 1 FROM tournament_participants
      WHERE tournament_participants.tournament_id = t.id
      AND tournament_participants.user_id = auth.uid()
    ),
    (
      SELECT tp.rank FROM tournament_participants tp
      WHERE tp.tournament_id = t.id AND tp.user_id = auth.uid()
    ),
    (
      SELECT tp.score FROM tournament_participants tp
      WHERE tp.tournament_id = t.id AND tp.user_id = auth.uid()
    )
  FROM tournaments t
  WHERE t.status IN ('upcoming', 'active')
    OR (t.status = 'finished' AND t.end_date > NOW() - INTERVAL '1 day')
  ORDER BY
    CASE t.status
      WHEN 'active' THEN 1
      WHEN 'upcoming' THEN 2
      WHEN 'finished' THEN 3
    END,
    t.start_date
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Join tournament
CREATE OR REPLACE FUNCTION join_tournament(p_tournament_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_tournament RECORD;
BEGIN
  SELECT * INTO v_tournament FROM tournaments WHERE id = p_tournament_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Tournoi introuvable';
    RETURN;
  END IF;

  IF v_tournament.status != 'active' THEN
    RETURN QUERY SELECT FALSE, 'Ce tournoi n''est pas actif';
    RETURN;
  END IF;

  IF NOW() > v_tournament.end_date THEN
    RETURN QUERY SELECT FALSE, 'Ce tournoi est terminé';
    RETURN;
  END IF;

  -- Check if already joined
  IF EXISTS (SELECT 1 FROM tournament_participants WHERE tournament_id = p_tournament_id AND user_id = auth.uid()) THEN
    RETURN QUERY SELECT TRUE, 'Déjà inscrit';
    RETURN;
  END IF;

  -- Join
  INSERT INTO tournament_participants (tournament_id, user_id)
  VALUES (p_tournament_id, auth.uid());

  RETURN QUERY SELECT TRUE, 'Inscription réussie';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get tournament questions
CREATE OR REPLACE FUNCTION get_tournament_questions(p_tournament_id UUID)
RETURNS TABLE (
  question_order INTEGER,
  question_id UUID,
  question_text TEXT,
  player_name TEXT,
  options JSONB
) AS $$
BEGIN
  -- Check if user is participant
  IF NOT EXISTS (
    SELECT 1 FROM tournament_participants
    WHERE tournament_id = p_tournament_id AND user_id = auth.uid()
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    tq.question_order,
    tq.question_id,
    q.question_text,
    q.player_name,
    q.options
  FROM tournament_questions tq
  JOIN questions q ON q.id = tq.question_id
  WHERE tq.tournament_id = p_tournament_id
  ORDER BY tq.question_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Submit tournament result
CREATE OR REPLACE FUNCTION submit_tournament_result(
  p_tournament_id UUID,
  p_score INTEGER,
  p_correct_answers INTEGER,
  p_total_time_ms INTEGER
)
RETURNS TABLE (
  success BOOLEAN,
  final_rank INTEGER,
  total_participants BIGINT
) AS $$
DECLARE
  v_rank INTEGER;
  v_total BIGINT;
BEGIN
  -- Update participant
  UPDATE tournament_participants
  SET
    score = p_score,
    correct_answers = p_correct_answers,
    total_time_ms = p_total_time_ms,
    completed = TRUE,
    completed_at = NOW()
  WHERE tournament_id = p_tournament_id AND user_id = auth.uid();

  -- Calculate ranks for all participants
  WITH ranked AS (
    SELECT
      id,
      ROW_NUMBER() OVER (ORDER BY score DESC, total_time_ms ASC) as new_rank
    FROM tournament_participants
    WHERE tournament_id = p_tournament_id AND completed = TRUE
  )
  UPDATE tournament_participants tp
  SET rank = ranked.new_rank
  FROM ranked
  WHERE tp.id = ranked.id;

  -- Get user's rank
  SELECT rank INTO v_rank FROM tournament_participants
  WHERE tournament_id = p_tournament_id AND user_id = auth.uid();

  SELECT COUNT(*) INTO v_total FROM tournament_participants
  WHERE tournament_id = p_tournament_id AND completed = TRUE;

  RETURN QUERY SELECT TRUE, v_rank, v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get tournament leaderboard
CREATE OR REPLACE FUNCTION get_tournament_leaderboard(p_tournament_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  rank INTEGER,
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  score INTEGER,
  correct_answers INTEGER,
  total_time_ms INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tp.rank,
    tp.user_id,
    u.username,
    u.avatar_url,
    tp.score,
    tp.correct_answers,
    tp.total_time_ms
  FROM tournament_participants tp
  JOIN users u ON u.id = tp.user_id
  WHERE tp.tournament_id = p_tournament_id
    AND tp.completed = TRUE
  ORDER BY tp.rank
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create weekly tournament (to be called by cron job)
CREATE OR REPLACE FUNCTION create_weekly_tournament()
RETURNS UUID AS $$
DECLARE
  v_tournament_id UUID;
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ;
BEGIN
  -- Set dates: Monday to Sunday
  v_start := date_trunc('week', NOW()) + INTERVAL '1 week';
  v_end := v_start + INTERVAL '6 days 23 hours 59 minutes';

  -- Create tournament
  INSERT INTO tournaments (name, description, category, status, questions_count, start_date, end_date, prize_xp)
  VALUES (
    'Tournoi de la Semaine',
    'Affrontez les meilleurs joueurs dans ce tournoi hebdomadaire !',
    'general',
    'upcoming',
    15,
    v_start,
    v_end,
    500
  )
  RETURNING id INTO v_tournament_id;

  -- Select random questions
  INSERT INTO tournament_questions (tournament_id, question_id, question_order)
  SELECT
    v_tournament_id,
    q.id,
    row_number() OVER (ORDER BY RANDOM())
  FROM questions q
  WHERE q.is_active = true AND q.options IS NOT NULL AND q.player_name IS NOT NULL
  ORDER BY RANDOM()
  LIMIT 15;

  RETURN v_tournament_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert a sample tournament for testing
INSERT INTO tournaments (name, description, category, status, questions_count, time_limit_seconds, start_date, end_date, prize_xp)
VALUES (
  'Tournoi de la Semaine',
  'Testez vos connaissances et grimpez dans le classement !',
  'general',
  'active',
  10,
  15,
  NOW(),
  NOW() + INTERVAL '7 days',
  500
)
ON CONFLICT DO NOTHING;

-- Add questions to the sample tournament
INSERT INTO tournament_questions (tournament_id, question_id, question_order)
SELECT
  t.id,
  q.id,
  row_number() OVER (ORDER BY RANDOM())
FROM tournaments t
CROSS JOIN LATERAL (
  SELECT id FROM questions
  WHERE is_active = true AND options IS NOT NULL AND player_name IS NOT NULL
  ORDER BY RANDOM()
  LIMIT 10
) q
WHERE t.name = 'Tournoi de la Semaine' AND t.status = 'active'
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_current_tournament TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_tournament TO anon;
GRANT EXECUTE ON FUNCTION join_tournament TO authenticated;
GRANT EXECUTE ON FUNCTION get_tournament_questions TO authenticated;
GRANT EXECUTE ON FUNCTION submit_tournament_result TO authenticated;
GRANT EXECUTE ON FUNCTION get_tournament_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION get_tournament_leaderboard TO anon;
