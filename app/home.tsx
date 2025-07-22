import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { usePoints } from '@/context/PointsContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import useHabitStats from '@/hooks/useHabitStats';
import analyticsService from '@/services/analyticsService';
import useGoalsManager from '@/hooks/useGoalsManager';

// Import components
import { DashboardStats } from '@/components/home/DashboardStats';
import QuickActions from '@/components/home/QuickActions';
import { GoalsList, GoalsHeader } from '@/components/home/GoalsList';
import EditGoalModal from '@/components/modals/EditGoalModal';

// Import styles
import { homeStyles } from '@/styles/Home.styles';

// Import types
import { EnhancedGoal, TimeFrequency } from '@/types/goal.types';
import useProfileManager from '@/hooks/useProfileManager';

export default function Home() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // State for UI
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<EnhancedGoal | null>(null);
  
  // Use the profile manager hook
  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
    loadProfile,
    getProfileDisplayIdentifier
  } = useProfileManager();
  
  // For compatibility with existing code
  const loading = profileLoading;
  const error = profileError;
  // Dummy functions for compatibility with existing code
  const setLoading = (value: boolean) => {};
  const setError = (value: string | null) => {};
  
  // The loadProfile function is now provided by useProfileManager

  // Add authentication redirect using useFocusEffect
  useFocusEffect(
    useCallback(() => {
      const checkAuth = async () => {
        try {
          if (!authLoading && !user) {
            console.log('No authenticated user found, redirecting to signin');
            await router.replace('/auth/signin');
          } else if (!authLoading && user) {
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
  
  // Get points context to handle daily check-ins
  const { awardDailyCheckIn } = usePoints();

  // Listen for firstDailyActivity events to process daily check-ins
  useEffect(() => {
    if (!user) return;
    
    // Handler for the firstDailyActivity event
    const handleFirstActivity = async (event: any) => {
      try {
        // Only process if the user ID matches
        if (event.detail?.userId === user.id && awardDailyCheckIn) {
          console.log('Processing daily check-in from event');
          await awardDailyCheckIn();
        }
      } catch (error) {
        console.error('Error processing daily check-in from event:', error);
      }
    };
    
    // Add event listener
    document.addEventListener('firstDailyActivity', handleFirstActivity);
    
    // Cleanup function to remove the event listener
    return () => {
      document.removeEventListener('firstDailyActivity', handleFirstActivity);
    };
  }, [user, awardDailyCheckIn]);

  // Get stats and goals data from custom hooks
  const { totalCO2Saved, totalActions, overallStreak, refreshStats } = useHabitStats();
  const { 
    goals, 
    updateGoal, 
    deleteGoal, 
    refreshGoals 
  } = useGoalsManager();

  const displayIdentifier = profile ? getProfileDisplayIdentifier() : '';

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

  // Get notification context
  const { addNotification } = useNotification();

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (err) {
      addNotification({
        type: 'toast',
        message: 'Failed to sign out. Please try again.',
        severity: 'error',
      });
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
        style={homeStyles.scrollView}
        contentContainerStyle={homeStyles.scrollContentContainer}
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

           {/* Go to Map Button */}
           <TouchableOpacity
             style={homeStyles.mapNavButton}
             onPress={() => router.push('/map')}
             accessibilityLabel="Go to map screen"
             accessibilityRole="button"
           >
             <Ionicons name="map-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
             <Text style={homeStyles.mapNavButtonText}>Open Sustainability Map</Text>
           </TouchableOpacity>

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
