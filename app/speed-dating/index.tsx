import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Zap, Users, Clock, Calendar, MapPin, Crown, Heart, Star, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

interface SpeedDatingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  price: number;
  registeredMales: number;
  registeredFemales: number;
  maxParticipants: number;
  status: 'upcoming' | 'registration_open' | 'full' | 'live' | 'completed';
  description: string;
  image: string;
}

const SAMPLE_EVENTS: SpeedDatingEvent[] = [
  {
    id: '1',
    title: 'Lagos Virtual Speed Dating',
    date: '2025-01-20',
    time: '7:00 PM',
    duration: '2 hours',
    price: 5000,
    registeredMales: 8,
    registeredFemales: 7,
    maxParticipants: 10,
    status: 'registration_open',
    description: 'Meet 10 amazing singles in one evening! Each conversation lasts 5 minutes.',
    image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg'
  },
  {
    id: '2',
    title: 'Abuja Professional Mixer',
    date: '2025-01-25',
    time: '6:30 PM',
    duration: '2.5 hours',
    price: 7500,
    registeredMales: 10,
    registeredFemales: 9,
    maxParticipants: 10,
    status: 'full',
    description: 'Connect with career-focused singles in the capital city.',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
  },
  {
    id: '3',
    title: 'Weekend Love Connection',
    date: '2025-02-01',
    time: '8:00 PM',
    duration: '2 hours',
    price: 4500,
    registeredMales: 3,
    registeredFemales: 5,
    maxParticipants: 10,
    status: 'upcoming',
    description: 'Casual weekend speed dating for genuine connections.',
    image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg'
  }
];

export default function SpeedDatingScreen() {
  const { user, userProfile } = useAuth();
  const [events, setEvents] = useState<SpeedDatingEvent[]>(SAMPLE_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<SpeedDatingEvent | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registration_open': return '#10B981';
      case 'full': return '#F59E0B';
      case 'live': return '#EF4444';
      case 'completed': return '#6B7280';
      default: return '#3B82F6';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'registration_open': return 'Registration Open';
      case 'full': return 'Event Full';
      case 'live': return 'Live Now';
      case 'completed': return 'Completed';
      default: return 'Coming Soon';
    }
  };

  const handleRegister = (event: SpeedDatingEvent) => {
    if (!userProfile) {
      router.push('/auth/login');
      return;
    }
    router.push(`/speed-dating/register?eventId=${event.id}`);
  };

  const renderEventCard = (event: SpeedDatingEvent, index: number) => (
    <Animated.View 
      key={event.id}
      entering={FadeInDown.delay(index * 200)}
      style={styles.eventCard}
    >
      <Image source={{ uri: event.image }} style={styles.eventImage} />
      
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
        <Text style={styles.statusText}>{getStatusText(event.status)}</Text>
      </View>

      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDescription}>{event.description}</Text>
        
        <View style={styles.eventDetails}>
          <View style={styles.eventDetail}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.eventDetailText}>{formatDate(event.date)}</Text>
          </View>
          
          <View style={styles.eventDetail}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.eventDetailText}>{event.time} • {event.duration}</Text>
          </View>
          
          <View style={styles.eventDetail}>
            <Users size={16} color="#6B7280" />
            <Text style={styles.eventDetailText}>
              {event.registeredMales + event.registeredFemales}/{event.maxParticipants * 2} registered
            </Text>
          </View>
        </View>

        {/* Participants Progress */}
        <View style={styles.participantsSection}>
          <Text style={styles.participantsTitle}>Participants</Text>
          <View style={styles.participantsProgress}>
            <View style={styles.genderProgress}>
              <Text style={styles.genderLabel}>Males: {event.registeredMales}/{event.maxParticipants}</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    styles.maleProgress,
                    { width: `${(event.registeredMales / event.maxParticipants) * 100}%` }
                  ]} 
                />
              </View>
            </View>
            <View style={styles.genderProgress}>
              <Text style={styles.genderLabel}>Females: {event.registeredFemales}/{event.maxParticipants}</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    styles.femaleProgress,
                    { width: `${(event.registeredFemales / event.maxParticipants) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.eventFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Entry Fee</Text>
            <Text style={styles.price}>{formatPrice(event.price)}</Text>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.registerButton,
              event.status === 'full' && styles.registerButtonDisabled
            ]}
            onPress={() => handleRegister(event)}
            disabled={event.status === 'full'}
          >
            <Text style={styles.registerButtonText}>
              {event.status === 'full' ? 'Event Full' : 'Register Now'}
            </Text>
            {event.status !== 'full' && <ChevronRight size={16} color="white" />}
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

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
          <Text style={styles.title}>Speed Dating</Text>
          <Text style={styles.subtitle}>Find love in fast-forward</Text>
        </View>
        
        <View style={styles.headerIcon}>
          <Zap size={24} color="#FF6B6B" />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.heroSection}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E8E']}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Zap size={40} color="white" />
              <Text style={styles.heroTitle}>Virtual Speed Dating</Text>
              <Text style={styles.heroSubtitle}>
                Meet 10 amazing singles in one evening! Each conversation lasts 5 minutes.
              </Text>
              
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Heart size={20} color="white" />
                  <Text style={styles.heroStatText}>500+ Matches Made</Text>
                </View>
                <View style={styles.heroStat}>
                  <Star size={20} color="white" />
                  <Text style={styles.heroStatText}>4.8/5 Rating</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* How It Works */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: '#FF6B6B' }]}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Register & Pay</Text>
                <Text style={styles.stepDescription}>
                  Choose your event and secure your spot with payment
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: '#8B5CF6' }]}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Join the Event</Text>
                <Text style={styles.stepDescription}>
                  Enter the virtual room when the event starts
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: '#10B981' }]}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Speed Date</Text>
                <Text style={styles.stepDescription}>
                  Chat with each person for 5 minutes, then rotate
                </Text>
              </View>
            </View>
            
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: '#F59E0B' }]}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Make Connections</Text>
                <Text style={styles.stepDescription}>
                  Choose who you'd like to match with after the event
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Events List */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          {events.map(renderEventCard)}
        </View>

        {/* Premium Features */}
        <Animated.View entering={FadeInDown.delay(800)} style={styles.premiumSection}>
          <LinearGradient
            colors={['#1F2937', '#374151']}
            style={styles.premiumGradient}
          >
            <Crown size={32} color="#F59E0B" />
            <Text style={styles.premiumTitle}>Premium Speed Dating</Text>
            <Text style={styles.premiumSubtitle}>
              Get priority access to exclusive events and premium features
            </Text>
            
            <View style={styles.premiumFeatures}>
              <View style={styles.premiumFeature}>
                <Star size={16} color="#F59E0B" />
                <Text style={styles.premiumFeatureText}>Priority event access</Text>
              </View>
              <View style={styles.premiumFeature}>
                <Star size={16} color="#F59E0B" />
                <Text style={styles.premiumFeatureText}>Extended chat time</Text>
              </View>
              <View style={styles.premiumFeature}>
                <Star size={16} color="#F59E0B" />
                <Text style={styles.premiumFeatureText}>Post-event contact info</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.premiumButton}>
              <Text style={styles.premiumButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
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
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 24,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 24,
  },
  heroStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroStatText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  howItWorksSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  stepsContainer: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  stepContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  eventsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: 160,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 1,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  eventContent: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  eventDetails: {
    marginBottom: 16,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDetailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginLeft: 8,
  },
  participantsSection: {
    marginBottom: 20,
  },
  participantsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  participantsProgress: {
    gap: 8,
  },
  genderProgress: {
    flex: 1,
  },
  genderLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  maleProgress: {
    backgroundColor: '#3B82F6',
  },
  femaleProgress: {
    backgroundColor: '#EC4899',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 2,
  },
  price: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  registerButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  registerButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  registerButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  premiumSection: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
  },
  premiumGradient: {
    padding: 24,
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
  },
  premiumSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  premiumFeatures: {
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  premiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  premiumFeatureText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    marginLeft: 8,
  },
  premiumButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  premiumButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});