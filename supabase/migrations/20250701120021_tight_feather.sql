/*
  # Love Meter System

  1. New Tables
    - `love_meter_results` - Store quiz results
    - `love_meter_questions` - Questions for the love meter quiz

  2. Security
    - Enable RLS on all tables
    - Users can only access their own results
*/

-- Create love meter results table
CREATE TABLE IF NOT EXISTS love_meter_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  category TEXT NOT NULL,
  answers JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create love meter questions table
CREATE TABLE IF NOT EXISTS love_meter_questions (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  weight INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE love_meter_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_meter_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for love_meter_results
CREATE POLICY "Users can view their own results"
  ON love_meter_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create results"
  ON love_meter_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for love_meter_questions
CREATE POLICY "Anyone can view questions"
  ON love_meter_questions
  FOR SELECT
  TO authenticated
  USING (active = true);

-- Insert sample questions
INSERT INTO love_meter_questions (question, options) VALUES
('How quickly do they respond to your messages?', 
 '[{"text": "Almost immediately", "score": 10}, {"text": "Within an hour or two", "score": 8}, {"text": "Usually within the same day", "score": 5}, {"text": "Often takes a day or more", "score": 2}, {"text": "Frequently leaves me on read", "score": 0}]'),
('Do they initiate conversations with you?', 
 '[{"text": "Very often, almost daily", "score": 10}, {"text": "Regularly, a few times a week", "score": 8}, {"text": "Sometimes, but I usually reach out first", "score": 5}, {"text": "Rarely initiates contact", "score": 2}, {"text": "Never starts conversations", "score": 0}]'),
('How often do they compliment you or show interest in your life?', 
 '[{"text": "Frequently and genuinely", "score": 10}, {"text": "Regularly, seems to notice things about me", "score": 8}, {"text": "Occasionally, when something stands out", "score": 5}, {"text": "Rarely gives compliments", "score": 2}, {"text": "Never compliments or shows interest", "score": 0}]'),
('Do they ask personal or deep questions about your life?', 
 '[{"text": "Yes, they''re genuinely curious about me", "score": 10}, {"text": "Often asks thoughtful questions", "score": 8}, {"text": "Sometimes, but mostly surface-level", "score": 5}, {"text": "Rarely asks about my personal life", "score": 2}, {"text": "Never asks personal questions", "score": 0}]'),
('How often do they want to meet in person or video call?', 
 '[{"text": "Frequently suggests meeting up", "score": 10}, {"text": "Regularly makes plans to see me", "score": 8}, {"text": "Sometimes, but I usually initiate", "score": 5}, {"text": "Rarely wants to meet up", "score": 2}, {"text": "Always avoids meeting in person", "score": 0}]'),
('Do they remember small details you''ve shared about yourself?', 
 '[{"text": "Remembers everything, even small details", "score": 10}, {"text": "Remembers important things I''ve shared", "score": 8}, {"text": "Remembers some things, forgets others", "score": 5}, {"text": "Rarely remembers what I''ve told them", "score": 2}, {"text": "Never seems to remember anything about me", "score": 0}]'),
('Do they make future plans that include you?', 
 '[{"text": "Often talks about long-term future together", "score": 10}, {"text": "Makes plans weeks or months ahead", "score": 8}, {"text": "Sometimes makes near-future plans", "score": 5}, {"text": "Rarely plans ahead with me", "score": 2}, {"text": "Never discusses future plans", "score": 0}]'),
('Have they introduced you to their friends or talked about you to others?', 
 '[{"text": "Introduced me to friends and family", "score": 10}, {"text": "Has introduced me to some friends", "score": 8}, {"text": "Mentioned meeting friends someday", "score": 5}, {"text": "Keeps our relationship private", "score": 2}, {"text": "Actively avoids being seen with me", "score": 0}]'),
('Do they show signs of jealousy or concern when you talk about others?', 
 '[{"text": "Clearly jealous when I mention others", "score": 10}, {"text": "Shows subtle signs of jealousy", "score": 8}, {"text": "Sometimes seems curious about others in my life", "score": 5}, {"text": "Rarely shows any reaction", "score": 2}, {"text": "Completely indifferent to who else I spend time with", "score": 0}]'),
('Have they clearly communicated their feelings or intentions?', 
 '[{"text": "Has openly expressed strong feelings for me", "score": 10}, {"text": "Has hinted at deeper feelings", "score": 8}, {"text": "Gives mixed signals about their feelings", "score": 5}, {"text": "Avoids discussing feelings", "score": 2}, {"text": "Has stated they''re not interested romantically", "score": 0}]')
ON CONFLICT DO NOTHING;

-- Function to calculate love meter category
CREATE OR REPLACE FUNCTION get_love_meter_category(score INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF score >= 85 THEN
    RETURN 'Deeply In Love';
  ELSIF score >= 70 THEN
    RETURN 'Strongly Interested';
  ELSIF score >= 50 THEN
    RETURN 'Curious & Friendly';
  ELSIF score >= 30 THEN
    RETURN 'Just Friends';
  ELSE
    RETURN 'Not Interested';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to save love meter result
CREATE OR REPLACE FUNCTION save_love_meter_result(
  p_user_id UUID,
  p_score INTEGER,
  p_answers JSONB
)
RETURNS UUID AS $$
DECLARE
  result_id UUID;
  category TEXT;
BEGIN
  -- Get category based on score
  category := get_love_meter_category(p_score);
  
  -- Insert result
  INSERT INTO love_meter_results (
    user_id,
    score,
    category,
    answers
  ) VALUES (
    p_user_id,
    p_score,
    category,
    p_answers
  ) RETURNING id INTO result_id;
  
  RETURN result_id;
END;
$$ LANGUAGE plpgsql;