/*
  # Suitability Calculator System

  1. New Tables
    - `suitability_sessions` - Quiz sessions between two users
    - `suitability_questions` - Questions for the compatibility quiz

  2. Functions
    - `calculate_suitability` - Calculate compatibility score based on answers

  3. Security
    - Enable RLS on all tables
    - Users can only access their own sessions
*/

-- Create suitability sessions table
CREATE TABLE IF NOT EXISTS suitability_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user1_phone TEXT,
  user2_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'expired')),
  user1_answers JSONB,
  user2_answers JSONB,
  compatibility_score INTEGER,
  category_scores JSONB,
  insights JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  UNIQUE(user1_id, user2_id, DATE(created_at))
);

-- Create suitability questions table
CREATE TABLE IF NOT EXISTS suitability_questions (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('values', 'lifestyle', 'communication', 'future', 'personality')),
  weight FLOAT DEFAULT 1.0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE suitability_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suitability_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for suitability_sessions
CREATE POLICY "Users can view their own sessions"
  ON suitability_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create sessions"
  ON suitability_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can update their own sessions"
  ON suitability_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- RLS Policies for suitability_questions
CREATE POLICY "Anyone can view questions"
  ON suitability_questions
  FOR SELECT
  TO authenticated
  USING (active = true);

-- Function to calculate suitability score
CREATE OR REPLACE FUNCTION calculate_suitability(session_id UUID)
RETURNS INTEGER AS $$
DECLARE
  session_record RECORD;
  user1_answers JSONB;
  user2_answers JSONB;
  category_scores JSONB := '{}'::JSONB;
  overall_score INTEGER := 0;
  category_weights JSONB := '{"values": 0.25, "communication": 0.25, "future": 0.2, "personality": 0.15, "lifestyle": 0.15}'::JSONB;
  categories TEXT[] := ARRAY['values', 'lifestyle', 'communication', 'future', 'personality'];
  category TEXT;
  category_score INTEGER;
  insights JSONB := '{}'::JSONB;
BEGIN
  -- Get session data
  SELECT * INTO session_record FROM suitability_sessions WHERE id = session_id;
  
  IF session_record IS NULL OR session_record.user1_answers IS NULL OR session_record.user2_answers IS NULL THEN
    RETURN 0;
  END IF;
  
  user1_answers := session_record.user1_answers;
  user2_answers := session_record.user2_answers;
  
  -- Calculate scores for each category
  FOREACH category IN ARRAY categories LOOP
    -- Calculate match percentage for this category
    WITH category_questions AS (
      SELECT 
        q->>'question_id' AS question_id
      FROM jsonb_array_elements(user1_answers) q
      WHERE q->>'category' = category
    ),
    matching_answers AS (
      SELECT 
        COUNT(*) AS matches
      FROM jsonb_array_elements(user1_answers) u1
      JOIN jsonb_array_elements(user2_answers) u2 
        ON u1->>'question_id' = u2->>'question_id' 
        AND u1->>'answer' = u2->>'answer'
      WHERE u1->>'category' = category
    ),
    total_questions AS (
      SELECT COUNT(*) AS total FROM category_questions
    )
    SELECT 
      CASE 
        WHEN t.total > 0 THEN ROUND((m.matches::FLOAT / t.total) * 100)
        ELSE 0
      END INTO category_score
    FROM matching_answers m, total_questions t;
    
    -- Add to category scores
    category_scores := category_scores || jsonb_build_object(category, category_score);
    
    -- Add weighted score to overall
    overall_score := overall_score + (category_score * (category_weights->>category)::FLOAT);
  END LOOP;
  
  -- Generate insights based on scores
  insights := jsonb_build_object(
    'strengths', 
    (SELECT jsonb_agg(category) 
     FROM jsonb_each_text(category_scores) 
     WHERE value::INTEGER >= 80),
    
    'improvements',
    (SELECT jsonb_agg(category) 
     FROM jsonb_each_text(category_scores) 
     WHERE value::INTEGER < 60),
    
    'recommendations',
    CASE 
      WHEN overall_score >= 85 THEN jsonb_build_array(
        'You have excellent compatibility! Focus on maintaining open communication.',
        'Consider planning activities that leverage your shared interests.'
      )
      WHEN overall_score >= 70 THEN jsonb_build_array(
        'You have good compatibility with room for growth.',
        'Work on understanding each other''s differences as strengths.'
      )
      ELSE jsonb_build_array(
        'Focus on building understanding in areas where you differ.',
        'Consider couples counseling to improve communication.'
      )
    END
  );
  
  -- Update session with results
  UPDATE suitability_sessions
  SET 
    compatibility_score = ROUND(overall_score),
    category_scores = category_scores,
    insights = insights,
    status = 'completed',
    completed_at = NOW()
  WHERE id = session_id;
  
  RETURN ROUND(overall_score);
END;
$$ LANGUAGE plpgsql;

-- Insert sample questions
INSERT INTO suitability_questions (question, options, category) VALUES
('What''s most important to you in a relationship?', 
 '[{"text": "Trust and honesty", "value": 1}, {"text": "Fun and adventure", "value": 2}, {"text": "Deep emotional connection", "value": 3}, {"text": "Shared goals and values", "value": 4}]', 
 'values'),
('How do you prefer to spend your weekends?', 
 '[{"text": "Relaxing at home", "value": 1}, {"text": "Going out and socializing", "value": 2}, {"text": "Trying new activities", "value": 3}, {"text": "Working on personal projects", "value": 4}]', 
 'lifestyle'),
('When you''re upset, how do you prefer your partner to respond?', 
 '[{"text": "Give me space to process", "value": 1}, {"text": "Talk it through immediately", "value": 2}, {"text": "Offer physical comfort", "value": 3}, {"text": "Help me find solutions", "value": 4}]', 
 'communication')
ON CONFLICT DO NOTHING;