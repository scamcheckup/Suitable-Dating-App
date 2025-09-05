import { supabase } from './supabase';
import { updateUserProfile } from './auth';

export interface PremiumFeatures {
  unlimited_matches: boolean;
  advanced_filters: boolean;
  read_receipts: boolean;
  priority_matching: boolean;
  see_who_liked: boolean;
  boost_profile: boolean;
}

export const checkPremiumStatus = async (userId: string): Promise<{ isPremium: boolean; features: PremiumFeatures }> => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('is_premium')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const features: PremiumFeatures = {
      unlimited_matches: user.is_premium,
      advanced_filters: user.is_premium,
      read_receipts: user.is_premium,
      priority_matching: user.is_premium,
      see_who_liked: user.is_premium,
      boost_profile: user.is_premium,
    };

    return { isPremium: user.is_premium, features };
  } catch (error) {
    return {
      isPremium: false,
      features: {
        unlimited_matches: false,
        advanced_filters: false,
        read_receipts: false,
        priority_matching: false,
        see_who_liked: false,
        boost_profile: false,
      }
    };
  }
};

export const upgradeToPremium = async (userId: string): Promise<{ success: boolean; error?: any }> => {
  try {
    const { error } = await updateUserProfile(userId, { is_premium: true });
    if (error) throw error;

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const getDailyMatchLimit = (isPremium: boolean): number => {
  return isPremium ? 50 : 3; // Premium gets 50, free gets 3
};

export const canUseAdvancedFilters = (isPremium: boolean): boolean => {
  return isPremium;
};

export const canSeeWhoLiked = (isPremium: boolean): boolean => {
  return isPremium;
};