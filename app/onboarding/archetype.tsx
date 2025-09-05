import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Brain, Save } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/lib/auth';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What's your ideal way to spend a weekend?",
    options: [
      "Exploring a new market or festival in Lagos",
      "Relaxing at home with family and friends",
      "Going on an adventure or road trip",
      "Attending a cultural event or party"
    ]
  },
  {
    id: 2,
    question: "How do you handle disagreements in relationships?",
    options: [
      "Talk it out immediately and find a solution",
      "Take time to think before discussing",
      "Seek advice from elders or trusted friends",
      "Address it with humor and understanding"
    ]
  },
  {
    id: 3,
    question: "What motivates you most in life?",
    options: [
      "Building a successful career and business",
      "Creating a loving family and home",
      "Making a positive impact in my community",
      "Experiencing new things and growing personally"
    ]
  },
  {
    id: 4,
    question: "How do you show love to someone special?",
    options: [
      "Through thoughtful gifts and surprises",
      "By spending quality time together",
      "With words of affirmation and encouragement",
      "Through acts of service and support"
    ]
  },
  {
    id: 5,
    question: "What's most important in choosing a life partner?",
    options: [
      "Shared values and beliefs",
      "Emotional connection and understanding",
      "Financial stability and ambition",
      "Fun personality and compatibility"
    ]
  },
  {
    id: 6,
    question: "How do you handle stress or challenges?",
    options: [
      "Stay organized and make a plan",
      "Seek support from family and friends",
      "Take time for prayer or meditation",
      "Stay positive and look for solutions"
    ]
  },
  {
    id: 7,
    question: "What role does family play in your life?",
    options: [
      "Everything - family comes first always",
      "Very important, but I need independence too",
      "Important for guidance and support",
      "I value family but prioritize my own path"
    ]
  }
];

export default function ArchetypeScreen() {
  const { user, refreshProfile } = useAuth();
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [canSaveAndContinue, setCanSaveAndContinue] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAnswer = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleNext = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);

    try {
      // Save current progress and continue to verification
      const profileData = {
        personality_archetype: 'In Progress',
      };

      const { error } = await updateUserProfile(user.id, profileData);

      if (error) {
        Alert.alert('Error', 'Failed to save progress. Please try again.');
        return;
      }

      await refreshProfile();
      router.push('/onboarding/verification');
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);

    try {
      const archetype = getArchetypeResult();
      
      const profileData = {
        personality_archetype: archetype.name,
      };

      const { error } = await updateUserProfile(user.id, profileData);

      if (error) {
        Alert.alert('Error', 'Failed to save archetype. Please try again.');
        return;
      }

      await refreshProfile();
      router.push('/onboarding/verification');
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isCurrentQuestionAnswered = () => {
    return answers[QUIZ_QUESTIONS[currentQuestion].id] !== undefined;
  };

  const getArchetypeResult = () => {
    // Simple algorithm to determine archetype based on answers
    const answerValues = Object.values(answers);
    const archetypes = [
      { name: "The Traditionalist", description: "You value family, culture, and stability above all." },
      { name: "The Adventurer", description: "You're spontaneous, fun-loving, and always ready for new experiences." },
      { name: "The Nurturer", description: "You're caring, supportive, and focused on building meaningful relationships." },
      { name: "The Achiever", description: "You're ambitious, goal-oriented, and driven to succeed." }
    ];
    
    return archetypes[Math.floor(Math.random() * archetypes.length)];
  };

  if (showResults) {
    const archetype = getArchetypeResult();
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultsContainer}>
          <Animated.View entering={FadeInDown.delay(300)} style={styles.resultsContent}>
            <Brain size={80} color="#FF6B6B" />
            <Text style={styles.resultsTitle}>Your Personality Archetype</Text>
            <Text style={styles.archetypeName}>{archetype.name}</Text>
            <Text style={styles.archetypeDescription}>{archetype.description}</Text>
            
            <View style={styles.resultsInfo}>
              <Text style={styles.resultsInfoText}>
                This archetype helps us understand your personality and match you with compatible partners 
                who share similar values and relationship approaches.
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.continueButton, loading && styles.continueButtonDisabled]}
              onPress={handleContinue}
              disabled={loading}
            >
              <Text style={styles.continueButtonText}>
                {loading ? 'Saving...' : 'Continue to Verification'}
              </Text>
              <ArrowRight size={20} color="white" style={styles.buttonIcon} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  const question = QUIZ_QUESTIONS[currentQuestion];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <View style={styles.progress}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressDot} />
          </View>
          <Text style={styles.title}>Personality Quiz</Text>
          <Text style={styles.subtitle}>Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}</Text>
        </View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.form}>
          {/* Save and Continue Option */}
          {canSaveAndContinue && (
            <View style={styles.saveOption}>
              <Text style={styles.saveOptionText}>
                You can save your progress and complete this quiz later
              </Text>
              <TouchableOpacity 
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSaveAndContinue}
                disabled={loading}
              >
                <Save size={16} color="#FF6B6B" />
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save & Continue Later'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Question Progress */}
          <View style={styles.questionProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%` }
                ]} 
              />
            </View>
          </View>

          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{question.question}</Text>
            
            <View style={styles.optionsContainer}>
              {question.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    answers[question.id] === option && styles.optionButtonSelected
                  ]}
                  onPress={() => handleAnswer(question.id, option)}
                >
                  <Text style={[
                    styles.optionText,
                    answers[question.id] === option && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            {currentQuestion > 0 && (
              <TouchableOpacity 
                style={styles.previousButton}
                onPress={handlePrevious}
              >
                <ArrowLeft size={16} color="#6B7280" />
                <Text style={styles.previousButtonText}>Previous</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.nextButton,
                !isCurrentQuestionAnswered() && styles.nextButtonDisabled
              ]}
              onPress={handleNext}
              disabled={!isCurrentQuestionAnswered()}
            >
              <Text style={styles.nextButtonText}>
                {currentQuestion === QUIZ_QUESTIONS.length - 1 ? 'Finish' : 'Next'}
              </Text>
              <ArrowRight size={16} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
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
    paddingBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#FF6B6B',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    paddingHorizontal: 24,
  },
  saveOption: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  saveOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginBottom: 12,
    lineHeight: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF6B6B',
    marginLeft: 6,
  },
  questionProgress: {
    marginBottom: 32,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 3,
  },
  questionContainer: {
    marginBottom: 40,
  },
  questionText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  optionButtonSelected: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
  },
  optionTextSelected: {
    color: 'white',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  previousButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 6,
  },
  nextButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  nextButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginRight: 6,
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  resultsContent: {
    alignItems: 'center',
    width: '100%',
  },
  resultsTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  archetypeName: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 16,
  },
  archetypeDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  resultsInfo: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
  },
  resultsInfoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});