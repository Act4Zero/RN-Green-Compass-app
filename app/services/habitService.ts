import supabase from '../lib/supabase';
import { Habit, UserHabit, HabitLog, UserGoal } from '../types/supabase';

/**
 * Service for interacting with habits in Supabase
 */
export const habitService = {
  /**
   * Get all available habits
   */
  getHabits: async (): Promise<Habit[]> => {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching habits:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get a specific habit by ID
   */
  getHabitById: async (habitId: string): Promise<Habit | null> => {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .single();

    if (error) {
      console.error(`Error fetching habit with ID ${habitId}:`, error);
      throw error;
    }

    return data;
  },

  /**
   * Get all habits that a user is tracking
   */
  getUserHabits: async (userId: string): Promise<UserHabit[]> => {
    const { data, error } = await supabase
      .from('user_habits')
      .select('*, habits(*)')
      .eq('user_id', userId);

    if (error) {
      console.error(`Error fetching habits for user ${userId}:`, error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get active habits for a user
   */
  getActiveUserHabits: async (userId: string): Promise<UserHabit[]> => {
    const { data, error } = await supabase
      .from('user_habits')
      .select('*, habits(*)')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error(`Error fetching active habits for user ${userId}:`, error);
      throw error;
    }

    return data || [];
  },

  /**
   * Add a habit to a user's tracking list
   */
  addUserHabit: async (
    userId: string,
    habitId: string,
    targetFrequency?: number,
    frequencyPeriod?: string
  ): Promise<UserHabit> => {
    const { data, error } = await supabase
      .from('user_habits')
      .insert({
        user_id: userId,
        habit_id: habitId,
        is_active: true,
        target_frequency: targetFrequency || null,
        frequency_period: frequencyPeriod || null,
        start_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      console.error(`Error adding habit ${habitId} for user ${userId}:`, error);
      throw error;
    }

    return data;
  },

  /**
   * Update a user's habit tracking settings
   */
  updateUserHabit: async (
    userHabitId: string,
    updates: Partial<UserHabit>
  ): Promise<UserHabit> => {
    const { data, error } = await supabase
      .from('user_habits')
      .update(updates)
      .eq('id', userHabitId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating user habit ${userHabitId}:`, error);
      throw error;
    }

    return data;
  },

  /**
   * Toggle a habit's active status for a user
   */
  toggleHabitActive: async (
    userHabitId: string,
    isActive: boolean
  ): Promise<UserHabit> => {
    return habitService.updateUserHabit(userHabitId, { is_active: isActive });
  },

  /**
   * Remove a habit from a user's tracking list
   */
  removeUserHabit: async (userHabitId: string): Promise<void> => {
    const { error } = await supabase
      .from('user_habits')
      .delete()
      .eq('id', userHabitId);

    if (error) {
      console.error(`Error removing user habit ${userHabitId}:`, error);
      throw error;
    }
  },

  /**
   * Log a completed habit for a user
   */
  logHabit: async (
    userId: string,
    habitId: string,
    quantity: number = 1,
    notes?: string,
    logDate?: string
  ): Promise<HabitLog> => {
    // Get the habit's CO2 saving value
    const { data: habit, error: habitError } = await supabase
      .from('habits')
      .select('estimated_co2_saving')
      .eq('id', habitId)
      .single();

    if (habitError) {
      console.error(`Error fetching habit ${habitId} for CO2 calculation:`, habitError);
      throw habitError;
    }

    // Calculate CO2 saving
    const co2Saving = habit.estimated_co2_saving 
      ? habit.estimated_co2_saving * quantity 
      : null;

    // Create the log entry
    const { data, error } = await supabase
      .from('habit_logs')
      .insert({
        user_id: userId,
        habit_id: habitId,
        log_date: logDate || new Date().toISOString().split('T')[0],
        completed: true,
        quantity,
        co2_saving: co2Saving,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error(`Error logging habit ${habitId} for user ${userId}:`, error);
      throw error;
    }

    // Update any relevant goals
    await goalService.updateGoalsForHabitLog(userId, habitId, co2Saving || 0, quantity);

    return data;
  },

  /**
   * Get habit logs for a user within a date range
   */
  getHabitLogs: async (
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<HabitLog[]> => {
    let query = supabase
      .from('habit_logs')
      .select('*, habits(*)')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('log_date', startDate);
    }

    if (endDate) {
      query = query.lte('log_date', endDate);
    }

    const { data, error } = await query.order('log_date', { ascending: false });

    if (error) {
      console.error(`Error fetching habit logs for user ${userId}:`, error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get habit logs for a specific habit
   */
  getHabitLogsByHabit: async (
    userId: string,
    habitId: string,
    startDate?: string,
    endDate?: string
  ): Promise<HabitLog[]> => {
    let query = supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('habit_id', habitId);

    if (startDate) {
      query = query.gte('log_date', startDate);
    }

    if (endDate) {
      query = query.lte('log_date', endDate);
    }

    const { data, error } = await query.order('log_date', { ascending: false });

    if (error) {
      console.error(`Error fetching logs for habit ${habitId} and user ${userId}:`, error);
      throw error;
    }

    return data || [];
  },

  /**
   * Calculate a user's streak for a specific habit
   */
  calculateHabitStreak: async (userId: string, habitId: string): Promise<number> => {
    // Get all logs for this habit, ordered by date descending
    const { data, error } = await supabase
      .from('habit_logs')
      .select('log_date')
      .eq('user_id', userId)
      .eq('habit_id', habitId)
      .eq('completed', true)
      .order('log_date', { ascending: false });

    if (error) {
      console.error(`Error calculating streak for habit ${habitId} and user ${userId}:`, error);
      throw error;
    }

    if (!data || data.length === 0) {
      return 0;
    }

    // Calculate streak
    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Format today as YYYY-MM-DD
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if the most recent log is from today or yesterday
    const mostRecentLog = new Date(data[0].log_date);
    mostRecentLog.setHours(0, 0, 0, 0);
    
    // If the most recent log is older than yesterday, the streak is broken
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (mostRecentLog < yesterday && data[0].log_date !== todayStr) {
      return 0;
    }
    
    // Count consecutive days
    for (let i = 0; i < data.length - 1; i++) {
      const currentDate = new Date(data[i].log_date);
      const nextDate = new Date(data[i + 1].log_date);
      
      // Calculate the difference in days
      const diffTime = currentDate.getTime() - nextDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      // If the difference is exactly 1 day, increment the streak
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  },

  /**
   * Calculate a user's overall streak (at least one habit completed each day)
   */
  calculateOverallStreak: async (userId: string): Promise<number> => {
    // Get all logs, ordered by date descending
    const { data, error } = await supabase
      .from('habit_logs')
      .select('log_date')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('log_date', { ascending: false });

    if (error) {
      console.error(`Error calculating overall streak for user ${userId}:`, error);
      throw error;
    }

    if (!data || data.length === 0) {
      return 0;
    }

    // Group logs by date to check if at least one habit was completed each day
    const dateMap = new Map<string, boolean>();
    data.forEach(log => {
      dateMap.set(log.log_date, true);
    });

    // Convert to sorted array of dates
    const dates = Array.from(dateMap.keys()).sort().reverse();
    
    if (dates.length === 0) {
      return 0;
    }

    // Calculate streak
    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Format today as YYYY-MM-DD
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if the most recent log is from today or yesterday
    const mostRecentLog = new Date(dates[0]);
    mostRecentLog.setHours(0, 0, 0, 0);
    
    // If the most recent log is older than yesterday, the streak is broken
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (mostRecentLog < yesterday && dates[0] !== todayStr) {
      return 0;
    }
    
    // Count consecutive days
    for (let i = 0; i < dates.length - 1; i++) {
      const currentDate = new Date(dates[i]);
      const nextDate = new Date(dates[i + 1]);
      
      // Calculate the difference in days
      const diffTime = currentDate.getTime() - nextDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      // If the difference is exactly 1 day, increment the streak
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  },

  /**
   * Calculate total CO2 saved by a user
   */
  calculateTotalCO2Saved: async (userId: string): Promise<number> => {
    const { data, error } = await supabase
      .from('habit_logs')
      .select('co2_saving')
      .eq('user_id', userId)
      .eq('completed', true);

    if (error) {
      console.error(`Error calculating total CO2 saved for user ${userId}:`, error);
      throw error;
    }

    if (!data || data.length === 0) {
      return 0;
    }

    // Sum up all CO2 savings
    return data.reduce((total, log) => total + (log.co2_saving || 0), 0);
  },

  /**
   * Calculate total actions taken by a user
   */
  calculateTotalActions: async (userId: string): Promise<number> => {
    const { data, error } = await supabase
      .from('habit_logs')
      .select('quantity')
      .eq('user_id', userId)
      .eq('completed', true);

    if (error) {
      console.error(`Error calculating total actions for user ${userId}:`, error);
      throw error;
    }

    if (!data || data.length === 0) {
      return 0;
    }

    // Sum up all quantities
    return data.reduce((total, log) => total + (log.quantity || 1), 0);
  },
};

/**
 * Service for interacting with sustainability goals in Supabase
 */
export const goalService = {
  /**
   * Get all goals for a user
   */
  getUserGoals: async (userId: string): Promise<UserGoal[]> => {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching goals for user ${userId}:`, error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get active (not completed) goals for a user
   */
  getActiveUserGoals: async (userId: string): Promise<UserGoal[]> => {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching active goals for user ${userId}:`, error);
      throw error;
    }

    return data || [];
  },

  /**
   * Create a new goal for a user
   */
  createUserGoal: async (
    userId: string,
    title: string,
    targetValue: number,
    category?: string,
    subcategory?: string,
    habitId?: string,
    description?: string,
    endDate?: string
  ): Promise<UserGoal> => {
    const { data, error } = await supabase
      .from('user_goals')
      .insert({
        user_id: userId,
        title,
        description: description || null,
        category: category || null,
        habit_id: habitId || null,
        target_value: targetValue,
        current_value: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: endDate || null,
        is_completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error(`Error creating goal for user ${userId}:`, error);
      throw error;
    }

    return data;
  },

  /**
   * Update a user's goal
   */
  updateUserGoal: async (
    goalId: string,
    updates: Partial<UserGoal>
  ): Promise<UserGoal> => {
    const { data, error } = await supabase
      .from('user_goals')
      .update(updates)
      .eq('id', goalId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating goal ${goalId}:`, error);
      throw error;
    }

    return data;
  },

  /**
   * Delete a user's goal
   */
  deleteUserGoal: async (goalId: string): Promise<void> => {
    const { error } = await supabase
      .from('user_goals')
      .delete()
      .eq('id', goalId);

    if (error) {
      console.error(`Error deleting goal ${goalId}:`, error);
      throw error;
    }
  },

  /**
   * Update goals when a habit is logged
   */
  updateGoalsForHabitLog: async (
    userId: string,
    habitId: string,
    co2Saving: number,
    quantity: number
  ): Promise<void> => {
    try {
      // Get the habit to check its category
      const { data: habit, error: habitError } = await supabase
        .from('habits')
        .select('category')
        .eq('id', habitId)
        .single();

      if (habitError) {
        console.error(`Error fetching habit ${habitId} for goal update:`, habitError);
        throw habitError;
      }

      // Get active goals that match this habit or category
      const { data: goals, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', false)
        .or(`habit_id.eq.${habitId},category.eq.${habit.category}`);

      if (goalsError) {
        console.error(`Error fetching goals for habit ${habitId}:`, goalsError);
        throw goalsError;
      }

      if (!goals || goals.length === 0) {
        return;
      }

      // Update each matching goal
      for (const goal of goals) {
        // Determine how much to increment the current value
        let increment = 0;
        
        // If the goal is CO2-based, use the CO2 saving
        if (goal.title.toLowerCase().includes('co2') || goal.description?.toLowerCase().includes('co2')) {
          increment = co2Saving;
        } else {
          // Otherwise, use the quantity (number of actions)
          increment = quantity;
        }

        // Update the goal
        const newValue = goal.current_value + increment;
        const isCompleted = newValue >= goal.target_value;

        await supabase
          .from('user_goals')
          .update({
            current_value: newValue,
            is_completed: isCompleted,
          })
          .eq('id', goal.id);
      }
    } catch (error) {
      console.error('Error updating goals for habit log:', error);
      // Don't throw here to prevent the habit log from failing
    }
  },
};

export default {
  habitService,
  goalService,
};
