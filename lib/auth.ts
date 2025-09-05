import { supabase } from './supabase';

export interface SignUpData {
  email: string;
  name: string;
  phone?: string;
  password: string;
}

export interface UserProfile {
  id: string;
  phone?: string;
  email: string;
  name: string;
  age: number;
  gender: string;
  occupation: string;
  school_state?: string;
  location_type: string;
  state?: string;
  lga?: string;
  current_location?: string;
  personality_type?: string;
  relationship_intention?: string;
  religion?: string;
  tribe?: string;
  education_level?: string;
  smoking?: string;
  drinking?: string;
  children?: string;
  height?: string;
  body_type?: string;
  complexion?: string;
  bio?: string;
  interests?: string[];
  partner_values?: string[];
  personality_archetype?: string;
  verification_status: string;
  verification_photo_url?: string;
  profile_photos?: string[];
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export const signUp = async (data: SignUpData) => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone,
        }
      }
    });

    if (authError) throw authError;

    return { data: authData, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/reset-password',
    });
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

export const getUserProfile = async (userId: string): Promise<{ data: UserProfile | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const createUserProfile = async (userId: string, profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at' | 'verification_status' | 'is_premium'>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        ...profileData,
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};