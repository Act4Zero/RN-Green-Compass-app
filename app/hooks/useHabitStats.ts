import { useCallback } from 'react';
import { useHabit } from '../context/HabitContext';
import { HabitLog } from '../types/supabase';

/**
 * Custom hook for habit tracking statistics
 */
export const useHabitStats = () => {
  const {
    habitLogs,
    totalCO2Saved,
    totalActions,
    overallStreak,
    loadingStats,
    errorStats,
    refreshStats,
    refreshHabitLogs,
  } = useHabit();

  /**
   * Get logs for a specific habit
   */
  const getLogsForHabit = useCallback((habitId: string): HabitLog[] => {
    return habitLogs.filter(log => log.habit_id === habitId);
  }, [habitLogs]);

  /**
   * Calculate CO2 saved for a specific habit
   */
  const getCO2SavedForHabit = useCallback((habitId: string): number => {
    return habitLogs
      .filter(log => log.habit_id === habitId && log.completed)
      .reduce((total, log) => total + (log.co2_saving || 0), 0);
  }, [habitLogs]);

  /**
   * Calculate actions taken for a specific habit
   */
  const getActionsForHabit = useCallback((habitId: string): number => {
    return habitLogs
      .filter(log => log.habit_id === habitId && log.completed)
      .reduce((total, log) => total + (log.quantity || 1), 0);
  }, [habitLogs]);

  /**
   * Calculate CO2 saved by category
   */
  const getCO2SavedByCategory = useCallback((category: string, habits: { id: string, category: string | null }[]): number => {
    const habitIds = habits
      .filter(habit => habit.category === category)
      .map(habit => habit.id);
    
    return habitLogs
      .filter(log => habitIds.includes(log.habit_id) && log.completed)
      .reduce((total, log) => total + (log.co2_saving || 0), 0);
  }, [habitLogs]);

  /**
   * Calculate CO2 saved by subcategory
   */
  const getCO2SavedBySubcategory = useCallback((subcategory: string, habits: { id: string, subcategory: string | null }[]): number => {
    const habitIds = habits
      .filter(habit => habit.subcategory === subcategory)
      .map(habit => habit.id);
    
    return habitLogs
      .filter(log => habitIds.includes(log.habit_id) && log.completed)
      .reduce((total, log) => total + (log.co2_saving || 0), 0);
  }, [habitLogs]);

  /**
   * Calculate CO2 saved by category and subcategory
   */
  const getCO2SavedByCategoryAndSubcategory = useCallback(
    (category: string, subcategory: string, habits: { id: string, category: string | null, subcategory: string | null }[]): number => {
      const habitIds = habits
        .filter(habit => habit.category === category && habit.subcategory === subcategory)
        .map(habit => habit.id);
      
      return habitLogs
        .filter(log => habitIds.includes(log.habit_id) && log.completed)
        .reduce((total, log) => total + (log.co2_saving || 0), 0);
    }, 
    [habitLogs]
  );

  /**
   * Calculate actions taken by category
   */
  const getActionsByCategory = useCallback((category: string, habits: { id: string, category: string | null }[]): number => {
    const habitIds = habits
      .filter(habit => habit.category === category)
      .map(habit => habit.id);
    
    return habitLogs
      .filter(log => habitIds.includes(log.habit_id) && log.completed)
      .reduce((total, log) => total + (log.quantity || 1), 0);
  }, [habitLogs]);

  /**
   * Calculate actions taken by subcategory
   */
  const getActionsBySubcategory = useCallback((subcategory: string, habits: { id: string, subcategory: string | null }[]): number => {
    const habitIds = habits
      .filter(habit => habit.subcategory === subcategory)
      .map(habit => habit.id);
    
    return habitLogs
      .filter(log => habitIds.includes(log.habit_id) && log.completed)
      .reduce((total, log) => total + (log.quantity || 1), 0);
  }, [habitLogs]);

  /**
   * Calculate actions taken by category and subcategory
   */
  const getActionsByCategoryAndSubcategory = useCallback(
    (category: string, subcategory: string, habits: { id: string, category: string | null, subcategory: string | null }[]): number => {
      const habitIds = habits
        .filter(habit => habit.category === category && habit.subcategory === subcategory)
        .map(habit => habit.id);
      
      return habitLogs
        .filter(log => habitIds.includes(log.habit_id) && log.completed)
        .reduce((total, log) => total + (log.quantity || 1), 0);
    },
    [habitLogs]
  );

  /**
   * Get logs by date range
   */
  const getLogsByDateRange = useCallback(async (startDate: string, endDate: string): Promise<HabitLog[]> => {
    await refreshHabitLogs(startDate, endDate);
    return habitLogs;
  }, [refreshHabitLogs, habitLogs]);

  /**
   * Calculate CO2 saved in a date range
   */
  const getCO2SavedInDateRange = useCallback(async (startDate: string, endDate: string): Promise<number> => {
    const logs = await getLogsByDateRange(startDate, endDate);
    return logs
      .filter(log => log.completed)
      .reduce((total, log) => total + (log.co2_saving || 0), 0);
  }, [getLogsByDateRange]);

  /**
   * Calculate actions taken in a date range
   */
  const getActionsInDateRange = useCallback(async (startDate: string, endDate: string): Promise<number> => {
    const logs = await getLogsByDateRange(startDate, endDate);
    return logs
      .filter(log => log.completed)
      .reduce((total, log) => total + (log.quantity || 1), 0);
  }, [getLogsByDateRange]);

  /**
   * Get logs grouped by date
   */
  const getLogsGroupedByDate = useCallback((): Record<string, HabitLog[]> => {
    const grouped: Record<string, HabitLog[]> = {};
    
    habitLogs.forEach(log => {
      if (!grouped[log.log_date]) {
        grouped[log.log_date] = [];
      }
      grouped[log.log_date].push(log);
    });
    
    return grouped;
  }, [habitLogs]);

  /**
   * Get dates with at least one completed habit
   */
  const getDatesWithCompletedHabits = useCallback((): string[] => {
    const dates = new Set<string>();
    
    habitLogs
      .filter(log => log.completed)
      .forEach(log => dates.add(log.log_date));
    
    return Array.from(dates).sort().reverse();
  }, [habitLogs]);

  /**
   * Check if user has completed any habits today
   */
  const hasCompletedHabitsToday = useCallback((): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return habitLogs.some(log => log.log_date === today && log.completed);
  }, [habitLogs]);

  /**
   * Get most frequently completed habits (top N)
   */
  const getMostFrequentHabits = useCallback((limit: number = 5): { habitId: string, count: number }[] => {
    const habitCounts: Record<string, number> = {};
    
    habitLogs
      .filter(log => log.completed)
      .forEach(log => {
        habitCounts[log.habit_id] = (habitCounts[log.habit_id] || 0) + 1;
      });
    
    return Object.entries(habitCounts)
      .map(([habitId, count]) => ({ habitId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }, [habitLogs]);

  /**
   * Get habits with highest CO2 impact (top N)
   */
  const getHighestImpactHabits = useCallback((limit: number = 5): { habitId: string, co2Saved: number }[] => {
    const habitImpact: Record<string, number> = {};
    
    habitLogs
      .filter(log => log.completed)
      .forEach(log => {
        habitImpact[log.habit_id] = (habitImpact[log.habit_id] || 0) + (log.co2_saving || 0);
      });
    
    return Object.entries(habitImpact)
      .map(([habitId, co2Saved]) => ({ habitId, co2Saved }))
      .sort((a, b) => b.co2Saved - a.co2Saved)
      .slice(0, limit);
  }, [habitLogs]);

  return {
    // Stats
    totalCO2Saved,
    totalActions,
    overallStreak,
    loadingStats,
    errorStats,
    
    // Actions
    refreshStats,
    refreshHabitLogs,
    
    // Helpers - General
    getLogsForHabit,
    getCO2SavedForHabit,
    getActionsForHabit,
    getLogsByDateRange,
    getCO2SavedInDateRange,
    getActionsInDateRange,
    getLogsGroupedByDate,
    getDatesWithCompletedHabits,
    hasCompletedHabitsToday,
    getMostFrequentHabits,
    getHighestImpactHabits,
    
    // Helpers - Category
    getCO2SavedByCategory,
    getActionsByCategory,
    
    // Helpers - Subcategory
    getCO2SavedBySubcategory,
    getActionsBySubcategory,
    
    // Helpers - Category and Subcategory
    getCO2SavedByCategoryAndSubcategory,
    getActionsByCategoryAndSubcategory,
  };
};

export default useHabitStats;
