import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useAuth } from './context/AuthContext';
import Button from './components/Button';
import Input from './components/Input';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation, useFocusEffect } from 'expo-router';
import useHabitStats from './hooks/useHabitStats';
import useGoals from './hooks/useGoals';

interface Styles {
  keyboardAvoidingContainer: ViewStyle;
  scrollContent: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  welcomeText: TextStyle;
  userName: TextStyle;
  card: ViewStyle;
  cardTitle: TextStyle;
  cardContent: TextStyle;
  statsContainer: ViewStyle;
  statItem: ViewStyle;
  statValue: TextStyle;
  statLabel: TextStyle;
  actionButton: ViewStyle;
  actionButtonText: TextStyle;
  logoutButton: ViewStyle;
  section: ViewStyle;
  sectionHeader: ViewStyle;
  addGoalButton: ViewStyle;
  addGoalText: TextStyle;
  goalsContainer: ViewStyle;
  scrollViewStyle: ViewStyle;
  goalsRow: ViewStyle;
  goalCard: ViewStyle;
  goalCardHeader: ViewStyle;
  goalTitle: TextStyle;
  goalCategory: TextStyle;
  goalProgress: ViewStyle;
  goalProgressBar: ViewStyle;
  goalProgressFill: ViewStyle;
  goalProgressText: TextStyle;
  goalActions: ViewStyle;
  goalActionButton: ViewStyle;
  goalActionText: TextStyle;
  quickActionsContainer: ViewStyle;
  quickActionItem: ViewStyle;
  quickActionIcon: ViewStyle;
  quickActionText: TextStyle;
  modalContainer: ViewStyle;
  modalContent: ViewStyle;
  modalHeader: ViewStyle;
  modalTitle: TextStyle;
  modalCloseButton: ViewStyle;
  modalForm: ViewStyle;
  modalLabel: TextStyle;
  modalInput: ViewStyle;
  modalButtonContainer: ViewStyle;
  emptyGoalsContainer: ViewStyle;
  emptyGoalsText: TextStyle;
  timeChip: ViewStyle;
  timeChipText: TextStyle;
  deleteButton: ViewStyle;
  deleteButtonText: TextStyle;
}

// Time-bound frequency options for goals
type TimeFrequency = 'daily' | 'weekly' | 'monthly' | 'none';

// Enhanced goal type with time-bound information
interface EnhancedGoal {
  id: string;
  title: string;
  category: string;
  progress: number;
  target: number;
  timeFrequency: TimeFrequency;
  startDate: string;
  endDate?: string | null;
  originalGoal: any;
}

export default function Home() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { user, signOut } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guard state to prevent accidental "pop" or back navigation
  // until we explicitly allow it (for sign out, etc.).
  const [shouldPreventBack, setShouldPreventBack] = useState(true);

  const { totalCO2Saved, totalActions, overallStreak } = useHabitStats();
  const { userGoals, loading: goalsLoading, updateExistingGoal, deleteExistingGoal, refreshGoals } = useGoals();

  // Use real goals data from the database with enhanced structure
  const [goals, setGoals] = useState<EnhancedGoal[]>([]);
  
  // State for goal editing modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<EnhancedGoal | null>(null);
  const [editedGoalName, setEditedGoalName] = useState('');
  const [editedGoalCategory, setEditedGoalCategory] = useState('');
  const [editedGoalTarget, setEditedGoalTarget] = useState('');
  const [editedGoalCurrent, setEditedGoalCurrent] = useState('');
  const [editedTimeFrequency, setEditedTimeFrequency] = useState<TimeFrequency>('none');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [pendingDeleteGoalId, setPendingDeleteGoalId] = useState<string | null>(null);

  // Helper function to determine time frequency from goal dates
  const determineTimeFrequency = useCallback((goal: any): TimeFrequency => {
    if (!goal.end_date) return 'none';
    
    const startDate = new Date(goal.start_date);
    const endDate = new Date(goal.end_date);
    const daysDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) return 'daily';
    if (daysDiff <= 7) return 'weekly';
    if (daysDiff <= 31) return 'monthly';
    return 'none';
  }, []);

  // Helper function to check if a time-bound goal needs to be reset
  const shouldResetGoalProgress = useCallback((goal: any): boolean => {
    if (!goal.end_date) return false;
    
    const timeFrequency = determineTimeFrequency(goal);
    if (timeFrequency === 'none') return false;
    
    const today = new Date();
    const lastUpdated = new Date(goal.updated_at);
    
    // Reset daily goals if last updated was yesterday or earlier
    if (timeFrequency === 'daily') {
      return today.getDate() !== lastUpdated.getDate() || 
             today.getMonth() !== lastUpdated.getMonth() || 
             today.getFullYear() !== lastUpdated.getFullYear();
    }
    
    // Reset weekly goals if last updated was in a different week
    if (timeFrequency === 'weekly') {
      const todayWeek = Math.floor(today.getDate() / 7);
      const lastUpdatedWeek = Math.floor(lastUpdated.getDate() / 7);
      return todayWeek !== lastUpdatedWeek || 
             today.getMonth() !== lastUpdated.getMonth() || 
             today.getFullYear() !== lastUpdated.getFullYear();
    }
    
    // Reset monthly goals if last updated was in a different month
    if (timeFrequency === 'monthly') {
      return today.getMonth() !== lastUpdated.getMonth() || 
             today.getFullYear() !== lastUpdated.getFullYear();
    }
    
    return false;
  }, [determineTimeFrequency]);

  // Load goals only once on initial component mount
  useEffect(() => {
    // Only load goals if we don't already have them
    if (userGoals.length === 0 && !goalsLoading) {
      refreshGoals();
    }
    // We intentionally don't include userGoals in the dependency array
    // to prevent refresh loops
  }, []);
  
  // Manual refresh function that can be called when needed
  const handleManualRefresh = useCallback(() => {
    if (!goalsLoading) {
      refreshGoals();
    }
  }, [refreshGoals, goalsLoading]);

  // Update goals when userGoals changes
  useEffect(() => {
    if (userGoals && userGoals.length > 0) {
      // Check for time-bound goals that need to be reset
      const goalsToReset = userGoals.filter(goal => shouldResetGoalProgress(goal));
      
      // Reset progress for time-bound goals if needed
      if (goalsToReset.length > 0) {
        Promise.all(
          goalsToReset.map(goal => 
            updateExistingGoal(goal.id, { 
              current_value: 0,
              updated_at: new Date().toISOString()
            })
          )
        ).then(() => {
          // Refresh goals after resetting
          refreshGoals();
        }).catch(err => {
          console.error('Error resetting time-bound goals:', err);
        });
        return; // Exit early as we'll refresh goals after reset
      }
      
      // Filter out completed goals (where current_value >= target_value)
      const activeGoals = userGoals.filter(goal => goal.current_value < goal.target_value);
      
      // Prevent duplicates by category
      const uniqueCategories = new Set<string>();
      const uniqueGoals = activeGoals.filter(goal => {
        if (!goal.category) return true; // Keep goals without category
        
        // If we haven't seen this category before, keep it
        if (!uniqueCategories.has(goal.category)) {
          uniqueCategories.add(goal.category);
          return true;
        }
        
        // Otherwise, it's a duplicate category
        return false;
      });
      
      // Transform userGoals to match the expected format with time frequency
      const formattedGoals = uniqueGoals.map((goal) => ({
        id: goal.id,
        title: goal.goal_name, // Using goal_name instead of name to match DB schema
        category: goal.category || 'other',
        progress: goal.current_value || 0, // Using current_value instead of progress
        target: goal.target_value || 5, // Using target_value instead of target
        timeFrequency: determineTimeFrequency(goal),
        startDate: goal.start_date,
        endDate: goal.end_date,
        // Store the original goal object for easier updates
        originalGoal: goal,
      }));
      setGoals(formattedGoals);
    } else {
      setGoals([]);
    }
  }, [userGoals, determineTimeFrequency, shouldResetGoalProgress, updateExistingGoal, refreshGoals]);

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1) Temporarily disable the back-navigation guard
      setShouldPreventBack(false);

      const { error } = await signOut();

      if (error) {
        // If sign-out fails, re-enable guard
        setShouldPreventBack(true);

        setError('Failed to sign out. Please try again.');
        Alert.alert('Error', 'Failed to sign out. Please try again.');
      } else {
        // Redirect to signin screen after successful logout
        router.replace('/auth/signin');
      }
    } catch (err) {
      // If anything unexpected happens, re-enable guard
      setShouldPreventBack(true);

      setError('An unexpected error occurred. Please try again.');
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prevent "back" navigation unless shouldPreventBack is false
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        if (!shouldPreventBack) {
          // If we explicitly turned off prevention, let them navigate
          return;
        }
        // Otherwise, block navigation
        e.preventDefault();
      });

      return unsubscribe;
    }, [navigation, shouldPreventBack])
  );

  // Open edit modal and set initial values
  const handleEditGoal = (goal: EnhancedGoal) => {
    setSelectedGoal(goal);
    setEditedGoalName(goal.title);
    setEditedGoalCategory(goal.category);
    setEditedGoalTarget(goal.target.toString());
    setEditedGoalCurrent(goal.progress.toString());
    setEditedTimeFrequency(goal.timeFrequency);
    setIsEditModalVisible(true);
  };

  // Close modal and reset values
  const handleCloseModal = () => {
    setIsEditModalVisible(false);
    setSelectedGoal(null);
    setEditedGoalName('');
    setEditedGoalCategory('');
    setEditedGoalTarget('');
    setEditedGoalCurrent('');
    setEditedTimeFrequency('none');
    setError(null);
  };
  
  // Handle goal deletion
  const handleDeleteGoal = async () => {
    if (!selectedGoal || !selectedGoal.originalGoal) {
      console.log('No goal selected for deletion or missing original goal data');
      return;
    }
    
    // Get the original goal ID from Supabase
    const originalGoalId = selectedGoal.originalGoal.id;
    const goalTitle = selectedGoal.title;
    console.log('Attempting to delete goal:', originalGoalId, goalTitle);
    
    // Close the modal first
    setIsEditModalVisible(false);
    
    // Set loading state
    setUpdateLoading(true);
    setError(null);
    
    try {
      console.log('Calling deleteExistingGoal with ID:', originalGoalId);
      const success = await deleteExistingGoal(originalGoalId);
      console.log('Delete result:', success);
      
      if (success) {
        console.log('Goal deleted successfully');
        // Force refresh goals after deletion
        refreshGoals();
      } else {
        console.log('Failed to delete goal');
        setError('Failed to delete goal. Please try again.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error deleting goal:', err);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Validate goal name to prevent script injection and ensure proper format
  const validateGoalName = (name: string) => {
    const trimmedName = name.trim();
    
    // Check if empty
    if (!trimmedName) {
      setError('Goal name is required');
      return false;
    }
    
    // Check length
    if (trimmedName.length > 50) {
      setError('Goal name must be less than 50 characters');
      return false;
    }
    
    // Check for potentially dangerous characters or script tags
    const dangerousCharsRegex = /<script|<\/?[a-z]+[^>]*>|javascript:|onerror=|onclick=|onload=/i;
    if (dangerousCharsRegex.test(trimmedName)) {
      setError('Goal name contains invalid characters');
      return false;
    }
    
    return true;
  };
  
  // Validate numeric input to ensure it's a valid number and within reasonable range
  const validateNumericInput = (value: string, fieldName: string, minValue: number, maxValue: number) => {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      setError(`${fieldName} must be a valid number`);
      return false;
    }
    
    if (numValue < minValue) {
      setError(`${fieldName} must be at least ${minValue}`);
      return false;
    }
    
    if (numValue > maxValue) {
      setError(`${fieldName} must be less than ${maxValue}`);
      return false;
    }
    
    return true;
  };
  
  // Save updated goal
  const handleSaveGoal = async () => {
    if (!selectedGoal) return;
    
    setUpdateLoading(true);
    setError(null);
    
    try {
      // Sanitize inputs
      const sanitizedGoalName = editedGoalName.trim();
      const sanitizedGoalCategory = editedGoalCategory.trim();
      
      // Validate goal name
      if (!validateGoalName(sanitizedGoalName)) {
        setUpdateLoading(false);
        return;
      }
      
      // Validate target value (positive number, reasonable maximum)
      if (!validateNumericInput(editedGoalTarget, 'Target value', 0.1, 1000000)) {
        setUpdateLoading(false);
        return;
      }
      const targetValue = parseFloat(editedGoalTarget);
      
      // Validate current value (non-negative number, reasonable maximum)
      if (!validateNumericInput(editedGoalCurrent, 'Current value', 0, 1000000)) {
        setUpdateLoading(false);
        return;
      }
      const currentValue = parseFloat(editedGoalCurrent);
      
      // Calculate dates based on time frequency
      let startDate = selectedGoal.startDate;
      let endDate = selectedGoal.endDate;
      
      if (editedTimeFrequency !== selectedGoal.timeFrequency) {
        // If time frequency has changed, update the dates
        if (editedTimeFrequency === 'none') {
          // If changing to non-time-bound, remove end date
          endDate = null;
        } else {
          // Set start date to today
          startDate = new Date().toISOString().split('T')[0];
          
          // Calculate end date based on frequency
          const endDateObj = new Date();
          if (editedTimeFrequency === 'daily') {
            endDateObj.setDate(endDateObj.getDate() + 1);
          } else if (editedTimeFrequency === 'weekly') {
            endDateObj.setDate(endDateObj.getDate() + 7);
          } else if (editedTimeFrequency === 'monthly') {
            endDateObj.setMonth(endDateObj.getMonth() + 1);
          }
          endDate = endDateObj.toISOString().split('T')[0];
        }
      }
      
      // Prepare updates with sanitized values
      const updates = {
        goal_name: sanitizedGoalName,
        category: sanitizedGoalCategory || 'other',
        target_value: targetValue,
        current_value: currentValue,
        start_date: startDate,
        end_date: endDate,
      };
      
      // Call the update function
      const success = await updateExistingGoal(selectedGoal.id, updates);
      
      if (success) {
        // Close modal after successful update
        handleCloseModal();
        Alert.alert('Success', 'Goal updated successfully');
      } else {
        setError('Failed to update goal. Please try again.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error updating goal:', err);
    } finally {
      setUpdateLoading(false);
    }
  };

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
          <View>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.userName}>Green Compass</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={24} color="#2E7D32" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Sustainability Dashboard</Text>
          <Text style={styles.cardContent}>
            Track your progress and see how your actions are making a difference.
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalActions || 0}</Text>
              <Text style={styles.statLabel}>Actions Taken</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalCO2Saved?.toFixed(1) || '0'}</Text>
              <Text style={styles.statLabel}>CO₂ Saved (kg)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{overallStreak || 0}</Text>
              <Text style={styles.statLabel}>Streak Days</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.quickActionItem}
            onPress={() => router.push('/habits/log' as any)}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="add-outline" size={24} color="#2E7D32" />
            </View>
            <Text style={styles.quickActionText}>Log Action</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionItem}
            onPress={() => router.push('/habits/history' as any)}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="calendar-outline" size={24} color="#2E7D32" />
            </View>
            <Text style={styles.quickActionText}>View History</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Your Goals</Text>
            <TouchableOpacity 
              style={styles.addGoalButton}
              onPress={() => router.push({ pathname: '/habits/goal', params: { source: 'home' } })}
            >
              <Ionicons name="add-circle-outline" size={20} color="#2E7D32" />
              <Text style={styles.addGoalText}>Add Goal</Text>
            </TouchableOpacity>
          </View>
          
          {/* Empty state for no goals */}
          {goals.length === 0 && (
            <View style={styles.emptyGoalsContainer}>
              <Text style={styles.emptyGoalsText}>
                You don't have any active goals yet. Tap 'Add Goal' to get started!
              </Text>
            </View>
          )}
          
          {/* Single row of goals if less than 4 */}
          {goals.length > 0 && goals.length < 4 && (
            <FlatList
              data={goals}
              horizontal
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.goalsContainer}
              style={styles.scrollViewStyle}
              keyExtractor={(item) => item.id}
              renderItem={({item: goal}) => (
                <View style={styles.goalCard}>
                  <View style={styles.goalCardHeader}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.goalCategory}>{goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}</Text>
                      {goal.timeFrequency !== 'none' && (
                        <View style={styles.timeChip}>
                          <Text style={styles.timeChipText}>{goal.timeFrequency}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.goalProgress}>
                    <View style={styles.goalProgressBar}>
                      <View 
                        style={[styles.goalProgressFill, { width: `${(goal.progress / goal.target) * 100}%` }]}
                      />
                    </View>
                    <Text style={styles.goalProgressText}>
                      {goal.progress} of {goal.target} actions completed
                    </Text>
                  </View>
                  
                  <View style={styles.goalActions}>
                    <TouchableOpacity 
                      style={styles.goalActionButton}
                      onPress={() => handleEditGoal(goal)}
                    >
                      <Text style={styles.goalActionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.goalActionButton, { marginLeft: 8 }]}
                      onPress={() => router.push({
                        pathname: '/habits/log',
                        params: { category: goal.category }
                      } as any)}
                    >
                      <Text style={styles.goalActionText}>Log Action</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
          
          {/* Split into two rows if 4+ goals */}
          {goals.length >= 4 && (
            <View>
              {/* First row */}
              <FlatList
                data={goals.slice(0, Math.ceil(goals.length / 2))}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.goalsContainer}
                style={styles.scrollViewStyle}
                keyExtractor={(item) => item.id}
                renderItem={({item: goal}) => (
                  <View style={styles.goalCard}>
                    <View style={styles.goalCardHeader}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.goalCategory}>{goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}</Text>
                        {goal.timeFrequency !== 'none' && (
                          <View style={styles.timeChip}>
                            <Text style={styles.timeChipText}>{goal.timeFrequency}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    
                    <View style={styles.goalProgress}>
                      <View style={styles.goalProgressBar}>
                        <View 
                          style={[styles.goalProgressFill, { width: `${(goal.progress / goal.target) * 100}%` }]}
                        />
                      </View>
                      <Text style={styles.goalProgressText}>
                        {goal.progress} of {goal.target} actions completed
                      </Text>
                    </View>
                    
                    <View style={styles.goalActions}>
                      <TouchableOpacity 
                        style={styles.goalActionButton}
                        onPress={() => handleEditGoal(goal)}
                      >
                        <Text style={styles.goalActionText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.goalActionButton, { marginLeft: 8 }]}
                        onPress={() => router.push({
                          pathname: '/habits/log',
                          params: { category: goal.category }
                        } as any)}
                      >
                        <Text style={styles.goalActionText}>Log Action</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
              
              {/* Second row */}
              <View style={{ marginTop: 12 }}>
                <FlatList
                  data={goals.slice(Math.ceil(goals.length / 2))}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.goalsContainer}
                  style={styles.scrollViewStyle}
                  keyExtractor={(item) => item.id}
                  renderItem={({item: goal}) => (
                    <View style={styles.goalCard}>
                      <View style={styles.goalCardHeader}>
                        <Text style={styles.goalTitle}>{goal.title}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={styles.goalCategory}>{goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}</Text>
                          {goal.timeFrequency !== 'none' && (
                            <View style={styles.timeChip}>
                              <Text style={styles.timeChipText}>{goal.timeFrequency}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      
                      <View style={styles.goalProgress}>
                        <View style={styles.goalProgressBar}>
                          <View 
                            style={[styles.goalProgressFill, { width: `${(goal.progress / goal.target) * 100}%` }]}
                          />
                        </View>
                        <Text style={styles.goalProgressText}>
                          {goal.progress} of {goal.target} actions completed
                        </Text>
                      </View>
                      
                      <View style={styles.goalActions}>
                        <TouchableOpacity 
                          style={styles.goalActionButton}
                          onPress={() => handleEditGoal(goal)}
                        >
                          <Text style={styles.goalActionText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.goalActionButton, { marginLeft: 8 }]}
                          onPress={() => router.push({
                            pathname: '/habits/log',
                            params: { category: goal.category }
                          } as any)}
                        >
                          <Text style={styles.goalActionText}>Log Action</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
              </View>
            </View>
          )}
        </View>

        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          style={{ marginTop: 24, marginBottom: 40 }}
          loading={loading}
          disabled={loading}
        />
      </View>
      
      {/* Goal Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Goal</Text>
              <TouchableOpacity style={styles.modalCloseButton} onPress={handleCloseModal}>
                <Ionicons name="close" size={24} color="#2E7D32" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalForm}>
              {error && (
                <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
              )}
              
              <Text style={styles.modalLabel}>Goal Name</Text>
              <Input
                value={editedGoalName}
                onChangeText={(text) => {
                  // Limit input length during typing
                  if (text.length <= 50) {
                    setEditedGoalName(text);
                  }
                }}
                placeholder="Enter goal name (max 50 characters)"
                maxLength={50}
                error={error && error.includes('Goal name') ? error : undefined}
              />
              
              <Text style={styles.modalLabel}>Category</Text>
              <View style={{ marginBottom: 16 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', flexWrap: 'nowrap' }}>
                    {['Mobility', 'Food', 'Household Activities', 'Heating'].map((category) => (
                      <TouchableOpacity 
                        key={category}
                        style={[
                          styles.timeChip, 
                          { 
                            marginRight: 10, 
                            marginBottom: 10,
                            backgroundColor: editedGoalCategory === category ? '#2E7D32' : '#E8F5E9' 
                          }
                        ]}
                        onPress={() => setEditedGoalCategory(category)}
                      >
                        <Text 
                          style={[
                            styles.timeChipText, 
                            { color: editedGoalCategory === category ? 'white' : '#2E7D32' }
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
              
              <Text style={styles.modalLabel}>Target Value</Text>
              <Input
                value={editedGoalTarget}
                onChangeText={(text) => {
                  // Only allow numeric input with decimal point
                  if (/^\d*\.?\d*$/.test(text)) {
                    setEditedGoalTarget(text);
                  }
                }}
                placeholder="Enter target value (positive number)"
                keyboardType="numeric"
                error={error && error.includes('Target value') ? error : undefined}
              />
              
              <Text style={styles.modalLabel}>Time Frequency</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
                {(['none', 'daily', 'weekly', 'monthly'] as TimeFrequency[]).map((frequency) => (
                  <TouchableOpacity 
                    key={frequency}
                    style={[
                      styles.timeChip, 
                      { 
                        marginRight: 10, 
                        marginBottom: 10,
                        backgroundColor: editedTimeFrequency === frequency ? '#2E7D32' : '#E8F5E9' 
                      }
                    ]}
                    onPress={() => setEditedTimeFrequency(frequency)}
                  >
                    <Text 
                      style={[
                        styles.timeChipText, 
                        { color: editedTimeFrequency === frequency ? 'white' : '#2E7D32' }
                      ]}
                    >
                      {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.modalButtonContainer}>
                <Button
                  title="Cancel"
                  onPress={handleCloseModal}
                  variant="outline"
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title={updateLoading ? "Saving..." : "Save Changes"}
                  onPress={handleSaveGoal}
                  disabled={updateLoading}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
              
              {/* Delete button - separate from other buttons */}
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDeleteGoal}
                disabled={updateLoading}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={20} color="#D32F2F" />
                <Text style={styles.deleteButtonText}>Delete Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create<Styles>({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 8,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D32F2F',
    backgroundColor: '#FFEBEE',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  deleteButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#D32F2F',
    fontWeight: '600',
  },
  content: {
    width: '100%',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: '#555555',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#555555',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoutButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  goalsContainer: {
    paddingBottom: 8,
    paddingTop: 8,
    paddingHorizontal: 8,
    gap: 12,
    minWidth: '100%',
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  scrollViewStyle: {
    width: '100%',
    minHeight: 200,
    maxHeight: 250,
    flexGrow: 0,
    flexShrink: 0,
  },
  goalsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: 250,
    minWidth: 200,
    marginRight: 12,
    flexShrink: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalCardHeader: {
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  goalCategory: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  goalProgress: {
    marginBottom: 16,
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 4,
  },
  goalProgressText: {
    fontSize: 12,
    color: '#555555',
    textAlign: 'right',
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  goalActionButton: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  goalActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2E7D32',
  },
  emptyGoalsContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginVertical: 10,
  },
  emptyGoalsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  timeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#E8F5E9',
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  quickActionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flex: 1,
    minWidth: 90,
    marginHorizontal: 4,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
  },
  addGoalText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2E7D32',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalForm: {
    width: '100%',
  },
  modalLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
