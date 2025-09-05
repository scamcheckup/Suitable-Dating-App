import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Users, Clock, Heart, CircleCheck as CheckCircle } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  category: 'values' | 'lifestyle' | 'communication' | 'future' | 'personality';
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What's most important to you in a relationship?",
    options: ["Trust and honesty", "Fun and adventure", "Deep emotional connection", "Shared goals and values"],
    category: 'values'
  },
  {
    id: 2,
    question: "How do you prefer to spend your weekends?",
    options: ["Relaxing at home", "Going out and socializing", "Trying new activities", "Working on personal projects"],
    category: 'lifestyle'
  },
  {
    id: 3,
    question: "When you're upset, how do you prefer your partner to respond?",
    options: ["Give me space to process", "Talk it through immediately", "Offer physical comfort", "Help me find solutions"],
    category: 'communication'
  },
  {
    id: 4,
    question: "What's your ideal way to show love?",
    options: ["Words of affirmation", "Quality time together", "Physical touch", "Acts of service"],
    category: 'communication'
  },
  {
    id: 5,
    question: "How important is financial stability in a relationship?",
    options: ["Extremely important", "Somewhat important", "Not very important", "We'll figure it out together"],
    category: 'values'
  },
  {
    id: 6,
    question: "What's your approach to conflict resolution?",
    options: ["Address it immediately", "Take time to cool down first", "Seek compromise", "Avoid confrontation"],
    category: 'communication'
  },
  {
    id: 7,
    question: "How do you envision your future family?",
    options: ["Large family with many children", "Small family with 1-2 children", "Just the two of us", "Open to whatever happens"],
    category: 'future'
  },
  {
    id: 8,
    question: "What role should friends play in your relationship?",
    options: ["Very important, we socialize together", "Important but separate", "Partner comes first", "Balance is key"],
    category: 'lifestyle'
  },
  {
    id: 9,
    question: "How do you handle stress?",
    options: ["Talk to someone about it", "Exercise or physical activity", "Take time alone", "Focus on solutions"],
    category: 'personality'
  },
  {
    id: 10,
    question: "What's your ideal date night?",
    options: ["Romantic dinner at home", "Adventure or outdoor activity", "Cultural event or show", "Trying something new together"],
    category: 'lifestyle'
  },
  {
    id: 11,
    question: "How important is physical attraction?",
    options: ["Very important", "Somewhat important", "Not the most important", "Grows over time"],
    category: 'values'
  },
  {
    id: 12,
    question: "What's your communication style?",
    options: ["Direct and straightforward", "Gentle and considerate", "Humorous and light", "Deep and meaningful"],
    category: 'communication'
  },
  {
    id: 13,
    question: "How do you prefer to make big decisions?",
    options: ["Together as a team", "I like to lead", "My partner can decide", "We each handle different areas"],
    category: 'personality'
  },
  {
    id: 14,
    question: "What's your ideal living situation?",
    options: ["City apartment", "Suburban house", "Rural/countryside", "Wherever we're happy"],
    category: 'future'
  },
  {
    id: 15,
    question: "How do you show appreciation?",
    options: ["Say 'thank you' often", "Do something special", "Give gifts", "Physical affection"],
    category: 'communication'
  },
  {
    id: 16,
    question: "What's your approach to personal growth?",
    options: ["Always learning and improving", "Content with who I am", "Grow through experiences", "Grow together as a couple"],
    category: 'personality'
  },
  {
    id: 17,
    question: "How important is alone time?",
    options: ["Very important", "Somewhat important", "Not very important", "Prefer time together"],
    category: 'lifestyle'
  },
  {
    id: 18,
    question: "What's your view on marriage?",
    options: ["Essential for commitment", "Nice but not necessary", "Just a piece of paper", "Depends on the person"],
    category: 'future'
  },
  {
    id: 19,
    question: "How do you handle disagreements about money?",
    options: ["Discuss and compromise", "One person manages finances", "Keep finances separate", "Seek outside advice"],
    category: 'values'
  },
  {
    id: 20,
    question: "What makes you feel most loved?",
    options: ["Being listened to", "Physical affection", "Thoughtful gestures", "Quality time together"],
    category: 'communication'
  }
];

export default function QuizScreen() {
  const { sessionId, partnerPhone } = useLocalSearchParams();
  const { user, userProfile } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes
  const [partnerProgress, setPartnerProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          Alert.alert('Time Up!', 'The quiz session has expired.');
          router.back();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate partner progress
    const progressTimer = setInterval(() => {
      setPartnerProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 2, currentQuestion + Math.random() * 3);
        return Math.min(newProgress, QUIZ_QUESTIONS.length);
      });
    }, 3000);

    return () => clearInterval(progressTimer);
  }, [currentQuestion]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [QUIZ_QUESTIONS[currentQuestion].id]: answer
    }));

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz completed
      router.push(`/suitability-calculator/results/${sessionId}`);
    }
  };

  const question = QUIZ_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;
  const partnerProgressPercent = (partnerProgress / QUIZ_QUESTIONS.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            Alert.alert(
              'Exit Quiz?',
              'Are you sure you want to exit? Your progress will be lost.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Exit', style: 'destructive', onPress: () => router.back() }
              ]
            );
          }}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>Compatibility Quiz</Text>
          <View style={styles.timerContainer}>
            <Clock size={14} color="#F59E0B" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Your Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{currentQuestion + 1}/{QUIZ_QUESTIONS.length}</Text>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Partner's Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, styles.partnerProgress, { width: `${partnerProgressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.floor(partnerProgress)}/{QUIZ_QUESTIONS.length}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(300)} style={styles.questionContainer}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{question.category.toUpperCase()}</Text>
          </View>

          {/* Question */}
          <Text style={styles.questionText}>{question.question}</Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <Animated.View 
                key={index}
                entering={FadeInRight.delay(index * 100)}
              >
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => handleAnswer(option)}
                >
                  <View style={styles.optionContent}>
                    <Text style={styles.optionText}>{option}</Text>
                    <View style={styles.optionArrow}>
                      <Text style={styles.optionArrowText}>→</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* Question Info */}
          <View style={styles.questionInfo}>
            <Text style={styles.questionInfoText}>
              Choose the answer that best represents your feelings or preferences
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Status */}
      <View style={styles.bottomStatus}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E']}
          style={styles.statusGradient}
        >
          <Users size={20} color="white" />
          <Text style={styles.statusText}>
            Both of you are taking the quiz together
          </Text>
        </LinearGradient>
      </View>
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
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timerText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginLeft: 4,
  },
  progressSection: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 3,
  },
  partnerProgress: {
    backgroundColor: '#10B981',
  },
  progressText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
  questionContainer: {
    padding: 24,
  },
  categoryBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    lineHeight: 32,
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    flex: 1,
    lineHeight: 24,
  },
  optionArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionArrowText: {
    fontSize: 16,
    color: '#6B7280',
  },
  questionInfo: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  questionInfoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
  },
  bottomStatus: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  statusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 8,
  },
});