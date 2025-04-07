import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from './context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import useHabitStats from './hooks/useHabitStats';
import analyticsService from './services/analyticsService';
import useGoalsManager from './hooks/useGoalsManager';

// Import components
import { DashboardStats } from './components/home/DashboardStats';
import QuickActions from './components/home/QuickActions';
import { GoalsList, GoalsHeader } from './components/home/GoalsList';
import EditGoalModal from './components/modals/EditGoalModal';

// Import styles
import { homeStyles } from './styles/Home.styles';

// Import types
import { EnhancedGoal, TimeFrequency } from './components/home/types/goal.types';
import { Profile } from './services/profile/types';
import { fetchUserProfile, getDisplayIdentifier } from './services/profile';

export default function Home() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { user, signOut, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();
  
  // State for UI
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<EnhancedGoal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Define loadProfile as a regular function to avoid dependency cycles
    const loadProfile = async () => {
      try {
        if (!user) {
          console.log('No user available to load profile');
          return;
        }
  
        // Only set loading to true if we don't already have a profile
        if (!profile) {
          setLoading(true);
        }
        
        // Fetch profile data
        console.log('Fetching profile data for user:', user.id);
        const profileData = await fetchUserProfile(user.id);
        
        if (profileData) {
          console.log('Profile data received:', JSON.stringify(profileData, null, 2));
          
          // Ensure all required fields are present with defaults if needed
          // Parse interests if it's a string (this is a backup in case it wasn't parsed in profileService)
          let interests = profileData.interests || [];
          if (typeof interests === 'string') {
            try {
              interests = JSON.parse(interests);
              console.log('Parsed interests in component from string to array:', interests);
            } catch (parseErr) {
              console.error('Error parsing interests JSON string in component:', parseErr);
              interests = [];
            }
          }
          
          const processedProfile = {
            ...profileData,
            display_name: profileData.display_name || '',
            interests: interests,
            avatar_url: profileData.avatar_url || null,
            is_anonymous: typeof profileData.is_anonymous === 'boolean' ? profileData.is_anonymous : false
          };
          
          console.log('Processed profile data:', JSON.stringify(processedProfile, null, 2));
          setProfile(processedProfile);
          console.log('Profile state updated with processed data');
        } else {
          console.warn('No profile data returned from fetchUserProfile');
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

  // Add authentication redirect using useFocusEffect
  useFocusEffect(
    useCallback(() => {
      const checkAuth = async () => {
        try {
          if (!authLoading && !user) {
            console.log('No authenticated user found, redirecting to signin');
            await router.replace('/auth/signin');
          } else if (!authLoading && user) {
            console.log('Authenticated user:', user.id);
            // Load profile data
            await loadProfile();
          }
        } catch (error) {
          console.error('Navigation error:', error);
        }
      };

      // Add slight delay to ensure navigation is ready
      const timeoutId = setTimeout(checkAuth, 100);
      return () => clearTimeout(timeoutId);
    }, [user, authLoading, router])
  );

  // Analytics tracking
  useEffect(() => {
    analyticsService.trackScreenView('Home');
    // Set user properties for better analytics segmentation
    if (user) {
      analyticsService.setUserProperties({
        userEmail: user.email || 'unknown',
        userCreatedAt: user.created_at || 'unknown'
      });
    }
  }, [user]);

  // Get stats and goals data from custom hooks
  const { totalCO2Saved, totalActions, overallStreak, refreshStats } = useHabitStats();
  const { 
    goals, 
    updateGoal, 
    deleteGoal, 
    refreshGoals 
  } = useGoalsManager();

  const displayIdentifier = profile ? getDisplayIdentifier(profile) : '';

  // Refresh data when screen comes into focus with debounce to prevent infinite loops
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [lastRefreshAttempt, setLastRefreshAttempt] = useState(0);
  
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      // Only refresh if not already refreshing and at least 5 seconds have passed since last attempt
      if (!isRefreshing && (now - lastRefreshAttempt > 5000)) {
        const loadData = async () => {
          setIsRefreshing(true);
          setLastRefreshAttempt(now);
          setRefreshError(null);
          
          try {
            // Use Promise.allSettled to continue even if one promise fails
            const results = await Promise.allSettled([
              refreshStats(),
              refreshGoals()
            ]);
            
            // Check for any rejected promises
            const errors = results
              .filter(result => result.status === 'rejected')
              .map(result => (result as PromiseRejectedResult).reason?.message || 'Unknown error');
            
            if (errors.length > 0) {
              console.error('Refresh errors:', errors);
              setRefreshError(errors.join(', '));
            }
          } catch (error) {
            console.error('Error refreshing data:', error);
            setRefreshError(error instanceof Error ? error.message : 'Failed to refresh data');
          } finally {
            setIsRefreshing(false);
          }
        };
        
        loadData();
      }
      
      // Cleanup function
      return () => {
        // Any cleanup code if needed
      };
    }, [refreshStats, refreshGoals, isRefreshing, lastRefreshAttempt])
  );

  // Handle goal editing
  const handleEditGoal = (goal: EnhancedGoal) => {
    setSelectedGoal(goal);
    setIsEditModalVisible(true);
  };

  // Handle goal update
  const handleUpdateGoal = async (
    goalId: string,
    updates: {
      goalName: string;
      category: string;
      targetValue: number;
      currentValue: number;
      timeFrequency: TimeFrequency;
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateGoal(goalId, updates);
      setLoading(false);
      return result;
    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Handle goal deletion
  const handleDeleteGoal = async (goalId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await deleteGoal(goalId);
      setLoading(false);
      return result;
    } catch (err) {
      setLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (err) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  // Handle adding a new goal
  const handleAddGoal = () => {
    router.push('habits/goal' as any);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={homeStyles.keyboardAvoidingContainer}
    >
      <ScrollView
        style={homeStyles.scrollContent}
        contentContainerStyle={{ paddingBottom: 40, alignItems: isTabletOrLarger ? 'center' : 'stretch' }}
      >
        <View style={[homeStyles.content, isTabletOrLarger && { width: '60%', maxWidth: 700 }]}>
          {/* Header with welcome message and logout */}
          <View style={homeStyles.header}>
            <View>
              <Text style={homeStyles.welcomeText}>Welcome back,</Text>
              <Text style={homeStyles.userName}>{displayIdentifier || ''}</Text>
            </View>
            <View style={homeStyles.headerButtons}>
              <TouchableOpacity
                style={homeStyles.headerButton}
                onPress={() => router.replace('/profile')}
              >
                <Ionicons name="person-outline" size={24} color="#2E7D32" />
              </TouchableOpacity>
              <TouchableOpacity
                style={homeStyles.headerButton}
                onPress={handleSignOut}
              >
                <Ionicons name="log-out-outline" size={24} color="#2E7D32" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Dashboard Stats */}
          <DashboardStats
            totalActions={totalActions}
            totalCO2Saved={totalCO2Saved}
            overallStreak={overallStreak}
          />

          {/* Quick Actions */}
          <QuickActions />

          {/* Goals Section */}
          <View style={homeStyles.section}>
            <GoalsHeader onAddGoal={handleAddGoal} />
            <GoalsList 
              goals={goals} 
              onEditGoal={handleEditGoal} 
            />
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            style={homeStyles.signOutButton}
            onPress={handleSignOut}
            disabled={loading}
          >
            <Text style={homeStyles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Goal Modal */}
      <EditGoalModal
        visible={isEditModalVisible}
        goal={selectedGoal}
        onClose={() => setIsEditModalVisible(false)}
        onSave={handleUpdateGoal}
        onDelete={handleDeleteGoal}
        loading={loading}
      />
    </KeyboardAvoidingView>
  );
}
