/*
  # Vibe Vote System

  1. New Tables
    - `vibe_votes` - Store user ratings
    - `vibe_vote_stats` - Aggregated statistics (view)

  2. Functions
    - `get_user_vibe_stats` - Get user's rating statistics
    - `get_vibe_vote_leaderboard` - Get top rated users

  3. Security
    - Enable RLS on all tables
    - Users can only vote, not see who voted for them
*/

-- Create vibe votes table if it doesn't exist
CREATE TABLE IF NOT EXISTS vibe_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rated_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 100),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(voter_id, rated_user_id, DATE(created_at))
);

-- Enable RLS
ALTER TABLE vibe_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can submit votes"
  ON vibe_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Users can view their own votes"
  ON vibe_votes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = voter_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vibe_votes_voter ON vibe_votes(voter_id, created_at);
CREATE INDEX IF NOT EXISTS idx_vibe_votes_rated ON vibe_votes(rated_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_vibe_votes_daily ON vibe_votes(voter_id, DATE(created_at));

-- Function to get user vibe stats
CREATE OR REPLACE FUNCTION get_user_vibe_stats(user_id UUID)
RETURNS TABLE (
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
    ROUND(us.avg_rating, 1) as average_rating,
    us.total_count::INTEGER as total_votes,
    us.weekly_count::INTEGER as weekly_votes,
    COALESCE(ur.user_rank::INTEGER, 0) as rank
  FROM user_stats us
  LEFT JOIN user_rank ur ON true;
END;
$$ LANGUAGE plpgsql;

-- Function to get vibe vote leaderboard
CREATE OR REPLACE FUNCTION get_vibe_vote_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
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
    u.profile_photos[1] as profile_photo,
    ROUND(AVG(vv.rating), 1) as average_rating,
    COUNT(vv.rating)::INTEGER as total_votes,
    ROW_NUMBER() OVER (ORDER BY AVG(vv.rating) DESC, COUNT(vv.rating) DESC)::INTEGER as rank
  FROM users u
  INNER JOIN vibe_votes vv ON u.id = vv.rated_user_id
  WHERE u.verification_status = 'verified'
    AND u.profile_photos IS NOT NULL
    AND array_length(u.profile_photos, 1) > 0
  GROUP BY u.id, u.name, u.profile_photos[1]
  HAVING COUNT(vv.rating) >= 5  -- Minimum votes to appear on leaderboard
  ORDER BY average_rating DESC, total_votes DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;