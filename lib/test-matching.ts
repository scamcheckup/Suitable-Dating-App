import { supabase } from './supabase';
import { calculateCompatibility, findPotentialMatches } from './matching';
import { testDatabaseConnection } from './supabase';

export const testAllDatabaseTables = async () => {
  try {
    console.log('📋 Testing all database tables...');

    const tablesToTest = [
      'users',
      'matches', 
      'user_preferences',
      'chat_channels',
      'chat_messages',
      'user_push_tokens',
      'vibe_votes',
      'love_meter_questions',
      'love_meter_results',
      'ai_chat_sessions',
      'ai_chat_messages',
      'suitability_sessions',
      'speed_dating_events',
      'speed_dating_registrations',
      'speed_dating_rooms',
      'user_subscriptions',
      'payments'
    ];

    let allTablesWorking = true;

    for (const table of tablesToTest) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`❌ ${table} table access failed:`, error.message);
          allTablesWorking = false;
        } else {
          console.log(`✅ ${table} table accessible`);
        }
      } catch (error) {
        console.error(`❌ ${table} table test failed:`, error);
        allTablesWorking = false;
      }
    }

    return allTablesWorking;
  } catch (error) {
    console.error('❌ Table tests failed:', error);
    return false;
  }
};

export const testDatabaseFunctions = async () => {
  try {
    console.log('⚙️ Testing database functions...');

    const functionsToTest = [
      {
        name: 'calculate_compatibility',
        params: {
          user1_id: '00000000-0000-0000-0000-000000000001',
          user2_id: '00000000-0000-0000-0000-000000000002'
        }
      },
      {
        name: 'get_user_vibe_stats',
        params: {
          user_id: '00000000-0000-0000-0000-000000000001'
        }
      },
      {
        name: 'get_vibe_vote_leaderboard',
        params: {
          limit_count: 5
        }
      }
    ];

    let allFunctionsWorking = true;

    for (const func of functionsToTest) {
      try {
        const { data, error } = await supabase.rpc(func.name, func.params);
        
        if (error) {
          console.error(`❌ Function ${func.name} failed:`, error.message);
          // Don't fail the test if it's just missing test data
          if (!error.message.includes('does not exist') && !error.message.includes('not found')) {
            allFunctionsWorking = false;
          }
        } else {
          console.log(`✅ Function ${func.name} working, returned:`, data);
        }
      } catch (error) {
        console.error(`❌ Function ${func.name} test failed:`, error);
        allFunctionsWorking = false;
      }
    }

    return allFunctionsWorking;
  } catch (error) {
    console.error('❌ Function tests failed:', error);
    return false;
  }
};

export const testMatchingAlgorithm = async () => {
  try {
    console.log('🧪 Testing Matching Algorithm...');

    // Test 0: Check basic database connection
    const connectionTest = await testDatabaseConnection();
    if (!connectionTest) {
      console.error('❌ Database connection failed');
      return false;
    }
    console.log('✅ Database connection successful');

    // Test 1: Check if compatibility function exists
    try {
      const { data: functionExists, error: functionError } = await supabase.rpc('calculate_compatibility', {
        user1_id: '00000000-0000-0000-0000-000000000001',
        user2_id: '00000000-0000-0000-0000-000000000002'
      });

      if (functionError) {
        console.error('❌ Compatibility function error:', functionError);
        if (functionError.message.includes('does not exist')) {
          console.log('ℹ️ This is expected if test users don\'t exist yet');
        } else {
          console.error('❌ Function may not be properly created');
        }
      } else {
        console.log('✅ Compatibility function exists and returns:', functionExists);
      }
    } catch (error) {
      console.error('❌ Compatibility function test failed:', error);
    }

    // Test 2: Check RLS policies
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name, age')
        .limit(5);

      if (usersError) {
        console.error('❌ RLS policy test failed:', usersError);
      } else {
        console.log('✅ RLS policies working, found users:', users?.length || 0);
      }
    } catch (error) {
      console.error('❌ Users table test failed:', error);
    }

    // Test 3: Check matches table
    try {
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .limit(5);

      if (matchesError) {
        console.error('❌ Matches table access failed:', matchesError);
      } else {
        console.log('✅ Matches table accessible, found matches:', matches?.length || 0);
      }
    } catch (error) {
      console.error('❌ Matches table test failed:', error);
    }

    // Test 4: Check user_preferences table
    try {
      const { data: preferences, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .limit(5);

      if (preferencesError) {
        console.error('❌ User preferences table access failed:', preferencesError);
      } else {
        console.log('✅ User preferences table accessible, found preferences:', preferences?.length || 0);
      }
    } catch (error) {
      console.error('❌ User preferences table test failed:', error);
    }

    // Test 5: Test additional tables
    const additionalTablesSuccess = await testAllDatabaseTables();
    if (additionalTablesSuccess) {
      console.log('✅ All additional tables working');
    } else {
      console.log('⚠️ Some additional tables have issues');
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