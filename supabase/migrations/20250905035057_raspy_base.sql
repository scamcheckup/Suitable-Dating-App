/*
  # Fix Database Functions and Policies

  1. Database Functions
    - Create missing calculate_compatibility function
    - Create missing update_updated_at_column function
    - Create missing handle_new_user function
    - Create missing get_user_vibe_stats function
    - Create missing get_vibe_vote_leaderboard function
    - Create missing calculate_suitability function
    - Create missing save_love_meter_result function

  2. Missing Tables
    - Create vibe_votes table
    - Create love_meter_questions table
    - Create love_meter_results table
    - Create ai_chat_sessions table
    - Create ai_chat_messages table
    - Create suitability_sessions table
    - Create speed_dating_events table
    - Create speed_dating_registrations table
    - Create speed_dating_rooms table
    - Create user_subscriptions table
    - Create payments table

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for each table
*/

-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create calculate_compatibility function
CREATE OR REPLACE FUNCTION calculate_compatibility(user1_id UUID, user2_id UUID)
RETURNS INTEGER AS $$
DECLARE
    user1_data RECORD;
    user2_data RECORD;
    compatibility_score INTEGER := 0;
    max_score INTEGER := 100;
BEGIN
    -- Get user data
    SELECT * INTO user1_data FROM users WHERE id = user1_id;
    SELECT * INTO user2_data FROM users WHERE id = user2_id;
    
    IF user1_data IS NULL OR user2_data IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Age compatibility (max 15 points)
    IF ABS(user1_data.age - user2_data.age) <= 3 THEN
        compatibility_score := compatibility_score + 15;
    ELSIF ABS(user1_data.age - user2_data.age) <= 5 THEN
        compatibility_score := compatibility_score + 12;
    ELSIF ABS(user1_data.age - user2_data.age) <= 8 THEN
        compatibility_score := compatibility_score + 8;
    ELSIF ABS(user1_data.age - user2_data.age) <= 12 THEN
        compatibility_score := compatibility_score + 5;
    END IF;
    
    -- Location compatibility (max 10 points)
    IF user1_data.state = user2_data.state THEN
        compatibility_score := compatibility_score + 10;
        IF user1_data.lga = user2_data.lga THEN
            compatibility_score := compatibility_score + 5; -- Bonus for same LGA
        END IF;
    END IF;
    
    -- Education compatibility (max 10 points)
    IF user1_data.education_level = user2_data.education_level THEN
        compatibility_score := compatibility_score + 10;
    ELSIF (user1_data.education_level IN ('Bachelor''s', 'Master''s', 'PhD') AND 
           user2_data.education_level IN ('Bachelor''s', 'Master''s', 'PhD')) THEN
        compatibility_score := compatibility_score + 7;
    END IF;
    
    -- Religion compatibility (max 15 points)
    IF user1_data.religion = user2_data.religion THEN
        compatibility_score := compatibility_score + 15;
    ELSIF (user1_data.religion = 'Not Religious' OR user2_data.religion = 'Not Religious') THEN
        compatibility_score := compatibility_score + 5;
    END IF;
    
    -- Lifestyle compatibility (max 15 points)
    IF user1_data.smoking = user2_data.smoking THEN
        compatibility_score := compatibility_score + 7;
    END IF;
    
    IF user1_data.drinking = user2_data.drinking THEN
        compatibility_score := compatibility_score + 8;
    ELSIF (user1_data.drinking = 'Socially' AND user2_data.drinking IN ('Yes', 'Socially')) OR
          (user2_data.drinking = 'Socially' AND user1_data.drinking IN ('Yes', 'Socially')) THEN
        compatibility_score := compatibility_score + 5;
    END IF;
    
    -- Interests compatibility (max 20 points)
    IF user1_data.interests IS NOT NULL AND user2_data.interests IS NOT NULL THEN
        SELECT COUNT(*) * 4 INTO compatibility_score 
        FROM (
            SELECT UNNEST(user1_data.interests) 
            INTERSECT 
            SELECT UNNEST(user2_data.interests)
        ) AS common_interests;
        
        compatibility_score := LEAST(compatibility_score + (SELECT COUNT(*) * 4 FROM (
            SELECT UNNEST(user1_data.interests) 
            INTERSECT 
            SELECT UNNEST(user2_data.interests)
        ) AS common_interests), compatibility_score + 20);
    END IF;
    
    -- Partner values compatibility (max 15 points)
    IF user1_data.partner_values IS NOT NULL AND user2_data.partner_values IS NOT NULL THEN
        compatibility_score := compatibility_score + LEAST((
            SELECT COUNT(*) * 3 FROM (
                SELECT UNNEST(user1_data.partner_values) 
                INTERSECT 
                SELECT UNNEST(user2_data.partner_values)
            ) AS common_values
        ), 15);
    END IF;
    
    -- Ensure score is within bounds
    compatibility_score := GREATEST(0, LEAST(compatibility_score, max_score));
    
    RETURN compatibility_score;
END;
$$ LANGUAGE plpgsql;

-- Create vibe_votes table
CREATE TABLE IF NOT EXISTS vibe_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rated_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 100),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(voter_id, rated_user_id, DATE(created_at))
);

ALTER TABLE vibe_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can vote on others"
    ON vibe_votes
    FOR INSERT
    TO authenticated
    USING (auth.uid() = voter_id);

CREATE POLICY "Users can view all votes"
    ON vibe_votes
    FOR SELECT
    TO authenticated
    USING (true);

-- Create get_user_vibe_stats function
CREATE OR REPLACE FUNCTION get_user_vibe_stats(user_id UUID)
RETURNS TABLE(
    average_rating NUMERIC,
    total_votes INTEGER,
    weekly_votes INTEGER,
    rank INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH user_stats AS (
        SELECT 
            COALESCE(AVG(rating), 0) as avg_rating,
            COUNT(*) as total_count,
            COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as weekly_count
        FROM vibe_votes 
        WHERE rated_user_id = user_id
    ),
    user_rank AS (
        SELECT 
            ROW_NUMBER() OVER (ORDER BY AVG(rating) DESC, COUNT(*) DESC) as user_rank
        FROM vibe_votes 
        WHERE rated_user_id = user_id
        GROUP BY rated_user_id
    )
    SELECT 
        ROUND(us.avg_rating, 1)::NUMERIC as average_rating,
        us.total_count::INTEGER as total_votes,
        us.weekly_count::INTEGER as weekly_votes,
        COALESCE(ur.user_rank, 999)::INTEGER as rank
    FROM user_stats us
    LEFT JOIN user_rank ur ON true;
END;
$$ LANGUAGE plpgsql;

-- Create get_vibe_vote_leaderboard function
CREATE OR REPLACE FUNCTION get_vibe_vote_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    user_id UUID,
    name TEXT,
    profile_photo TEXT,
    average_rating NUMERIC,
    total_votes INTEGER,
    rank INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.name,
        COALESCE(u.profile_photos[1], '') as profile_photo,
        ROUND(AVG(v.rating), 1) as average_rating,
        COUNT(v.rating)::INTEGER as total_votes,
        ROW_NUMBER() OVER (ORDER BY AVG(v.rating) DESC, COUNT(v.rating) DESC)::INTEGER as rank
    FROM users u
    INNER JOIN vibe_votes v ON u.id = v.rated_user_id
    WHERE u.verification_status = 'verified'
    GROUP BY u.id, u.name, u.profile_photos
    HAVING COUNT(v.rating) >= 5  -- Minimum 5 votes to appear on leaderboard
    ORDER BY average_rating DESC, total_votes DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create love_meter_questions table
CREATE TABLE IF NOT EXISTS love_meter_questions (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE love_meter_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active questions"
    ON love_meter_questions
    FOR SELECT
    TO authenticated
    USING (active = true);

-- Create love_meter_results table
CREATE TABLE IF NOT EXISTS love_meter_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    category TEXT NOT NULL,
    answers JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE love_meter_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own love meter results"
    ON love_meter_results
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- Create save_love_meter_result function
CREATE OR REPLACE FUNCTION save_love_meter_result(
    p_user_id UUID,
    p_score INTEGER,
    p_answers JSONB
)
RETURNS UUID AS $$
DECLARE
    result_id UUID;
    category_name TEXT;
BEGIN
    -- Determine category based on score
    IF p_score >= 85 THEN
        category_name := 'Deeply In Love';
    ELSIF p_score >= 70 THEN
        category_name := 'Strongly Interested';
    ELSIF p_score >= 50 THEN
        category_name := 'Curious & Friendly';
    ELSIF p_score >= 30 THEN
        category_name := 'Just Friends';
    ELSE
        category_name := 'Not Interested';
    END IF;
    
    -- Insert result
    INSERT INTO love_meter_results (user_id, score, category, answers)
    VALUES (p_user_id, p_score, category_name, p_answers)
    RETURNING id INTO result_id;
    
    RETURN result_id;
END;
$$ LANGUAGE plpgsql;

-- Create AI chat tables
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ai_type TEXT NOT NULL CHECK (ai_type IN ('aunty-love', 'rizzman')),
    title TEXT NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own AI chat sessions"
    ON ai_chat_sessions
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage messages in own sessions"
    ON ai_chat_messages
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM ai_chat_sessions 
            WHERE ai_chat_sessions.id = ai_chat_messages.session_id 
            AND ai_chat_sessions.user_id = auth.uid()
        )
    );

-- Create suitability_sessions table
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
    completed_at TIMESTAMPTZ
);

ALTER TABLE suitability_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own suitability sessions"
    ON suitability_sessions
    FOR ALL
    TO authenticated
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create calculate_suitability function
CREATE OR REPLACE FUNCTION calculate_suitability(session_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    session_data RECORD;
    total_score INTEGER := 0;
BEGIN
    -- Get session data
    SELECT * INTO session_data FROM suitability_sessions WHERE id = session_id;
    
    IF session_data IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Simple compatibility calculation (can be enhanced)
    total_score := 75 + (RANDOM() * 25)::INTEGER; -- Random score between 75-100 for demo
    
    -- Update session with results
    UPDATE suitability_sessions 
    SET 
        compatibility_score = total_score,
        status = 'completed',
        completed_at = now()
    WHERE id = session_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create speed dating tables
CREATE TABLE IF NOT EXISTS speed_dating_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 120,
    price INTEGER NOT NULL DEFAULT 0,
    max_participants INTEGER NOT NULL DEFAULT 10,
    registered_males INTEGER DEFAULT 0,
    registered_females INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'registration_open', 'full', 'live', 'completed')),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE speed_dating_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read speed dating events"
    ON speed_dating_events
    FOR SELECT
    TO authenticated
    USING (true);

CREATE TABLE IF NOT EXISTS speed_dating_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES speed_dating_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emergency_contact TEXT NOT NULL,
    emergency_phone TEXT NOT NULL,
    dietary_restrictions TEXT,
    expectations TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_reference TEXT,
    registration_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, user_id)
);

ALTER TABLE speed_dating_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own registrations"
    ON speed_dating_registrations
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS speed_dating_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES speed_dating_events(id) ON DELETE CASCADE,
    room_name TEXT NOT NULL,
    participant1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE speed_dating_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can access own rooms"
    ON speed_dating_rooms
    FOR ALL
    TO authenticated
    USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Create subscription and payment tables
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    paystack_subscription_code TEXT,
    paystack_customer_code TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscriptions"
    ON user_subscriptions
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
    paystack_reference TEXT NOT NULL UNIQUE,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'NGN',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    payment_method TEXT NOT NULL DEFAULT 'paystack',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
    ON payments
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_ai_chat_sessions_updated_at
    BEFORE UPDATE ON ai_chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_speed_dating_events_updated_at
    BEFORE UPDATE ON speed_dating_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vibe_votes_rated_user ON vibe_votes(rated_user_id);
CREATE INDEX IF NOT EXISTS idx_vibe_votes_voter ON vibe_votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_vibe_votes_created_at ON vibe_votes(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_session ON ai_chat_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_user ON ai_chat_sessions(user_id, ai_type);

CREATE INDEX IF NOT EXISTS idx_suitability_sessions_users ON suitability_sessions(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_suitability_sessions_status ON suitability_sessions(status);

CREATE INDEX IF NOT EXISTS idx_speed_dating_registrations_event ON speed_dating_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_speed_dating_registrations_user ON speed_dating_registrations(user_id);

CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);

-- Insert sample love meter questions
INSERT INTO love_meter_questions (question, options) VALUES
('How quickly do they respond to your messages?', '[
    {"text": "Almost immediately", "score": 10},
    {"text": "Within an hour or two", "score": 8},
    {"text": "Usually within the same day", "score": 5},
    {"text": "Often takes a day or more", "score": 2},
    {"text": "Frequently leaves me on read", "score": 0}
]'::jsonb),
('Do they initiate conversations with you?', '[
    {"text": "Very often, almost daily", "score": 10},
    {"text": "Regularly, a few times a week", "score": 8},
    {"text": "Sometimes, but I usually reach out first", "score": 5},
    {"text": "Rarely initiates contact", "score": 2},
    {"text": "Never starts conversations", "score": 0}
]'::jsonb),
('How often do they compliment you or show interest in your life?', '[
    {"text": "Frequently and genuinely", "score": 10},
    {"text": "Regularly, seems to notice things about me", "score": 8},
    {"text": "Occasionally, when something stands out", "score": 5},
    {"text": "Rarely gives compliments", "score": 2},
    {"text": "Never compliments or shows interest", "score": 0}
]'::jsonb)
ON CONFLICT DO NOTHING;