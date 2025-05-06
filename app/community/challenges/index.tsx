import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ChallengeStyles from '@/styles/community/ChallengeStyles';
import useChallenges from '@/hooks/challenge/useChallenges';
import ChallengeCard from '../../../src/components/challenges/ChallengeCard';
import { useAuth } from '@/context/AuthContext';
import EmptyState from '../../../src/components/challenges/EmptyState';
import FilterTabs from '../../../src/components/challenges/FilterTabs';

// Styles for this component
const styles = ChallengeStyles;

export default function ChallengesList() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // Use our challenge hook  // State and handlers
  const { challenges, isLoading, error, loadChallenges, loadMore, hasMore } = useChallenges();
  
  type ChallengeFilterType = 'all' | 'active' | 'participating' | 'completed';
  const [filter, setFilter] = React.useState<ChallengeFilterType>('all');

  // Platform-dependent minimum visible challenges for Load More button
  const minVisibleChallenges = Platform.OS === 'web'
    ? (isTabletOrLarger ? 10 : 8)
    : 6;

  // Filter challenges based on the selected filter
  const now = new Date();
  const filteredChallenges = React.useMemo(() => {
    if (filter === 'active') {
      return challenges.filter(challenge => {
        const start = new Date(challenge.start_date);
        const end = new Date(challenge.end_date);
        return now >= start && now <= end;
      });
    } else if (filter === 'completed') {
      return challenges.filter(challenge => {
        const end = new Date(challenge.end_date);
        return now > end;
      });
    } else if (filter === 'participating') {
      return challenges.filter(challenge => {
        const start = new Date(challenge.start_date);
        const end = new Date(challenge.end_date);
        return challenge.is_participant && now >= start && now <= end;
      });
    }
    return challenges;
  }, [challenges, filter]);

  // Only show Load More if there are fewer than the threshold and hasMore is true
  const shouldShowLoadMore = hasMore && filteredChallenges.length < minVisibleChallenges;
  
  // Function to refresh challenges
  const refreshChallenges = React.useCallback(() => {
    loadChallenges();
  }, [loadChallenges]);
  
  // Function to load more challenges
  const loadMoreChallenges = React.useCallback(() => {
    loadMore();
  }, [loadMore]);

  // Redirect to signin if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('No authenticated user found in challenges, redirecting to signin');
      router.replace('/auth/signin');
    }
  }, [user, authLoading, router]);

  // If still loading auth, show loading indicator
  if (authLoading) {
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
              onPress={() => {
                if (typeof router.canGoBack === 'function' ? router.canGoBack() : false) {
                  router.back();
                } else {
                  router.replace('/community');
                }
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#2E7D32" />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>Sustainability Challenges</Text>
              <Text style={styles.subtitle}>Join group challenges and track progress together</Text>
            </View>
          </View>

          {/* Filter Tabs */}
          <FilterTabs 
            activeFilter={filter} 
            onFilterChange={setFilter} 
          />

          {/* Challenges List */}
          {isLoading && challenges.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2E7D32" />
            </View>
          ) : error ? (
            <EmptyState 
              message="Error loading challenges. Please try again."
              buttonText="Try Again" 
              onButtonPress={refreshChallenges}
            />
          ) : challenges.length === 0 ? (
            <EmptyState 
              message="No challenges found. Check back later for new opportunities!"
              buttonText="Refresh" 
              onButtonPress={refreshChallenges}
            />
          ) : (
            <View style={styles.challengesContainer}>
              {filteredChallenges.length > 0 ? (
                filteredChallenges.map(challenge => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onPress={() => router.push(`./challenges/${challenge.id}`)}
                  />
                ))
              ) : (
                <EmptyState
                  message={
                    filter === 'active'
                      ? 'No active challenges found.'
                      : filter === 'completed'
                      ? 'No completed challenges found.'
                      : filter === 'participating'
                      ? "You're not participating in any active challenges."
                      : 'No challenges found.'
                  }
                  buttonText="Refresh"
                  onButtonPress={refreshChallenges}
                />
              )}
              
              {/* Load More Button */}
              {shouldShowLoadMore && (
                <TouchableOpacity 
                  style={[styles.joinButton, { backgroundColor: '#81C784' }]} 
                  onPress={loadMoreChallenges}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.joinButtonText}>Load More</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
