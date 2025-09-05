import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, ArrowRight, Info } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    score: number;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "How quickly do they respond to your messages?",
    options: [
      { text: "Almost immediately", score: 10 },
      { text: "Within an hour or two", score: 8 },
      { text: "Usually within the same day", score: 5 },
      { text: "Often takes a day or more", score: 2 },
      { text: "Frequently leaves me on read", score: 0 }
    ]
  },
  {
    id: 2,
    text: "Do they initiate conversations with you?",
    options: [
      { text: "Very often, almost daily", score: 10 },
      { text: "Regularly, a few times a week", score: 8 },
      { text: "Sometimes, but I usually reach out first", score: 5 },
      { text: "Rarely initiates contact", score: 2 },
      { text: "Never starts conversations", score: 0 }
    ]
  },
  {
    id: 3,
    text: "How often do they compliment you or show interest in your life?",
    options: [
      { text: "Frequently and genuinely", score: 10 },
      { text: "Regularly, seems to notice things about me", score: 8 },
      { text: "Occasionally, when something stands out", score: 5 },
      { text: "Rarely gives compliments", score: 2 },
      { text: "Never compliments or shows interest", score: 0 }
    ]
  },
  {
    id: 4,
    text: "Do they ask personal or deep questions about your life?",
    options: [
      { text: "Yes, they're genuinely curious about me", score: 10 },
      { text: "Often asks thoughtful questions", score: 8 },
      { text: "Sometimes, but mostly surface-level", score: 5 },
      { text: "Rarely asks about my personal life", score: 2 },
      { text: "Never asks personal questions", score: 0 }
    ]
  },
  {
    id: 5,
    text: "How often do they want to meet in person or video call?",
    options: [
      { text: "Frequently suggests meeting up", score: 10 },
      { text: "Regularly makes plans to see me", score: 8 },
      { text: "Sometimes, but I usually initiate", score: 5 },
      { text: "Rarely wants to meet up", score: 2 },
      { text: "Always avoids meeting in person", score: 0 }
    ]
  },
  {
    id: 6,
    text: "Do they remember small details you've shared about yourself?",
    options: [
      { text: "Remembers everything, even small details", score: 10 },
      { text: "Remembers important things I've shared", score: 8 },
      { text: "Remembers some things, forgets others", score: 5 },
      { text: "Rarely remembers what I've told them", score: 2 },
      { text: "Never seems to remember anything about me", score: 0 }
    ]
  },
  {
    id: 7,
    text: "Do they make future plans that include you?",
    options: [
      { text: "Often talks about long-term future together", score: 10 },
      { text: "Makes plans weeks or months ahead", score: 8 },
      { text: "Sometimes makes near-future plans", score: 5 },
      { text: "Rarely plans ahead with me", score: 2 },
      { text: "Never discusses future plans", score: 0 }
    ]
  },
  {
    id: 8,
    text: "Have they introduced you to their friends or talked about you to others?",
    options: [
      { text: "Introduced me to friends and family", score: 10 },
      { text: "Has introduced me to some friends", score: 8 },
      { text: "Mentioned meeting friends someday", score: 5 },
      { text: "Keeps our relationship private", score: 2 },
      { text: "Actively avoids being seen with me", score: 0 }
    ]
  },
  {
    id: 9,
    text: "Do they show signs of jealousy or concern when you talk about others?",
    options: [
      { text: "Clearly jealous when I mention others", score: 10 },
      { text: "Shows subtle signs of jealousy", score: 8 },
      { text: "Sometimes seems curious about others in my life", score: 5 },
      { text: "Rarely shows any reaction", score: 2 },
      { text: "Completely indifferent to who else I spend time with", score: 0 }
    ]
  },
  {
    id: 10,
    text: "Have they clearly communicated their feelings or intentions?",
    options: [
      { text: "Has openly expressed strong feelings for me", score: 10 },
      { text: "Has hinted at deeper feelings", score: 8 },
      { text: "Gives mixed signals about their feelings", score: 5 },
      { text: "Avoids discussing feelings", score: 2 },
      { text: "Has stated they're not interested romantically", score: 0 }
    ]
  }
];

export default function LoveMeterQuizScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleAnswer = (score: number) => {
    setAnswers({
      ...answers,
      [QUESTIONS[currentQuestion].id]: score
    });
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate total score
      const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
      // Navigate to results
      router.push({
        pathname: '/love-meter/results',
        params: { score: totalScore }
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const isAnswered = QUESTIONS[currentQuestion].id in answers;
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

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
          <Text style={styles.title}>Love Meter Quiz</Text>
          <Text style={styles.subtitle}>Question {currentQuestion + 1} of {QUESTIONS.length}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progress}%` }
            ]} 
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(300)} style={styles.questionContainer}>
          {/* Question */}
          <Text style={styles.questionText}>{QUESTIONS[currentQuestion].text}</Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {QUESTIONS[currentQuestion].options.map((option, index) => (
              <Animated.View 
                key={index}
                entering={FadeInRight.delay(index * 100)}
              >
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    answers[QUESTIONS[currentQuestion].id] === option.score && styles.optionButtonSelected
                  ]}
                  onPress={() => handleAnswer(option.score)}
                >
                  <Text style={[
                    styles.optionText,
                    answers[QUESTIONS[currentQuestion].id] === option.score && styles.optionTextSelected
                  ]}>
                    {option.text}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* Tip */}
          <View style={styles.tipContainer}>
            <Info size={16} color="#0EA5E9" />
            <Text style={styles.tipText}>
              Be honest in your answers for the most accurate results. Think about their consistent behavior, not just one-time actions.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {currentQuestion > 0 ? (
          <TouchableOpacity 
            style={styles.prevButton}
            onPress={handlePrevious}
          >
            <ArrowLeft size={20} color="#6B7280" />
            <Text style={styles.prevButtonText}>Previous</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.buttonSpacer} />
        )}
        
        <TouchableOpacity 
          style={[
            styles.nextButton,
            !isAnswered && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!isAnswered}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestion === QUESTIONS.length - 1 ? 'See Results' : 'Next'}
          </Text>
          <ArrowRight size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  questionContainer: {
    flex: 1,
  },
  questionText: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 24,
    lineHeight: 30,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionButtonSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FF6B6B',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  optionTextSelected: {
    color: '#FF6B6B',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  prevButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 8,
  },
  buttonSpacer: {
    width: 100,
  },
  nextButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  nextButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginRight: 8,
  },
});