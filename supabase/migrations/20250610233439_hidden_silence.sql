/*
  # Create compatibility calculation function

  1. Functions
    - `calculate_compatibility` - Calculates compatibility score between two users
      - Takes user1_id and user2_id as parameters
      - Returns compatibility score (0-100)
      - Implements the matching algorithm based on:
        - Location (30 max)
        - Age (20 max)
        - Tags (11 max)
        - Interests (20 max)
        - Values (20 max)
        - Personality Quiz (20 max)
*/

CREATE OR REPLACE FUNCTION calculate_compatibility(user1_id uuid, user2_id uuid)
RETURNS integer AS $$
DECLARE
  user1 users%ROWTYPE;
  user2 users%ROWTYPE;
  location_score integer := 0;
  age_score integer := 0;
  tags_score integer := 0;
  interests_score integer := 0;
  values_score integer := 0;
  personality_score integer := 0;
  total_score integer := 0;
  age_diff integer;
  common_interests integer;
  common_values integer;
BEGIN
  -- Get user data
  SELECT * INTO user1 FROM users WHERE id = user1_id;
  SELECT * INTO user2 FROM users WHERE id = user2_id;
  
  IF user1.id IS NULL OR user2.id IS NULL THEN
    RETURN 0;
  END IF;

  -- 1. Location Score (30 max)
  IF user1.lga = user2.lga AND user1.lga IS NOT NULL THEN
    location_score := 30;
  ELSIF user1.state = user2.state AND user1.state IS NOT NULL THEN
    location_score := 20;
  -- Add geopolitical zone logic here if needed
  ELSE
    location_score := 10;
  END IF;
  
  -- School state bonus (+10% max 30)
  IF user1.school_state = user2.state OR user2.school_state = user1.state THEN
    location_score := LEAST(30, location_score + ROUND(location_score * 0.1));
  END IF;

  -- 2. Age Score (20 max)
  age_diff := ABS(user1.age - user2.age);
  IF age_diff <= 3 THEN
    age_score := 20;
  ELSIF age_diff <= 6 THEN
    age_score := 15;
  ELSIF age_diff <= 10 THEN
    age_score := 10;
  ELSE
    age_score := 0;
  END IF;

  -- 3. Tags Score (11 max)
  -- Same personality type
  IF user1.personality_type = user2.personality_type AND user1.personality_type IS NOT NULL THEN
    tags_score := tags_score + 3;
  END IF;
  
  -- Same religion
  IF user1.religion = user2.religion AND user1.religion IS NOT NULL THEN
    tags_score := tags_score + 3;
  END IF;
  
  -- Same tribe
  IF user1.tribe = user2.tribe AND user1.tribe IS NOT NULL THEN
    tags_score := tags_score + 3;
  END IF;
  
  -- Same relationship intention
  IF user1.relationship_intention = user2.relationship_intention AND user1.relationship_intention IS NOT NULL THEN
    tags_score := tags_score + 2;
  END IF;

  -- 4. Interests Score (20 max)
  IF user1.interests IS NOT NULL AND user2.interests IS NOT NULL THEN
    SELECT COUNT(*)
    INTO common_interests
    FROM unnest(user1.interests) AS interest
    WHERE interest = ANY(user2.interests);
    
    interests_score := common_interests * 3;
    -- Bonus for 4-5 matches
    IF common_interests >= 4 THEN
      interests_score := interests_score + 5;
    END IF;
    interests_score := LEAST(20, interests_score);
  END IF;

  -- 5. Values Score (20 max)
  IF user1.partner_values IS NOT NULL AND user2.partner_values IS NOT NULL THEN
    SELECT COUNT(*)
    INTO common_values
    FROM unnest(user1.partner_values) AS value
    WHERE value = ANY(user2.partner_values);
    
    values_score := common_values * 3;
    -- Bonus for 4-5 matches
    IF common_values >= 4 THEN
      values_score := values_score + 5;
    END IF;
    values_score := LEAST(20, values_score);
  END IF;

  -- 6. Personality Quiz Score (20 max)
  IF user1.personality_archetype = user2.personality_archetype AND user1.personality_archetype IS NOT NULL THEN
    personality_score := 20;
  ELSIF user1.personality_archetype IS NOT NULL AND user2.personality_archetype IS NOT NULL THEN
    -- Complementary personality logic can be added here
    personality_score := 10;
  END IF;

  -- Calculate total score
  total_score := location_score + age_score + tags_score + interests_score + values_score + personality_score;
  
  -- Cap at 95% if over 100
  IF total_score >= 100 THEN
    total_score := 95;
  END IF;
  
  -- Only return matches above 65%
  IF total_score < 65 THEN
    total_score := 0;
  END IF;

  RETURN total_score;
END;
$$ LANGUAGE plpgsql;