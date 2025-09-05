import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, MessageCircle, Zap, Info, Star, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function LoveMeterScreen() {
  const handleStartQuiz = () => {
    router.push('/love-meter/quiz');
  };

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
          <Text style={styles.title}>Love Meter</Text>
          <Text style={styles.subtitle}>Decode their feelings for you</Text>
        </View>
        
        <View style={styles.headerIcon}>
          <Heart size={24} color="#FF6B6B" />
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
              <Heart size={48} color="white" fill="white" />
              <Text style={styles.heroTitle}>Love Meter Quiz</Text>
              <Text style={styles.heroSubtitle}>
                Answer 10 questions to understand how they really feel about you
              </Text>
              
              <TouchableOpacity 
                style={styles.startButton}
                onPress={handleStartQuiz}
              >
                <Text style={styles.startButtonText}>Start Quiz</Text>
                <ArrowRight size={20} color="#FF6B6B" />
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
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Answer 10 Questions</Text>
                <Text style={styles.stepDescription}>
                  Reflect on their behavior and interactions with you
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: '#8B5CF6' }]}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Get Your Score</Text>
                <Text style={styles.stepDescription}>
                  See where they fall on the interest scale
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: '#10B981' }]}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Understand Their Feelings</Text>
                <Text style={styles.stepDescription}>
                  Get insights into how they truly feel about you
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Get Personalized Advice</Text>
                <Text style={styles.stepDescription}>
                  Receive tips on how to move forward based on results
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Categories */}
        <Animated.View entering={FadeInDown.delay(700)} style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Feeling Categories</Text>
          
          <View style={styles.categoriesGrid}>
            <View style={styles.categoryCard}>
              <LinearGradient
                colors={['#10B981', '#34D399']}
                style={styles.categoryIcon}
              >
                <Heart size={24} color="white" fill="white" />
              </LinearGradient>
              <Text style={styles.categoryTitle}>Deeply In Love</Text>
              <Text style={styles.categoryDescription}>
                They have strong romantic feelings for you
              </Text>
            </View>
            
            <View style={styles.categoryCard}>
              <LinearGradient
                colors={['#F59E0B', '#FBBF24']}
                style={styles.categoryIcon}
              >
                <Star size={24} color="white" />
              </LinearGradient>
              <Text style={styles.categoryTitle}>Strongly Interested</Text>
              <Text style={styles.categoryDescription}>
                They're attracted to you and want to explore more
              </Text>
            </View>
            
            <View style={styles.categoryCard}>
              <LinearGradient
                colors={['#8B5CF6', '#A78BFA']}
                style={styles.categoryIcon}
              >
                <MessageCircle size={24} color="white" />
              </LinearGradient>
              <Text style={styles.categoryTitle}>Curious & Friendly</Text>
              <Text style={styles.categoryDescription}>
                They enjoy your company but may be unsure
              </Text>
            </View>
            
            <View style={styles.categoryCard}>
              <LinearGradient
                colors={['#3B82F6', '#60A5FA']}
                style={styles.categoryIcon}
              >
                <Zap size={24} color="white" />
              </LinearGradient>
              <Text style={styles.categoryTitle}>Just Friends</Text>
              <Text style={styles.categoryDescription}>
                They value you as a friend without romantic interest
              </Text>
            </View>
            
            <View style={styles.categoryCard}>
              <LinearGradient
                colors={['#6B7280', '#9CA3AF']}
                style={styles.categoryIcon}
              >
                <Info size={24} color="white" />
              </LinearGradient>
              <Text style={styles.categoryTitle}>Not Interested</Text>
              <Text style={styles.categoryDescription}>
                They don't currently have romantic feelings for you
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Disclaimer */}
        <Animated.View entering={FadeInDown.delay(900)} style={styles.disclaimerSection}>
          <Text style={styles.disclaimerTitle}>💡 Important Note</Text>
          <Text style={styles.disclaimerText}>
            This quiz is meant to be a fun tool to help you reflect on your relationship dynamics. 
            It's not a scientific assessment and shouldn't replace open communication. The best way 
            to understand someone's feelings is to have an honest conversation with them when the time is right.
          </Text>
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
  stepNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: 'white',
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
  categoriesSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  categoriesGrid: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    flex: 1,
    lineHeight: 16,
  },
  disclaimerSection: {
    backgroundColor: '#F0F9FF',
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  disclaimerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
  },
});