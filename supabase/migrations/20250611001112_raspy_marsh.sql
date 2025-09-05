/*
  # Compatibility Calculation Function

  1. Function
    - `calculate_compatibility(user1_id, user2_id)` - Calculates compatibility score between two users
    
  2. Algorithm
    - Location (30 max): Same LGA = 30, same state = 20, same geopolitical zone = 10, school state bonus = +10%
    - Age (20 max): ±3 years = 20, ±6 years = 15, ±10 years = 10
    - Tags (11 max): Same personality = 3, same religion = 3, same tribe = 3, same relationship intention = 2
    - Interests (20 max): 5 selections, 3 points per match, +5 bonus for 4–5 matches
    - Values (20 max): 5 selections, 3 points per match, +5 bonus for 4–5 matches
    - Personality Quiz (20 max): Same personality = 20, complementary = 10, dissimilar = 0
*/

-- Geopolitical zones mapping
CREATE OR REPLACE FUNCTION get_geopolitical_zone(state_name TEXT)
RETURNS TEXT AS $$
BEGIN
  CASE state_name
    WHEN 'Lagos', 'Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti' THEN RETURN 'South West';
    WHEN 'Abia', 'Anambra', 'Ebonyi', 'Enugu', 'Imo' THEN RETURN 'South East';
    WHEN 'Akwa Ibom', 'Bayelsa', 'Cross River', 'Delta', 'Edo', 'Rivers' THEN RETURN 'South South';
    WHEN 'Benue', 'Kogi', 'Kwara', 'Nasarawa', 'Niger', 'Plateau', 'FCT' THEN RETURN 'North Central';
    WHEN 'Adamawa', 'Bauchi', 'Borno', 'Gombe', 'Taraba', 'Yobe' THEN RETURN 'North East';
    WHEN 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Sokoto', 'Zamfara' THEN RETURN 'North West';
    ELSE RETURN 'Unknown';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Main compatibility calculation function
CREATE OR REPLACE FUNCTION calculate_compatibility(user1_id UUID, user2_id UUID)
RETURNS INTEGER AS $$
DECLARE
  user1_record RECORD;
  user2_record RECORD;
  location_score INTEGER := 0;
  age_score INTEGER := 0;
  tags_score INTEGER := 0;
  interests_score INTEGER := 0;
  values_score INTEGER := 0;
  personality_score INTEGER := 0;
  total_score INTEGER := 0;
  age_diff INTEGER;
  common_interests INTEGER;
  common_values INTEGER;
BEGIN
  -- Get user records
  SELECT * INTO user1_record FROM users WHERE id = user1_id;
  SELECT * INTO user2_record FROM users WHERE id = user2_id;
  
  IF user1_record IS NULL OR user2_record IS NULL THEN
    RETURN 0;
  END IF;

  -- 1. Location Score (30 max)
  IF user1_record.lga IS NOT NULL AND user2_record.lga IS NOT NULL AND user1_record.lga = user2_record.lga THEN
    location_score := 30;
  ELSIF user1_record.state IS NOT NULL AND user2_record.state IS NOT NULL AND user1_record.state = user2_record.state THEN
    location_score := 20;
  ELSIF get_geopolitical_zone(user1_record.state) = get_geopolitical_zone(user2_record.state) THEN
    location_score := 10;
  END IF;
  
  -- School state bonus (+10% max 30)
  IF user1_record.school_state IS NOT NULL AND user2_record.school_state IS NOT NULL 
     AND user1_record.school_state = user2_record.school_state THEN
    location_score := LEAST(30, ROUND(location_score * 1.1));
  END IF;

  -- 2. Age Score (20 max)
  age_diff := ABS(user1_record.age - user2_record.age);
  IF age_diff <= 3 THEN
    age_score := 20;
  ELSIF age_diff <= 6 THEN
    age_score := 15;
  ELSIF age_diff <= 10 THEN
    age_score := 10;
  END IF;

  -- 3. Tags Score (11 max)
  -- Same personality type
  IF user1_record.personality_type IS NOT NULL AND user2_record.personality_type IS NOT NULL 
     AND user1_record.personality_type = user2_record.personality_type THEN
    tags_score := tags_score + 3;
  END IF;
  
  -- Same religion
  IF user1_record.religion IS NOT NULL AND user2_record.religion IS NOT NULL 
     AND user1_record.religion = user2_record.religion THEN
    tags_score := tags_score + 3;
  END IF;
  
  -- Same tribe
  IF user1_record.tribe IS NOT NULL AND user2_record.tribe IS NOT NULL 
     AND user1_record.tribe = user2_record.tribe THEN
    tags_score := tags_score + 3;
  END IF;
  
  -- Same relationship intention
  IF user1_record.relationship_intention IS NOT NULL AND user2_record.relationship_intention IS NOT NULL 
     AND user1_record.relationship_intention = user2_record.relationship_intention THEN
    tags_score := tags_score + 2;
  END IF;

  -- 4. Interests Score (20 max)
  IF user1_record.interests IS NOT NULL AND user2_record.interests IS NOT NULL THEN
    SELECT COUNT(*) INTO common_interests 
    FROM unnest(user1_record.interests) AS interest1
    WHERE interest1 = ANY(user2_record.interests);
    
    interests_score := common_interests * 3;
    
    -- Bonus for 4-5 matches
    IF common_interests >= 4 THEN
      interests_score := interests_score + 5;
    END IF;
    
    interests_score := LEAST(20, interests_score);
  END IF;

  -- 5. Values Score (20 max)
  IF user1_record.partner_values IS NOT NULL AND user2_record.partner_values IS NOT NULL THEN
    SELECT COUNT(*) INTO common_values 
    FROM unnest(user1_record.partner_values) AS value1
    WHERE value1 = ANY(user2_record.partner_values);
    
    values_score := common_values * 3;
    
    -- Bonus for 4-5 matches
    IF common_values >= 4 THEN
      values_score := values_score + 5;
    END IF;
    
    values_score := LEAST(20, values_score);
  END IF;

  -- 6. Personality Quiz Score (20 max)
  IF user1_record.personality_archetype IS NOT NULL AND user2_record.personality_archetype IS NOT NULL THEN
    IF user1_record.personality_archetype = user2_record.personality_archetype THEN
      personality_score := 20;
    ELSIF (user1_record.personality_archetype = 'The Traditionalist' AND user2_record.personality_archetype = 'The Nurturer')
       OR (user1_record.personality_archetype = 'The Nurturer' AND user2_record.personality_archetype = 'The Traditionalist')
       OR (user1_record.personality_archetype = 'The Adventurer' AND user2_record.personality_archetype = 'The Achiever')
       OR (user1_record.personality_archetype = 'The Achiever' AND user2_record.personality_archetype = 'The Adventurer') THEN
      personality_score := 10;
    END IF;
  END IF;

  -- Calculate total score
  total_score := location_score + age_score + tags_score + interests_score + values_score + personality_score;
  
  -- Cap at 95% if over 100
  IF total_score >= 100 THEN
    total_score := 95;
  END IF;

  RETURN total_score;
END;
$$ LANGUAGE plpgsql;