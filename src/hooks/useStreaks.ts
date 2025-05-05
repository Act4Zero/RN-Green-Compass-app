import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateStreak, formatDateToYYYYMMDD } from '../utils/streakUtils';
import analyticsService from '../services/analyticsService';

/**
 * Hook for managing habit streaks and login streaks
 * @returns Functions and data for working with user streaks
 */
function useStreaks() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loginStreak, setLoginStreak] = useState(0);
  const [habitStreaks, setHabitStreaks] = useState<Record<string, number>>({});

  /**
   * Get the current login streak for the authenticated user
   */
  const fetchLoginStreak = useCallback(async () => {
    if (!user?.id) return null;
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('login_streak, last_login_date')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      setLoginStreak(data?.login_streak || 0);
      return data;
    } catch (error) {
      console.error('Error fetching login streak:', error);
      setHasError(true);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Get all habit streaks for the authenticated user
   */
  const fetchHabitStreaks = useCallback(async () => {
    if (!user?.id) return [];
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      const { data, error } = await supabase
        .from('user_habit_streaks')
        .select('habit_id, current_streak, last_log_date')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Convert array of streak objects to a record for easier access
      const streaksRecord = (data || []).reduce<Record<string, number>>((acc, streak) => {
        acc[streak.habit_id] = streak.current_streak || 0;
        return acc;
      }, {});
      
      setHabitStreaks(streaksRecord);
      return data;
    } catch (error) {
      console.error('Error fetching habit streaks:', error);
      setHasError(true);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Get the streak for a specific habit
   * @param habitId The habit ID to get the streak for
   */
  const getHabitStreak = useCallback(async (habitId: string) => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_habit_streaks')
        .select('current_streak, last_log_date')
        .match({ user_id: user.id, habit_id: habitId })
        .maybeSingle();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching streak for habit ${habitId}:`, error);
      return null;
    }
  }, [user?.id]);

  /**
   * Update the login streak for the authenticated user
   */
  const updateLoginStreak = useCallback(async () => {
    if (!user?.id) return false;
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      // Get current streak info
      const { data: currentData, error: fetchError } = await supabase
        .from('profiles')
        .select('login_streak, last_login_date')
        .eq('id', user.id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const currentDate = new Date();
      const formattedCurrentDate = formatDateToYYYYMMDD(currentDate);
      
      let newStreak = 1; // Default for first login
      let streakMaintained = false;
      
      if (currentData?.last_login_date) {
        const result = calculateStreak(
          currentData.last_login_date,
          currentData.login_streak || 0
        );
        newStreak = result.streak;
        streakMaintained = result.maintained;
      }
      
      // Only update if not already logged in today
      if (currentData?.last_login_date !== formattedCurrentDate) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            login_streak: newStreak,
            last_login_date: formattedCurrentDate
          })
          .eq('id', user.id);
        
        if (updateError) throw updateError;
        
        setLoginStreak(newStreak);
        
        // Track the streak update in analytics
        analyticsService.trackEvent('login_streak_update', {
          new_streak: newStreak,
          streak_maintained: streakMaintained
        });
        
        return true;
      }
      
      // Already logged in today, no update needed
      setLoginStreak(currentData.login_streak || 0);
      return false;
    } catch (error) {
      console.error('Error updating login streak:', error);
      setHasError(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    loginStreak,
    habitStreaks,
    isLoading,
    hasError,
    fetchLoginStreak,
    fetchHabitStreaks,
    getHabitStreak,
    updateLoginStreak
  };
}

export default useStreaks;
