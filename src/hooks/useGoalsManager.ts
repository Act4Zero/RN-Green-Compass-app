import { useState, useEffect, useCallback } from 'react';
import useGoals from './useGoals';
import { EnhancedGoal, TimeFrequency, DatabaseGoal } from '../types/goal.types';

export default function useGoalsManager() {
  const { userGoals, loading: goalsLoading, updateExistingGoal, deleteExistingGoal, refreshGoals } = useGoals();
  const [goals, setGoals] = useState<EnhancedGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to determine time frequency from goal dates
  const determineTimeFrequency = useCallback((goal: DatabaseGoal): TimeFrequency => {
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
  const shouldResetGoalProgress = useCallback((goal: DatabaseGoal): boolean => {
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

  // Load goals only once on initial component mount
  useEffect(() => {
    // Only load goals if we don't already have them
    if (userGoals.length === 0 && !goalsLoading) {
      refreshGoals();
    }
    // We intentionally don't include userGoals in the dependency array
    // to prevent refresh loops
  }, []);

  // Validate goal name to prevent script injection and ensure proper format
  const validateGoalName = (name: string) => {
    const trimmedName = name.trim();
    
    // Check if empty
    if (!trimmedName) {
      return { valid: false, error: 'Goal name is required' };
    }
    
    // Check length
    if (trimmedName.length > 50) {
      return { valid: false, error: 'Goal name must be less than 50 characters' };
    }
    
    // Check for potentially dangerous characters or script tags
    const dangerousCharsRegex = /<script|<\/?[a-z]+[^>]*>|javascript:|onerror=|onclick=|onload=/i;
    if (dangerousCharsRegex.test(trimmedName)) {
      return { valid: false, error: 'Goal name contains invalid characters' };
    }
    
    return { valid: true, error: null };
  };
  
  // Validate numeric input to ensure it's a valid number and within reasonable range
  const validateNumericInput = (value: string, fieldName: string, minValue: number, maxValue: number) => {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      return { valid: false, error: `${fieldName} must be a valid number` };
    }
    
    if (numValue < minValue) {
      return { valid: false, error: `${fieldName} must be at least ${minValue}` };
    }
    
    if (numValue > maxValue) {
      return { valid: false, error: `${fieldName} must be less than ${maxValue}` };
    }
    
    return { valid: true, error: null };
  };

  // Update a goal
  const updateGoal = async (
    goalId: string, 
    updates: {
      goalName?: string;
      category?: string;
      targetValue?: number;
      currentValue?: number;
      timeFrequency?: TimeFrequency;
      startDate?: string;
      endDate?: string | null;
    }
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare database updates
      const dbUpdates: Record<string, any> = {};
      
      if (updates.goalName !== undefined) {
        const validation = validateGoalName(updates.goalName);
        if (!validation.valid) {
          setError(validation.error);
          setLoading(false);
          return { success: false, error: validation.error };
        }
        dbUpdates.goal_name = updates.goalName.trim();
      }
      
      if (updates.category !== undefined) {
        dbUpdates.category = updates.category.trim() || 'other';
      }
      
      if (updates.targetValue !== undefined) {
        const validation = validateNumericInput(
          updates.targetValue.toString(), 
          'Target value', 
          0.1, 
          1000000
        );
        if (!validation.valid) {
          setError(validation.error);
          setLoading(false);
          return { success: false, error: validation.error };
        }
        dbUpdates.target_value = updates.targetValue;
      }
      
      if (updates.currentValue !== undefined) {
        const validation = validateNumericInput(
          updates.currentValue.toString(), 
          'Current value', 
          0, 
          1000000
        );
        if (!validation.valid) {
          setError(validation.error);
          setLoading(false);
          return { success: false, error: validation.error };
        }
        dbUpdates.current_value = updates.currentValue;
      }
      
      // Handle time frequency changes
      const goal = goals.find(g => g.id === goalId);
      if (goal && updates.timeFrequency !== undefined && updates.timeFrequency !== goal.timeFrequency) {
        if (updates.timeFrequency === 'none') {
          // If changing to non-time-bound, remove end date
          dbUpdates.end_date = null;
        } else {
          // Set start date to today
          const startDate = updates.startDate || new Date().toISOString().split('T')[0];
          dbUpdates.start_date = startDate;
          
          // Calculate end date based on frequency
          const endDateObj = new Date();
          if (updates.timeFrequency === 'daily') {
            endDateObj.setDate(endDateObj.getDate() + 1);
          } else if (updates.timeFrequency === 'weekly') {
            endDateObj.setDate(endDateObj.getDate() + 7);
          } else if (updates.timeFrequency === 'monthly') {
            endDateObj.setMonth(endDateObj.getMonth() + 1);
          }
          dbUpdates.end_date = updates.endDate || endDateObj.toISOString().split('T')[0];
        }
      } else {
        // Use provided dates if specified
        if (updates.startDate !== undefined) {
          dbUpdates.start_date = updates.startDate;
        }
        if (updates.endDate !== undefined) {
          dbUpdates.end_date = updates.endDate;
        }
      }
      
      // Call the update function
      const success = await updateExistingGoal(goalId, dbUpdates);
      
      if (success) {
        // Refresh goals after successful update
        refreshGoals();
        return { success: true, error: null };
      } else {
        const errorMsg = 'Failed to update goal. Please try again.';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error updating goal:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Delete a goal
  const deleteGoal = async (goalId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await deleteExistingGoal(goalId);
      
      if (success) {
        // Force refresh goals after deletion
        refreshGoals();
        return { success: true, error: null };
      } else {
        const errorMsg = 'Failed to delete goal. Please try again.';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error deleting goal:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    goals,
    loading: loading || goalsLoading,
    error,
    refreshGoals: handleManualRefresh,
    updateGoal,
    deleteGoal,
    validateGoalName,
    validateNumericInput
  };
}
