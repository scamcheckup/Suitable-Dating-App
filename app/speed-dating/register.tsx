import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard, Shield, Clock, Users, CircleCheck as CheckCircle, Info } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface RegistrationForm {
  eventId: string;
  emergencyContact: string;
  emergencyPhone: string;
  dietaryRestrictions: string;
  expectations: string;
  agreeToTerms: boolean;
  agreeToRefund: boolean;
}

export default function SpeedDatingRegisterScreen() {
  const { eventId } = useLocalSearchParams();
  const { user, userProfile } = useAuth();
  const [formData, setFormData] = useState<RegistrationForm>({
    eventId: eventId as string,
    emergencyContact: '',
    emergencyPhone: '',
    dietaryRestrictions: '',
    expectations: '',
    agreeToTerms: false,
    agreeToRefund: false,
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Mock event data - in production, fetch from API
  const eventData = {
    id: eventId,
    title: 'Lagos Virtual Speed Dating',
    date: '2025-01-20',
    time: '7:00 PM',
    price: 5000,
    duration: '2 hours',
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.emergencyContact.trim() && formData.emergencyPhone.trim();
      case 2:
        return formData.agreeToTerms && formData.agreeToRefund;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        handlePayment();
      }
    } else {
      Alert.alert('Incomplete Information', 'Please fill in all required fields.');
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Registration Successful!',
        'You have been registered for the speed dating event. You will receive a confirmation email shortly.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/speed-dating')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Animated.View entering={FadeInDown.delay(300)} style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>
        We need some additional information for safety and event coordination
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Emergency Contact Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Full name of emergency contact"
          value={formData.emergencyContact}
          onChangeText={(text) => setFormData({...formData, emergencyContact: text})}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Emergency Contact Phone *</Text>
        <TextInput
          style={styles.input}
          placeholder="+234 xxx xxx xxxx"
          value={formData.emergencyPhone}
          onChangeText={(text) => setFormData({...formData, emergencyPhone: text})}
          keyboardType="phone-pad"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Dietary Restrictions (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Any allergies or dietary preferences"
          value={formData.dietaryRestrictions}
          onChangeText={(text) => setFormData({...formData, dietaryRestrictions: text})}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>What are you looking for? (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell us about your expectations for this event..."
          value={formData.expectations}
          onChangeText={(text) => setFormData({...formData, expectations: text})}
          multiline
          numberOfLines={3}
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View entering={FadeInDown.delay(300)} style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Terms & Conditions</Text>
      <Text style={styles.stepSubtitle}>
        Please review and accept our terms before proceeding
      </Text>

      <View style={styles.termsContainer}>
        <View style={styles.termSection}>
          <Text style={styles.termTitle}>Event Guidelines</Text>
          <Text style={styles.termText}>
            • Be respectful and courteous to all participants{'\n'}
            • Arrive on time for the virtual event{'\n'}
            • Keep conversations appropriate and engaging{'\n'}
            • No sharing of personal contact information during the event{'\n'}
            • Follow the moderator's instructions
          </Text>
        </View>

        <View style={styles.termSection}>
          <Text style={styles.termTitle}>Refund Policy</Text>
          <Text style={styles.termText}>
            • Full refund available up to 24 hours before the event{'\n'}
            • 50% refund available up to 2 hours before the event{'\n'}
            • No refunds after the event has started{'\n'}
            • Refunds processed within 3-5 business days
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.checkboxContainer}
        onPress={() => setFormData({...formData, agreeToTerms: !formData.agreeToTerms})}
      >
        <View style={[styles.checkbox, formData.agreeToTerms && styles.checkboxChecked]}>
          {formData.agreeToTerms && <CheckCircle size={16} color="white" />}
        </View>
        <Text style={styles.checkboxText}>
          I agree to the event guidelines and terms of service
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.checkboxContainer}
        onPress={() => setFormData({...formData, agreeToRefund: !formData.agreeToRefund})}
      >
        <View style={[styles.checkbox, formData.agreeToRefund && styles.checkboxChecked]}>
          {formData.agreeToRefund && <CheckCircle size={16} color="white" />}
        </View>
        <Text style={styles.checkboxText}>
          I understand and accept the refund policy
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View entering={FadeInDown.delay(300)} style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Payment</Text>
      <Text style={styles.stepSubtitle}>
        Complete your registration with secure payment
      </Text>

      {/* Order Summary */}
      <View style={styles.orderSummary}>
        <Text style={styles.orderTitle}>Order Summary</Text>
        
        <View style={styles.orderItem}>
          <Text style={styles.orderItemName}>{eventData.title}</Text>
          <Text style={styles.orderItemPrice}>{formatPrice(eventData.price)}</Text>
        </View>
        
        <View style={styles.orderItem}>
          <Text style={styles.orderItemName}>Processing Fee</Text>
          <Text style={styles.orderItemPrice}>₦100</Text>
        </View>
        
        <View style={styles.orderDivider} />
        
        <View style={styles.orderItem}>
          <Text style={styles.orderTotal}>Total</Text>
          <Text style={styles.orderTotalPrice}>{formatPrice(eventData.price + 100)}</Text>
        </View>
      </View>

      {/* Payment Method */}
      <View style={styles.paymentSection}>
        <Text style={styles.paymentTitle}>Payment Method</Text>
        
        <TouchableOpacity style={styles.paymentMethod}>
          <CreditCard size={20} color="#FF6B6B" />
          <Text style={styles.paymentMethodText}>Card Payment (Paystack)</Text>
          <CheckCircle size={16} color="#10B981" />
        </TouchableOpacity>
      </View>

      {/* Security Notice */}
      <View style={styles.securityNotice}>
        <Shield size={16} color="#10B981" />
        <Text style={styles.securityText}>
          Your payment is secured with 256-bit SSL encryption
        </Text>
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
          <Text style={styles.title}>Event Registration</Text>
          <Text style={styles.subtitle}>Step {currentStep} of 3</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(currentStep / 3) * 100}%` }
            ]} 
          />
        </View>
      </View>

      {/* Event Info */}
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{eventData.title}</Text>
        <View style={styles.eventDetails}>
          <View style={styles.eventDetail}>
            <Clock size={14} color="#6B7280" />
            <Text style={styles.eventDetailText}>{eventData.date} • {eventData.time}</Text>
          </View>
          <View style={styles.eventDetail}>
            <Users size={14} color="#6B7280" />
            <Text style={styles.eventDetailText}>{eventData.duration}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {currentStep > 1 && (
          <TouchableOpacity 
            style={styles.backStepButton}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Text style={styles.backStepButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[
            styles.nextButton,
            !validateStep(currentStep) && styles.nextButtonDisabled,
            loading && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!validateStep(currentStep) || loading}
        >
          <Text style={styles.nextButtonText}>
            {loading ? 'Processing...' : currentStep === 3 ? `Pay ${formatPrice(eventData.price + 100)}` : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 2,
  },
  eventInfo: {
    backgroundColor: '#F9FAFB',
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  eventDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDetailText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  termsContainer: {
    marginBottom: 24,
  },
  termSection: {
    marginBottom: 20,
  },
  termTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  termText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  checkboxText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
    flex: 1,
  },
  orderSummary: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  orderTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderItemName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  orderItemPrice: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  orderDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  orderTotal: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  orderTotalPrice: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FF6B6B',
  },
  paymentSection: {
    marginBottom: 24,
  },
  paymentTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  paymentMethodText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    flex: 1,
    marginLeft: 12,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  securityText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#166534',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  backStepButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  backStepButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});