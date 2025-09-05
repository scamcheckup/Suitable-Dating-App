import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { X, Crown, Heart, Filter, Eye, Zap, Star } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export default function PremiumModal({ visible, onClose, onUpgrade }: PremiumModalProps) {
  const features = [
    {
      icon: Heart,
      title: 'Unlimited Matches',
      description: 'Get up to 50 daily matches instead of 3',
      color: '#FF6B6B',
    },
    {
      icon: Filter,
      title: 'Advanced Filters',
      description: 'Filter by education, religion, lifestyle preferences',
      color: '#8B5CF6',
    },
    {
      icon: Eye,
      title: 'See Who Liked You',
      description: 'View all users who have liked your profile',
      color: '#10B981',
    },
    {
      icon: Zap,
      title: 'Priority Matching',
      description: 'Your profile appears first in potential matches',
      color: '#F59E0B',
    },
    {
      icon: Star,
      title: 'Read Receipts',
      description: 'See when your messages are read',
      color: '#EC4899',
    },
  ];

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
          <View style={styles.headerContent}>
            <Crown size={32} color="#F59E0B" />
            <Text style={styles.title}>Upgrade to Premium</Text>
            <Text style={styles.subtitle}>Unlock all features and find love faster</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(200)}>
            {/* Features */}
            <View style={styles.featuresContainer}>
              {features.map((feature, index) => (
                <Animated.View 
                  key={index}
                  entering={FadeInDown.delay(300 + index * 100)}
                  style={styles.featureItem}
                >
                  <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                    <feature.icon size={24} color="white" />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </Animated.View>
              ))}
            </View>

            {/* Pricing */}
            <View style={styles.pricingContainer}>
              <Text style={styles.pricingTitle}>Choose Your Plan</Text>
              
              <View style={styles.pricingCard}>
                <View style={styles.pricingHeader}>
                  <Text style={styles.planName}>Premium Monthly</Text>
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Most Popular</Text>
                  </View>
                </View>
                <Text style={styles.price}>₦2,500<Text style={styles.period}>/month</Text></Text>
                <Text style={styles.priceDescription}>Cancel anytime</Text>
              </View>

              <View style={styles.pricingCard}>
                <Text style={styles.planName}>Premium Yearly</Text>
                <Text style={styles.price}>₦25,000<Text style={styles.period}>/year</Text></Text>
                <Text style={styles.priceDescription}>Save 17% • ₦2,083/month</Text>
              </View>
            </View>

            {/* Testimonial */}
            <View style={styles.testimonialContainer}>
              <Text style={styles.testimonialText}>
                "I found my soulmate within 2 weeks of upgrading to Premium. The advanced filters helped me find exactly what I was looking for!"
              </Text>
              <Text style={styles.testimonialAuthor}>- Sarah, Lagos</Text>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <Crown size={20} color="white" />
            <Text style={styles.upgradeButtonText}>Start Premium Trial</Text>
          </TouchableOpacity>
          <Text style={styles.trialText}>7-day free trial, then ₦2,500/month</Text>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  featuresContainer: {
    paddingVertical: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  pricingContainer: {
    marginBottom: 24,
  },
  pricingTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  pricingCard: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  pricingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  popularBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  price: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  period: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  priceDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  testimonialContainer: {
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  testimonialText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    lineHeight: 20,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#9CA3AF',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  upgradeButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 8,
  },
  trialText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
});