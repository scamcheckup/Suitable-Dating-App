import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, MapPin, Users, Clock, Star, Filter, Search, Bell, Plus, Heart } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

const SAMPLE_EVENTS = [
  {
    id: 1,
    title: 'Lagos Singles Mixer',
    date: '2025-01-25',
    time: '7:00 PM',
    location: 'Victoria Island, Lagos',
    attendees: 45,
    maxAttendees: 60,
    image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg',
    price: 'Free',
    category: 'Social',
    featured: true,
    interested: false,
  },
  {
    id: 2,
    title: 'Speed Dating Night',
    date: '2025-01-28',
    time: '6:30 PM',
    location: 'Ikeja, Lagos',
    attendees: 28,
    maxAttendees: 40,
    image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg',
    price: '₦5,000',
    category: 'Dating',
    featured: false,
    interested: false,
  },
  {
    id: 3,
    title: 'Abuja Professional Networking',
    date: '2025-02-02',
    time: '5:00 PM',
    location: 'Wuse 2, Abuja',
    attendees: 32,
    maxAttendees: 50,
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    price: '₦3,000',
    category: 'Professional',
    featured: false,
    interested: false,
  },
  {
    id: 4,
    title: 'Wine Tasting Evening',
    date: '2025-02-05',
    time: '6:00 PM',
    location: 'Lekki, Lagos',
    attendees: 18,
    maxAttendees: 25,
    image: 'https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg',
    price: '₦8,000',
    category: 'Social',
    featured: false,
    interested: false,
  },
];

const EVENT_CATEGORIES = ['All', 'Social', 'Dating', 'Professional', 'Cultural'];

export default function EventsScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [events, setEvents] = useState(SAMPLE_EVENTS);
  const [showNotifications, setShowNotifications] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleJoinEvent = (eventId: number) => {
    Alert.alert(
      'Join Event',
      'This feature will be available when events launch. You\'ll be notified!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Notify Me', onPress: () => handleNotifyMe(eventId) }
      ]
    );
  };

  const handleNotifyMe = (eventId: number) => {
    Alert.alert('Success', 'You\'ll be notified when this event becomes available!');
  };

  const handleInterestToggle = (eventId: number) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? { ...event, interested: !event.interested }
          : event
      )
    );
  };

  const handleCreateEvent = () => {
    Alert.alert(
      'Create Event',
      'Event creation will be available soon! Premium users will be able to create their own events.',
      [
        { text: 'OK' },
        { text: 'Upgrade to Premium', onPress: () => router.push('/(tabs)/profile') }
      ]
    );
  };

  const handleSearch = () => {
    Alert.alert('Search Events', 'Search functionality coming soon!');
  };

  const handleFilter = () => {
    Alert.alert('Filter Events', 'Advanced filtering options coming soon!');
  };

  const handleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      Alert.alert('Notifications', 'You\'ll receive updates about new events in your area!');
    }
  };

  // Bottom menu handlers
  const handleFindMatches = () => {
    router.push('/(tabs)/matches');
  };

  const handleVibeVote = () => {
    router.push('/vibe-vote');
  };

  const handleCommunity = () => {
    router.push('/(tabs)/chats');
  };

  const filteredEvents = selectedCategory === 'All' 
    ? events 
    : events.filter(event => event.category === selectedCategory);

  const renderEventCard = (event, index) => (
    <Animated.View 
      key={event.id}
      entering={FadeInDown.delay(index * 200)}
      style={[styles.eventCard, event.featured && styles.featuredCard]}
    >
      {event.featured && (
        <View style={styles.featuredBadge}>
          <Star size={12} color="#F59E0B" fill="#F59E0B" />
          <Text style={styles.featuredText}>Featured</Text>
        </View>
      )}
      
      <Image source={{ uri: event.image }} style={styles.eventImage} />
      
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <TouchableOpacity 
            style={styles.interestButton}
            onPress={() => handleInterestToggle(event.id)}
          >
            <Heart 
              size={20} 
              color={event.interested ? "#FF6B6B" : "#9CA3AF"} 
              fill={event.interested ? "#FF6B6B" : "none"}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.categoryContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
        </View>
        
        <View style={styles.eventDetails}>
          <View style={styles.eventDetail}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.eventDetailText}>
              {formatDate(event.date)} at {event.time}
            </Text>
          </View>
          
          <View style={styles.eventDetail}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.eventDetailText}>{event.location}</Text>
          </View>
          
          <View style={styles.eventDetail}>
            <Users size={16} color="#6B7280" />
            <Text style={styles.eventDetailText}>
              {event.attendees}/{event.maxAttendees} attending
            </Text>
          </View>
        </View>
        
        <View style={styles.eventFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price:</Text>
            <Text style={[
              styles.price,
              event.price === 'Free' && styles.freePrice
            ]}>
              {event.price}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => handleJoinEvent(event.id)}
          >
            <Text style={styles.joinButtonText}>Join Event</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Events</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.headerButton, showNotifications && styles.headerButtonActive]}
              onPress={handleNotifications}
            >
              <Bell size={20} color={showNotifications ? "#FF6B6B" : "#6B7280"} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleSearch}>
              <Search size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleFilter}>
              <Filter size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.subtitle}>Meet people in real life</Text>
      </View>

      {/* Category Filter */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.categoryFilter}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {EVENT_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      <ScrollView 
        style={styles.eventsList}
        showsVerticalScrollIndicator={false}
      >
        {/* Coming Soon Notice */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.comingSoonNotice}>
          <Clock size={20} color="#F59E0B" />
          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>Events Coming Soon!</Text>
            <Text style={styles.noticeText}>
              We're working on bringing you amazing in-person events to meet other singles in your area.
            </Text>
          </View>
        </Animated.View>

        {/* Sample Events */}
        <View style={styles.sampleSection}>
          <Text style={styles.sectionTitle}>Preview: Upcoming Events</Text>
          <Text style={styles.sectionSubtitle}>
            Here's what you can expect when events launch
          </Text>
          
          {filteredEvents.map(renderEventCard)}
        </View>

        {/* Event Types */}
        <Animated.View entering={FadeInDown.delay(800)} style={styles.eventTypesSection}>
          <Text style={styles.sectionTitle}>Event Types</Text>
          
          <View style={styles.eventTypesGrid}>
            <TouchableOpacity style={styles.eventType} onPress={() => setSelectedCategory('Social')}>
              <View style={[styles.eventTypeIcon, { backgroundColor: '#FF6B6B' }]}>
                <Users size={24} color="white" />
              </View>
              <Text style={styles.eventTypeName}>Social Mixers</Text>
              <Text style={styles.eventTypeDescription}>
                Casual meetups to connect with other singles
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.eventType} onPress={() => setSelectedCategory('Dating')}>
              <View style={[styles.eventTypeIcon, { backgroundColor: '#8B5CF6' }]}>
                <Heart size={24} color="white" />
              </View>
              <Text style={styles.eventTypeName}>Speed Dating</Text>
              <Text style={styles.eventTypeDescription}>
                Quick conversations to find instant connections
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.eventType} onPress={() => setSelectedCategory('Professional')}>
              <View style={[styles.eventTypeIcon, { backgroundColor: '#10B981' }]}>
                <Star size={24} color="white" />
              </View>
              <Text style={styles.eventTypeName}>Professional Events</Text>
              <Text style={styles.eventTypeDescription}>
                Network with like-minded professionals
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Notification Signup */}
        <Animated.View entering={FadeInDown.delay(1000)} style={styles.notificationSection}>
          <Text style={styles.notificationTitle}>Be the first to know</Text>
          <Text style={styles.notificationText}>
            Get notified when events launch in your city
          </Text>
          
          <TouchableOpacity 
            style={styles.notifyButton}
            onPress={() => handleNotifyMe(0)}
          >
            <Bell size={16} color="white" />
            <Text style={styles.notifyButtonText}>Notify Me</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Bottom Menu */}
      <Animated.View entering={FadeInDown.delay(1200)} style={styles.bottomMenu}>
        <TouchableOpacity 
          style={styles.bottomMenuItem}
          onPress={handleFindMatches}
        >
          <Heart size={20} color="#6B7280" />
          <Text style={styles.bottomMenuText}>Find Matches</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bottomMenuItem}
          onPress={handleCreateEvent}
        >
          <Plus size={20} color="#6B7280" />
          <Text style={styles.bottomMenuText}>Create Event</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bottomMenuItem}
          onPress={handleVibeVote}
        >
          <Star size={20} color="#6B7280" />
          <Text style={styles.bottomMenuText}>Vibe Vote</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bottomMenuItem}
          onPress={handleCommunity}
        >
          <Users size={20} color="#6B7280" />
          <Text style={styles.bottomMenuText}>Community</Text>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonActive: {
    backgroundColor: '#FEF2F2',
  },
  categoryFilter: {
    paddingVertical: 16,
  },
  categoryScrollContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  eventsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  comingSoonNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  noticeContent: {
    flex: 1,
    marginLeft: 12,
  },
  noticeTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  sampleSection: {
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
    marginBottom: 20,
  },
  eventCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  featuredCard: {
    borderColor: '#F59E0B',
    borderWidth: 2,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  featuredText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginLeft: 4,
  },
  eventImage: {
    width: '100%',
    height: 160,
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  interestButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContainer: {
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
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
    color: '#6B7280',
    marginLeft: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginRight: 4,
  },
  price: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  freePrice: {
    color: '#10B981',
  },
  joinButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  joinButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  eventTypesSection: {
    marginBottom: 32,
  },
  eventTypesGrid: {
    gap: 16,
  },
  eventType: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  eventTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTypeName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  eventTypeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  notificationSection: {
    backgroundColor: '#1F2937',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 100, // Space for bottom menu
  },
  notificationTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  notificationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  notifyButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notifyButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 6,
  },
  bottomMenu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomMenuItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  bottomMenuText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 4,
  },
});