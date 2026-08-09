import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
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
import { GoalsList, GoalsHeader } from '@/components/home/GoalsList';
import EditGoalModal from '@/components/modals/EditGoalModal';
import { AppButton, Card, Content, PageHeader, Screen } from '@/components/ui';
import { useAppTheme } from '@/theme';

// Import types
import { EnhancedGoal, TimeFrequency } from '@/types/goal.types';
import useProfileManager from '@/hooks/useProfileManager';

export default function Home() {
  const { theme } = useAppTheme();
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

  const metrics = [
    { label: 'Actions taken', value: `${totalActions || 0}`, icon: 'checkmark-circle-outline' as const },
    { label: 'CO₂ saved', value: `${totalCO2Saved?.toFixed(1) || '0.0'} kg`, icon: 'cloud-outline' as const },
    { label: 'Current streak', value: `${overallStreak || 0} days`, icon: 'flame-outline' as const },
  ];

  const actions = [
    { label: 'Log an action', detail: 'Record a sustainable choice', icon: 'add-circle-outline' as const, route: '/habits/log' as const },
    { label: 'Explore the map', detail: 'Find greener places nearby', icon: 'map-outline' as const, route: '/map' as const },
    { label: 'Join the community', detail: 'Take part in a challenge', icon: 'people-outline' as const, route: '/community' as const },
  ];

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Content wide>
          <PageHeader
            eyebrow="Your compass"
            title={`Welcome back${displayIdentifier ? `, ${displayIdentifier}` : ''}`}
            description="Keep your momentum visible and choose the next action that feels achievable today."
            action={isTabletOrLarger ? <AppButton label="Log action" icon="add" onPress={() => router.push('/habits/log')} /> : undefined}
          />

          <Card elevated style={{ backgroundColor: theme.colors.primary, borderColor: theme.colors.primary, padding: isTabletOrLarger ? 32 : 24, marginBottom: 18, overflow: 'hidden' }}>
            <View style={{ position: 'absolute', width: 260, height: 260, borderRadius: 130, right: -70, top: -110, backgroundColor: theme.colors.accent, opacity: 0.18 }} />
            <View style={{ flexDirection: isTabletOrLarger ? 'row' : 'column', justifyContent: 'space-between', alignItems: isTabletOrLarger ? 'center' : 'flex-start', gap: 20 }}>
              <View style={{ flex: 1, maxWidth: 600 }}>
                <Text style={[theme.typography.label, { color: theme.colors.accent, textTransform: 'uppercase', letterSpacing: 1.1 }]}>Your impact story</Text>
                <Text style={[theme.typography.h1, { color: '#FFFFFF', marginTop: 8 }]}>Consistency is climate action.</Text>
                <Text style={[theme.typography.body, { color: '#D8EAE0', marginTop: 10 }]}>Every logged habit makes your progress easier to understand—and easier to repeat.</Text>
              </View>
              <AppButton label="View history" icon="arrow-forward" variant="secondary" onPress={() => router.push('/habits/history')} style={{ minWidth: 160 }} />
            </View>
          </Card>

          <View style={{ flexDirection: isTabletOrLarger ? 'row' : 'column', gap: 12, marginBottom: 28 }}>
            {metrics.map((metric) => (
              <Card key={metric.label} style={{ flex: 1, padding: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={[theme.typography.metric, { color: theme.colors.text }]}>{metric.value}</Text>
                    <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 4 }]}>{metric.label}</Text>
                  </View>
                  <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={metric.icon} size={21} color={theme.colors.primary} />
                  </View>
                </View>
              </Card>
            ))}
          </View>

          <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 14 }]}>Choose your next move</Text>
          <View style={{ flexDirection: isTabletOrLarger ? 'row' : 'column', gap: 12, marginBottom: 32 }}>
            {actions.map((action) => (
              <Card key={action.label} style={{ flex: 1, padding: 20 }}>
                <View style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: theme.colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Ionicons name={action.icon} size={22} color={theme.colors.primary} />
                </View>
                <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{action.label}</Text>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 4, marginBottom: 16 }]}>{action.detail}</Text>
                <AppButton label="Open" variant="ghost" icon="arrow-forward" onPress={() => router.push(action.route)} />
              </Card>
            ))}
          </View>

          {refreshError ? <Text style={[theme.typography.bodySmall, { color: theme.colors.danger, marginBottom: 12 }]}>{refreshError}</Text> : null}
          <Card style={{ padding: 20, marginBottom: 26 }}>
            <GoalsHeader onAddGoal={handleAddGoal} />
            <GoalsList goals={goals} onEditGoal={handleEditGoal} />
          </Card>
        </Content>
      </ScrollView>

      <EditGoalModal
        visible={isEditModalVisible}
        goal={selectedGoal}
        onClose={() => setIsEditModalVisible(false)}
        onSave={handleUpdateGoal}
        onDelete={handleDeleteGoal}
        loading={loading}
      />
    </Screen>
  );
}
