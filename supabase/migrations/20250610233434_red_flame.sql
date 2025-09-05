/*
  # Create user preferences table for dating app

  1. New Tables
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `min_age` (integer, default 18)
      - `max_age` (integer, default 80)
      - `max_distance` (integer, nullable)
      - `preferred_education` (text array, nullable)
      - `preferred_religion` (text array, nullable)
      - `preferred_tribe` (text array, nullable)
      - `preferred_complexion` (text array, nullable)
      - `deal_breakers` (text array, nullable)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `user_preferences` table
    - Add policy for users to manage their own preferences
*/

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  min_age integer DEFAULT 18 CHECK (min_age >= 18 AND min_age <= 80),
  max_age integer DEFAULT 80 CHECK (max_age >= 18 AND max_age <= 80),
  max_distance integer CHECK (max_distance > 0),
  preferred_education text[],
  preferred_religion text[],
  preferred_tribe text[],
  preferred_complexion text[],
  deal_breakers text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences
CREATE POLICY "Users can manage own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();