import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ChallengeStyles from '@/styles/ChallengeStyles';
import { useAuth } from '@/context/AuthContext';
import useSelectedChallenge from '@/hooks/challenge/useSelectedChallenge';
import useActivityLogs from '@/hooks/challenge/useActivityLogs';

// Styles for this component
const styles = ChallengeStyles;

export default function LogActivity() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user, loading: authLoading } = useAuth();
  
  // Local state for the form
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [progress, setProgress] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use our selected challenge hook to get challenge details
  const {
    challenge,
    isLoading: challengeLoading,
    error: challengeError,
    loadChallenge,
  } = useSelectedChallenge();
  
  // Use activity logs hook to add a log
  const { logActivity } = useActivityLogs({ challengeId: id as string });

  // Load challenge on mount
  useEffect(() => {
    if (id && typeof id === 'string') {
      loadChallenge(id);
    }
  }, [id, loadChallenge]);

  // Redirect to signin if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('No authenticated user found in log activity, redirecting to signin');
      router.replace('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Handle activity submission
  const handleSubmit = async () => {
    if (!challenge || !user) return;
    
    if (!activityTitle.trim()) {
      Alert.alert('Error', 'Please enter an activity title');
      return;
    }
    
    const progressValue = parseInt(progress) || 1;
    
    try {
      setIsSubmitting(true);
      
      // Combine title and description into one field for logging
      const fullDescription = activityDescription
        ? `${activityTitle}: ${activityDescription}`
        : activityTitle;
      await logActivity(fullDescription, progressValue);
      
      Alert.alert(
        'Success',
        'Your activity has been logged successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => router.replace(`../`) 
          }
        ]
      );
    } catch (error) {
      console.error('Error logging activity:', error);
      Alert.alert('Error', 'Failed to log your activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If still loading auth, show loading indicator
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  // Show loading state while challenge data is being fetched
  if (challengeLoading || !challenge) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, isTabletOrLarger && { alignSelf: 'center', width: '60%', maxWidth: 700 }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#2E7D32" />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>Log Activity</Text>
              <Text style={styles.subtitle}>{challenge.title}</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.detailCard}>
            {/* Activity Title */}
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.progressLabel, { marginBottom: 8 }]}>Activity Title *</Text>
              <TextInput
                style={{
                  backgroundColor: '#F5F5F5',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: '#333333',
                }}
                placeholder="e.g., Used reusable water bottle today"
                value={activityTitle}
                onChangeText={setActivityTitle}
              />
            </View>
            
            {/* Activity Description */}
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.progressLabel, { marginBottom: 8 }]}>Description (Optional)</Text>
              <TextInput
                style={{
                  backgroundColor: '#F5F5F5',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: '#333333',
                  height: 100,
                  textAlignVertical: 'top',
                }}
                placeholder="Describe your activity in detail..."
                value={activityDescription}
                onChangeText={setActivityDescription}
                multiline
              />
            </View>
            
            {/* Progress */}
            <View style={{ marginBottom: 24 }}>
              <Text style={[styles.progressLabel, { marginBottom: 8 }]}>Progress Points (1-10)</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#E0E0E0',
                    borderRadius: 8,
                    padding: 12,
                    marginRight: 8,
                  }}
                  onPress={() => {
                    const value = parseInt(progress) || 1;
                    if (value > 1) setProgress((value - 1).toString());
                  }}
                >
                  <Ionicons name="remove" size={20} color="#333333" />
                </TouchableOpacity>
                
                <TextInput
                  style={{
                    backgroundColor: '#F5F5F5',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    color: '#333333',
                    flex: 1,
                    textAlign: 'center',
                  }}
                  keyboardType="number-pad"
                  value={progress}
                  onChangeText={(text) => {
                    const value = parseInt(text) || 0;
                    if (value >= 0 && value <= 10) {
                      setProgress(text);
                    }
                  }}
                />
                
                <TouchableOpacity
                  style={{
                    backgroundColor: '#E0E0E0',
                    borderRadius: 8,
                    padding: 12,
                    marginLeft: 8,
                  }}
                  onPress={() => {
                    const value = parseInt(progress) || 0;
                    if (value < 10) setProgress((value + 1).toString());
                  }}
                >
                  <Ionicons name="add" size={20} color="#333333" />
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 12, color: '#777777', marginTop: 4 }}>
                Estimate how much impact this activity had (1 = small, 10 = large)
              </Text>
            </View>
            
            {/* Submit Button */}
            <TouchableOpacity 
              style={styles.joinButton} 
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.joinButtonText}>Log Activity</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
