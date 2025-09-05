import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, Camera, Plus, X } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/lib/auth';
import { uploadWithRetry } from '@/lib/r2-storage';

const HEIGHT_OPTIONS = ['Short (5\'0" - 5\'4")', 'Average (5\'5" - 5\'8")', 'Tall (5\'9" - 6\'2")', 'Very Tall (6\'3"+)'];
const BODY_TYPES = ['Slim', 'Athletic', 'Average', 'Curvy', 'Plus Size'];
const COMPLEXIONS = ['Fair', 'Light', 'Medium', 'Dark', 'Very Dark'];

export default function AppearanceScreen() {
  const { user, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    height: '',
    bodyType: '',
    complexion: '',
    bio: '',
    photos: [],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.height) {
      newErrors.height = 'Please select your height';
    }
    
    if (!formData.bodyType) {
      newErrors.bodyType = 'Please select your body type';
    }
    
    if (!formData.complexion) {
      newErrors.complexion = 'Please select your complexion';
    }
    
    if (formData.photos.length < 2) {
      newErrors.photos = 'Please upload exactly 2 photos';
    }
    
    if (formData.photos.length > 2) {
      newErrors.photos = 'Maximum 2 photos allowed';
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
        height: formData.height,
        body_type: formData.bodyType,
        complexion: formData.complexion,
        bio: formData.bio || null,
        profile_photos: formData.photos.map(photo => photo.uri),
      };

      const { error } = await updateUserProfile(user.id, profileData);

      if (error) {
        Alert.alert('Error', 'Failed to save profile data. Please try again.');
        return;
      }

      // Refresh profile context
      await refreshProfile();

      router.push('/onboarding/interests');
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhoto = async () => {
    if (formData.photos.length >= 2) {
      Alert.alert('Maximum Photos', 'You can upload exactly 2 photos');
      return;
    }

    try {
      setUploadingPhoto(true);

      // For web, create a file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (file) {
          // Validate file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            Alert.alert('File Too Large', 'Please select an image smaller than 5MB');
            setUploadingPhoto(false);
            return;
          }

          // Upload to R2 with retry logic
          const uploadResult = await uploadWithRetry(file, user.id, formData.photos.length);
          
          if (uploadResult.success && uploadResult.url) {
            const newPhoto = {
              id: Date.now().toString(),
              uri: uploadResult.url,
            };
            
            setFormData(prev => ({
              ...prev,
              photos: [...prev.photos, newPhoto],
            }));
          } else {
            Alert.alert('Upload Failed', uploadResult.error || 'Failed to upload photo');
          }
        }
        setUploadingPhoto(false);
      };
      input.click();
    } catch (error) {
      setUploadingPhoto(false);
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    }
  };

  const handleRemovePhoto = (photoId) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo.id !== photoId),
    }));
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
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
          </View>
          <Text style={styles.title}>Appearance & Bio</Text>
          <Text style={styles.subtitle}>Share more about yourself</Text>
        </View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.form}>
          {/* Photo Upload */}
          <View style={styles.photoSection}>
            <Text style={styles.selectorTitle}>Profile Photos (Required: 2)</Text>
            <Text style={styles.photoSubtitle}>Upload exactly 2 photos - one selfie and one full-body photo</Text>
            
            <View style={styles.photosGrid}>
              {formData.photos.map((photo, index) => (
                <View key={photo.id} style={styles.photoContainer}>
                  <Image source={{ uri: photo.uri }} style={styles.photo} />
                  <TouchableOpacity 
                    style={styles.removePhotoButton}
                    onPress={() => handleRemovePhoto(photo.id)}
                  >
                    <X size={16} color="white" />
                  </TouchableOpacity>
                  {index === 0 && <Text style={styles.primaryPhotoLabel}>Primary</Text>}
                </View>
              ))}
              
              {formData.photos.length < 2 && (
                <TouchableOpacity 
                  style={[styles.addPhotoButton, uploadingPhoto && styles.addPhotoButtonDisabled]}
                  onPress={handleAddPhoto}
                  disabled={uploadingPhoto}
                >
                  <Plus size={24} color="#FF6B6B" />
                  <Text style={styles.addPhotoText}>
                    {uploadingPhoto ? 'Uploading...' : 'Add Photo'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {errors.photos && <Text style={styles.errorText}>{errors.photos}</Text>}
          </View>

          {/* Height */}
          {renderSelector(
            'Height',
            HEIGHT_OPTIONS,
            formData.height,
            (value) => setFormData({...formData, height: value}),
            'height'
          )}

          {/* Body Type */}
          {renderSelector(
            'Body Type',
            BODY_TYPES,
            formData.bodyType,
            (value) => setFormData({...formData, bodyType: value}),
            'bodyType'
          )}

          {/* Complexion */}
          {renderSelector(
            'Complexion',
            COMPLEXIONS,
            formData.complexion,
            (value) => setFormData({...formData, complexion: value}),
            'complexion'
          )}

          {/* Bio */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Bio (Optional)</Text>
            <TextInput
              style={styles.bioInput}
              placeholder="Tell us something cool about you..."
              value={formData.bio}
              onChangeText={(text) => setFormData({...formData, bio: text})}
              multiline
              numberOfLines={4}
              maxLength={500}
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />
            <Text style={styles.characterCount}>{formData.bio.length}/500</Text>
          </View>

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
  photoSection: {
    marginBottom: 24,
  },
  photoSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 16,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  photoContainer: {
    position: 'relative',
    marginRight: 12,
    marginBottom: 12,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryPhotoLabel: {
    position: 'absolute',
    bottom: -16,
    left: 0,
    right: 0,
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#FF6B6B',
    textAlign: 'center',
  },
  addPhotoButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
  },
  addPhotoButtonDisabled: {
    opacity: 0.5,
  },
  addPhotoText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#FF6B6B',
    marginTop: 4,
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
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    backgroundColor: 'white',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
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