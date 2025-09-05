import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Camera, CircleCheck as CheckCircle } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const { width, height } = Dimensions.get('window');

export default function VerificationScreen() {
  const { user, refreshProfile } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [verificationPhoto, setVerificationPhoto] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      // For web, simulate photo capture with file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (file) {
          await uploadVerificationPhoto(file);
        }
      };
      input.click();
      return;
    }

    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) return;
    }
    setShowCamera(true);
  };

  const uploadVerificationPhoto = async (file) => {
    if (!user) return;

    setLoading(true);
    try {
      // Upload to Supabase storage
      const fileName = `verification_${user.id}_${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from('verification-photos')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('verification-photos')
        .getPublicUrl(fileName);

      // Update user profile
      const { error: updateError } = await updateUserProfile(user.id, {
        verification_photo_url: publicUrl,
        verification_status: 'pending'
      });

      if (updateError) throw updateError;

      setVerificationPhoto(publicUrl);
      setIsVerified(true);
      await refreshProfile();
    } catch (error) {
      Alert.alert('Error', 'Failed to upload verification photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const capturePhoto = () => {
    // Simulate photo capture for mobile
    const mockPhotoUri = 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg';
    setVerificationPhoto(mockPhotoUri);
    setShowCamera(false);
    setIsVerified(true);
  };

  const handleComplete = () => {
    router.replace('/(tabs)');
  };

  if (showCamera && Platform.OS !== 'web') {
    return (
      <SafeAreaView style={styles.cameraContainer}>
        <CameraView style={styles.camera}>
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setShowCamera(false)}
              >
                <ArrowLeft size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.cameraTitle}>Verification Selfie</Text>
            </View>
            
            <View style={styles.cameraGuide}>
              <View style={styles.guideBorder} />
              <Text style={styles.guideText}>
                Position your face clearly within the frame while holding a naira note
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.captureButton}
              onPress={capturePhoto}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
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
            <View style={[styles.progressDot, styles.progressDotActive]} />
          </View>
          <Text style={styles.title}>Photo Verification</Text>
          <Text style={styles.subtitle}>Help us verify you're a real person</Text>
        </View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.verificationContent}>
          {!isVerified ? (
            <>
              {/* Sample Image */}
              <View style={styles.sampleContainer}>
                <Text style={styles.sampleTitle}>Example:</Text>
                <Image 
                  source={{ uri: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg' }}
                  style={styles.sampleImage}
                  resizeMode="cover"
                />
              </View>

              {/* Instructions */}
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>Verification Process</Text>
                <Text style={styles.instructionsText}>
                  To ensure authentic profiles and prevent catfishing, please take a selfie 
                  showing your face clearly while holding a Nigerian naira note.
                </Text>
                
                <View style={styles.requirementsList}>
                  <View style={styles.requirement}>
                    <Text style={styles.requirementBullet}>•</Text>
                    <Text style={styles.requirementText}>Show your face clearly in the photo</Text>
                  </View>
                  <View style={styles.requirement}>
                    <Text style={styles.requirementBullet}>•</Text>
                    <Text style={styles.requirementText}>Hold any denomination of naira note</Text>
                  </View>
                  <View style={styles.requirement}>
                    <Text style={styles.requirementBullet}>•</Text>
                    <Text style={styles.requirementText}>Ensure good lighting for clarity</Text>
                  </View>
                  <View style={styles.requirement}>
                    <Text style={styles.requirementBullet}>•</Text>
                    <Text style={styles.requirementText}>Make sure the naira note is visible</Text>
                  </View>
                </View>

                <View style={styles.accessNote}>
                  <Text style={styles.accessNoteText}>
                    You can access and use the app immediately after taking the photo. 
                    Verification will be completed within 24 hours to get your verification badge.
                  </Text>
                </View>
              </View>

              {/* Take Photo Button */}
              <TouchableOpacity 
                style={[styles.takePhotoButton, loading && styles.takePhotoButtonDisabled]}
                onPress={handleTakePhoto}
                disabled={loading}
              >
                <Camera size={24} color="white" />
                <Text style={styles.takePhotoButtonText}>
                  {loading ? 'Uploading...' : 'Take Verification Photo'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Success State */}
              <View style={styles.successContainer}>
                <CheckCircle size={80} color="#10B981" />
                <Text style={styles.successTitle}>Photo Submitted Successfully!</Text>
                <Text style={styles.successText}>
                  Your verification photo has been submitted. You can now access and use the app. 
                  Verification will be completed within 24 hours and you'll receive your verification badge.
                </Text>
                
                {verificationPhoto && (
                  <Image 
                    source={{ uri: verificationPhoto }}
                    style={styles.verificationPreview}
                    resizeMode="cover"
                  />
                )}
              </View>

              {/* Complete Button */}
              <TouchableOpacity 
                style={styles.completeButton}
                onPress={handleComplete}
              >
                <Text style={styles.completeButtonText}>Start Using Suitable</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
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
  verificationContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sampleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sampleTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 12,
  },
  sampleImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  instructionsContainer: {
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  requirementsList: {
    paddingLeft: 8,
    marginBottom: 16,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  requirementBullet: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FF6B6B',
    marginRight: 8,
    marginTop: 2,
  },
  requirementText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    flex: 1,
    lineHeight: 18,
  },
  accessNote: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  accessNoteText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#0F172A',
    lineHeight: 16,
  },
  takePhotoButton: {
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
  takePhotoButtonDisabled: {
    opacity: 0.7,
  },
  takePhotoButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 8,
  },
  successContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  verificationPreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  completeButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  cameraTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginLeft: 16,
  },
  cameraGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  guideBorder: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 125,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  guideText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'white',
    textAlign: 'center',
    lineHeight: 22,
  },
  captureButton: {
    alignSelf: 'center',
    marginBottom: 60,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
});