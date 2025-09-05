/*
  # Create users table for dating app

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `phone` (text, unique, not null)
      - `email` (text, nullable)
      - `name` (text, not null)
      - `age` (integer, not null)
      - `gender` (text, not null)
      - `occupation` (text, not null)
      - `school_state` (text, nullable)
      - `location_type` (text, not null)
      - `state` (text, nullable)
      - `lga` (text, nullable)
      - `current_location` (text, nullable)
      - `personality_type` (text, nullable)
      - `relationship_intention` (text, nullable)
      - `religion` (text, nullable)
      - `tribe` (text, nullable)
      - `education_level` (text, nullable)
      - `smoking` (text, nullable)
      - `drinking` (text, nullable)
      - `children` (text, nullable)
      - `height` (text, nullable)
      - `body_type` (text, nullable)
      - `complexion` (text, nullable)
      - `bio` (text, nullable)
      - `interests` (text array, nullable)
      - `partner_values` (text array, nullable)
      - `personality_archetype` (text, nullable)
      - `verification_status` (text, default 'pending')
      - `verification_photo_url` (text, nullable)
      - `profile_photos` (text array, nullable)
      - `is_premium` (boolean, default false)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read/update their own data
    - Add policy for authenticated users to read other users' basic info
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL,
  email text,
  name text NOT NULL,
  age integer NOT NULL CHECK (age >= 18 AND age <= 80),
  gender text NOT NULL CHECK (gender IN ('Male', 'Female')),
  occupation text NOT NULL,
  school_state text,
  location_type text NOT NULL CHECK (location_type IN ('gps', 'manual')),
  state text,
  lga text,
  current_location text,
  personality_type text CHECK (personality_type IN ('Introvert', 'Ambivert', 'Extrovert')),
  relationship_intention text,
  religion text,
  tribe text,
  education_level text,
  smoking text CHECK (smoking IN ('Yes', 'No', 'Sometimes')),
  drinking text CHECK (drinking IN ('Yes', 'No', 'Socially')),
  children text,
  height text,
  body_type text,
  complexion text,
  bio text,
  interests text[],
  partner_values text[],
  personality_archetype text,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_photo_url text,
  profile_photos text[],
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own data
CREATE POLICY "Users can manage own data"
  ON users
  FOR ALL
  TO authenticated
  USING (auth.uid() = id);

-- Authenticated users can read basic info of other users for matching
CREATE POLICY "Users can read others basic info"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();