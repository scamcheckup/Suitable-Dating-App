import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, X, Star, Zap, Crown, TrendingUp, Users, Award } from 'lucide-react-native';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const { width, height } = Dimensions.get('window');

interface VibeVoteProfile {
  id: string;
  name: string;
  age: number;
  photo: string;
  rating: number;
  totalVotes: number;
  isVerified: boolean;
}

interface UserStats {
  averageRating: number;
  totalVotes: number;
  rank: number;
  weeklyVotes: number;
}

export default function VibeVoteScreen() {
  const { user, userProfile } = useAuth();
  const [currentProfile, setCurrentProfile] = useState<VibeVoteProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [dailyVotesLeft, setDailyVotesLeft] = useState(10);

  // Animation values
  const cardScale = useSharedValue(1);
  const heartScale = useSharedValue(1);
  const skipScale = useSharedValue(1);

  useEffect(() => {
    loadRandomProfile();
    loadUserStats();
  }, []);

  const loadRandomProfile = async () => {
    try {
      setLoading(true);
      
      // Get random verified user profile (excluding current user)
      const { data, error } = await supabase
        .from('users')
        .select('id, name, age, profile_photos, verification_status')
        .eq('verification_status', 'verified')
        .neq('id', user?.id || '')
        .not('profile_photos', 'is', null)
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        const randomUser = data[Math.floor(Math.random() * data.length)];
        
        // Simulate rating data (in production, this would come from a ratings table)
        const mockProfile: VibeVoteProfile = {
          id: randomUser.id,
          name: randomUser.name,
          age: randomUser.age,
          photo: randomUser.profile_photos[0] || 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg',
          rating: Math.floor(Math.random() * 50) + 50, // 50-100 rating
          totalVotes: Math.floor(Math.random() * 500) + 100,
          isVerified: true,
        };
        
        setCurrentProfile(mockProfile);
        setHasVoted(false);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    if (!user) return;

    // Mock user stats (in production, calculate from ratings table)
    const mockStats: UserStats = {
      averageRating: Math.floor(Math.random() * 30) + 70, // 70-100
      totalVotes: Math.floor(Math.random() * 200) + 50,
      rank: Math.floor(Math.random() * 1000) + 1,
      weeklyVotes: Math.floor(Math.random() * 50) + 10,
    };
    
    setUserStats(mockStats);
  };

  const handleVote = async (rating: number) => {
    if (!currentProfile || hasVoted || dailyVotesLeft <= 0) return;

    // Animate button press
    if (rating >= 80) {
      heartScale.value = withSequence(
        withSpring(1.3),
        withSpring(1)
      );
    } else {
      skipScale.value = withSequence(
        withSpring(1.3),
        withSpring(1)
      );
    }

    // Animate card exit
    cardScale.value = withSpring(0.8, {}, () => {
      runOnJS(processVote)(rating);
    });

    setHasVoted(true);
    setDailyVotesLeft(prev => prev - 1);
  };

  const processVote = async (rating: number) => {
    // In production, save vote to database
    console.log(`Voted ${rating} for user ${currentProfile?.id}`);
    
    // Show brief feedback
    setTimeout(() => {
      cardScale.value = withSpring(1);
      loadRandomProfile();
    }, 500);
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const skipAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: skipScale.value }],
  }));

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Zap size={40} color="#FF6B6B" />
          <Text style={styles.loadingText}>Finding amazing profiles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Vibe Vote</Text>
          <Text style={styles.subtitle}>Rate anonymously, get honest feedback</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.statsButton}
          onPress={() => setShowStats(!showStats)}
        >
          <TrendingUp size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* Daily Votes Counter */}
      <Animated.View entering={FadeInDown.delay(200)} style={styles.votesCounter}>
        <Zap size={16} color="#F59E0B" />
        <Text style={styles.votesText}>{dailyVotesLeft} votes left today</Text>
        {dailyVotesLeft <= 3 && (
          <TouchableOpacity style={styles.upgradeHint}>
            <Crown size={14} color="#F59E0B" />
            <Text style={styles.upgradeText}>Upgrade for unlimited</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* User Stats Panel */}
      {showStats && userStats && (
        <Animated.View entering={FadeInDown.delay(300)} style={styles.statsPanel}>
          <Text style={styles.statsPanelTitle}>Your Vibe Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Star size={20} color="#F59E0B" />
              <Text style={styles.statValue}>{userStats.averageRating}</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Users size={20} color="#10B981" />
              <Text style={styles.statValue}>{userStats.totalVotes}</Text>
              <Text style={styles.statLabel}>Total Votes</Text>
            </View>
            <View style={styles.statItem}>
              <Award size={20} color="#8B5CF6" />
              <Text style={styles.statValue}>#{userStats.rank}</Text>
              <Text style={styles.statLabel}>Rank</Text>
            </View>
            <View style={styles.statItem}>
              <TrendingUp size={20} color="#FF6B6B" />
              <Text style={styles.statValue}>{userStats.weeklyVotes}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {currentProfile && (
          <Animated.View 
            style={[styles.profileCard, cardAnimatedStyle]}
            entering={FadeInUp.delay(400)}
          >
            <Image 
              source={{ uri: currentProfile.photo }}
              style={styles.profileImage}
              resizeMode="cover"
            />
            
            {/* Gradient Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.gradientOverlay}
            >
              <View style={styles.profileInfo}>
                <View style={styles.nameContainer}>
                  <Text style={styles.profileName}>
                    {currentProfile.name}, {currentProfile.age}
                  </Text>
                  {currentProfile.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                    </View>
                  )}
                </View>
                
                <View style={styles.ratingInfo}>
                  <View style={styles.ratingBadge}>
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.ratingText}>{currentProfile.rating}</Text>
                  </View>
                  <Text style={styles.votesInfo}>
                    {currentProfile.totalVotes} votes
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Voting Instructions */}
            <View style={styles.instructionsOverlay}>
              <Text style={styles.instructionsText}>
                Rate this vibe honestly and anonymously
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Action Buttons */}
        <Animated.View 
          entering={FadeInDown.delay(600)} 
          style={styles.actionButtons}
        >
          <TouchableOpacity 
            style={[styles.actionButton, styles.skipButton]}
            onPress={() => handleVote(40)}
            disabled={hasVoted || dailyVotesLeft <= 0}
          >
            <Animated.View style={skipAnimatedStyle}>
              <X size={28} color="#6B7280" />
            </Animated.View>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => handleVote(85)}
            disabled={hasVoted || dailyVotesLeft <= 0}
          >
            <Animated.View style={heartAnimatedStyle}>
              <Heart size={28} color="white" fill="white" />
            </Animated.View>
            <Text style={styles.likeButtonText}>Good Vibe</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Rating Scale */}
        <Animated.View entering={FadeInDown.delay(800)} style={styles.ratingScale}>
          <Text style={styles.ratingScaleTitle}>Quick Rate</Text>
          <View style={styles.ratingButtons}>
            {[60, 70, 80, 90, 95].map((rating) => (
              <TouchableOpacity
                key={rating}
                style={styles.ratingButton}
                onPress={() => handleVote(rating)}
                disabled={hasVoted || dailyVotesLeft <= 0}
              >
                <Text style={styles.ratingButtonText}>{rating}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>

      {/* Bottom Tips */}
      <Animated.View entering={FadeInDown.delay(1000)} style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
        <Text style={styles.tipsText}>
          • Be honest but kind in your ratings{'\n'}
          • Higher ratings help others get more matches{'\n'}
          • Your votes are completely anonymous
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  statsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
  },
  votesCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    marginHorizontal: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  votesText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#92400E',
    marginLeft: 6,
  },
  upgradeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
  },
  upgradeText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#F59E0B',
    marginLeft: 4,
  },
  statsPanel: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsPanelTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  profileCard: {
    height: height * 0.5,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  profileInfo: {
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  verifiedBadge: {
    marginLeft: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginLeft: 4,
  },
  votesInfo: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  instructionsOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  instructionsText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'white',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  skipButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  likeButton: {
    backgroundColor: '#FF6B6B',
  },
  skipButtonText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 4,
  },
  likeButtonText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: 'white',
    marginTop: 4,
  },
  ratingScale: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ratingScaleTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ratingButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  tipsContainer: {
    backgroundColor: '#F0F9FF',
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  tipsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 16,
  },
});