-- Migration: 1v1 Duel System
-- Real-time multiplayer duels

-- ============================================
-- DUEL TABLES
-- ============================================

-- Duel sessions
CREATE TABLE IF NOT EXISTS duels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished', 'cancelled')),
  category TEXT DEFAULT 'general',
  rounds_total INTEGER NOT NULL DEFAULT 5,
  current_round INTEGER NOT NULL DEFAULT 0,
  host_score INTEGER NOT NULL DEFAULT 0,
  guest_score INTEGER NOT NULL DEFAULT 0,
  winner_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

-- Duel rounds (each question in a duel)
CREATE TABLE IF NOT EXISTS duel_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duel_id UUID NOT NULL REFERENCES duels(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  question_id UUID NOT NULL REFERENCES questions(id),
  host_answer TEXT,
  host_answer_time_ms INTEGER,
  host_correct BOOLEAN,
  guest_answer TEXT,
  guest_answer_time_ms INTEGER,
  guest_correct BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(duel_id, round_number)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_duels_code ON duels(code);
CREATE INDEX IF NOT EXISTS idx_duels_host ON duels(host_id);
CREATE INDEX IF NOT EXISTS idx_duels_guest ON duels(guest_id);
CREATE INDEX IF NOT EXISTS idx_duels_status ON duels(status);
CREATE INDEX IF NOT EXISTS idx_duel_rounds_duel ON duel_rounds(duel_id);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE duel_rounds ENABLE ROW LEVEL SECURITY;

-- Duels: Players can see their own duels
CREATE POLICY "Users can view duels they participate in" ON duels
  FOR SELECT USING (auth.uid() = host_id OR auth.uid() = guest_id OR status = 'waiting');

CREATE POLICY "Users can create duels" ON duels
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Users can update their duels" ON duels
  FOR UPDATE USING (auth.uid() = host_id OR auth.uid() = guest_id);

-- Duel rounds: Players can see rounds of their duels
CREATE POLICY "Users can view duel rounds" ON duel_rounds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM duels
      WHERE duels.id = duel_rounds.duel_id
      AND (duels.host_id = auth.uid() OR duels.guest_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert duel rounds" ON duel_rounds
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM duels
      WHERE duels.id = duel_rounds.duel_id
      AND (duels.host_id = auth.uid() OR duels.guest_id = auth.uid())
    )
  );

CREATE POLICY "Users can update duel rounds" ON duel_rounds
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM duels
      WHERE duels.id = duel_rounds.duel_id
      AND (duels.host_id = auth.uid() OR duels.guest_id = auth.uid())
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Generate unique 6-character code for duel
CREATE OR REPLACE FUNCTION generate_duel_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create a new duel
CREATE OR REPLACE FUNCTION create_duel(p_host_id UUID, p_category TEXT DEFAULT 'general', p_rounds INTEGER DEFAULT 5)
RETURNS TABLE (
  duel_id UUID,
  duel_code VARCHAR(6)
) AS $$
DECLARE
  v_code VARCHAR(6);
  v_duel_id UUID;
BEGIN
  -- Generate unique code
  LOOP
    v_code := generate_duel_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM duels WHERE code = v_code AND status = 'waiting');
  END LOOP;

  -- Create duel
  INSERT INTO duels (code, host_id, category, rounds_total)
  VALUES (v_code, p_host_id, p_category, p_rounds)
  RETURNING id INTO v_duel_id;

  RETURN QUERY SELECT v_duel_id, v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Join a duel by code
CREATE OR REPLACE FUNCTION join_duel(p_code VARCHAR(6), p_guest_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  duel_id UUID,
  message TEXT
) AS $$
DECLARE
  v_duel RECORD;
BEGIN
  -- Find the duel
  SELECT * INTO v_duel FROM duels WHERE code = UPPER(p_code) AND status = 'waiting';

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Duel non trouvé ou déjà commencé';
    RETURN;
  END IF;

  IF v_duel.host_id = p_guest_id THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Tu ne peux pas rejoindre ton propre duel';
    RETURN;
  END IF;

  -- Join the duel
  UPDATE duels
  SET guest_id = p_guest_id, status = 'playing', started_at = NOW()
  WHERE id = v_duel.id;

  RETURN QUERY SELECT TRUE, v_duel.id, 'Duel rejoint avec succès';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get questions for a duel
CREATE OR REPLACE FUNCTION get_duel_questions(p_duel_id UUID)
RETURNS TABLE (
  round_number INTEGER,
  question_id UUID,
  question_text TEXT,
  player_name TEXT,
  options JSONB
) AS $$
DECLARE
  v_duel RECORD;
BEGIN
  SELECT * INTO v_duel FROM duels WHERE id = p_duel_id;

  RETURN QUERY
  SELECT
    row_number() OVER ()::INTEGER as round_number,
    q.id as question_id,
    q.question_text,
    q.player_name,
    q.options
  FROM questions q
  WHERE q.is_active = true
    AND q.options IS NOT NULL
    AND q.player_name IS NOT NULL
    AND (v_duel.category = 'general' OR q.category = v_duel.category)
  ORDER BY RANDOM()
  LIMIT v_duel.rounds_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Submit answer in duel
CREATE OR REPLACE FUNCTION submit_duel_answer(
  p_duel_id UUID,
  p_user_id UUID,
  p_round_number INTEGER,
  p_answer TEXT,
  p_answer_time_ms INTEGER
)
RETURNS TABLE (
  success BOOLEAN,
  is_correct BOOLEAN,
  correct_answer TEXT
) AS $$
DECLARE
  v_duel RECORD;
  v_round RECORD;
  v_question RECORD;
  v_is_host BOOLEAN;
  v_is_correct BOOLEAN;
BEGIN
  -- Get duel
  SELECT * INTO v_duel FROM duels WHERE id = p_duel_id;
  v_is_host := v_duel.host_id = p_user_id;

  -- Get or create round
  SELECT * INTO v_round FROM duel_rounds WHERE duel_id = p_duel_id AND round_number = p_round_number;

  IF NOT FOUND THEN
    -- Need to create round - get question first
    WITH duel_q AS (
      SELECT q.id, q.options->>'correct' as correct
      FROM questions q
      WHERE q.is_active = true AND q.options IS NOT NULL
      ORDER BY RANDOM()
      LIMIT 1
    )
    INSERT INTO duel_rounds (duel_id, round_number, question_id)
    SELECT p_duel_id, p_round_number, duel_q.id FROM duel_q
    RETURNING * INTO v_round;
  END IF;

  -- Get question to check answer
  SELECT * INTO v_question FROM questions WHERE id = v_round.question_id;
  v_is_correct := p_answer = (v_question.options->>'correct');

  -- Update round with answer
  IF v_is_host THEN
    UPDATE duel_rounds
    SET host_answer = p_answer, host_answer_time_ms = p_answer_time_ms, host_correct = v_is_correct
    WHERE id = v_round.id;

    IF v_is_correct THEN
      UPDATE duels SET host_score = host_score + 1 WHERE id = p_duel_id;
    END IF;
  ELSE
    UPDATE duel_rounds
    SET guest_answer = p_answer, guest_answer_time_ms = p_answer_time_ms, guest_correct = v_is_correct
    WHERE id = v_round.id;

    IF v_is_correct THEN
      UPDATE duels SET guest_score = guest_score + 1 WHERE id = p_duel_id;
    END IF;
  END IF;

  -- Update current round
  UPDATE duels SET current_round = GREATEST(current_round, p_round_number) WHERE id = p_duel_id;

  RETURN QUERY SELECT TRUE, v_is_correct, v_question.options->>'correct';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Finish duel
CREATE OR REPLACE FUNCTION finish_duel(p_duel_id UUID)
RETURNS TABLE (
  winner_id UUID,
  host_score INTEGER,
  guest_score INTEGER
) AS $$
DECLARE
  v_duel RECORD;
  v_winner UUID;
BEGIN
  SELECT * INTO v_duel FROM duels WHERE id = p_duel_id;

  IF v_duel.host_score > v_duel.guest_score THEN
    v_winner := v_duel.host_id;
  ELSIF v_duel.guest_score > v_duel.host_score THEN
    v_winner := v_duel.guest_id;
  END IF;

  UPDATE duels
  SET status = 'finished', winner_id = v_winner, finished_at = NOW()
  WHERE id = p_duel_id;

  RETURN QUERY SELECT v_winner, v_duel.host_score, v_duel.guest_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for duels
ALTER PUBLICATION supabase_realtime ADD TABLE duels;
ALTER PUBLICATION supabase_realtime ADD TABLE duel_rounds;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_duel TO authenticated;
GRANT EXECUTE ON FUNCTION join_duel TO authenticated;
GRANT EXECUTE ON FUNCTION get_duel_questions TO authenticated;
GRANT EXECUTE ON FUNCTION submit_duel_answer TO authenticated;
GRANT EXECUTE ON FUNCTION finish_duel TO authenticated;
