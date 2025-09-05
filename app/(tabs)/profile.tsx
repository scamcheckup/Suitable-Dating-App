import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, CreditCard as Edit, Crown, Shield, Heart, Camera, MapPin, Briefcase, GraduationCap, Star, ChevronRight, Bell, Lock, CircleHelp as HelpCircle, LogOut, Database, TestTube } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/auth';

export default function ProfileScreen() {
  const { user, userProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !userProfile) {
      refreshProfile();
    }
  }, [user]);

  const menuItems = [
    {
      id: 1,
      title: 'Edit Profile',
      subtitle: 'Update your information',
      icon: Edit,
      color: '#FF6B6B',
      action: () => handleEditProfile(),
    },
    {
      id: 2,
      title: 'Upgrade to Premium',
      subtitle: 'Unlock exclusive features',
      icon: Crown,
      color: '#F59E0B',
      highlight: true,
      action: () => handleUpgradePremium(),
    },
    {
      id: 3,
      title: 'Privacy & Safety',
      subtitle: 'Manage your privacy settings',
      icon: Shield,
      color: '#10B981',
      action: () => handlePrivacySafety(),
    },
    {
      id: 4,
      title: 'Preferences',
      subtitle: 'Dating and match preferences',
      icon: Heart,
      color: '#EC4899',
      action: () => handlePreferences(),
    },
    {
      id: 5,
      title: 'Notifications',
      subtitle: 'Manage your notifications',
      icon: Bell,
      color: '#8B5CF6',
      action: () => handleNotifications(),
    },
    {
      id: 6,
      title: 'Account Security',
      subtitle: 'Password and security settings',
      icon: Lock,
      color: '#059669',
      action: () => handleAccountSecurity(),
    },
    {
      id: 7,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: HelpCircle,
      color: '#0EA5E9',
      action: () => handleHelpSupport(),
    },
    {
      id: 8,
      title: 'Settings',
      subtitle: 'App settings and preferences',
      icon: Settings,
      color: '#6B7280',
      action: () => handleSettings(),
    },
    // Development/Admin items
    {
      id: 9,
      title: 'Environment Status',
      subtitle: 'Check system configuration',
      icon: Database,
      color: '#3B82F6',
      action: () => router.push('/admin/environment'),
      dev: true,
    },
    {
      id: 10,
      title: 'System Tests',
      subtitle: 'Run system diagnostics',
      icon: TestTube,
      color: '#10B981',
      action: () => router.push('/test-system'),
      dev: true,
    },
  ];

  const handleEditProfile = () => {
    router.push('/onboarding/basic-info');
  };

  const handleUpgradePremium = () => {
    Alert.alert(
      'Upgrade to Premium',
      'Unlock unlimited matches, advanced filters, and exclusive features.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade Now', onPress: () => console.log('Navigate to premium') }
      ]
    );
  };

  const handlePrivacySafety = () => {
    Alert.alert('Privacy & Safety', 'Manage your privacy settings and safety preferences');
  };

  const handlePreferences = () => {
    Alert.alert('Preferences', 'Update your dating and match preferences');
  };

  const handleNotifications = () => {
    Alert.alert('Notifications', 'Manage your notification settings');
  };

  const handleAccountSecurity = () => {
    Alert.alert('Account Security', 'Update your password and security settings');
  };

  const handleHelpSupport = () => {
    Alert.alert('Help & Support', 'Get help or contact our support team');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'App settings and general preferences');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await signOut();
              router.replace('/welcome');
            } catch (error) {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleAddPhoto = () => {
    Alert.alert('Add Photo', 'Select a photo from your gallery or take a new one');
  };

  const renderMenuItem = (item, index) => (
    <Animated.View 
      key={item.id}
      entering={FadeInDown.delay(600 + index * 100)}
    >
      <TouchableOpacity 
        style={[
          styles.menuItem,
          item.highlight && styles.highlightMenuItem,
          item.dev && styles.devMenuItem
        ]}
        onPress={item.action}
      >
        <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
          <item.icon size={20} color={item.color} />
        </View>
        
        <View style={styles.menuContent}>
          <Text style={[
            styles.menuTitle,
            item.highlight && styles.highlightMenuTitle,
            item.dev && styles.devMenuTitle
          ]}>
            {item.title}
          </Text>
          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
        </View>
        
        <ChevronRight size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </Animated.View>
  );

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
            <Settings size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ 
                  uri: userProfile.profile_photos?.[0] || 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg' 
                }} 
                style={styles.avatar} 
              />
              {userProfile.verification_status === 'verified' && (
                <View style={styles.verifiedBadge}>
                  <Shield size={12} color="white" />
                </View>
              )}
              <TouchableOpacity style={styles.cameraButton} onPress={handleAddPhoto}>
                <Camera size={16} color="white" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <View style={styles.nameContainer}>
                <Text style={styles.profileName}>
                  {userProfile.name}, {userProfile.age}
                </Text>
                {userProfile.is_premium && (
                  <Crown size={16} color="#F59E0B" style={styles.premiumIcon} />
                )}
              </View>
              
              <View style={styles.profileDetail}>
                <MapPin size={14} color="#6B7280" />
                <Text style={styles.profileDetailText}>
                  {userProfile.current_location || `${userProfile.lga || userProfile.state || 'Nigeria'}`}
                </Text>
              </View>
              
              <View style={styles.profileDetail}>
                <Briefcase size={14} color="#6B7280" />
                <Text style={styles.profileDetailText}>{userProfile.occupation}</Text>
              </View>
              
              {userProfile.education_level && (
                <View style={styles.profileDetail}>
                  <GraduationCap size={14} color="#6B7280" />
                  <Text style={styles.profileDetailText}>{userProfile.education_level}</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Bio */}
          {userProfile.bio && (
            <Text style={styles.bio}>{userProfile.bio}</Text>
          )}
          
          {/* Interests */}
          {userProfile.interests && userProfile.interests.length > 0 && (
            <View style={styles.interestsContainer}>
              <Text style={styles.interestsTitle}>Interests</Text>
              <View style={styles.interestsGrid}>
                {userProfile.interests.map((interest, index) => (
                  <View key={index} style={styles.interestTag}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Photos */}
          <View style={styles.photosContainer}>
            <Text style={styles.photosTitle}>Photos</Text>
            <View style={styles.photosGrid}>
              {userProfile.profile_photos?.map((photo, index) => (
                <Image key={index} source={{ uri: photo }} style={styles.photo} />
              ))}
              {(!userProfile.profile_photos || userProfile.profile_photos.length < 2) && (
                <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
                  <Camera size={20} color="#FF6B6B" />
                  <Text style={styles.addPhotoText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(450)} style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Conversations</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <View style={styles.ratingContainer}>
              <Text style={styles.statNumber}>
                {userProfile.verification_status === 'verified' ? '5.0' : '—'}
              </Text>
              {userProfile.verification_status === 'verified' && (
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
              )}
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </Animated.View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Logout Button */}
        <Animated.View entering={FadeInDown.delay(1200)} style={styles.logoutContainer}>
          <TouchableOpacity 
            style={[styles.logoutButton, loading && styles.logoutButtonDisabled]}
            onPress={handleLogout}
            disabled={loading}
          >
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutButtonText}>
              {loading ? 'Logging out...' : 'Log Out'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* App Version */}
        <Animated.View entering={FadeInDown.delay(1300)} style={styles.versionContainer}>
          <Text style={styles.versionText}>Suitable v1.0.0</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: '#F9FAFB',
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  verifiedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  premiumIcon: {
    marginLeft: 8,
  },
  profileDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileDetailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 6,
  },
  bio: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  interestsContainer: {
    marginBottom: 16,
  },
  interestsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'white',
  },
  photosContainer: {
    marginTop: 8,
  },
  photosTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  photosGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
  },
  addPhotoText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#FF6B6B',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  menuContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  highlightMenuItem: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  devMenuItem: {
    backgroundColor: '#F0F9FF',
    borderColor: '#3B82F6',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  highlightMenuTitle: {
    color: '#F59E0B',
  },
  devMenuTitle: {
    color: '#3B82F6',
  },
  menuSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  logoutContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  versionText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
});