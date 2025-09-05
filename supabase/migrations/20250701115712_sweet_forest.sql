/*
  # Speed Dating System

  1. New Tables
    - `speed_dating_events` - Events information
    - `speed_dating_registrations` - User registrations for events
    - `speed_dating_rooms` - Virtual rooms for speed dating sessions

  2. Security
    - Enable RLS on all tables
    - Users can only access their own registrations
*/

-- Create speed dating events table
CREATE TABLE IF NOT EXISTS speed_dating_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price INTEGER NOT NULL,
  max_participants INTEGER NOT NULL,
  registered_males INTEGER DEFAULT 0,
  registered_females INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'registration_open', 'full', 'live', 'completed')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create speed dating registrations table
CREATE TABLE IF NOT EXISTS speed_dating_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES speed_dating_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emergency_contact TEXT NOT NULL,
  emergency_phone TEXT NOT NULL,
  dietary_restrictions TEXT,
  expectations TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_reference TEXT,
  registration_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create speed dating rooms table
CREATE TABLE IF NOT EXISTS speed_dating_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES speed_dating_events(id) ON DELETE CASCADE,
  room_name TEXT NOT NULL,
  participant1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE speed_dating_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE speed_dating_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE speed_dating_rooms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for speed_dating_events
CREATE POLICY "Anyone can view speed dating events"
  ON speed_dating_events
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for speed_dating_registrations
CREATE POLICY "Users can view their own registrations"
  ON speed_dating_registrations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can register for events"
  ON speed_dating_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for speed_dating_rooms
CREATE POLICY "Users can view their own rooms"
  ON speed_dating_rooms
  FOR SELECT
  TO authenticated
  USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

-- Update triggers
CREATE TRIGGER update_speed_dating_events_updated_at
  BEFORE UPDATE ON speed_dating_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_speed_dating_registrations_updated_at
  BEFORE UPDATE ON speed_dating_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_speed_dating_rooms_updated_at
  BEFORE UPDATE ON speed_dating_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();