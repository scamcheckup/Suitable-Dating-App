import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase configuration missing. Please check your environment variables.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Test database connection
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔌 Testing database connection...');
    
    // Test 1: Basic connection
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    
    // Test 2: Check if we can access auth
    try {
      const { data: session, error: authError } = await supabase.auth.getSession();
      if (authError) {
        console.warn('⚠️ Auth session check failed:', authError.message);
      } else {
        console.log('✅ Auth system accessible');
      }
    } catch (authError) {
      console.warn('⚠️ Auth test failed:', authError);
    }
    
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

// Test specific table access
export const testTableAccess = async (tableName: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Test RPC function
export const testRPCFunction = async (functionName: string, params: any): Promise<{ success: boolean; result?: any; error?: string }> => {
  try {
    const { data, error } = await supabase.rpc(functionName, params);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, result: data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};