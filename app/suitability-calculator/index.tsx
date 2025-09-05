import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calculator, Users, Heart, Star, Zap, Trophy, Play, UserPlus, TrendingUp } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

interface CompatibilitySession {
  id: string;
  user1_name: string;
  user2_name: string;
  score: number;
  status: 'completed' | 'in_progress';
  date: string;
}

const SAMPLE_SESSIONS: CompatibilitySession[] = [
  {
    id: '1',
    user1_name: 'You',
    user2_name: 'Sarah M.',
    score: 87,
    status: 'completed',
    date: '2025-01-15'
  },
  {
    id: '2',
    user1_name: 'You',
    user2_name: 'David K.',
    score: 72,
    status: 'completed',
    date: '2025-01-12'
  },
  {
    id: '3',
    user1_name: 'You',
    user2_name: 'Amara O.',
    score: 94,
    status: 'completed',
    date: '2025-01-10'
  }
];

export default function SuitabilityCalculatorScreen() {
  const { user, userProfile } = useAuth();
  const [recentSessions, setRecentSessions] = useState<CompatibilitySession[]>(SAMPLE_SESSIONS);

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10B981';
    if (score >= 80) return '#F59E0B';
    if (score >= 70) return '#3B82F6';
    return '#EF4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Perfect Match';
    if (score >= 80) return 'Great Match';
    if (score >= 70) return 'Good Match';
    if (score >= 60) return 'Fair Match';
    return 'Low Match';
  };

  const handleStartQuiz = () => {
    if (!userProfile) {
      router.push('/auth/login');
      return;
    }
    router.push('/suitability-calculator/connect');
  };

  const renderSessionCard = (session: CompatibilitySession, index: number) => (
    <Animated.View 
      key={session.id}
      entering={FadeInDown.delay(index * 100)}
      style={styles.sessionCard}
    >
      <View style={styles.sessionHeader}>
        <View style={styles.sessionUsers}>
          <Text style={styles.sessionUsersText}>
            {session.user1_name} & {session.user2_name}
          </Text>
          <Text style={styles.sessionDate}>
            {new Date(session.date).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={[styles.scoreCircle, { borderColor: getScoreColor(session.score) }]}>
          <Text style={[styles.scoreText, { color: getScoreColor(session.score) }]}>
            {session.score}%
          </Text>
        </View>
      </View>
      
      <View style={styles.sessionFooter}>
        <Text style={[styles.scoreLabel, { color: getScoreColor(session.score) }]}>
          {getScoreLabel(session.score)}
        </Text>
        
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => router.push(`/suitability-calculator/results/${session.id}`)}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
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
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>Suitability Calculator</Text>
          <Text style={styles.subtitle}>Discover your compatibility</Text>
        </View>
        
        <View style={styles.headerIcon}>
          <Calculator size={24} color="#FF6B6B" />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.heroSection}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E8E']}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Calculator size={48} color="white" />
              <Text style={styles.heroTitle}>Compatibility Quiz</Text>
              <Text style={styles.heroSubtitle}>
                Answer fun questions together and discover how compatible you really are!
              </Text>
              
              <TouchableOpacity 
                style={styles.startButton}
                onPress={handleStartQuiz}
              >
                <Play size={20} color="#FF6B6B" />
                <Text style={styles.startButtonText}>Start New Quiz</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* How It Works */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: '#FF6B6B' }]}>
                <UserPlus size={20} color="white" />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Connect with Someone</Text>
                <Text style={styles.stepDescription}>
                  Enter their phone number to invite them to take the quiz
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: '#8B5CF6' }]}>
                <Users size={20} color="white" />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Answer Together</Text>
                <Text style={styles.stepDescription}>
                  Both of you answer 20 fun compatibility questions
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: '#10B981' }]}>
                <TrendingUp size={20} color="white" />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Get Your Score</Text>
                <Text style={styles.stepDescription}>
                  Receive a detailed compatibility report with insights
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: '#F59E0B' }]}>
                <Heart size={20} color="white" />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Discover Compatibility</Text>
                <Text style={styles.stepDescription}>
                  Learn about your strengths and areas to work on together
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Features */}
        <Animated.View entering={FadeInDown.delay(700)} style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>What You'll Discover</Text>
          
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <Heart size={32} color="#FF6B6B" />
              <Text style={styles.featureTitle}>Love Languages</Text>
              <Text style={styles.featureDescription}>
                How you both express and receive love
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <Users size={32} color="#8B5CF6" />
              <Text style={styles.featureTitle}>Communication Style</Text>
              <Text style={styles.featureDescription}>
                Your preferred ways of communicating
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <Star size={32} color="#F59E0B" />
              <Text style={styles.featureTitle}>Shared Values</Text>
              <Text style={styles.featureDescription}>
                What matters most to both of you
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <Zap size={32} color="#10B981" />
              <Text style={styles.featureTitle}>Relationship Goals</Text>
              <Text style={styles.featureDescription}>
                Your vision for the future together
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <Animated.View entering={FadeInDown.delay(900)} style={styles.sessionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Quizzes</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {recentSessions.slice(0, 3).map(renderSessionCard)}
          </Animated.View>
        )}

        {/* Stats Section */}
        <Animated.View entering={FadeInDown.delay(1100)} style={styles.statsSection}>
          <LinearGradient
            colors={['#1F2937', '#374151']}
            style={styles.statsGradient}
          >
            <Text style={styles.statsTitle}>Quiz Statistics</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Trophy size={24} color="#F59E0B" />
                <Text style={styles.statNumber}>10K+</Text>
                <Text style={styles.statLabel}>Quizzes Taken</Text>
              </View>
              
              <View style={styles.statItem}>
                <Heart size={24} color="#FF6B6B" />
                <Text style={styles.statNumber}>85%</Text>
                <Text style={styles.statLabel}>Average Score</Text>
              </View>
              
              <View style={styles.statItem}>
                <Users size={24} color="#10B981" />
                <Text style={styles.statNumber}>2.5K</Text>
                <Text style={styles.statLabel}>Couples Helped</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Tips Section */}
        <Animated.View entering={FadeInDown.delay(1300)} style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>💡 Pro Tips</Text>
          
          <View style={styles.tipsList}>
            <View style={styles.tip}>
              <Text style={styles.tipText}>
                • Be honest in your answers for the most accurate results
              </Text>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipText}>
                • Take the quiz in a relaxed, comfortable environment
              </Text>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipText}>
                • Discuss your results together afterwards
              </Text>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipText}>
                • Remember, compatibility can grow over time!
              </Text>
            </View>
          </View>
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
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 24,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF6B6B',
  },
  howItWorksSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  stepsContainer: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  featuresSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  sessionsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  seeAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF6B6B',
  },
  sessionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionUsers: {
    flex: 1,
  },
  sessionUsersText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  sessionDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  scoreCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  viewButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  statsSection: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: 24,
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
  },
  tipsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  tipsList: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  tip: {
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
  },
});