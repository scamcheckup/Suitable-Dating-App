import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Filter, Crown, Heart, X, MessageCircle, Clock, CircleCheck as CheckCircle, MapPin, Briefcase } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { findPotentialMatches, createMatch, updateMatchStatus, getUserMatches, getMatchCompatibilityLabel } from '@/lib/matching';
import { createChatChannel } from '@/lib/supabase-chat';

const { width } = Dimensions.get('window');

export default function MatchesScreen() {
  const { user, userProfile } = useAuth();
  const { sendLocalNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const [matches, setMatches] = useState([]);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && userProfile) {
      loadMatches();
      loadPotentialMatches();
    }
  }, [user, userProfile]);

  const loadMatches = async () => {
    if (!user) return;

    try {
      const { matches: userMatches, error } = await getUserMatches(user.id);
      if (error) {
        console.error('Error loading matches:', error);
        return;
      }
      setMatches(userMatches || []);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const loadPotentialMatches = async () => {
    if (!user) return;

    try {
      const { matches: potential, error } = await findPotentialMatches(user.id, 3); // Daily limit of 3
      if (error) {
        console.error('Error loading potential matches:', error);
        return;
      }
      setPotentialMatches(potential || []);
    } catch (error) {
      console.error('Error loading potential matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMatches = () => {
    switch (activeTab) {
      case 'new':
        return potentialMatches.map(match => ({
          ...match,
          status: 'new',
          compatibility: match.compatibility_score
        }));
      case 'matched':
        return matches.filter(match => match.status === 'matched').map(match => ({
          ...match.user_profile,
          status: match.status,
          compatibility: match.compatibility_score,
          matchId: match.id
        }));
      default:
        const allMatches = [
          ...potentialMatches.map(match => ({
            ...match,
            status: 'new',
            compatibility: match.compatibility_score
          })),
          ...matches.map(match => ({
            ...match.user_profile,
            status: match.status,
            compatibility: match.compatibility_score,
            matchId: match.id
          }))
        ];
        return allMatches;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new':
        return <Heart size={16} color="white" />;
      case 'pending':
        return <Clock size={16} color="white" />;
      case 'matched':
        return <CheckCircle size={16} color="white" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'new':
        return 'New Match';
      case 'pending':
        return 'Pending';
      case 'matched':
        return 'Matched';
      default:
        return '';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return '#FF6B6B';
      case 'pending':
        return '#F59E0B';
      case 'matched':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const handleMatchAction = async (matchData, action) => {
    if (!user) return;

    try {
      if (action === 'like' && matchData.status === 'new') {
        // Create new match
        const { match, error } = await createMatch(user.id, matchData.id);
        if (error) {
          Alert.alert('Error', 'Failed to create match. Please try again.');
          return;
        }
        
        // Remove from potential matches and add to matches
        setPotentialMatches(prev => prev.filter(m => m.id !== matchData.id));
        await loadMatches();
        
        // Send local notification
        sendLocalNotification('new_match', { matchName: matchData.name });
        
        Alert.alert('Match Created!', 'Your match request has been sent.');
      } else if (action === 'reject') {
        // For new matches, just remove from potential matches
        if (matchData.status === 'new') {
          setPotentialMatches(prev => prev.filter(m => m.id !== matchData.id));
        } else if (matchData.matchId) {
          // Update existing match status
          const { error } = await updateMatchStatus(matchData.matchId, 'rejected');
          if (error) {
            Alert.alert('Error', 'Failed to update match status.');
            return;
          }
          await loadMatches();
        }
      } else if (action === 'chat' && matchData.status === 'matched') {
        // Navigate to chat
        router.push('/(tabs)/chats');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const renderMatchCard = (match) => (
    <Animated.View 
      key={match.id}
      entering={FadeInDown.delay(match.id * 100)}
      style={styles.matchCard}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ 
            uri: match.profile_photos?.[0] || 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg' 
          }} 
          style={styles.matchImage} 
        />
        
        {/* Overlay Content */}
        <View style={styles.overlay}>
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(match.status) }]}>
            {getStatusIcon(match.status)}
            <Text style={styles.statusText}>
              {getStatusText(match.status)}
            </Text>
          </View>

          {/* Compatibility Score */}
          <View style={styles.compatibilityBadge}>
            <Text style={styles.compatibilityText}>
              {match.compatibility || match.compatibility_score}% Match
            </Text>
          </View>
        </View>

        {/* Bottom Info with LinearGradient */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.bottomInfo}
        >
          <View style={styles.matchInfo}>
            <Text style={styles.matchName}>{match.name}, {match.age}</Text>
            <View style={styles.locationRow}>
              <MapPin size={12} color="white" />
              <Text style={styles.matchLocation}>
                {match.current_location || `${match.lga || match.state || 'Nigeria'}`}
              </Text>
            </View>
            <View style={styles.occupationRow}>
              <Briefcase size={12} color="white" />
              <Text style={styles.matchOccupation}>{match.occupation}</Text>
            </View>
            {match.bio && (
              <Text style={styles.matchBio} numberOfLines={2}>{match.bio}</Text>
            )}
            <Text style={styles.compatibilityLabel}>
              {getMatchCompatibilityLabel(match.compatibility || match.compatibility_score)}
            </Text>
          </View>
        </LinearGradient>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.matchActions}>
        {match.status === 'new' && (
          <>
            <TouchableOpacity 
              style={styles.rejectButton}
              onPress={() => handleMatchAction(match, 'reject')}
            >
              <X size={20} color="#EF4444" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.likeButton}
              onPress={() => handleMatchAction(match, 'like')}
            >
              <Heart size={20} color="white" />
              <Text style={styles.likeButtonText}>Match</Text>
            </TouchableOpacity>
          </>
        )}
        
        {match.status === 'pending' && (
          <View style={styles.pendingContainer}>
            <Clock size={16} color="#F59E0B" />
            <Text style={styles.pendingText}>Waiting for response</Text>
          </View>
        )}
        
        {match.status === 'matched' && (
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => handleMatchAction(match, 'chat')}
          >
            <MessageCircle size={20} color="white" />
            <Text style={styles.chatButtonText}>Start Chat</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Finding your matches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show onboarding message if profile is incomplete
  if (!userProfile || !userProfile.interests || !userProfile.partner_values) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Heart size={64} color="#E5E7EB" />
          <Text style={styles.emptyTitle}>Complete Your Profile</Text>
          <Text style={styles.emptySubtitle}>
            Finish setting up your profile to start receiving matches
          </Text>
          <TouchableOpacity 
            style={styles.completeProfileButton}
            onPress={() => router.push('/onboarding/basic-info')}
          >
            <Text style={styles.completeProfileButtonText}>Complete Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Matches</Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.premiumButton}>
              <Crown size={16} color="#F59E0B" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {[
            { key: 'all', label: 'All Matches' },
            { key: 'new', label: 'New Matches' },
            { key: 'matched', label: 'Matched' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Matches List */}
      <ScrollView 
        style={styles.matchesList}
        showsVerticalScrollIndicator={false}
      >
        {getFilteredMatches().length > 0 ? (
          <>
            {/* Daily Limit Info */}
            <View style={styles.limitInfo}>
              <Text style={styles.limitText}>
                Daily matches: {potentialMatches.length}/3 available
              </Text>
              <Text style={styles.limitSubtext}>
                Upgrade to Premium for unlimited matches
              </Text>
            </View>

            {getFilteredMatches().map(renderMatchCard)}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Heart size={64} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No matches yet</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'new' 
                ? 'New matches will appear here daily'
                : activeTab === 'matched'
                ? 'Your mutual matches will appear here'
                : 'Check back tomorrow for new matches'
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  premiumButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FF6B6B',
  },
  matchesList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  limitInfo: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  limitText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 4,
  },
  limitSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  matchCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  imageContainer: {
    position: 'relative',
    height: 400,
  },
  matchImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 4,
  },
  compatibilityBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  compatibilityText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  matchLocation: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'white',
    marginLeft: 4,
  },
  occupationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchOccupation: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'white',
    marginLeft: 4,
  },
  matchBio: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 8,
  },
  compatibilityLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
  },
  matchActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  rejectButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  likeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    borderRadius: 24,
    marginLeft: 12,
  },
  likeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 6,
  },
  pendingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingVertical: 12,
    borderRadius: 24,
  },
  pendingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#F59E0B',
    marginLeft: 6,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 24,
  },
  chatButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  completeProfileButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  completeProfileButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});