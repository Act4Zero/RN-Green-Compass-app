import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import profileStyles from '@/styles/Profile.styles';
import useProfileManager from '@/hooks/useProfileManager';
import usePointsBalance from '@/hooks/community/points/usePointsBalance';
import usePointsHistory from '@/hooks/community/points/usePointsHistory';
import useHabitStats from '@/hooks/useHabitStats';
import PointsSummary from '@/components/community/points/PointsSummary';
import { PointSource } from '@/types/community/points';
import { formatPointSource } from '@/utils/pointsFormatters';

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const [imageLoadError, setImageLoadError] = useState(false);
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const [hasTrackedView, setHasTrackedView] = useState(false);
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
  
  // Points related hooks
  const { formattedPoints, refresh: refreshBalance, isLoading: isBalanceLoading } = usePointsBalance();
  const { 
    historyByDate, 
    activeFilters, 
    toggleFilter, 
    clearFilters, 
    isLoading: isHistoryLoading,
    refresh: refreshHistory 
  } = usePointsHistory();
  const { overallStreak: loginStreak, loadingStats: isStreakLoading } = useHabitStats();
  
  // Get unique point sources from history
  const availableSources = Object.keys(historyByDate)
    .flatMap(date => historyByDate[date])
    .map(event => event.source)
    .filter((value, index, self) => self.indexOf(value) === index) as PointSource[];
    
  // Track if points data is loading - now including streak loading
  const isPointsLoading = isBalanceLoading || isHistoryLoading || isStreakLoading;



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
            // Load points and history data in parallel
            await Promise.all([
              refreshBalance(),
              refreshHistory()
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
      refreshBalance,
      refreshHistory
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
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
      style={styles.keyboardAvoidingContainer}
    >
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: 40, alignItems: isTabletOrLarger ? 'center' : 'stretch' }}
      >
        <View style={styles.pageContainer}>
          <View style={styles.pageHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.replace('/home')}
            >
              <Ionicons name="arrow-back" size={24} color="#2E7D32" />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>Profile</Text>
              <Text style={styles.subtitle}>Manage your personal information</Text>
            </View>
          </View>
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
              <View style={styles.avatarPlaceholder}>
                <Text>{displayIdentifier.charAt(0).toUpperCase()}</Text>
              </View>
            )}
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.displayName}>{displayIdentifier}</Text>
            {profile.is_anonymous && (
              <Text style={styles.anonymousIndicator}>Anonymous Mode</Text>
            )}
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Your Sustainability Interests</Text>
          <View style={styles.interestsContainer}>
            {Array.isArray(profile.interests) && profile.interests.length > 0 ? (
              profile.interests.map((interest) => (
                <View key={interest} style={styles.interestItem}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))
            ) : (
              <Text>No interests selected yet.</Text>
            )}
          </View>

          {/* Points Section */}
          <Text style={styles.sectionTitle}>Green Points</Text>
          <View style={styles.pointsSection}>
            {isPointsLoading ? (
              <ActivityIndicator size="small" color="#2E7D32" />
            ) : (
              <PointsSummary 
                points={formattedPoints} 
                streak={loginStreak} 
              />
            )}

            {/* Points History */}
            <View style={styles.pointsHistoryContainer}>
              <Text style={styles.sectionTitle}>Points History</Text>
              
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
              
              {/* History Items */}
              {isHistoryLoading ? (
                <ActivityIndicator size="small" color="#2E7D32" />
              ) : Object.keys(historyByDate).length > 0 ? (
                Object.entries(historyByDate)
                  .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                  .map(([date, events]) => (
                    <View key={date}>
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
                              color="#2E7D32" 
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

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
