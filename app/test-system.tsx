import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { testMatchingAlgorithm, createTestUsers } from '@/lib/test-matching';
import { ArrowLeft, Play, Users, Database, Heart } from 'lucide-react-native';
import { router } from 'expo-router';

export default function TestSystemScreen() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const runDatabaseTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    addResult('🚀 Starting database tests...');
    
    try {
      const success = await testMatchingAlgorithm();
      if (success) {
        addResult('✅ All database tests passed!');
      } else {
        addResult('❌ Some database tests failed');
      }
    } catch (error) {
      addResult(`❌ Database test error: ${error}`);
    }
    
    setLoading(false);
  };

  const runMatchingTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    addResult('🧪 Testing matching algorithm...');
    
    try {
      const success = await createTestUsers();
      if (success) {
        addResult('✅ Matching algorithm tests completed!');
      } else {
        addResult('❌ Matching algorithm tests failed');
      }
    } catch (error) {
      addResult(`❌ Matching test error: ${error}`);
    }
    
    setLoading(false);
  };

  const runFullSystemTest = async () => {
    setLoading(true);
    setTestResults([]);
    
    addResult('🔧 Running full system test...');
    
    try {
      // Test database
      addResult('📊 Testing database connection...');
      const dbSuccess = await testMatchingAlgorithm();
      
      if (dbSuccess) {
        addResult('✅ Database tests passed');
        
        // Test matching
        addResult('💕 Testing matching algorithm...');
        const matchSuccess = await createTestUsers();
        
        if (matchSuccess) {
          addResult('✅ Matching algorithm working');
          addResult('🎉 All systems operational!');
        } else {
          addResult('❌ Matching algorithm failed');
        }
      } else {
        addResult('❌ Database tests failed');
      }
    } catch (error) {
      addResult(`❌ System test error: ${error}`);
    }
    
    setLoading(false);
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
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Database Tests</Text>
          <TouchableOpacity 
            style={[styles.testButton, loading && styles.testButtonDisabled]}
            onPress={runDatabaseTests}
            disabled={loading}
          >
            <Database size={20} color="white" />
            <Text style={styles.testButtonText}>Test Database Connection</Text>
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
            <Text style={styles.testButtonText}>Test Matching Algorithm</Text>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
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