import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import { Heart } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const heartScale = useSharedValue(1);
  const logoOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);

  const navigateToWelcome = () => {
    router.replace('/welcome');
  };

  useEffect(() => {
    // Heart animation
    heartScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );

    // Logo fade in
    logoOpacity.value = withTiming(1, { duration: 1500 });
    
    // Tagline fade in after logo
    setTimeout(() => {
      taglineOpacity.value = withTiming(1, { duration: 1000 });
    }, 1000);

    // Navigate after 3 seconds
    setTimeout(() => {
      runOnJS(navigateToWelcome)();
    }, 3000);
  }, []);

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  return (
    <LinearGradient
      colors={['#FF6B6B', '#FF8E8E', '#FFB6B6']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Animated.View style={heartAnimatedStyle}>
            <Heart size={80} color="white" fill="white" />
          </Animated.View>
          <Text style={styles.brandName}>Suitable</Text>
        </Animated.View>
        
        <Animated.Text style={[styles.tagline, taglineAnimatedStyle]}>
          Where perfect matches are made
        </Animated.Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandName: {
    fontSize: 42,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: 16,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
});