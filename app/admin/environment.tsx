import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CircleCheck as CheckCircle, Circle as XCircle, TriangleAlert as AlertTriangle, RefreshCw } from 'lucide-react-native';
import { router } from 'expo-router';
import { getEnvironmentStatus } from '@/lib/environment';
import { testMatchingAlgorithm } from '@/lib/test-matching';

export default function EnvironmentScreen() {
  const [envStatus, setEnvStatus] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkEnvironment();
  }, []);

  const checkEnvironment = async () => {
    setLoading(true);
    
    // Check environment variables
    const status = getEnvironmentStatus();
    setEnvStatus(status);
    
    // Test database connection
    try {
      const dbSuccess = await testMatchingAlgorithm();
      setDbStatus(dbSuccess ? 'connected' : 'failed');
    } catch (error) {
      setDbStatus('error');
    }
    
    setLoading(false);
  };

  const renderStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle size={20} color="#10B981" />
    ) : (
      <XCircle size={20} color="#EF4444" />
    );
  };

  const renderOptionalIcon = (status: boolean) => {
    return status ? (
      <CheckCircle size={20} color="#10B981" />
    ) : (
      <AlertTriangle size={20} color="#F59E0B" />
    );
  };

  if (!envStatus) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Checking environment...</Text>
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
        <Text style={styles.title}>Environment Status</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={checkEnvironment}
          disabled={loading}
        >
          <RefreshCw size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Overall Status */}
        <View style={styles.overallStatus}>
          {renderStatusIcon(envStatus.overall)}
          <Text style={[
            styles.overallText,
            { color: envStatus.overall ? '#10B981' : '#EF4444' }
          ]}>
            {envStatus.overall ? 'Environment Ready' : 'Configuration Issues'}
          </Text>
        </View>

        {/* Supabase Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supabase Configuration</Text>
          <View style={styles.statusItem}>
            {renderStatusIcon(envStatus.supabase.configured)}
            <Text style={styles.statusLabel}>Overall Status</Text>
            <Text style={styles.statusValue}>
              {envStatus.supabase.configured ? 'Configured' : 'Missing Config'}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusDetail}>URL: {envStatus.supabase.url}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusDetail}>Anon Key: {envStatus.supabase.key}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusDetail}>
              Database: {dbStatus === 'connected' ? '✅ Connected' : 
                        dbStatus === 'failed' ? '❌ Connection Failed' : 
                        dbStatus === 'error' ? '❌ Error' : '⏳ Testing...'}
            </Text>
          </View>
        </View>

        {/* R2 Storage Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cloudflare R2 Storage</Text>
          <View style={styles.statusItem}>
            {renderStatusIcon(envStatus.r2.configured)}
            <Text style={styles.statusLabel}>Overall Status</Text>
            <Text style={styles.statusValue}>
              {envStatus.r2.configured ? 'Configured' : 'Missing Config'}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusDetail}>Endpoint: {envStatus.r2.endpoint}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusDetail}>Bucket: {envStatus.r2.bucket}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusDetail}>Credentials: {envStatus.r2.credentials}</Text>
          </View>
        </View>

        {/* SMS Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SMS Service (Kudisms)</Text>
          <View style={styles.statusItem}>
            {renderOptionalIcon(envStatus.sms.configured)}
            <Text style={styles.statusLabel}>Overall Status</Text>
            <Text style={styles.statusValue}>
              {envStatus.sms.configured ? 'Configured' : 'Optional - Not Configured'}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusDetail}>API Key: {envStatus.sms.apiKey}</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusDetail}>Endpoint: {envStatus.sms.endpoint}</Text>
          </View>
        </View>

        {/* Missing Configuration */}
        {envStatus.missing.length > 0 && (
          <View style={styles.missingSection}>
            <Text style={styles.missingSectionTitle}>Missing Configuration</Text>
            {envStatus.missing.map((item, index) => (
              <Text key={index} style={styles.missingItem}>
                • EXPO_PUBLIC_{item}
              </Text>
            ))}
          </View>
        )}

        {/* Setup Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>Setup Instructions</Text>
          <Text style={styles.instructionsText}>
            1. Create a .env file in your project root{'\n'}
            2. Copy the variables from .env.example{'\n'}
            3. Replace placeholder values with your actual credentials{'\n'}
            4. Restart the development server
          </Text>
        </View>
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
  overallStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  overallText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginLeft: 12,
  },
  section: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  statusValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  statusDetail: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 28,
  },
  missingSection: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  missingSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#EF4444',
    marginBottom: 8,
  },
  missingItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginBottom: 4,
  },
  instructionsSection: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  instructionsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
  },
});