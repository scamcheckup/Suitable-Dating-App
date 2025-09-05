import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Share2, MessageCircle, ArrowRight, Info, Star, Sparkles } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';

interface ResultCategory {
  title: string;
  description: string;
  color: string;
  gradient: string[];
  minScore: number;
  advice: string[];
  nextSteps: string[];
}

const RESULT_CATEGORIES: ResultCategory[] = [
  {
    title: "Deeply In Love",
    description: "They have strong romantic feelings for you and are likely in love. Their actions consistently show deep interest, care, and commitment.",
    color: "#10B981",
    gradient: ["#10B981", "#34D399"],
    minScore: 85,
    advice: [
      "They're showing clear signs of being in love with you",
      "Their actions consistently demonstrate deep interest",
      "They prioritize you in their life and future plans",
      "They're emotionally invested and vulnerable with you",
      "They make consistent effort to connect with you"
    ],
    nextSteps: [
      "Have an open conversation about your feelings",
      "If you feel the same way, consider moving the relationship forward",
      "Continue building emotional intimacy and trust",
      "Discuss your relationship goals and timeline"
    ]
  },
  {
    title: "Strongly Interested",
    description: "They have significant interest in you that goes beyond friendship. They're likely developing deeper feelings but may not be fully in love yet.",
    color: "#F59E0B",
    gradient: ["#F59E0B", "#FBBF24"],
    minScore: 70,
    advice: [
      "They show clear signs of romantic interest in you",
      "They're making consistent effort to connect with you",
      "They're likely thinking about you often",
      "They enjoy spending time with you and want more",
      "They may be developing deeper feelings"
    ],
    nextSteps: [
      "Continue spending quality time together",
      "Gradually increase emotional intimacy",
      "Look for opportunities to deepen your connection",
      "Consider expressing your interest if you feel the same"
    ]
  },
  {
    title: "Curious & Friendly",
    description: "They enjoy your company and may be open to exploring a deeper connection, but their feelings aren't clearly romantic yet.",
    color: "#8B5CF6",
    gradient: ["#8B5CF6", "#A78BFA"],
    minScore: 50,
    advice: [
      "They enjoy your company and conversation",
      "They're open to spending time with you",
      "They may be curious about you romantically",
      "Their feelings are still developing or unclear",
      "They're friendly but not showing strong romantic signals"
    ],
    nextSteps: [
      "Focus on building a stronger friendship first",
      "Create opportunities for deeper conversations",
      "Be patient and don't rush romantic expectations",
      "Look for gradual increases in their interest level"
    ]
  },
  {
    title: "Just Friends",
    description: "They value you as a friend and enjoy your company, but they're likely not seeing you in a romantic light at this time.",
    color: "#3B82F6",
    gradient: ["#3B82F6", "#60A5FA"],
    minScore: 30,
    advice: [
      "They see you primarily as a friend",
      "They enjoy your company but aren't showing romantic interest",
      "They may not be thinking about you romantically",
      "Their behavior is consistent with how they treat other friends",
      "They're comfortable but not flirtatious with you"
    ],
    nextSteps: [
      "Value the friendship you have",
      "Don't pressure them with romantic expectations",
      "Consider whether you're content with friendship",
      "If you have strong feelings, prepare for the possibility they may not reciprocate"
    ]
  },
  {
    title: "Not Interested",
    description: "They don't currently show signs of romantic interest. Their behavior suggests they see you as an acquaintance or casual friend at most.",
    color: "#6B7280",
    gradient: ["#6B7280", "#9CA3AF"],
    minScore: 0,
    advice: [
      "They're showing minimal investment in connecting with you",
      "Their responses and availability are inconsistent",
      "They don't prioritize communication with you",
      "They keep conversations surface-level",
      "They don't show curiosity about your personal life"
    ],
    nextSteps: [
      "Focus your emotional energy elsewhere",
      "Maintain friendly but casual interactions",
      "Avoid reading too much into small gestures",
      "Consider exploring connections with others who show clear interest"
    ]
  }
];

export default function LoveMeterResultsScreen() {
  const { score } = useLocalSearchParams();
  const [result, setResult] = useState<ResultCategory | null>(null);
  const [showAdvice, setShowAdvice] = useState(false);

  useEffect(() => {
    const numericScore = Number(score);
    
    // Find the appropriate category based on score
    const category = RESULT_CATEGORIES.find(
      cat => numericScore >= cat.minScore
    );
    
    if (category) {
      setResult(category);
    } else {
      // Fallback to lowest category
      setResult(RESULT_CATEGORIES[RESULT_CATEGORIES.length - 1]);
    }
  }, [score]);

  const handleShare = async () => {
    if (!result) return;
    
    try {
      await Share.share({
        message: `I just took the Love Meter quiz and discovered that someone is "${result.title}" towards me! Try the Suitable app to find out how someone feels about you!`,
        title: 'Love Meter Results'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (!result) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Analyzing results...</Text>
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
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>Your Results</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Share2 size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Result Card */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.resultCard}>
          <LinearGradient
            colors={result.gradient}
            style={styles.resultGradient}
          >
            <View style={styles.resultContent}>
              <Heart size={48} color="white" fill="white" />
              <Text style={styles.resultTitle}>{result.title}</Text>
              <Text style={styles.resultScore}>Score: {score}/100</Text>
              
              <View style={styles.resultDescription}>
                <Text style={styles.resultDescriptionText}>
                  {result.description}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Advice Section */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.adviceSection}>
          <Text style={styles.sectionTitle}>What This Means</Text>
          
          <View style={styles.adviceList}>
            {result.advice.map((item, index) => (
              <View key={index} style={styles.adviceItem}>
                <View style={[styles.adviceIcon, { backgroundColor: result.color }]}>
                  <Star size={16} color="white" />
                </View>
                <Text style={styles.adviceText}>{item}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Next Steps */}
        <Animated.View entering={FadeInDown.delay(700)} style={styles.nextStepsSection}>
          <Text style={styles.sectionTitle}>Recommended Next Steps</Text>
          
          <View style={styles.nextStepsList}>
            {result.nextSteps.map((item, index) => (
              <View key={index} style={styles.nextStepItem}>
                <View style={[styles.nextStepNumber, { backgroundColor: result.color }]}>
                  <Text style={styles.nextStepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.nextStepText}>{item}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Talk to AI Coaches */}
        <Animated.View entering={FadeInDown.delay(900)} style={styles.aiCoachesSection}>
          <Text style={styles.sectionTitle}>Get Personalized Advice</Text>
          
          <View style={styles.aiCoachesContainer}>
            <TouchableOpacity 
              style={styles.aiCoachCard}
              onPress={() => router.push('/ai-chat/aunty-love')}
            >
              <LinearGradient
                colors={['#EC4899', '#F472B6']}
                style={styles.aiCoachGradient}
              >
                <Heart size={24} color="white" />
                <Text style={styles.aiCoachName}>Aunty Love</Text>
                <Text style={styles.aiCoachDescription}>
                  Get relationship advice from your caring virtual aunty
                </Text>
                <View style={styles.aiCoachButton}>
                  <Text style={styles.aiCoachButtonText}>Chat Now</Text>
                  <ArrowRight size={16} color="#EC4899" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.aiCoachCard}
              onPress={() => router.push('/ai-chat/rizzman')}
            >
              <LinearGradient
                colors={['#8B5CF6', '#A78BFA']}
                style={styles.aiCoachGradient}
              >
                <Sparkles size={24} color="white" />
                <Text style={styles.aiCoachName}>RizzMan</Text>
                <Text style={styles.aiCoachDescription}>
                  Get tips on building confidence and attraction
                </Text>
                <View style={styles.aiCoachButton}>
                  <Text style={styles.aiCoachButtonText}>Chat Now</Text>
                  <ArrowRight size={16} color="#8B5CF6" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Disclaimer */}
        <Animated.View entering={FadeInDown.delay(1100)} style={styles.disclaimerSection}>
          <Info size={16} color="#0EA5E9" />
          <Text style={styles.disclaimerText}>
            Remember that this quiz is meant to be a fun tool for reflection. The most accurate way to understand someone's feelings is through open, honest communication when the time is right.
          </Text>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(1300)} style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/love-meter/quiz')}
          >
            <Text style={styles.primaryButtonText}>Take Quiz Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.secondaryButtonText}>Return to Home</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
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
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  resultCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
  },
  resultGradient: {
    padding: 24,
    alignItems: 'center',
  },
  resultContent: {
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  resultDescription: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 12,
  },
  resultDescriptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'white',
    textAlign: 'center',
    lineHeight: 20,
  },
  adviceSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  adviceList: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  adviceIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  adviceText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  nextStepsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  nextStepsList: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  nextStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nextStepNumberText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  nextStepText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    flex: 1,
    lineHeight: 20,
    paddingTop: 4,
  },
  aiCoachesSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  aiCoachesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aiCoachCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  aiCoachGradient: {
    padding: 16,
    alignItems: 'center',
    height: 180,
  },
  aiCoachName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
  },
  aiCoachDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
  },
  aiCoachButton: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiCoachButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  disclaimerSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  disclaimerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  actionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
});