import { supabase } from './supabase';

export interface SuitabilitySession {
  id: string;
  user1_id: string;
  user2_id: string;
  user1_phone: string;
  user2_phone: string;
  status: 'pending' | 'active' | 'completed' | 'expired';
  user1_answers?: Record<string, any>;
  user2_answers?: Record<string, any>;
  compatibility_score?: number;
  category_scores?: Record<string, number>;
  insights?: {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  };
  created_at: string;
  expires_at: string;
  completed_at?: string;
}

export interface QuizAnswer {
  question_id: number;
  answer: string;
  category: string;
}

// Create a new suitability session
export const createSuitabilitySession = async (
  initiatorId: string,
  partnerPhone: string
): Promise<{ session: SuitabilitySession | null; error: any }> => {
  try {
    // Check if partner exists in the system
    const { data: partner } = await supabase
      .from('users')
      .select('id, phone, email')
      .or(`phone.eq.${partnerPhone},email.eq.${partnerPhone}`)
      .single();

    if (!partner) {
      throw new Error('User with this phone number or email not found on Suitable');
    }

    // Create session with 20-minute expiry
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 20);

    const { data, error } = await supabase
      .from('suitability_sessions')
      .insert({
        user1_id: initiatorId,
        user2_id: partner.id,
        user1_phone: '', // Will be filled from user profile
        user2_phone: partner.phone || partner.email,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Send notification to partner (in production)
    // await sendSuitabilityInvitation(partner.id, data.id);

    return { session: data, error: null };
  } catch (error) {
    return { session: null, error };
  }
};

// Get session by ID
export const getSuitabilitySession = async (
  sessionId: string
): Promise<{ session: SuitabilitySession | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('suitability_sessions')
      .select(`
        *,
        user1:users!suitability_sessions_user1_id_fkey(id, name, profile_photos),
        user2:users!suitability_sessions_user2_id_fkey(id, name, profile_photos)
      `)
      .eq('id', sessionId)
      .single();

    if (error) throw error;
    return { session: data, error: null };
  } catch (error) {
    return { session: null, error };
  }
};

// Submit quiz answers
export const submitQuizAnswers = async (
  sessionId: string,
  userId: string,
  answers: QuizAnswer[]
): Promise<{ success: boolean; error?: any }> => {
  try {
    // Get session to determine which user is submitting
    const { data: session } = await supabase
      .from('suitability_sessions')
      .select('user1_id, user2_id, user1_answers, user2_answers')
      .eq('id', sessionId)
      .single();

    if (!session) {
      throw new Error('Session not found');
    }

    const isUser1 = session.user1_id === userId;
    const updateField = isUser1 ? 'user1_answers' : 'user2_answers';

    // Update answers
    const { error } = await supabase
      .from('suitability_sessions')
      .update({
        [updateField]: answers,
        status: 'active'
      })
      .eq('id', sessionId);

    if (error) throw error;

    // Check if both users have submitted answers
    const otherUserAnswers = isUser1 ? session.user2_answers : session.user1_answers;
    
    if (otherUserAnswers) {
      // Both users have answered, calculate compatibility
      await calculateCompatibility(sessionId);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

// Calculate compatibility score
export const calculateCompatibility = async (
  sessionId: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    // Call the database function to calculate compatibility
    const { data, error } = await supabase.rpc('calculate_suitability', {
      session_id: sessionId
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

// Get user's session history
export const getUserSuitabilitySessions = async (
  userId: string
): Promise<{ sessions: SuitabilitySession[]; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('suitability_sessions')
      .select(`
        *,
        user1:users!suitability_sessions_user1_id_fkey(id, name, profile_photos),
        user2:users!suitability_sessions_user2_id_fkey(id, name, profile_photos)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return { sessions: data || [], error: null };
  } catch (error) {
    return { sessions: [], error };
  }
};

// Accept session invitation
export const acceptSuitabilityInvitation = async (
  sessionId: string,
  userId: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await supabase
      .from('suitability_sessions')
      .update({ status: 'active' })
      .eq('id', sessionId)
      .eq('user2_id', userId)
      .eq('status', 'pending');

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};