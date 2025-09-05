import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { X, Save } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

const AGE_RANGES = ['18-25', '26-30', '31-35', '36-40', '41-45', '46+'];
const DISTANCES = ['5km', '10km', '25km', '50km', '100km', 'Any distance'];
const EDUCATION_LEVELS = ['Secondary', 'Diploma', 'Bachelor\'s', 'Master\'s', 'PhD'];
const RELIGIONS = ['Christianity', 'Islam', 'Traditional', 'Hindu', 'Not Religious', 'Other'];

export default function FilterModal({ visible, onClose, onApply }: FilterModalProps) {
  const [filters, setFilters] = useState({
    ageRange: '',
    distance: '',
    education: '',
    religion: '',
    hasChildren: '',
    smoking: '',
    drinking: '',
  });

  const handleSave = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      ageRange: '',
      distance: '',
      education: '',
      religion: '',
      hasChildren: '',
      smoking: '',
      drinking: '',
    });
  };

  const renderFilterSection = (title: string, options: string[], selectedValue: string, onSelect: (value: string) => void, isPremium: boolean = false) => (
    <View style={styles.filterSection}>
      <View style={styles.filterHeader}>
        <Text style={styles.filterTitle}>{title}</Text>
        {isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        )}
      </View>
      <View style={styles.optionsGrid}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              selectedValue === option && styles.optionButtonSelected,
              isPremium && styles.optionButtonPremium
            ]}
            onPress={() => onSelect(selectedValue === option ? '' : option)}
            disabled={isPremium}
          >
            <Text style={[
              styles.optionText,
              selectedValue === option && styles.optionTextSelected,
              isPremium && styles.optionTextPremium
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>Match Settings</Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(200)}>
            {/* Age Range - Free */}
            {renderFilterSection(
              'Age Range',
              AGE_RANGES,
              filters.ageRange,
              (value) => setFilters({ ...filters, ageRange: value }),
              false
            )}

            {/* Distance - Premium */}
            {renderFilterSection(
              'Distance',
              DISTANCES,
              filters.distance,
              (value) => setFilters({ ...filters, distance: value }),
              true
            )}

            {/* Education - Premium */}
            {renderFilterSection(
              'Education Level',
              EDUCATION_LEVELS,
              filters.education,
              (value) => setFilters({ ...filters, education: value }),
              true
            )}

            {/* Religion - Premium */}
            {renderFilterSection(
              'Religion',
              RELIGIONS,
              filters.religion,
              (value) => setFilters({ ...filters, religion: value }),
              true
            )}

            {/* Children - Premium */}
            {renderFilterSection(
              'Children',
              ['Has children', 'Wants children', 'No children'],
              filters.hasChildren,
              (value) => setFilters({ ...filters, hasChildren: value }),
              true
            )}

            {/* Smoking - Premium */}
            {renderFilterSection(
              'Smoking',
              ['Yes', 'No', 'Sometimes'],
              filters.smoking,
              (value) => setFilters({ ...filters, smoking: value }),
              true
            )}

            {/* Drinking - Premium */}
            {renderFilterSection(
              'Drinking',
              ['Yes', 'No', 'Socially'],
              filters.drinking,
              (value) => setFilters({ ...filters, drinking: value }),
              true
            )}

            {/* Premium Notice */}
            <View style={styles.premiumNotice}>
              <Text style={styles.premiumNoticeTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumNoticeText}>
                Get access to advanced filters and find more compatible matches based on your specific preferences.
              </Text>
              <TouchableOpacity style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save size={20} color="white" />
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resetText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FF6B6B',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  premiumBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  premiumText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    margin: 4,
  },
  optionButtonSelected: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  optionButtonPremium: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    opacity: 0.6,
  },
  optionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  optionTextSelected: {
    color: 'white',
  },
  optionTextPremium: {
    color: '#9CA3AF',
  },
  premiumNotice: {
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  premiumNoticeTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  premiumNoticeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 8,
  },
});