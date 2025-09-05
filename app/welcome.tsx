import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Users, Shield } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Hero Section */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.heroSection}>
          <Heart size={60} color="#FF6B6B" fill="#FF6B6B" />
          <Text style={styles.title}>Welcome to Suitable</Text>
          <Text style={styles.subtitle}>
            Nigeria's most trusted dating platform where meaningful connections begin
          </Text>
        </Animated.View>

        {/* Features */}
        <Animated.View entering={FadeInUp.delay(600)} style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Users size={24} color="#FF6B6B" />
            <Text style={styles.featureText}>Smart matching based on compatibility</Text>
          </View>
          <View style={styles.feature}>
            <Shield size={24} color="#FF6B6B" />
            <Text style={styles.featureText}>Safe, secure, and privacy-focused</Text>
          </View>
          <View style={styles.feature}>
            <Heart size={24} color="#FF6B6B" />
            <Text style={styles.featureText}>Verified profiles for authentic connections</Text>
          </View>
        </Animated.View>

        {/* Illustration */}
        <Animated.View entering={FadeInUp.delay(900)} style={styles.illustrationContainer}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/5790655/pexels-photo-5790655.jpeg' }}
            style={styles.illustration}
            resizeMode="cover"
          />
        </Animated.View>
      </View>

      {/* Action Buttons */}
      <Animated.View entering={FadeInDown.delay(1200)} style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.push('/auth/signup')}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.secondaryButtonText}>I already have an account</Text>
        </TouchableOpacity>
      </Animated.View>
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
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: width * 0.8,
    height: 200,
    borderRadius: 16,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
});