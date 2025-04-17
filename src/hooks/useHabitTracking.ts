import { useState, useCallback } from 'react';
import HabitContextModule from '../context/HabitContext/HabitContext';

const { useHabit } = HabitContextModule;
import { Habit, UserHabit } from '../types/supabase';

/**
 * Custom hook for habit tracking functionality
 */
export const useHabitTracking = () => {
  const {
    habits,
    userHabits,
    activeUserHabits,
    loadingHabits,
    errorHabits,
    refreshHabits,
    refreshUserHabits,
    addUserHabit,
    updateUserHabit,
    toggleHabitActive,
    removeUserHabit,
    logHabit,
  } = useHabit();

  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [selectedUserHabit, setSelectedUserHabit] = useState<UserHabit | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Select a habit to track or log
   */
  const selectHabit = useCallback((habit: Habit | null) => {
    setSelectedHabit(habit);
    setSelectedUserHabit(null);
    setQuantity(1);
    setNotes('');
    setError(null);
  }, []);

  /**
   * Select a user habit to update or log
   */
  const selectUserHabit = useCallback((userHabit: UserHabit | null) => {
    setSelectedUserHabit(userHabit);
    if (userHabit) {
      // Find the corresponding habit
      const habit = habits.find(h => h.id === userHabit.habit_id);
      setSelectedHabit(habit || null);
    } else {
      setSelectedHabit(null);
    }
    setQuantity(1);
    setNotes('');
    setError(null);
  }, [habits]);

  /**
   * Start tracking a new habit
   */
  const startTrackingHabit = useCallback(async (
    habitId: string,
    targetFrequency?: number,
    frequencyPeriod?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      await addUserHabit(habitId, targetFrequency, frequencyPeriod);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start tracking habit';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [addUserHabit]);

  /**
   * Update a habit's tracking settings
   */
  const updateHabitSettings = useCallback(async (
    userHabitId: string,
    updates: Partial<UserHabit>
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      await updateUserHabit(userHabitId, updates);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update habit settings';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [updateUserHabit]);

  /**
   * Toggle a habit's active status
   */
  const toggleActive = useCallback(async (
    userHabitId: string,
    isActive: boolean
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      await toggleHabitActive(userHabitId, isActive);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle habit status';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [toggleHabitActive]);

  /**
   * Stop tracking a habit
   */
  const stopTrackingHabit = useCallback(async (userHabitId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await removeUserHabit(userHabitId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop tracking habit';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [removeUserHabit]);

  /**
   * Log a completed habit
   */
  const logCompletedHabit = useCallback(async (
    habitId: string,
    quantity: number = 1,
    notes?: string,
    logDate?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      await logHabit(habitId, quantity, notes, logDate);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to log habit';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [logHabit]);

  /**
   * Get habits by category
   */
  const getHabitsByCategory = useCallback((category: string): Habit[] => {
    return habits.filter(habit => habit.category === category);
  }, [habits]);

  /**
   * Get habits by subcategory
   */
  const getHabitsBySubcategory = useCallback((subcategory: string): Habit[] => {
    return habits.filter(habit => habit.subcategory === subcategory);
  }, [habits]);

  /**
   * Get habits by category and subcategory
   */
  const getHabitsByCategoryAndSubcategory = useCallback((category: string, subcategory: string): Habit[] => {
    return habits.filter(habit => habit.category === category && habit.subcategory === subcategory);
  }, [habits]);

  /**
   * Get user habits by category
   */
  const getUserHabitsByCategory = useCallback((category: string): UserHabit[] => {
    return userHabits.filter(userHabit => {
      const habit = habits.find(h => h.id === userHabit.habit_id);
      return habit?.category === category;
    });
  }, [userHabits, habits]);

  /**
   * Get user habits by subcategory
   */
  const getUserHabitsBySubcategory = useCallback((subcategory: string): UserHabit[] => {
    return userHabits.filter(userHabit => {
      const habit = habits.find(h => h.id === userHabit.habit_id);
      return habit?.subcategory === subcategory;
    });
  }, [userHabits, habits]);

  /**
   * Get user habits by category and subcategory
   */
  const getUserHabitsByCategoryAndSubcategory = useCallback((category: string, subcategory: string): UserHabit[] => {
    return userHabits.filter(userHabit => {
      const habit = habits.find(h => h.id === userHabit.habit_id);
      return habit?.category === category && habit?.subcategory === subcategory;
    });
  }, [userHabits, habits]);

  /**
   * Get active user habits by category
   */
  const getActiveUserHabitsByCategory = useCallback((category: string): UserHabit[] => {
    return activeUserHabits.filter(userHabit => {
      const habit = habits.find(h => h.id === userHabit.habit_id);
      return habit?.category === category;
    });
  }, [activeUserHabits, habits]);

  /**
   * Get active user habits by subcategory
   */
  const getActiveUserHabitsBySubcategory = useCallback((subcategory: string): UserHabit[] => {
    return activeUserHabits.filter(userHabit => {
      const habit = habits.find(h => h.id === userHabit.habit_id);
      return habit?.subcategory === subcategory;
    });
  }, [activeUserHabits, habits]);

  /**
   * Get active user habits by category and subcategory
   */
  const getActiveUserHabitsByCategoryAndSubcategory = useCallback((category: string, subcategory: string): UserHabit[] => {
    return activeUserHabits.filter(userHabit => {
      const habit = habits.find(h => h.id === userHabit.habit_id);
      return habit?.category === category && habit?.subcategory === subcategory;
    });
  }, [activeUserHabits, habits]);

  return {
    // State
    habits,
    userHabits,
    activeUserHabits,
    loadingHabits,
    errorHabits,
    selectedHabit,
    selectedUserHabit,
    quantity,
    notes,
    loading,
    error,
    
    // Actions
    setQuantity,
    setNotes,
    selectHabit,
    selectUserHabit,
    refreshHabits,
    refreshUserHabits,
    startTrackingHabit,
    updateHabitSettings,
    toggleActive,
    stopTrackingHabit,
    logCompletedHabit,
    
    // Helpers - Category
    getHabitsByCategory,
    getUserHabitsByCategory,
    getActiveUserHabitsByCategory,
    
    // Helpers - Subcategory
    getHabitsBySubcategory,
    getUserHabitsBySubcategory,
    getActiveUserHabitsBySubcategory,
    
    // Helpers - Category and Subcategory
    getHabitsByCategoryAndSubcategory,
    getUserHabitsByCategoryAndSubcategory,
    getActiveUserHabitsByCategoryAndSubcategory,
  };
};

export default useHabitTracking;
