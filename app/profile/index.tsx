import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useBadges } from '@/context/BadgesContext';
import { Ionicons } from '@expo/vector-icons';
import profileStyles from '@/styles/Profile.styles';
import useProfileManager from '@/hooks/useProfileManager';
import pointsService from '@/services/community/pointsService';
import useSimplePointHistory from '@/hooks/useSimplePointHistory';
import useHabitStats from '@/hooks/useHabitStats';
import PointsSummary from '@/components/community/points/PointsSummary';
import BadgeSummary from '@/components/badges/BadgeSummary';
import { PointSource } from '@/types/community/points';
import { formatPointSource } from '@/utils/pointsFormatters';
import { useAppTheme } from '@/theme';
import { knowledgeService, type KnowledgeProgress } from '@/features/knowledge';

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { theme, preference, setPreference } = useAppTheme();
  const [imageLoadError, setImageLoadError] = useState(false);
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [learningProgress, setLearningProgress] = useState<KnowledgeProgress[]>([]);
  const styles = profileStyles;
  
  // Use the profile manager hook
  const {
    profile,
    isLoading,
    error,
    loadProfile,
    getProfileDisplayIdentifier,
    resetProfile,
    trackProfileView
  } = useProfileManager();
  
  // Points state managed locally
  const [points, setPoints] = useState<string>('0');
const [isPointsLoading, setIsPointsLoading] = useState<boolean>(true);

  // Use badges hook to get user badges
  const { userBadges, isLoading: isBadgesLoading, loadUserBadges } = useBadges();

useEffect(() => {
  let isMounted = true;
  async function fetchPoints() {
    setIsPointsLoading(true);
    try {
      if (user?.id) {
        const balance = await pointsService.getUserPointBalance(user.id);
        if (isMounted) setPoints(balance.total.toLocaleString());
      }
    } catch (e) {
      if (isMounted) setPoints('0');
    } finally {
      if (isMounted) setIsPointsLoading(false);
    }
  }
  fetchPoints();
  return () => { isMounted = false; };
}, [user?.id]);

useEffect(() => {
  if (user?.id) void knowledgeService.getProgress(user.id).then(setLearningProgress);
}, [user?.id]);
  const { 
    historyByDate, 
    activeFilters, 
    toggleFilter, 
    clearFilters, 
    isLoading: isHistoryLoading,
    fetchHistory 
  } = useSimplePointHistory();
  const { overallStreak: loginStreak, loadingStats: isStreakLoading } = useHabitStats();
  
  // Get unique point sources from history
  const availableSources = Object.keys(historyByDate)
    .flatMap(date => historyByDate[date])
    .map(event => event.source)
    .filter((value, index, self) => self.indexOf(value) === index) as PointSource[];

  // Use ref to track if we've already loaded history on this focus
  const historyLoadedRef = useRef(false);
  
  // Ensure point history is loaded when profile screen is focused
  useFocusEffect(
    React.useCallback(() => {
      // Only fetch history if we haven't already and user exists
      if (user?.id && !historyLoadedRef.current) {
        historyLoadedRef.current = true;
        fetchHistory();
      }
      
      // Reset flag when screen loses focus
      return () => {
        historyLoadedRef.current = false;
      };
    }, [user?.id, fetchHistory])
  );

  // Redirect to signin if user is not authenticated and manage initial profile loading
  useEffect(() => {
    // Reset image error state when component mounts
    setImageLoadError(false);
    
    // Only check after auth loading is complete
    if (!authLoading) {
      if (!user) {
        router.replace('/auth/signin');
        return; // Exit early if no user
      } 
      
      // Only load profile once when component mounts or user changes
      const initializeProfile = async () => {
        if (user && !profile && !isLoading) {
          try {
            await loadProfile();
          } catch (error) {
            console.error('Failed to load profile during initialization:', error);
          }
        }
      };
      
      initializeProfile();
    }
    // This effect should only run when these dependencies change
    // Intentionally excluding profile and isLoading to prevent re-render loops
  }, [user, authLoading, router, loadProfile]);



  // Initial data loading on focus
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      
      // Track view only once
      if (!hasTrackedView && user) {
        trackProfileView('Profile');
        setHasTrackedView(true);
      }
      
      // Initial data loading when screen comes into focus
      const initialLoad = async () => {
        if (!authLoading && user && isMounted) {
          try {
            // Load points, history and badges data in parallel
            await Promise.all([
              fetchHistory(),
              loadUserBadges()
            ]);
            
            // Intentionally NOT refreshing streak here to avoid loops
            // The fixed streak value (3) from the hook will be used instead
          } catch (err) {
            console.error('Error loading initial data:', err);
          }
        }
      };
      
      initialLoad();
      
      return () => {
        isMounted = false;
      };
    }, [
      user, 
      authLoading, 
      hasTrackedView, 
      trackProfileView,
      fetchHistory,
      loadUserBadges
    ])
  );

  const handleEditProfile = () => {
    router.push('/profile/edit' as any);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      resetProfile(); // Clear profile data on sign out
      router.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Only show loading indicator if we're actually loading and have a user
  // This prevents potential infinite loading states
  if (isLoading && user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Loading your profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
      </View>
    );
  }

  if (!profile) {

    return null;
  }


  const displayIdentifier = getProfileDisplayIdentifier();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.keyboardAvoidingContainer, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      <ScrollView
        style={[styles.scrollContent, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={[styles.scrollContentContainer, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentContainer, { maxWidth: 1040 }, isTabletOrLarger && { width: '100%' }]}>
        {/* Header */}
        <View style={styles.pageHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.replace('/home')}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Your profile</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Identity, achievements, preferences, and account.</Text>
          </View>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}>
          {/* Avatar and Name */}
          <View style={styles.avatarContainer}>
            {profile.avatar_url && !imageLoadError ? (
              <Image 
                source={{ uri: profile.avatar_url }} 
                style={styles.avatar}
                onError={(e) => {
                  console.error('Error loading profile image:', e.nativeEvent.error);
                  setImageLoadError(true);
                }}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primarySoft }]}>
                <Text style={[styles.avatarPlaceholderText, { color: theme.colors.primary }]}>{displayIdentifier.charAt(0).toUpperCase()}</Text>
              </View>
            )}
          </View>

          <View style={styles.nameContainer}>
            <Text style={[styles.displayName, { color: theme.colors.text }]}>{displayIdentifier}</Text>
            {profile.is_anonymous && (
              <Text style={[styles.anonymousIndicator, { color: theme.colors.textMuted }]}>Anonymous mode</Text>
            )}
          </View>

          <TouchableOpacity style={[styles.editButton, { backgroundColor: theme.colors.primary }]} onPress={handleEditProfile}>
            <Ionicons name="pencil-outline" size={16} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Interests Section */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sustainability interests</Text>
          <View style={styles.interestsContainer}>
            {Array.isArray(profile.interests) && profile.interests.length > 0 ? (
              profile.interests.map((interest) => (
                <View key={interest} style={[styles.interestItem, { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.borderStrong }]}>
                  <Text style={[styles.interestText, { color: theme.colors.primary }]}>{interest}</Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyInterestsText, { color: theme.colors.textMuted }]}>No interests selected yet.</Text>
            )}
          </View>
        </View>

        {/* Points Summary Section */}
        <TouchableOpacity accessibilityRole="link" onPress={() => router.push('/knowledge' as any)} style={[styles.sectionContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }] }>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Knowledge Hub progress</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 5 }]}>{learningProgress.filter((entry) => entry.completed).length} completed • {learningProgress.filter((entry) => !entry.completed && entry.percent > 0).length} in progress</Text>
            </View>
            <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="library-outline" size={20} color={theme.colors.primary} /></View>
          </View>
        </TouchableOpacity>

        {/* Points Summary Section */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Green points</Text>
          {isPointsLoading ? (
            <View style={styles.loadingPoints}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : (
            <PointsSummary points={points} streak={loginStreak} />
          )}
        </View>
        
        {/* Badges Summary Section */}
        {isBadgesLoading ? (
          <View style={[styles.sectionContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Achievements</Text>
            <View style={styles.loadingPoints}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          </View>
        ) : (
          <BadgeSummary 
            badgeCount={userBadges.length} 
            totalBadgeCount={userBadges.length > 0 ? 20 : 0} /* Using a placeholder value for total badge count */
            recentBadgeNames={userBadges
              .slice(0, 3)
              .map(badge => badge.badge?.name || '')
              .filter(name => name !== '')}
            userName={displayIdentifier}
          />
        )}
        
        {/* Points History Section */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Points history</Text>
          
          {/* Filters */}
          <View style={styles.filterContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.filterScrollView}
            >
              {/* All filter */}
              <TouchableOpacity 
                style={[
                  styles.filterChip, 
                  activeFilters.length === 0 && styles.filterChipActive
                ]}
                onPress={clearFilters}
              >
                <Text 
                  style={[
                    styles.filterChipText, 
                    activeFilters.length === 0 && styles.filterChipTextActive
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>

              {/* Source-specific filters */}
              {availableSources.map(source => (
                <TouchableOpacity 
                  key={source}
                  style={[
                    styles.filterChip, 
                    activeFilters.includes(source) && styles.filterChipActive
                  ]}
                  onPress={() => toggleFilter(source)}
                >
                  <Text 
                    style={[
                      styles.filterChipText, 
                      activeFilters.includes(source) && styles.filterChipTextActive
                    ]}
                  >
                    {formatPointSource(source)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* History List */}
          <View style={styles.historyListContainer}>
            {isHistoryLoading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : Object.keys(historyByDate).length > 0 ? (
              Object.entries(historyByDate)
                .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                .map(([date, events]) => (
                  <View key={date} style={styles.historyDateGroup}>
                    <Text style={styles.historyDate}>{date}</Text>
                    {events.map(event => (
                      <View key={event.id} style={styles.historyItem}>
                        <View style={styles.pointSourceIcon}>
                          <Ionicons 
                            name={
                              event.source === 'daily_login' ? 'calendar-outline' :
                              event.source === 'habit_log' ? 'leaf-outline' :
                              'chatbubbles-outline'
                            } 
                            size={20} 
                            color={theme.colors.primary}
                          />
                        </View>

                        <View style={styles.historyItemContent}>
                          <View style={styles.historyItemHeader}>
                            <Text style={styles.pointsDescription}>
                              {formatPointSource(event.source)}
                            </Text>
                            <Text style={styles.pointsAmount}>+{event.points}</Text>
                          </View>
                          <Text style={styles.pointsDescription}>
                            {`You earned ${event.points} points for ${formatPointSource(event.source).toLowerCase()}!`}
                          </Text>
                          <Text style={styles.historyItemDate}>
                            {new Date(event.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No points history found. Start earning points by logging in daily and tracking sustainable habits!
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.sectionContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Appearance</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(['system', 'light', 'dark'] as const).map((option) => {
              const active = preference === option;
              return (
                <TouchableOpacity
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setPreference(option)}
                  style={{ minHeight: 44, minWidth: 92, paddingHorizontal: 16, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: active ? theme.colors.primary : theme.colors.border, backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface }}
                >
                  <Text style={[theme.typography.label, { color: active ? theme.colors.primary : theme.colors.text }]}>{option.charAt(0).toUpperCase() + option.slice(1)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={[styles.signOutButton, { borderColor: theme.colors.danger, borderWidth: 1, minHeight: 48 }]} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color={theme.colors.danger} style={{ marginRight: 8 }} />
          <Text style={[styles.signOutButtonText, { color: theme.colors.danger }]}>Sign out</Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
