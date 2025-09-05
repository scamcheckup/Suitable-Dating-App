import { supabase } from './supabase';

export interface VibeVoteRating {
  id: string;
  voter_id: string;
  rated_user_id: string;
  rating: number;
  created_at: string;
}

export interface VibeVoteStats {
  user_id: string;
  average_rating: number;
  total_votes: number;
  weekly_votes: number;
  rank: number;
}

// Submit a vote
export const submitVibeVote = async (
  voterId: string,
  ratedUserId: string,
  rating: number
): Promise<{ success: boolean; error?: any }> => {
  try {
    // Check if user already voted for this person today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingVote } = await supabase
      .from('vibe_votes')
      .select('id')
      .eq('voter_id', voterId)
      .eq('rated_user_id', ratedUserId)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .single();

    if (existingVote) {
      return { success: false, error: 'Already voted for this user today' };
    }

    // Check daily vote limit (10 for free users, unlimited for premium)
    const { data: todayVotes } = await supabase
      .from('vibe_votes')
      .select('id')
      .eq('voter_id', voterId)
      .gte('created_at', `${today}T00:00:00.000Z`);

    const { data: user } = await supabase
      .from('users')
      .select('is_premium')
      .eq('id', voterId)
      .single();

    if (!user?.is_premium && todayVotes && todayVotes.length >= 10) {
      return { success: false, error: 'Daily vote limit reached' };
    }

    // Submit the vote
    const { error } = await supabase
      .from('vibe_votes')
      .insert({
        voter_id: voterId,
        rated_user_id: ratedUserId,
        rating,
      });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

// Get user's vibe vote stats
export const getUserVibeStats = async (userId: string): Promise<{ stats: VibeVoteStats | null; error?: any }> => {
  try {
    const { data, error } = await supabase.rpc('get_user_vibe_stats', {
      user_id: userId
    });

    if (error) throw error;

    return { stats: data, error: null };
  } catch (error) {
    return { stats: null, error };
  }
};

// Get random profile for voting
export const getRandomProfileForVoting = async (
  voterId: string
): Promise<{ profile: any | null; error?: any }> => {
  try {
    // Get users that haven't been voted on today by this voter
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        age,
        profile_photos,
        verification_status
      `)
      .eq('verification_status', 'verified')
      .neq('id', voterId)
      .not('profile_photos', 'is', null)
      .limit(50);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { profile: null, error: 'No profiles available' };
    }

    // Filter out users already voted on today
    const { data: todayVotes } = await supabase
      .from('vibe_votes')
      .select('rated_user_id')
      .eq('voter_id', voterId)
      .gte('created_at', `${today}T00:00:00.000Z`);

    const votedUserIds = todayVotes?.map(vote => vote.rated_user_id) || [];
    const availableProfiles = data.filter(profile => !votedUserIds.includes(profile.id));

    if (availableProfiles.length === 0) {
      return { profile: null, error: 'No new profiles to vote on today' };
    }

    // Return random profile
    const randomProfile = availableProfiles[Math.floor(Math.random() * availableProfiles.length)];
    
    return { profile: randomProfile, error: null };
  } catch (error) {
    return { profile: null, error };
  }
};

// Get daily votes remaining
export const getDailyVotesRemaining = async (userId: string): Promise<{ remaining: number; error?: any }> => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('is_premium')
      .eq('id', userId)
      .single();

    if (user?.is_premium) {
      return { remaining: 999, error: null }; // Unlimited for premium
    }

    const today = new Date().toISOString().split('T')[0];
    const { data: todayVotes } = await supabase
      .from('vibe_votes')
      .select('id')
      .eq('voter_id', userId)
      .gte('created_at', `${today}T00:00:00.000Z`);

    const used = todayVotes?.length || 0;
    const remaining = Math.max(0, 10 - used);

    return { remaining, error: null };
  } catch (error) {
    return { remaining: 0, error };
  }
};

// Get leaderboard
export const getVibeVoteLeaderboard = async (limit: number = 10): Promise<{ leaderboard: any[]; error?: any }> => {
  try {
    const { data, error } = await supabase.rpc('get_vibe_vote_leaderboard', {
      limit_count: limit
    });

    if (error) throw error;

    return { leaderboard: data || [], error: null };
  } catch (error) {
    return { leaderboard: [], error };
  }
};