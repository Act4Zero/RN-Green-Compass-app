import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LeaderboardProvider, useLeaderboard } from '@/context/LeaderboardContext';
import LeaderboardStyles from '@/styles/LeaderboardStyles';
import LeaderboardFilters from '@/components/community/leaderboards/LeaderboardFilters';
import LeaderboardEntry from '@/components/community/leaderboards/LeaderboardEntry';
import MotivationalMessage from '@/components/community/leaderboards/MotivationalMessage';
import LoadingState from '@/components/community/leaderboards/LoadingState';
import ErrorState from '@/components/community/leaderboards/ErrorState';
import EmptyState from '@/components/community/leaderboards/EmptyState';

// Styles for this component
const styles = LeaderboardStyles;

function LeaderboardContent() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // Use our leaderboard context for all state management and event handlers
  const {
    // Data
    entries,
    currentUserEntry,
    totalEntries,
    hasMore,
    motivationalInfo,
    
    // State
    isLoading,
    error,
    filter,
    availableScopes,
    
    // Actions
    setLeaderboardType,
    setLeaderboardScope,
    loadMoreEntries,
    refreshLeaderboard,
  } = useLeaderboard();

  // Redirect to signin if user is not authenticated
  useEffect(() => {
    // Only check after auth loading is complete
    if (!authLoading && !user) {
      console.log('No authenticated user found in leaderboards, redirecting to signin');
      router.replace('/auth/signin');
    }
  }, [user, authLoading, router]);

  // If still loading auth, show loading state
  if (authLoading) {
    return <LoadingState />;
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
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#2E7D32" />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>Leaderboards</Text>
              <Text style={styles.subtitle}>See how you compare to others</Text>
            </View>
          </View>

          {/* Filter options for leaderboard type and scope */}
          <LeaderboardFilters
            filter={filter}
            availableScopes={availableScopes}
            setLeaderboardType={setLeaderboardType}
            setLeaderboardScope={setLeaderboardScope}
          />

          {/* Motivational message specific to the user's ranking */}
          <MotivationalMessage motivationalInfo={motivationalInfo} />

          {/* Leaderboard data display */}
          <View style={styles.leaderboardContainer}>
            <View style={styles.leaderboardHeader}>
              <Text style={styles.leaderboardTitle}>
                {filter.type === 'points' ? 'Most Green Points' : 'Longest Habit Streak'}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Loading state */}
            {isLoading && entries.length === 0 ? (
              <LoadingState />
            ) : null}

            {/* Error state */}
            {error && !isLoading ? (
              <ErrorState error={error} onRetry={refreshLeaderboard} />
            ) : null}

            {/* Empty state */}
            {!isLoading && !error && entries.length === 0 ? (
              <EmptyState />
            ) : null}

            {/* Leaderboard entries */}
            {entries.map((entry) => (
              <LeaderboardEntry
                key={entry.userId}
                entry={entry}
                leaderboardType={filter.type}
              />
            ))}

            {/* "Load more" button */}
            {hasMore && !isLoading && (
              <TouchableOpacity 
                style={styles.loadMoreButton}
                onPress={loadMoreEntries}
              >
                <Text style={styles.loadMoreButtonText}>Load More</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Wrap the component with the LeaderboardProvider to provide context
export default function LeaderboardScreen() {
  return (
    <LeaderboardProvider>
      <LeaderboardContent />
    </LeaderboardProvider>
  );
}
