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
import { PointsLeaderboardEntry, StreakLeaderboardEntry } from '@/types/leaderboards';
import LeaderboardStyles from '@/styles/LeaderboardStyles';
import LeaderboardFilters from '@/components/community/leaderboards/LeaderboardFilters';
import LeaderboardEntry from '@/components/community/leaderboards/LeaderboardEntry';
import MotivationalMessage from '@/components/community/leaderboards/MotivationalMessage';
import LoadingState from '@/components/community/leaderboards/LoadingState';
import ErrorState from '@/components/community/leaderboards/ErrorState';
import EmptyState from '@/components/community/leaderboards/EmptyState';
import { useAppTheme } from '@/theme';

// Styles for this component
const styles = LeaderboardStyles;

function LeaderboardContent() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { theme } = useAppTheme();
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
      style={[styles.keyboardAvoidingContainer, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { maxWidth: 1040 }, isTabletOrLarger && { alignSelf: 'center', width: '100%' }]}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <View>
              <Text style={[styles.title, { color: theme.colors.text }]}>Impact leaderboard</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Celebrate consistency and learn from the community.</Text>
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
          <MotivationalMessage 
            motivationalInfo={motivationalInfo}
            currentUserRank={currentUserEntry?.rank || 0}
            displayName={currentUserEntry?.displayName || user?.email?.split('@')[0] || 'User'}
            totalPoints={filter.type === 'points' ? (currentUserEntry as PointsLeaderboardEntry)?.totalPoints : undefined}
            leaderboardType={filter.type}
            leaderboardScope={filter.scope}
            longestStreak={filter.type === 'streak' ? (currentUserEntry as StreakLeaderboardEntry)?.longestStreak : undefined}
            currentStreak={filter.type === 'streak' ? (currentUserEntry as StreakLeaderboardEntry)?.currentStreak : undefined}
            totalEntries={totalEntries}
          />

          {/* Leaderboard data display */}
          <View style={[styles.leaderboardContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}>
            <View style={styles.leaderboardHeader}>
              <Text style={[styles.leaderboardTitle, { color: theme.colors.text }]}>
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
