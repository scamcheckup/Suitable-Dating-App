import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/lib/auth';

const PERSONALITY_TYPES = ['Introvert', 'Ambivert', 'Extrovert'];
const RELATIONSHIP_INTENTIONS = ['Serious Relationship', 'Marriage', 'Friendship', 'Casual Dating', 'Open to Anything'];
const RELIGIONS = ['Christianity', 'Islam', 'Traditional', 'Hindu', 'Not Religious', 'Other', 'Prefer not to say'];
const TRIBES = [
  'Yoruba', 'Igbo', 'Hausa', 'Fulani', 'Kanuri', 'Ibibio', 'Tiv', 'Ijaw', 'Edo', 'Nupe',
  'Urhobo', 'Igala', 'Idoma', 'Efik', 'Jukun', 'Gbagyi', 'Esan', 'Isoko', 'Itsekiri', 'Prefer not to say', 'Other'
];
const EDUCATION_LEVELS = ['Secondary', 'Diploma', 'Bachelor\'s', 'Master\'s', 'PhD', 'Other'];
const YES_NO_SOMETIMES = ['Yes', 'No', 'Sometimes'];
const CHILDREN_OPTIONS = ['Has children', 'Wants children', 'No children'];

export default function LifestyleScreen() {
  const { user, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    personality: '',
    relationshipIntention: '',
    religion: '',
    tribe: '',
    education: '',
    smoking: '',
    drinking: '',
    children: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['personality', 'relationshipIntention', 'religion', 'tribe', 'education', 'smoking', 'drinking', 'children'];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);

    try {
      // Update user profile in database
      const profileData = {
        personality_type: formData.personality,
        relationship_intention: formData.relationshipIntention,
        religion: formData.religion,
        tribe: formData.tribe,
        education_level: formData.education,
        smoking: formData.smoking,
        drinking: formData.drinking,
        children: formData.children,
      };

      const { error } = await updateUserProfile(user.id, profileData);

      if (error) {
        Alert.alert('Error', 'Failed to save profile data. Please try again.');
        return;
      }

      // Refresh profile context
      await refreshProfile();

      router.push('/onboarding/appearance');
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSelector = (title, options, selectedValue, onSelect, errorKey) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>{title}</Text>
      <View style={styles.optionsGrid}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              selectedValue === option && styles.optionButtonSelected
            ]}
            onPress={() => onSelect(option)}
          >
            <Text style={[
              styles.optionText,
              selectedValue === option && styles.optionTextSelected
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors[errorKey] && <Text style={styles.errorText}>{errors[errorKey]}</Text>}
    </View>
  );

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
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
          </View>
          <Text style={styles.title}>Lifestyle & Preferences</Text>
          <Text style={styles.subtitle}>Help us understand your preferences</Text>
        </View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.form}>
          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Info size={16} color="#FF6B6B" />
            <Text style={styles.disclaimerText}>
              This information is used only for compatibility matching and will not be displayed on your profile.
            </Text>
          </View>

          {/* Personality */}
          {renderSelector(
            'Personality Type',
            PERSONALITY_TYPES,
            formData.personality,
            (value) => setFormData({...formData, personality: value}),
            'personality'
          )}

          {/* Relationship Intention */}
          {renderSelector(
            'Relationship Intention',
            RELATIONSHIP_INTENTIONS,
            formData.relationshipIntention,
            (value) => setFormData({...formData, relationshipIntention: value}),
            'relationshipIntention'
          )}

          {/* Religion */}
          {renderSelector(
            'Religion',
            RELIGIONS,
            formData.religion,
            (value) => setFormData({...formData, religion: value}),
            'religion'
          )}

          {/* Tribe */}
          {renderSelector(
            'Tribe/Cultural Identity',
            TRIBES,
            formData.tribe,
            (value) => setFormData({...formData, tribe: value}),
            'tribe'
          )}

          {/* Education */}
          {renderSelector(
            'Education Level',
            EDUCATION_LEVELS,
            formData.education,
            (value) => setFormData({...formData, education: value}),
            'education'
          )}

          {/* Smoking */}
          {renderSelector(
            'Smoking',
            YES_NO_SOMETIMES,
            formData.smoking,
            (value) => setFormData({...formData, smoking: value}),
            'smoking'
          )}

          {/* Drinking */}
          {renderSelector(
            'Drinking',
            ['Yes', 'No', 'Socially'],
            formData.drinking,
            (value) => setFormData({...formData, drinking: value}),
            'drinking'
          )}

          {/* Children */}
          {renderSelector(
            'Children',
            CHILDREN_OPTIONS,
            formData.children,
            (value) => setFormData({...formData, children: value}),
            'children'
          )}

          {/* Continue Button */}
          <TouchableOpacity 
            style={[styles.continueButton, loading && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={styles.continueButtonText}>
              {loading ? 'Saving...' : 'Continue'}
            </Text>
            <ArrowRight size={20} color="white" style={styles.buttonIcon} />
          </TouchableOpacity>
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
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  selectorContainer: {
    marginBottom: 24,
  },
  selectorTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  optionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: 'white',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    marginTop: 4,
  },
  continueButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
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