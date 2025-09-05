import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Heart } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/lib/auth';

const INTERESTS = [
  'Movies & Cinema', 'Music & Concerts', 'Cooking & Food', 'Football & Sports', 'Basketball', 'Nightlife & Parties',
  'Social Events', 'Traditional Culture', 'Comedy & Entertainment', 'Religious Activities', 'Spiritual Growth',
  'Cultural Festivals'
];

const PARTNER_VALUES = [
  'Honesty & Integrity', 'Loyalty & Commitment', 'Respect & Kindness', 'Compassion & Empathy', 'Ambition & Drive', 
  'Family Orientation', 'Religious Faith', 'Financial Stability', 'Good Communication', 'Sense of Humor', 
  'Physical Attraction', 'Intelligence & Wisdom'
];

export default function InterestsScreen() {
  const { user, refreshProfile } = useAuth();
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (selectedInterests.length !== 5) {
      newErrors.interests = 'Please select exactly 5 interests';
    }
    
    if (selectedValues.length !== 5) {
      newErrors.values = 'Please select exactly 5 partner values';
    }
    
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
        interests: selectedInterests,
        partner_values: selectedValues,
      };

      const { error } = await updateUserProfile(user.id, profileData);

      if (error) {
        Alert.alert('Error', 'Failed to save profile data. Please try again.');
        return;
      }

      // Refresh profile context
      await refreshProfile();

      router.push('/onboarding/archetype');
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    } else if (selectedInterests.length < 5) {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const toggleValue = (value) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter(item => item !== value));
    } else if (selectedValues.length < 5) {
      setSelectedValues([...selectedValues, value]);
    }
  };

  const renderSelectionGrid = (title, items, selectedItems, onToggle, errorKey, subtitle) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      <Text style={styles.selectionCount}>{selectedItems.length}/5 selected</Text>
      
      <View style={styles.itemsGrid}>
        {items.map((item) => {
          const isSelected = selectedItems.includes(item);
          const isDisabled = !isSelected && selectedItems.length >= 5;
          
          return (
            <TouchableOpacity
              key={item}
              style={[
                styles.itemButton,
                isSelected && styles.itemButtonSelected,
                isDisabled && styles.itemButtonDisabled
              ]}
              onPress={() => onToggle(item)}
              disabled={isDisabled}
            >
              <Text style={[
                styles.itemText,
                isSelected && styles.itemTextSelected,
                isDisabled && styles.itemTextDisabled
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
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
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
          </View>
          <Text style={styles.title}>Interests & Values</Text>
          <Text style={styles.subtitle}>Help us find your perfect match</Text>
        </View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.form}>
          {/* Important Notice */}
          <View style={styles.notice}>
            <Heart size={16} color="#FF6B6B" />
            <Text style={styles.noticeText}>
              Selecting exactly 5 items in each section is crucial for our matching algorithm to work effectively.
            </Text>
          </View>

          {/* Interests */}
          {renderSelectionGrid(
            'Your Interests',
            INTERESTS,
            selectedInterests,
            toggleInterest,
            'interests',
            'Select 5 interests that best represent you'
          )}

          {/* Partner Values */}
          {renderSelectionGrid(
            'Partner Values',
            PARTNER_VALUES,
            selectedValues,
            toggleValue,
            'values',
            'Select 5 qualities most important to you in a partner'
          )}

          {/* Continue Button */}
          <TouchableOpacity 
            style={[
              styles.continueButton,
              (selectedInterests.length !== 5 || selectedValues.length !== 5 || loading) && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={selectedInterests.length !== 5 || selectedValues.length !== 5 || loading}
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
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  noticeText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  selectionCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FF6B6B',
    marginBottom: 16,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  itemButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    margin: 4,
    alignItems: 'center',
  },
  itemButtonSelected: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  itemButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#F3F4F6',
  },
  itemText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  itemTextSelected: {
    color: 'white',
  },
  itemTextDisabled: {
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    marginTop: 8,
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
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
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