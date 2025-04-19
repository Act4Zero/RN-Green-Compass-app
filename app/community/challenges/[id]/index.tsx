import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ChallengeStyles from '@/styles/ChallengeStyles';
import { useAuth } from '@/context/AuthContext';
import useSelectedChallenge from '@/hooks/challenge/useSelectedChallenge';
import useParticipants from '@/hooks/challenge/useParticipants';
import ChallengeParticipants from '@/components/challenges/ChallengeParticipants';
import ChallengeProgress from '@/components/challenges/ChallengeProgress';
import ActivityLogsList from '@/components/challenges/ActivityLogsList';
import formatDate from '@/utils/formatDate';

// Styles for this component
const styles = ChallengeStyles;

export default function ChallengeDetail() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const { user, loading: authLoading } = useAuth();
  
  // Use our selected challenge hook
  const { loadChallenge, updateParticipantCount, updateProgressMetrics, clearChallenge, challenge, isLoading, error } = useSelectedChallenge();
  const { joinChallenge: joinChallengeBackend, leaveChallenge: leaveChallengeBackend } = useParticipants({ challengeId: id });
  useEffect(() => {
    if (id && typeof id === 'string') {
      loadChallenge(id);
    }
  }, [id, loadChallenge]);

  // Redirect to signin if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('No authenticated user found in challenge detail, redirecting to signin');
      router.replace('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Event handlers for joining/leaving challenge
  const handleJoinChallenge = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please sign in to join this challenge.');
      return;
    }
    try {
      const result = await joinChallengeBackend();
      if (result.success && result.isJoined) {
        updateParticipantCount(true);
        Alert.alert('Success', 'You have joined the challenge!');
      } else if (!result.success) {
        Alert.alert('Error', 'Failed to join the challenge. The challenge may have ended or you have already joined.');
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
      Alert.alert('Error', 'Failed to join the challenge. Please try again.');
    }
  };
  
  const handleLeaveChallenge = async () => {
    if (!challenge) return;
    try {
      const result = await leaveChallengeBackend();
      if (result.success && result.isJoined === false) {
        updateParticipantCount(false);
        Alert.alert('Success', 'You have left the challenge.');
      } else {
        Alert.alert('Error', 'Failed to leave the challenge. Please try again.');
      }
    } catch (error) {
      console.error('Error leaving challenge:', error);
      Alert.alert('Error', 'Failed to leave the challenge. Please try again.');
    }
  };

  // Handle logging activity
  const handleLogActivity = () => {
    if (!challenge) return;
    // Navigate explicitly with challenge ID for the log screen
    router.push({ pathname: '/community/challenges/[id]/log', params: { id } });
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
  if (isLoading || !challenge) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  // Show error state if challenge failed to load
  if (error) {
    return (
      <View style={styles.emptyStateContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#777777" />
        <Text style={styles.emptyStateText}>{error}</Text>
        <TouchableOpacity 
          style={[styles.joinButton, { marginTop: 24 }]} 
          onPress={() => loadChallenge(id as string)}
        >
          <Text style={styles.joinButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate start and end dates
  const startDate = new Date(challenge.start_date);
  const endDate = new Date(challenge.end_date);
  const dateString = `${formatDate(startDate)} - ${formatDate(endDate)}`;
  
  // Check if challenge is active
  const now = new Date();
  const isActive = now >= startDate && now <= endDate;

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
              <Text style={styles.title}>Challenge Details</Text>
              <Text style={styles.subtitle}>View progress and participate</Text>
            </View>
          </View>

          {/* Challenge Detail Card */}
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>{challenge.title}</Text>
              <Text style={styles.detailDates}>{dateString}</Text>
            </View>
            
            <Text style={styles.detailDescription}>{challenge.description}</Text>
            
            <View style={styles.creatorInfo}>
              <Ionicons name="person-circle-outline" size={24} color="#555555" />
              <Text style={styles.creatorName}>
                Created by {challenge.creator?.display_name || 'Anonymous'}
              </Text>
            </View>
            
            {/* Progress Bars */}
            <View style={styles.progressContainer}>
              {/* Group Progress */}
              <Text style={styles.progressLabel}>Group Progress</Text>
              <ChallengeProgress 
                value={challenge.group_progress_metric || 0}
                total={100}
                color="#4CAF50"
              />
              
              {/* Personal Progress - only shown if participating */}
              {challenge.is_participant && (
                <>
                  <Text style={[styles.progressLabel, { marginTop: 16 }]}>Your Progress</Text>
                  <ChallengeProgress
                    value={challenge.progress_metric || 0}
                    total={100}
                    color="#81C784"
                  />
                </>
              )}
            </View>
            
            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              {isActive && (
                <TouchableOpacity 
                  style={[
                    styles.joinButton, 
                    challenge.is_participant && { backgroundColor: '#F44336' }
                  ]} 
                  onPress={challenge?.is_participant ? handleLeaveChallenge : handleJoinChallenge}
                >
                  <Text style={styles.joinButtonText}>
                    {challenge.is_participant ? 'Leave Challenge' : 'Join Challenge'}
                  </Text>
                </TouchableOpacity>
              )}
              
              {challenge.is_participant && isActive && (
                <TouchableOpacity 
                  style={styles.logButton} 
                  onPress={handleLogActivity}
                >
                  <Text style={styles.logButtonText}>Log Activity</Text>
                </TouchableOpacity>
              )}
              
              {!isActive && now < startDate && (
                <View style={[styles.joinButton, { backgroundColor: '#9E9E9E' }]}>
                  <Text style={styles.joinButtonText}>Challenge hasn't started yet</Text>
                </View>
              )}
              
              {!isActive && now > endDate && (
                <View style={[styles.joinButton, { backgroundColor: '#9E9E9E' }]}>
                  <Text style={styles.joinButtonText}>Challenge has ended</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Participants Section */}
          <ChallengeParticipants challengeId={id} />
          
          {/* Activity Logs Section - only show if user is participating */}
          {challenge.is_participant && (
            <ActivityLogsList challengeId={challenge.id} userId={user?.id} />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
