import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { testMatchingAlgorithm, createTestUsers, testAllDatabaseTables, testDatabaseFunctions } from '@/lib/test-matching';
import { ArrowLeft, Play, Users, Database, Heart, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { router } from 'expo-router';
import { testDatabaseConnection } from '@/lib/supabase';

export default function TestSystemScreen() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const runBasicConnectionTest = async () => {
    setLoading(true);
    setTestResults([]);
    setTestStatus('running');
    
    addResult('🔌 Testing basic database connection...');
    
    try {
      const isConnected = await testDatabaseConnection();
      if (isConnected) {
        addResult('✅ Database connection successful!');
        addResult('📊 Supabase client initialized correctly');
        setTestStatus('completed');
      } else {
        addResult('❌ Database connection failed');
        addResult('⚠️ Check your Supabase configuration');
        setTestStatus('error');
      }
    } catch (error) {
      addResult(`❌ Connection error: ${error}`);
      setTestStatus('error');
    }
    
    setLoading(false);
  };

  const runTableTests = async () => {
    setLoading(true);
    setTestResults([]);
    setTestStatus('running');
    
    addResult('📋 Testing all database tables...');
    
    try {
      const success = await testAllDatabaseTables();
      if (success) {
        addResult('✅ All database tables accessible!');
        addResult('🔐 Row Level Security policies working');
        setTestStatus('completed');
      } else {
        addResult('❌ Some database tables failed');
        setTestStatus('error');
      }
    } catch (error) {
      addResult(`❌ Table test error: ${error}`);
      setTestStatus('error');
    }
    
    setLoading(false);
  };

  const runFunctionTests = async () => {
    setLoading(true);
    setTestResults([]);
    setTestStatus('running');
    
    addResult('⚙️ Testing database functions...');
    
    try {
      const success = await testDatabaseFunctions();
      if (success) {
        addResult('✅ All database functions working!');
        addResult('🧮 Compatibility calculations functional');
        setTestStatus('completed');
      } else {
        addResult('❌ Some database functions failed');
        setTestStatus('error');
      }
    } catch (error) {
      addResult(`❌ Function test error: ${error}`);
      setTestStatus('error');
    }
    
    setLoading(false);
  };

  const runDatabaseTests = async () => {
    setLoading(true);
    setTestResults([]);
    setTestStatus('running');
    
    addResult('🚀 Starting database tests...');
    
    try {
      const success = await testMatchingAlgorithm();
      if (success) {
        addResult('✅ All database tests passed!');
        setTestStatus('completed');
      } else {
        addResult('❌ Some database tests failed');
        setTestStatus('error');
      }
    } catch (error) {
      addResult(`❌ Database test error: ${error}`);
      setTestStatus('error');
    }
    
    setLoading(false);
  };

  const runMatchingTests = async () => {
    setLoading(true);
    setTestResults([]);
    setTestStatus('running');
    
    addResult('🧪 Testing matching algorithm...');
    
    try {
      const success = await createTestUsers();
      if (success) {
        addResult('✅ Matching algorithm tests completed!');
        setTestStatus('completed');
      } else {
        addResult('❌ Matching algorithm tests failed');
        setTestStatus('error');
      }
    } catch (error) {
      addResult(`❌ Matching test error: ${error}`);
      setTestStatus('error');
    }
    
    setLoading(false);
  };

  const runFullSystemTest = async () => {
    setLoading(true);
    setTestResults([]);
    setTestStatus('running');
    
    addResult('🔧 Running full system test...');
    
    try {
      // Test basic connection first
      addResult('🔌 Testing database connection...');
      const connectionSuccess = await testDatabaseConnection();
      
      if (!connectionSuccess) {
        addResult('❌ Database connection failed - stopping tests');
        setTestStatus('error');
        setLoading(false);
        return;
      }
      addResult('✅ Database connection successful');
      
      // Test tables
      addResult('📋 Testing database tables...');
      const tablesSuccess = await testAllDatabaseTables();
      
      if (tablesSuccess) {
        addResult('✅ All tables accessible');
      } else {
        addResult('⚠️ Some table issues detected');
      }
      
      // Test functions
      addResult('⚙️ Testing database functions...');
      const functionsSuccess = await testDatabaseFunctions();
      
      if (functionsSuccess) {
        addResult('✅ Database functions working');
      } else {
        addResult('⚠️ Some function issues detected');
      }
      
      // Test database
      addResult('🧪 Testing matching algorithm...');
      const dbSuccess = await testMatchingAlgorithm();
      
      if (dbSuccess) {
        addResult('✅ Matching algorithm tests passed');
        
        // Test matching
        addResult('👥 Creating test users...');
        const matchSuccess = await createTestUsers();
        
        if (matchSuccess) {
          addResult('✅ Test users created successfully');
          addResult('🎉 All systems operational!');
          setTestStatus('completed');
        } else {
          addResult('❌ Test user creation failed');
          setTestStatus('error');
        }
      } else {
        addResult('❌ Matching algorithm tests failed');
        setTestStatus('error');
      }
    } catch (error) {
      addResult(`❌ System test error: ${error}`);
      setTestStatus('error');
    }
    
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
    setTestStatus('idle');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>System Tests</Text>
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={clearResults}
        >
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Test Status Indicator */}
        {testStatus !== 'idle' && (
          <View style={[
            styles.statusIndicator,
            testStatus === 'running' && styles.statusRunning,
            testStatus === 'completed' && styles.statusCompleted,
            testStatus === 'error' && styles.statusError
          ]}>
            {testStatus === 'running' && <Database size={16} color="#3B82F6" />}
            {testStatus === 'completed' && <CheckCircle size={16} color="#10B981" />}
            {testStatus === 'error' && <AlertTriangle size={16} color="#EF4444" />}
            <Text style={[
              styles.statusText,
              testStatus === 'running' && styles.statusTextRunning,
              testStatus === 'completed' && styles.statusTextCompleted,
              testStatus === 'error' && styles.statusTextError
            ]}>
              {testStatus === 'running' && 'Tests Running...'}
              {testStatus === 'completed' && 'Tests Completed Successfully'}
              {testStatus === 'error' && 'Tests Failed - Check Results'}
            </Text>
          </View>
        )}

        {/* Basic Connection Test */}
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Basic Connection</Text>
          <TouchableOpacity 
            style={[styles.testButton, loading && styles.testButtonDisabled]}
            onPress={runBasicConnectionTest}
            disabled={loading}
          >
            <Database size={20} color="white" />
            <Text style={styles.testButtonText}>Test Database Connection</Text>
          </TouchableOpacity>
        </View>

        {/* Table Tests */}
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Database Tables</Text>
          <TouchableOpacity 
            style={[styles.testButton, loading && styles.testButtonDisabled]}
            onPress={runTableTests}
            disabled={loading}
          >
            <Users size={20} color="white" />
            <Text style={styles.testButtonText}>Test All Tables</Text>
          </TouchableOpacity>
        </View>

        {/* Function Tests */}
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Database Functions</Text>
          <TouchableOpacity 
            style={[styles.testButton, loading && styles.testButtonDisabled]}
            onPress={runFunctionTests}
            disabled={loading}
          >
            <Heart size={20} color="white" />
            <Text style={styles.testButtonText}>Test Database Functions</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Legacy Database Tests</Text>
          <TouchableOpacity 
            style={[styles.testButton, loading && styles.testButtonDisabled]}
            onPress={runDatabaseTests}
            disabled={loading}
          >
            <Database size={20} color="white" />
            <Text style={styles.testButtonText}>Run Legacy Tests</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Matching Algorithm</Text>
          <TouchableOpacity 
            style={[styles.testButton, loading && styles.testButtonDisabled]}
            onPress={runMatchingTests}
            disabled={loading}
          >
            <Heart size={20} color="white" />
            <Text style={styles.testButtonText}>Create Test Users & Test Matching</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Full System Test</Text>
          <TouchableOpacity 
            style={[styles.fullTestButton, loading && styles.testButtonDisabled]}
            onPress={runFullSystemTest}
            disabled={loading}
          >
            <Play size={20} color="white" />
            <Text style={styles.testButtonText}>
              {loading ? 'Running Tests...' : 'Run All Tests'}
            </Text>
          </TouchableOpacity>
        </View>

        {testResults.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>Test Results</Text>
            <View style={styles.resultsContainer}>
              {testResults.map((result, index) => (
                <Text key={index} style={styles.resultText}>
                  {result}
                </Text>
              ))}
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF6B6B',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  statusRunning: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  statusCompleted: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  statusError: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  statusTextRunning: {
    color: '#3B82F6',
  },
  statusTextCompleted: {
    color: '#10B981',
  },
  statusTextError: {
    color: '#EF4444',
  },
  testSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  testButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullTestButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 8,
  },
  resultsSection: {
    marginTop: 32,
    marginBottom: 40,
  },
  resultsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  resultsContainer: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
  },
  resultText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    marginBottom: 4,
    lineHeight: 20,
  },
});