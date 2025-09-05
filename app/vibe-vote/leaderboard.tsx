import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Crown, Star, Trophy, Medal, Award } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { getVibeVoteLeaderboard } from '@/lib/vibe-vote';

interface LeaderboardUser {
  user_id: string;
  name: string;
  profile_photo: string;
  average_rating: number;
  total_votes: number;
  rank: number;
}

export default function VibeVoteLeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { leaderboard: data, error } = await getVibeVoteLeaderboard(20);
      if (!error && data) {
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={24} color="#F59E0B" />;
      case 2:
        return <Medal size={24} color="#9CA3AF" />;
      case 3:
        return <Award size={24} color="#CD7C2F" />;
      default:
        return <Trophy size={20} color="#6B7280" />;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return styles.firstPlace;
      case 2:
        return styles.secondPlace;
      case 3:
        return styles.thirdPlace;
      default:
        return styles.regularPlace;
    }
  };

  const renderLeaderboardItem = (user: LeaderboardUser, index: number) => (
    <Animated.View 
      key={user.user_id}
      entering={FadeInDown.delay(index * 100)}
      style={[styles.leaderboardItem, getRankStyle(user.rank)]}
    >
      <View style={styles.rankContainer}>
        {getRankIcon(user.rank)}
        <Text style={styles.rankNumber}>#{user.rank}</Text>
      </View>

      <Image 
        source={{ uri: user.profile_photo || 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg' }}
        style={styles.profileImage}
      />

      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.statText}>{user.average_rating}</Text>
          </View>
          <Text style={styles.votesText}>{user.total_votes} votes</Text>
        </View>
      </View>

      {user.rank <= 3 && (
        <View style={styles.badgeContainer}>
          <LinearGradient
            colors={user.rank === 1 ? ['#F59E0B', '#D97706'] : 
                   user.rank === 2 ? ['#9CA3AF', '#6B7280'] : 
                   ['#CD7C2F', '#92400E']}
            style={styles.badge}
          >
            <Text style={styles.badgeText}>TOP {user.rank}</Text>
          </LinearGradient>
        </View>
      )}
    </Animated.View>
  );

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
          <Text style={styles.title}>Vibe Leaderboard</Text>
          <Text style={styles.subtitle}>Top rated profiles this week</Text>
        </View>
        
        <View style={styles.placeholder} />
      </View>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <Animated.View entering={FadeInDown.delay(200)} style={styles.podiumContainer}>
          <View style={styles.podium}>
            {/* Second Place */}
            <View style={[styles.podiumPlace, styles.secondPodium]}>
              <Image 
                source={{ uri: leaderboard[1]?.profile_photo || 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg' }}
                style={styles.podiumImage}
              />
              <Medal size={20} color="#9CA3AF" />
              <Text style={styles.podiumName}>{leaderboard[1]?.name}</Text>
              <Text style={styles.podiumRating}>{leaderboard[1]?.average_rating}</Text>
            </View>

            {/* First Place */}
            <View style={[styles.podiumPlace, styles.firstPodium]}>
              <Image 
                source={{ uri: leaderboard[0]?.profile_photo || 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg' }}
                style={[styles.podiumImage, styles.firstPlaceImage]}
              />
              <Crown size={24} color="#F59E0B" />
              <Text style={styles.podiumName}>{leaderboard[0]?.name}</Text>
              <Text style={styles.podiumRating}>{leaderboard[0]?.average_rating}</Text>
            </View>

            {/* Third Place */}
            <View style={[styles.podiumPlace, styles.thirdPodium]}>
              <Image 
                source={{ uri: leaderboard[2]?.profile_photo || 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg' }}
                style={styles.podiumImage}
              />
              <Award size={20} color="#CD7C2F" />
              <Text style={styles.podiumName}>{leaderboard[2]?.name}</Text>
              <Text style={styles.podiumRating}>{leaderboard[2]?.average_rating}</Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Full Leaderboard */}
      <ScrollView style={styles.leaderboardList} showsVerticalScrollIndicator={false}>
        <Text style={styles.listTitle}>Complete Rankings</Text>
        {leaderboard.map(renderLeaderboardItem)}
        
        {/* Join Message */}
        <Animated.View entering={FadeInDown.delay(1000)} style={styles.joinMessage}>
          <Text style={styles.joinTitle}>Want to be on the leaderboard?</Text>
          <Text style={styles.joinText}>
            Get more votes by having great photos and being active in the community!
          </Text>
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => router.push('/vibe-vote')}
          >
            <Text style={styles.joinButtonText}>Start Voting</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  placeholder: {
    width: 40,
  },
  podiumContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 200,
  },
  podiumPlace: {
    alignItems: 'center',
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 16,
    minWidth: 80,
  },
  firstPodium: {
    backgroundColor: '#FEF3C7',
    height: 160,
    justifyContent: 'flex-end',
  },
  secondPodium: {
    backgroundColor: '#F3F4F6',
    height: 140,
    justifyContent: 'flex-end',
  },
  thirdPodium: {
    backgroundColor: '#FEF2F2',
    height: 120,
    justifyContent: 'flex-end',
  },
  podiumImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  firstPlaceImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#F59E0B',
  },
  podiumName: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginTop: 4,
    textAlign: 'center',
  },
  podiumRating: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#F59E0B',
    marginTop: 2,
  },
  leaderboardList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  listTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  firstPlace: {
    borderWidth: 2,
    borderColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
  },
  secondPlace: {
    borderWidth: 2,
    borderColor: '#9CA3AF',
    backgroundColor: '#F9FAFB',
  },
  thirdPlace: {
    borderWidth: 2,
    borderColor: '#CD7C2F',
    backgroundColor: '#FEF2F2',
  },
  regularPlace: {
    backgroundColor: 'white',
  },
  rankContainer: {
    alignItems: 'center',
    marginRight: 12,
    minWidth: 40,
  },
  rankNumber: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginTop: 2,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginLeft: 4,
  },
  votesText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  badgeContainer: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  joinMessage: {
    backgroundColor: '#1F2937',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  joinTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  joinText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  joinButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  joinButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});