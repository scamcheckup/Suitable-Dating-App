import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CircleCheck as CheckCircle, Circle as XCircle, RefreshCw } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { updateUserProfile } from '@/lib/auth';

interface PendingVerification {
  id: string;
  name: string;
  age: number;
  verification_photo_url: string;
  created_at: string;
}

export default function VerificationReviewScreen() {
  const [pendingVerifications, setPendingVerifications] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadPendingVerifications();
  }, []);

  const loadPendingVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, age, verification_photo_url, created_at')
        .eq('verification_status', 'pending')
        .not('verification_photo_url', 'is', null)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPendingVerifications(data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load pending verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationDecision = async (userId: string, approved: boolean) => {
    setProcessing(userId);
    
    try {
      const status = approved ? 'verified' : 'rejected';
      const { error } = await updateUserProfile(userId, { verification_status: status });
      
      if (error) throw error;
      
      // Remove from pending list
      setPendingVerifications(prev => prev.filter(v => v.id !== userId));
      
      Alert.alert(
        'Success', 
        `Verification ${approved ? 'approved' : 'rejected'} successfully`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update verification status');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading verifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Verification Review</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadPendingVerifications}
        >
          <RefreshCw size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {pendingVerifications.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle size={64} color="#10B981" />
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptySubtitle}>
              No pending verifications to review
            </Text>
          </View>
        ) : (
          pendingVerifications.map((verification) => (
            <View key={verification.id} style={styles.verificationCard}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {verification.name}, {verification.age}
                </Text>
                <Text style={styles.submissionDate}>
                  Submitted: {new Date(verification.created_at).toLocaleDateString()}
                </Text>
              </View>
              
              <Image 
                source={{ uri: verification.verification_photo_url }}
                style={styles.verificationImage}
                resizeMode="cover"
              />
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleVerificationDecision(verification.id, false)}
                  disabled={processing === verification.id}
                >
                  <XCircle size={20} color="#EF4444" />
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleVerificationDecision(verification.id, true)}
                  disabled={processing === verification.id}
                >
                  <CheckCircle size={20} color="white" />
                  <Text style={styles.approveButtonText}>
                    {processing === verification.id ? 'Processing...' : 'Approve'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  verificationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userInfo: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  submissionDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  verificationImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  rejectButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  rejectButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    marginLeft: 6,
  },
  approveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 6,
  },
});