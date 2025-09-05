import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Users, MessageCircle, Share2, Trophy, Star, TrendingUp, CircleCheck as CheckCircle } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface CompatibilityResult {
  overallScore: number;
  categories: {
    values: number;
    lifestyle: number;
    communication: number;
    future: number;
    personality: number;
  };
  strengths: string[];
  improvements: string[];
  insights: string[];
}

const SAMPLE_RESULT: CompatibilityResult = {
  overallScore: 87,
  categories: {
    values: 92,
    lifestyle: 78,
    communication: 89,
    future: 85,
    personality: 91
  },
  strengths: [
    "You both value honesty and trust above all else",
    "Similar communication styles - you both prefer direct conversation",
    "Aligned future goals regarding family and career",
    "Compatible approaches to handling stress and conflict"
  ],
  improvements: [
    "Different preferences for social activities - find a balance",
    "Varying approaches to financial planning - discuss openly",
    "Different energy levels - respect each other's pace"
  ],
  insights: [
    "Your relationship has a strong foundation built on shared values",
    "You complement each other well in areas where you differ",
    "Communication will be your strongest asset as a couple",
    "Consider discussing your different lifestyle preferences early on"
  ]
};

export default function ResultsScreen() {
  const { sessionId } = useLocalSearchParams();
  const { user, userProfile } = useAuth();
  const [result, setResult] = useState<CompatibilityResult>(SAMPLE_RESULT);
  const [showDetails, setShowDetails] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10B981';
    if (score >= 80) return '#F59E0B';
    if (score >= 70) return '#3B82F6';
    return '#EF4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Work';
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `We just took a compatibility quiz and scored ${result.overallScore}%! 💕 Try the Suitable app to test your compatibility too!`,
        title: 'Compatibility Quiz Results'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderCategoryScore = (category: string, score: number, index: number) => (
    <Animated.View 
      key={category}
      entering={FadeInDown.delay(index * 100)}
      style={styles.categoryCard}
    >
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryName}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
        <View style={[styles.categoryScore, { backgroundColor: getScoreColor(score) }]}>
          <Text style={styles.categoryScoreText}>{score}%</Text>
        </View>
      </View>
      
      <View style={styles.categoryProgress}>
        <View style={styles.categoryProgressBar}>
          <View 
            style={[
              styles.categoryProgressFill, 
              { width: `${score}%`, backgroundColor: getScoreColor(score) }
            ]} 
          />
        </View>
        <Text style={[styles.categoryLabel, { color: getScoreColor(score) }]}>
          {getScoreLabel(score)}
        </Text>
      </View>
    </Animated.View>
  );

  const renderInsightSection = (title: string, items: string[], icon: any, color: string, delay: number) => (
    <Animated.View entering={FadeInDown.delay(delay)} style={styles.insightSection}>
      <View style={styles.insightHeader}>
        <View style={[styles.insightIcon, { backgroundColor: color }]}>
          {React.createElement(icon, { size: 20, color: 'white' })}
        </View>
        <Text style={styles.insightTitle}>{title}</Text>
      </View>
      
      <View style={styles.insightList}>
        {items.map((item, index) => (
          <View key={index} style={styles.insightItem}>
            <CheckCircle size={16} color={color} />
            <Text style={styles.insightText}>{item}</Text>
          </View>
        ))}
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
          <Text style={styles.title}>Compatibility Results</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Share2 size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall Score */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.scoreSection}>
          <LinearGradient
            colors={[getScoreColor(result.overallScore), getScoreColor(result.overallScore) + '80']}
            style={styles.scoreGradient}
          >
            <View style={styles.scoreContent}>
              <Trophy size={40} color="white" />
              <Text style={styles.scoreTitle}>Your Compatibility Score</Text>
              <Text style={styles.scoreValue}>{result.overallScore}%</Text>
              <Text style={styles.scoreLabel}>{getScoreLabel(result.overallScore)} Match!</Text>
              
              <View style={styles.scoreDescription}>
                <Text style={styles.scoreDescriptionText}>
                  {result.overallScore >= 90 
                    ? "You two are incredibly compatible! Your values, communication styles, and life goals align beautifully."
                    : result.overallScore >= 80
                    ? "You have great compatibility! There are some areas to work on, but you have a strong foundation."
                    : result.overallScore >= 70
                    ? "You have good compatibility with room for growth. Focus on understanding each other better."
                    : "There are some challenges, but every relationship can grow with effort and understanding."
                  }
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Category Breakdown */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Detailed Breakdown</Text>
          {Object.entries(result.categories).map(([category, score], index) => 
            renderCategoryScore(category, score, index)
          )}
        </View>

        {/* Insights */}
        {renderInsightSection(
          "Your Strengths",
          result.strengths,
          Heart,
          '#10B981',
          800
        )}

        {renderInsightSection(
          "Areas to Explore",
          result.improvements,
          TrendingUp,
          '#F59E0B',
          900
        )}

        {renderInsightSection(
          "Relationship Insights",
          result.insights,
          Star,
          '#8B5CF6',
          1000
        )}

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(1100)} style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={20} color="white" />
            <Text style={styles.actionButtonText}>Start Conversation</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('/suitability-calculator')}
          >
            <Text style={styles.secondaryButtonText}>Take Another Quiz</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Tips */}
        <Animated.View entering={FadeInDown.delay(1200)} style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Relationship Tips</Text>
          
          <View style={styles.tipsList}>
            <Text style={styles.tipText}>
              • Use these results as a starting point for deeper conversations
            </Text>
            <Text style={styles.tipText}>
              • Focus on your strengths while working on areas for improvement
            </Text>
            <Text style={styles.tipText}>
              • Remember that compatibility can grow with understanding and effort
            </Text>
            <Text style={styles.tipText}>
              • Consider taking the quiz again in a few months to track progress
            </Text>
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    fontSize: 18,
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
  scoreSection: {
    margin: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  scoreGradient: {
    padding: 32,
    alignItems: 'center',
  },
  scoreContent: {
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 16,
  },
  scoreDescription: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 12,
  },
  scoreDescriptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'white',
    textAlign: 'center',
    lineHeight: 20,
  },
  categoriesSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  categoryScore: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryScoreText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  categoryProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginRight: 12,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  insightSection: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  insightList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  actionsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
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
  tipsSection: {
    backgroundColor: '#F0F9FF',
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
  },
});