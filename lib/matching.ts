import { supabase } from './supabase';
import { UserProfile } from './auth';
import { createChatChannel } from './supabase-chat';
import { sendPushNotification, NotificationTemplates } from './notifications';

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  compatibility_score: number;
  status: 'pending' | 'matched' | 'rejected';
  created_at: string;
  updated_at: string;
  user_profile?: UserProfile;
}

export const calculateCompatibility = async (user1Id: string, user2Id: string): Promise<{ score: number; error: any }> => {
  try {
    const { data, error } = await supabase.rpc('calculate_compatibility', {
      user1_id: user1Id,
      user2_id: user2Id,
    });

    if (error) throw error;

    return { score: data || 0, error: null };
  } catch (error) {
    return { score: 0, error };
  }
};

export const findPotentialMatches = async (userId: string, limit: number = 10): Promise<{ matches: UserProfile[]; error: any }> => {
  try {
    // Get current user's profile
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Get users that haven't been matched with yet
    const { data: existingMatches, error: matchError } = await supabase
      .from('matches')
      .select('user2_id')
      .eq('user1_id', userId);

    if (matchError) throw matchError;

    const excludedUserIds = existingMatches?.map(m => m.user2_id) || [];
    excludedUserIds.push(userId); // Exclude self

    // Find potential matches based on basic criteria
    let query = supabase
      .from('users')
      .select('*')
      .neq('id', userId)
      .not('id', 'in', `(${excludedUserIds.join(',')})`)
      .eq('verification_status', 'verified');

    // Add gender filter (opposite gender for heterosexual matching)
    if (currentUser.gender === 'Male') {
      query = query.eq('gender', 'Female');
    } else {
      query = query.eq('gender', 'Male');
    }

    // Add age range filter (±10 years)
    const minAge = Math.max(18, currentUser.age - 10);
    const maxAge = Math.min(80, currentUser.age + 10);
    query = query.gte('age', minAge).lte('age', maxAge);

    const { data: potentialMatches, error: queryError } = await query.limit(limit * 2); // Get more to filter

    if (queryError) throw queryError;

    // Calculate compatibility scores and filter
    const matchesWithScores = await Promise.all(
      (potentialMatches || []).map(async (user) => {
        const { score } = await calculateCompatibility(userId, user.id);
        return { ...user, compatibility_score: score };
      })
    );

    // Filter matches with score >= 65% and sort by score
    const validMatches = matchesWithScores
      .filter(match => match.compatibility_score >= 65)
      .sort((a, b) => b.compatibility_score - a.compatibility_score)
      .slice(0, limit);

    return { matches: validMatches, error: null };
  } catch (error) {
    return { matches: [], error };
  }
};

export const createMatch = async (user1Id: string, user2Id: string): Promise<{ match: Match | null; error: any }> => {
  try {
    // Calculate compatibility score
    const { score } = await calculateCompatibility(user1Id, user2Id);

    if (score < 65) {
      throw new Error('Compatibility score too low');
    }

    const { data, error } = await supabase
      .from('matches')
      .insert({
        user1_id: user1Id,
        user2_id: user2Id,
        compatibility_score: score,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Send notification to the matched user
    try {
      const { data: user1 } = await supabase
        .from('users')
        .select('name')
        .eq('id', user1Id)
        .single();

      const { data: pushToken } = await supabase
        .from('user_push_tokens')
        .select('push_token')
        .eq('user_id', user2Id)
        .single();

      if (pushToken?.push_token && user1?.name) {
        await sendPushNotification(
          pushToken.push_token,
          NotificationTemplates.newMatch(user1.name)
        );
      }
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
    }

    return { match: data, error: null };
  } catch (error) {
    return { match: null, error };
  }
};

export const updateMatchStatus = async (matchId: string, status: 'matched' | 'rejected'): Promise<{ match: Match | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .update({ status })
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;

    // If matched, create chat channel
    if (status === 'matched') {
      await createChatChannel(matchId, data.user1_id, data.user2_id);
    }

    return { match: data, error: null };
  } catch (error) {
    return { match: null, error };
  }
};

export const getUserMatches = async (userId: string): Promise<{ matches: Match[]; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        user_profile:users!matches_user2_id_fkey(*)
      `)
      .eq('user1_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { matches: data || [], error: null };
  } catch (error) {
    return { matches: [], error };
  }
};

export const getMatchCompatibilityLabel = (score: number): string => {
  if (score >= 90) return 'Very High Match';
  if (score >= 80) return 'High Match';
  if (score >= 65) return 'Moderate Match';
  return 'Low Match';
};