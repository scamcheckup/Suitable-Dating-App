import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Phone, Users, Send, UserCheck, Info } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function ConnectScreen() {
  const { user, userProfile } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter phone, 2: Waiting for acceptance

  const validatePhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if it's a valid Nigerian number
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      return true;
    }
    if (cleaned.length === 13 && cleaned.startsWith('234')) {
      return true;
    }
    if (cleaned.length === 14 && cleaned.startsWith('+234')) {
      return true;
    }
    
    return false;
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      return '+234' + cleaned.substring(1);
    }
    if (cleaned.startsWith('234')) {
      return '+' + cleaned;
    }
    
    return phone;
  };

  const handleSendInvite = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid Nigerian phone number');
      return;
    }

    setLoading(true);
    
    try {
      // Format the phone number
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // Check if user exists in the system
      // In production, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate sending invitation
      const sessionId = `session_${Date.now()}`;
      
      setStep(2);
      
      // Auto-proceed to quiz after 3 seconds (simulating acceptance)
      setTimeout(() => {
        router.push(`/suitability-calculator/quiz/${sessionId}?partnerPhone=${encodeURIComponent(formattedPhone)}`);
      }, 3000);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Animated.View entering={FadeInDown.delay(300)} style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E']}
          style={styles.iconGradient}
        >
          <Users size={32} color="white" />
        </LinearGradient>
      </View>
      
      <Text style={styles.stepTitle}>Connect with Someone</Text>
      <Text style={styles.stepSubtitle}>
        Enter their phone number to invite them to take the compatibility quiz with you
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Phone Number</Text>
        <View style={styles.inputWrapper}>
          <Phone size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="+234 xxx xxx xxxx"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            placeholderTextColor="#9CA3AF"
            editable={!loading}
          />
        </View>
        <Text style={styles.inputHint}>
          Enter the phone number they used to register on Suitable
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Info size={16} color="#0EA5E9" />
        <Text style={styles.infoText}>
          They'll receive an invitation to join your compatibility quiz. Both of you need to complete it to see results.
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.sendButton, (!phoneNumber.trim() || loading) && styles.sendButtonDisabled]}
        onPress={handleSendInvite}
        disabled={!phoneNumber.trim() || loading}
      >
        <Send size={20} color="white" />
        <Text style={styles.sendButtonText}>
          {loading ? 'Sending Invitation...' : 'Send Invitation'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View entering={FadeInDown.delay(300)} style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={['#10B981', '#34D399']}
          style={styles.iconGradient}
        >
          <UserCheck size={32} color="white" />
        </LinearGradient>
      </View>
      
      <Text style={styles.stepTitle}>Invitation Sent!</Text>
      <Text style={styles.stepSubtitle}>
        We've sent an invitation to {formatPhoneNumber(phoneNumber)}. 
        Waiting for them to accept...
      </Text>

      <View style={styles.waitingContainer}>
        <View style={styles.pulseContainer}>
          <View style={styles.pulseRing} />
          <View style={styles.pulseCore} />
        </View>
        <Text style={styles.waitingText}>Waiting for response...</Text>
      </View>

      <View style={styles.infoBox}>
        <Info size={16} color="#F59E0B" />
        <Text style={styles.infoText}>
          They have 10 minutes to accept the invitation. You'll be notified when they join.
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.cancelButton}
        onPress={() => setStep(1)}
      >
        <Text style={styles.cancelButtonText}>Send to Different Number</Text>
      </TouchableOpacity>
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
          <Text style={styles.title}>Connect</Text>
          <Text style={styles.subtitle}>Step {step} of 2</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(step / 2) * 100}%` }
            ]} 
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
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
    marginBottom: 32,
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  inputHint: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 6,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
  sendButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  waitingContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  pulseContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pulseCore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  waitingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF6B6B',
  },
});