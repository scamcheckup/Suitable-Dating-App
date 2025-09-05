import { supabase } from './supabase';
import { calculateCompatibility, findPotentialMatches } from './matching';

export const testMatchingAlgorithm = async () => {
  try {
    console.log('🧪 Testing Matching Algorithm...');

    // Test 1: Check if compatibility function exists
    const { data: functionExists, error: functionError } = await supabase.rpc('calculate_compatibility', {
      user1_id: '00000000-0000-0000-0000-000000000001',
      user2_id: '00000000-0000-0000-0000-000000000002'
    });

    if (functionError) {
      console.error('❌ Compatibility function not found:', functionError);
      return false;
    }

    console.log('✅ Compatibility function exists and returns:', functionExists);

    // Test 2: Check RLS policies
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, age')
      .limit(5);

    if (usersError) {
      console.error('❌ RLS policy test failed:', usersError);
    } else {
      console.log('✅ RLS policies working, found users:', users?.length || 0);
    }

    // Test 3: Check matches table
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .limit(5);

    if (matchesError) {
      console.error('❌ Matches table access failed:', matchesError);
    } else {
      console.log('✅ Matches table accessible, found matches:', matches?.length || 0);
    }

    // Test 4: Check user_preferences table
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(5);

    if (preferencesError) {
      console.error('❌ User preferences table access failed:', preferencesError);
    } else {
      console.log('✅ User preferences table accessible, found preferences:', preferences?.length || 0);
    }

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

export const createTestUsers = async () => {
  try {
    console.log('👥 Creating test users...');

    const testUsers = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        phone: '+2348012345678',
        name: 'Test User 1',
        age: 25,
        gender: 'Male',
        occupation: 'Engineer',
        location_type: 'manual',
        state: 'Lagos',
        lga: 'Ikeja',
        personality_type: 'Extrovert',
        relationship_intention: 'Serious Relationship',
        religion: 'Christianity',
        tribe: 'Yoruba',
        education_level: 'Bachelor\'s',
        smoking: 'No',
        drinking: 'Socially',
        children: 'Wants children',
        interests: ['Technology', 'Music', 'Sports', 'Travel', 'Food'],
        partner_values: ['Honesty & Integrity', 'Loyalty & Commitment', 'Respect & Kindness', 'Family Orientation', 'Good Communication'],
        personality_archetype: 'The Achiever',
        verification_status: 'verified'
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        phone: '+2348012345679',
        name: 'Test User 2',
        age: 23,
        gender: 'Female',
        occupation: 'Doctor',
        location_type: 'manual',
        state: 'Lagos',
        lga: 'Victoria Island',
        personality_type: 'Extrovert',
        relationship_intention: 'Serious Relationship',
        religion: 'Christianity',
        tribe: 'Yoruba',
        education_level: 'Master\'s',
        smoking: 'No',
        drinking: 'No',
        children: 'Wants children',
        interests: ['Music', 'Food', 'Travel', 'Reading', 'Healthcare'],
        partner_values: ['Honesty & Integrity', 'Loyalty & Commitment', 'Respect & Kindness', 'Family Orientation', 'Intelligence & Wisdom'],
        personality_archetype: 'The Achiever',
        verification_status: 'verified'
      }
    ];

    for (const user of testUsers) {
      const { error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Failed to create user ${user.name}:`, error);
      } else {
        console.log(`✅ Created test user: ${user.name}`);
      }
    }

    // Test compatibility between test users
    const { score } = await calculateCompatibility(
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002'
    );

    console.log(`🎯 Compatibility score between test users: ${score}%`);

    return true;
  } catch (error) {
    console.error('❌ Failed to create test users:', error);
    return false;
  }
};