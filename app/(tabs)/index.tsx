import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Crown, Filter, Bell, Heart, Zap, Calculator, ThumbsUp, MessageCircleHeart as MessageHeart, ArrowRight, Star } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import FilterModal from '@/components/FilterModal';

const { width } = Dimensions.get('window');

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function HomeScreen() {
  const greeting = getGreeting();
  const [showFilterModal, setShowFilterModal] = useState(false);

  const handlePremiumPress = () => {
    Alert.alert(
      'Upgrade to Premium',
      'Unlock unlimited matches, advanced filters, and exclusive features.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade Now', onPress: () => console.log('Navigate to premium') }
      ]
    );
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const handleApplyFilters = (filters: any) => {
    console.log('Applied filters:', filters);
    // Apply filters logic here
  };

  const handleFeaturePress = (featureName: string) => {
    if (featureName === 'Daily Match') {
      router.push('/(tabs)/matches');
    } else if (featureName === 'Speed Dating') {
      router.push('/speed-dating');
    } else if (featureName === 'Suitability Calculator') {
      router.push('/suitability-calculator');
    } else if (featureName === 'Vibe Vote') {
      router.push('/vibe-vote');
    } else if (featureName === 'Aunty Love') {
      router.push('/ai-chat/aunty-love');
    } else if (featureName === 'RizzMan') {
      router.push('/ai-chat/rizzman');
    } else if (featureName === 'Love Meter') {
      router.push('/love-meter');
    } else {
      Alert.alert('Coming Soon', `${featureName} will be available soon!`);
    }
  };

  const featureCards = [
    {
      id: 1,
      title: 'Daily Match',
      subtitle: 'Your perfect match awaits',
      icon: Heart,
      color: '#FF6B6B',
      available: true,
    },
    {
      id: 2,
      title: 'Speed Dating',
      subtitle: 'Virtual speed dating events',
      icon: Zap,
      color: '#8B5CF6',
      available: true,
    },
    {
      id: 3,
      title: 'Quick Connect',
      subtitle: 'Premium feature',
      icon: MessageHeart,
      color: '#F59E0B',
      available: false,
      premium: true,
    },
    {
      id: 4,
      title: 'Suitability Calculator',
      subtitle: 'Check compatibility',
      icon: Calculator,
      color: '#10B981',
      available: true,
    },
    {
      id: 5,
      title: 'Vibe Vote',
      subtitle: 'Rate photos anonymously',
      icon: ThumbsUp,
      color: '#3B82F6',
      available: true,
    },
    {
      id: 6,
      title: 'Aunty Love',
      subtitle: 'Your caring relationship advisor',
      icon: MessageHeart,
      color: '#EC4899',
      available: true,
    },
    {
      id: 7,
      title: 'RizzMan',
      subtitle: 'Your wingman for charm & confidence',
      icon: Zap,
      color: '#8B5CF6',
      available: true,
    },
    {
      id: 8,
      title: 'Love Meter',
      subtitle: 'Decode their feelings for you',
      icon: Heart,
      color: '#F43F5E',
      available: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.premiumButton} onPress={handlePremiumPress}>
              <Crown size={20} color="#F59E0B" />
              <Text style={styles.premiumText}>Premium</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
              <Filter size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.greeting}>{greeting}, Victor!</Text>
        </View>

        {/* Notifications */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.notificationContainer}>
          <TouchableOpacity style={styles.notification}>
            <Bell size={16} color="#FF6B6B" />
            <Text style={styles.notificationText}>You have 2 new matches waiting!</Text>
            <ArrowRight size={16} color="#FF6B6B" />
          </TouchableOpacity>
        </Animated.View>

        {/* Feature Cards Grid */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Discover</Text>
          
          <View style={styles.featuresGrid}>
            {featureCards.map((card, index) => (
              <TouchableOpacity 
                key={card.id}
                style={[
                  styles.featureCard,
                  !card.available && styles.featureCardDisabled
                ]}
                onPress={() => handleFeaturePress(card.title)}
                disabled={!card.available}
              >
                <View style={[styles.featureIcon, { backgroundColor: card.color }]}>
                  <card.icon size={24} color="white" />
                </View>
                
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{card.title}</Text>
                  <Text style={[
                    styles.featureSubtitle,
                    card.premium && styles.premiumSubtitle
                  ]}>
                    {card.subtitle}
                  </Text>
                </View>
                
                {card.premium && (
                  <Crown size={16} color="#F59E0B" style={styles.premiumIcon} />
                )}
                
                {!card.available && (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Soon</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Premium Upgrade Card */}
        <Animated.View entering={FadeInDown.delay(900)} style={styles.premiumCard}>
          <TouchableOpacity style={styles.premiumCardContent} onPress={handlePremiumPress}>
            <View style={styles.premiumCardLeft}>
              <Crown size={32} color="#F59E0B" />
              <View style={styles.premiumCardText}>
                <Text style={styles.premiumCardTitle}>Upgrade to Premium</Text>
                <Text style={styles.premiumCardSubtitle}>
                  Unlock unlimited matches, advanced filters, and exclusive features
                </Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.upgradeButton} onPress={handlePremiumPress}>
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </TouchableOpacity>
          </TouchableOpacity>
          
          <View style={styles.premiumBenefits}>
            <View style={styles.benefit}>
              <Star size={12} color="#F59E0B" />
              <Text style={styles.benefitText}>Unlimited daily matches</Text>
            </View>
            <View style={styles.benefit}>
              <Star size={12} color="#F59E0B" />
              <Text style={styles.benefitText}>See who liked you</Text>
            </View>
            <View style={styles.benefit}>
              <Star size={12} color="#F59E0B" />
              <Text style={styles.benefitText}>Advanced compatibility filters</Text>
            </View>
          </View>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View entering={FadeInDown.delay(1200)} style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <TouchableOpacity style={styles.activityCard}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg' }}
              style={styles.activityImage}
            />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Sarah liked your profile</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
            <TouchableOpacity style={styles.activityButton}>
              <Text style={styles.activityButtonText}>View</Text>
            </TouchableOpacity>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.activityCard}>
            <View style={[styles.activityIcon, { backgroundColor: '#10B981' }]}>
              <Heart size={20} color="white" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>New match available</Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
            <TouchableOpacity style={styles.activityButton}>
              <Text style={styles.activityButtonText}>Check</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  premiumText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginLeft: 4,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  notificationContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  notificationText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 12,
  },
  featuresContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  featureCardDisabled: {
    opacity: 0.6,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  premiumSubtitle: {
    color: '#F59E0B',
  },
  premiumIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#6B7280',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: 'white',
  },
  premiumCard: {
    marginHorizontal: 24,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  premiumCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  premiumCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  premiumCardText: {
    marginLeft: 12,
    flex: 1,
  },
  premiumCardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 4,
  },
  premiumCardSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    lineHeight: 16,
  },
  upgradeButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  premiumBenefits: {
    gap: 8,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    marginLeft: 8,
  },
  activityContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  activityImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  activityButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activityButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});