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
import ChallengeCard from '@/components/community/challenges/ChallengeCard';
import { useAuth } from '@/context/AuthContext';
import EmptyState from '@/components/community/challenges/EmptyState';
import FilterTabs from '@/components/community/challenges/FilterTabs';
import { useAppTheme } from '@/theme';
import { useAppLocale } from '@/context/AppLocaleContext';

// Styles for this component
const styles = ChallengeStyles;

export default function ChallengesList() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
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
      style={[styles.keyboardAvoidingContainer, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { maxWidth: 1040 }, isTabletOrLarger && { alignSelf: 'center', width: '100%' }]}>
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
              <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <View>
              <Text style={[styles.title, { color: theme.colors.text }]}>{t('Community challenges', 'Предизвикателства на общността')}</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{t('Build momentum with people working toward the same goal.', 'Напредвайте заедно с хора, които работят за същата цел.')}</Text>
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
              message={t('Error loading challenges. Please try again.', 'Предизвикателствата не можаха да се заредят. Опитайте отново.')}
              buttonText={t('Try Again', 'Опитайте отново')}
              onButtonPress={refreshChallenges}
            />
          ) : challenges.length === 0 ? (
            <EmptyState 
              message={t('No challenges found. Check back later for new opportunities!', 'Няма намерени предизвикателства. Проверете отново по-късно!')}
              buttonText={t('Refresh', 'Обнови')}
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
                      ? t('No active challenges found.', 'Няма активни предизвикателства.')
                      : filter === 'completed'
                      ? t('No completed challenges found.', 'Няма завършени предизвикателства.')
                      : filter === 'participating'
                      ? t("You're not participating in any active challenges.", 'Не участвате в активно предизвикателство.')
                      : t('No challenges found.', 'Няма намерени предизвикателства.')
                  }
                  buttonText={t('Refresh', 'Обнови')}
                  onButtonPress={refreshChallenges}
                />
              )}
              
              {/* Load More Button */}
              {shouldShowLoadMore && (
                <TouchableOpacity 
                  style={[styles.joinButton, { backgroundColor: theme.colors.primary }]}
                  onPress={loadMoreChallenges}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.joinButtonText}>{t('Load More', 'Зареди още')}</Text>
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
