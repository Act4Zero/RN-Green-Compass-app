import React, { createContext, useState, useEffect, useContext } from 'react';
import { habitService, goalService } from '../../services/habitService';
import { useAuth } from '../AuthContext';
import { Habit, UserHabit, HabitLog, UserGoal } from '../../types/supabase';

// Define the shape of the habit context
type HabitContextType = {
  // Habits
  habits: Habit[];
  userHabits: UserHabit[];
  activeUserHabits: UserHabit[];
  loadingHabits: boolean;
  errorHabits: string | null;
  
  // Habit Logs
  habitLogs: HabitLog[];
  loadingLogs: boolean;
  errorLogs: string | null;
  
  // Goals
  userGoals: UserGoal[];
  activeUserGoals: UserGoal[];
  loadingGoals: boolean;
  errorGoals: string | null;
  
  // Stats
  totalCO2Saved: number;
  totalActions: number;
  overallStreak: number;
  loadingStats: boolean;
  errorStats: string | null;
  
  // Actions
  refreshHabits: () => Promise<void>;
  refreshUserHabits: () => Promise<void>;
  refreshHabitLogs: (startDate?: string, endDate?: string) => Promise<void>;
  refreshGoals: () => Promise<void>;
  refreshStats: () => Promise<void>;
  
  addUserHabit: (habitId: string, targetFrequency?: number, frequencyPeriod?: string) => Promise<void>;
  updateUserHabit: (userHabitId: string, updates: Partial<UserHabit>) => Promise<void>;
  toggleHabitActive: (userHabitId: string, isActive: boolean) => Promise<void>;
  removeUserHabit: (userHabitId: string) => Promise<void>;
  
  logHabit: (habitId: string, quantity?: number, notes?: string, logDate?: string) => Promise<void>;
  
  createGoal: (
    title: string,
    targetValue: number,
    category?: string,
    subcategory?: string,
    habitId?: string,
    description?: string,
    endDate?: string
  ) => Promise<UserGoal | null>;
  updateGoal: (goalId: string, updates: Partial<UserGoal>) => Promise<UserGoal | null>;
  deleteGoal: (goalId: string) => Promise<void>;
};

// Create the habit context
const HabitContext = createContext<HabitContextType | undefined>(undefined);

// Habit provider component
export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // State for habits
  const [habits, setHabits] = useState<Habit[]>([]);
  const [userHabits, setUserHabits] = useState<UserHabit[]>([]);
  const [activeUserHabits, setActiveUserHabits] = useState<UserHabit[]>([]);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [errorHabits, setErrorHabits] = useState<string | null>(null);
  
  // State for habit logs
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [errorLogs, setErrorLogs] = useState<string | null>(null);
  
  // State for goals
  const [userGoals, setUserGoals] = useState<UserGoal[]>([]);
  const [activeUserGoals, setActiveUserGoals] = useState<UserGoal[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [errorGoals, setErrorGoals] = useState<string | null>(null);
  
  // State for stats
  const [totalCO2Saved, setTotalCO2Saved] = useState(0);
  const [totalActions, setTotalActions] = useState(0);
  const [overallStreak, setOverallStreak] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  // Load initial data when user changes
  useEffect(() => {
    if (user) {
      refreshHabits();
      refreshUserHabits();
      refreshHabitLogs();
      refreshGoals();
      refreshStats();
    } else {
      // Reset state when user logs out
      setHabits([]);
      setUserHabits([]);
      setActiveUserHabits([]);
      setHabitLogs([]);
      setUserGoals([]);
      setActiveUserGoals([]);
      setTotalCO2Saved(0);
      setTotalActions(0);
      setOverallStreak(0);
    }
  }, [user]);

  // Function to refresh habits
  const refreshHabits = async (): Promise<void> => {
    if (!user) return;
    
    setLoadingHabits(true);
    setErrorHabits(null);
    
    try {
      const habitsData = await habitService.getHabits();
      setHabits(habitsData);
    } catch (error) {
      console.error('Error refreshing habits:', error);
      setErrorHabits('Failed to load habits. Please try again.');
    } finally {
      setLoadingHabits(false);
    }
  };

  // Function to refresh user habits
  const refreshUserHabits = async (): Promise<void> => {
    if (!user) return;
    
    setLoadingHabits(true);
    setErrorHabits(null);
    
    try {
      const userHabitsData = await habitService.getUserHabits(user.id);
      setUserHabits(userHabitsData);
      
      const activeHabitsData = await habitService.getActiveUserHabits(user.id);
      setActiveUserHabits(activeHabitsData);
    } catch (error) {
      console.error('Error refreshing user habits:', error);
      setErrorHabits('Failed to load your habits. Please try again.');
    } finally {
      setLoadingHabits(false);
    }
  };

  // Function to refresh habit logs
  const refreshHabitLogs = async (startDate?: string, endDate?: string): Promise<void> => {
    if (!user) return;
    
    setLoadingLogs(true);
    setErrorLogs(null);
    
    try {
      const logsData = await habitService.getHabitLogs(user.id, startDate, endDate);
      setHabitLogs(logsData);
    } catch (error) {
      console.error('Error refreshing habit logs:', error);
      setErrorLogs('Failed to load habit logs. Please try again.');
    } finally {
      setLoadingLogs(false);
    }
  };

  // Function to refresh goals
  const refreshGoals = async (): Promise<void> => {
    if (!user) return;
    
    setLoadingGoals(true);
    setErrorGoals(null);
    
    try {
      const goalsData = await goalService.getUserGoals(user.id);
      setUserGoals(goalsData);
      
      const activeGoalsData = await goalService.getActiveUserGoals(user.id);
      setActiveUserGoals(activeGoalsData);
    } catch (error) {
      console.error('Error refreshing goals:', error);
      setErrorGoals('Failed to load goals. Please try again.');
    } finally {
      setLoadingGoals(false);
    }
  };

  // Function to refresh stats
  const refreshStats = async (): Promise<void> => {
    if (!user) return;
    
    setLoadingStats(true);
    setErrorStats(null);
    
    try {
      const co2Saved = await habitService.calculateTotalCO2Saved(user.id);
      setTotalCO2Saved(co2Saved);
      
      const actions = await habitService.calculateTotalActions(user.id);
      setTotalActions(actions);
      
      // Just get the streak without awarding points during regular refresh
      const streak = await habitService.calculateOverallStreak(user.id);
      setOverallStreak(streak);
    } catch (error) {
      console.error('Error refreshing stats:', error);
      setErrorStats('Failed to load statistics. Please try again.');
    } finally {
      setLoadingStats(false);
    }
  };

  // Function to add a habit to user's tracking list
  const addUserHabit = async (
    habitId: string,
    targetFrequency?: number,
    frequencyPeriod?: string
  ): Promise<void> => {
    if (!user) return;
    
    try {
      await habitService.addUserHabit(user.id, habitId, targetFrequency, frequencyPeriod);
      await refreshUserHabits();
    } catch (error) {
      console.error('Error adding habit:', error);
      throw error;
    }
  };

  // Function to update a user habit
  const updateUserHabit = async (
    userHabitId: string,
    updates: Partial<UserHabit>
  ): Promise<void> => {
    try {
      await habitService.updateUserHabit(userHabitId, updates);
      await refreshUserHabits();
    } catch (error) {
      console.error('Error updating habit:', error);
      throw error;
    }
  };

  // Function to toggle a habit's active status
  const toggleHabitActive = async (
    userHabitId: string,
    isActive: boolean
  ): Promise<void> => {
    try {
      await habitService.toggleHabitActive(userHabitId, isActive);
      await refreshUserHabits();
    } catch (error) {
      console.error('Error toggling habit active status:', error);
      throw error;
    }
  };

  // Function to remove a habit from user's tracking list
  const removeUserHabit = async (userHabitId: string): Promise<void> => {
    try {
      await habitService.removeUserHabit(userHabitId);
      await refreshUserHabits();
    } catch (error) {
      console.error('Error removing habit:', error);
      throw error;
    }
  };

  // Function to log a completed habit
  const logHabit = async (
    habitId: string,
    quantity: number = 1,
    notes?: string,
    logDate?: string
  ): Promise<void> => {
    if (!user) return;
    
    try {
      // Log the habit
      await habitService.logHabit(user.id, habitId, quantity, notes, logDate);
      
      // After logging a habit, we can award streak points
      // This ensures points are only awarded when a user actually logs a habit,
      // not on every stats refresh
      try {
        const streakAndPoint = await habitService.registerOverallStreakAndPoint(user.id);
        // Update streak in state with the returned value
        setOverallStreak(streakAndPoint.streak);
      } catch (pointsError) {
        // Just log the error if awarding points fails, but don't break the habit logging
        console.error('Error awarding streak points:', pointsError);
      }
      
      // Refresh relevant data
      await refreshHabitLogs();
      await refreshGoals();
      // Use the regular stats refresh without streak point awards
      await refreshStats();
    } catch (error) {
      console.error('Error logging habit:', error);
      throw error;
    }
  };

  // Function to create a new goal
  const createGoal = async (
    title: string,
    targetValue: number,
    category?: string,
    subcategory?: string,
    habitId?: string,
    description?: string,
    endDate?: string
  ): Promise<UserGoal | null> => {
    if (!user) {
      console.error('Cannot create goal: User not authenticated');
      return null;
    }
    
    try {
      // Create the goal and get the result
      const newGoal = await goalService.createUserGoal(
        user.id,
        title,
        targetValue,
        category,
        subcategory,
        habitId,
        description,
        endDate
      );
      
      // Refresh the goals list
      await refreshGoals();
      
      return newGoal;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  };

  // Function to update a goal
  const updateGoal = async (
    goalId: string,
    updates: Partial<UserGoal>
  ): Promise<UserGoal | null> => {
    try {
      // Update the goal and get the result
      const updatedGoal = await goalService.updateUserGoal(goalId, updates);    
      // Refresh the goals list
      await refreshGoals();
      
      return updatedGoal;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  };

  // Function to delete a goal
  const deleteGoal = async (goalId: string): Promise<void> => {
    try {
      await goalService.deleteUserGoal(goalId);
      await refreshGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  };

  // The context value exposing habit functions and state
  const value: HabitContextType = {
    // Habits
    habits,
    userHabits,
    activeUserHabits,
    loadingHabits,
    errorHabits,
    
    // Habit Logs
    habitLogs,
    loadingLogs,
    errorLogs,
    
    // Goals
    userGoals,
    activeUserGoals,
    loadingGoals,
    errorGoals,
    
    // Stats
    totalCO2Saved,
    totalActions,
    overallStreak,
    loadingStats,
    errorStats,
    
    // Actions
    refreshHabits,
    refreshUserHabits,
    refreshHabitLogs,
    refreshGoals,
    refreshStats,
    
    addUserHabit,
    updateUserHabit,
    toggleHabitActive,
    removeUserHabit,
    
    logHabit,
    
    createGoal,
    updateGoal,
    deleteGoal,
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
};

// Custom hook to use the habit context
export const useHabit = () => {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabit must be used within a HabitProvider');
  }
  return context;
};

// Default export
export default {
  HabitProvider,
  useHabit,
};
