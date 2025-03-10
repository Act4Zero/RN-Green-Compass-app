import { useState, useCallback } from 'react';
import { useHabit } from '../context/HabitContext';
import { UserGoal } from '../types/supabase';

/**
 * Custom hook for sustainability goals functionality
 */
export const useGoals = () => {
  const {
    userGoals,
    activeUserGoals,
    loadingGoals,
    errorGoals,
    refreshGoals,
    createGoal,
    updateGoal,
    deleteGoal,
  } = useHabit();

  const [selectedGoal, setSelectedGoal] = useState<UserGoal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Select a goal to view or edit
   */
  const selectGoal = useCallback((goal: UserGoal | null) => {
    setSelectedGoal(goal);
    setError(null);
  }, []);

  /**
   * Create a new sustainability goal
   */
  const createNewGoal = useCallback(async (
    title: string,
    targetValue: number,
    category?: string,
    habitId?: string,
    description?: string,
    endDate?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      await createGoal(title, targetValue, category, habitId, description, endDate);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create goal';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [createGoal]);

  /**
   * Update an existing goal
   */
  const updateExistingGoal = useCallback(async (
    goalId: string,
    updates: Partial<UserGoal>
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      await updateGoal(goalId, updates);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update goal';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [updateGoal]);

  /**
   * Delete a goal
   */
  const deleteExistingGoal = useCallback(async (goalId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await deleteGoal(goalId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete goal';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [deleteGoal]);

  /**
   * Get goals by category
   */
  const getGoalsByCategory = useCallback((category: string): UserGoal[] => {
    return userGoals.filter(goal => goal.category === category);
  }, [userGoals]);

  /**
   * Get active goals by category
   */
  const getActiveGoalsByCategory = useCallback((category: string): UserGoal[] => {
    return activeUserGoals.filter(goal => goal.category === category);
  }, [activeUserGoals]);

  /**
   * Get goals by habit
   */
  const getGoalsByHabit = useCallback((habitId: string): UserGoal[] => {
    return userGoals.filter(goal => goal.habit_id === habitId);
  }, [userGoals]);

  /**
   * Get active goals by habit
   */
  const getActiveGoalsByHabit = useCallback((habitId: string): UserGoal[] => {
    return activeUserGoals.filter(goal => goal.habit_id === habitId);
  }, [activeUserGoals]);

  /**
   * Calculate progress percentage for a goal
   */
  const calculateGoalProgress = useCallback((goal: UserGoal): number => {
    if (goal.target_value <= 0) return 0;
    const progress = (goal.current_value / goal.target_value) * 100;
    return Math.min(progress, 100); // Cap at 100%
  }, []);

  /**
   * Get goals sorted by progress (highest to lowest)
   */
  const getGoalsSortedByProgress = useCallback((): UserGoal[] => {
    return [...userGoals].sort((a, b) => {
      const progressA = calculateGoalProgress(a);
      const progressB = calculateGoalProgress(b);
      return progressB - progressA;
    });
  }, [userGoals, calculateGoalProgress]);

  /**
   * Get active goals sorted by progress (highest to lowest)
   */
  const getActiveGoalsSortedByProgress = useCallback((): UserGoal[] => {
    return [...activeUserGoals].sort((a, b) => {
      const progressA = calculateGoalProgress(a);
      const progressB = calculateGoalProgress(b);
      return progressB - progressA;
    });
  }, [activeUserGoals, calculateGoalProgress]);

  /**
   * Get goals that are nearly complete (>= 90% progress)
   */
  const getNearlyCompleteGoals = useCallback((): UserGoal[] => {
    return activeUserGoals.filter(goal => {
      const progress = calculateGoalProgress(goal);
      return progress >= 90 && progress < 100;
    });
  }, [activeUserGoals, calculateGoalProgress]);

  return {
    // State
    userGoals,
    activeUserGoals,
    loadingGoals,
    errorGoals,
    selectedGoal,
    loading,
    error,
    
    // Actions
    selectGoal,
    refreshGoals,
    createNewGoal,
    updateExistingGoal,
    deleteExistingGoal,
    
    // Helpers
    getGoalsByCategory,
    getActiveGoalsByCategory,
    getGoalsByHabit,
    getActiveGoalsByHabit,
    calculateGoalProgress,
    getGoalsSortedByProgress,
    getActiveGoalsSortedByProgress,
    getNearlyCompleteGoals,
  };
};

export default useGoals;
