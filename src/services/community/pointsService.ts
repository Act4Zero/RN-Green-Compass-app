import supabase from '../../lib/supabase';
import {
  AwardPointsParams,
  PointEvent,
  PointsResponse,
  PointBalance,
} from '../../types/community/points';

/**
 * Service for handling Green Points operations
 * Manages point awards, streaks, and balance calculations
 */
const pointsService = {
  /**
   * Award points to a user for a specific action
   * @param params Parameters for awarding points
   * @returns Response with success status and point event data
   */
  awardPoints: async (params: AwardPointsParams): Promise<PointsResponse> => {
    try {
      const { userId, source, points, referenceId } = params;
      
      // Validate required parameters
      if (!userId) {
        throw new Error('userId is required to award points');
      }
      
      if (!source) {
        throw new Error('source is required to award points');
      }
      
      if (points === undefined || points === null) {
        throw new Error('points value is required to award points');
      }
      
      // Create a point event record
      const { data, error } = await supabase
        .from('user_points')
        .insert({
          user_id: userId,
          source,
          points,
          reference_id: referenceId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Calculate updated point balance
      const pointBalance = await pointsService.getUserPointBalance(userId);
      
      return {
        success: true,
        message: `Successfully awarded ${points} points for ${source}`,
        data: {
          pointEvent: data as PointEvent,
          pointBalance: pointBalance.total,
        },
      };
    } catch (error) {
      console.error('Failed to award points:', error);
      return {
        success: false,
        error,
        message: 'Failed to award points',
      };
    }
  },
  
  /**
   * Process a daily check-in for a user
   * Updates login streak and awards points
   * @param userId The user's ID
   * @returns Response with success status and updated streak
   */
  processDailyCheckIn: async (userId: string): Promise<PointsResponse> => {
    try {
      // Get user's current streak info
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('last_login_date, login_streak')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        throw profileError;
      }
      
      const today = new Date();
      const currentDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
      const lastLoginDate = profileData?.last_login_date;
      
      let newStreak = 1; // Default to 1 for first login or reset streak
      
      // Check if the user logged in yesterday to maintain streak
      if (lastLoginDate) {
        const lastLogin = new Date(lastLoginDate);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Compare dates without time component
        const lastLoginDay = lastLogin.toISOString().split('T')[0];
        const yesterdayDay = yesterday.toISOString().split('T')[0];
        
        if (lastLoginDay === yesterdayDay) {
          // User logged in yesterday, increment streak
          newStreak = (profileData?.login_streak || 0) + 1;
        } else if (lastLoginDay === currentDate) {
          // User already logged in today, maintain current streak
          newStreak = profileData?.login_streak || 1;
          return {
            success: false,
            message: 'Already checked in today',
            data: {
              streak: newStreak,
            },
          };
        }
      }
      
      // Update user profile with new streak and login date
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          last_login_date: currentDate,
          login_streak: newStreak,
        })
        .eq('id', userId);
      
      if (updateError) {
        throw updateError;
      }
      
      // Award points for daily login
      // Base points plus bonus for streak
      const basePoints = 20;
      const streakBonus = Math.min(newStreak - 1, 5) * 5; // Max 5x5=25 bonus points
      const totalPoints = basePoints + streakBonus;
      
      const pointsResult = await pointsService.awardPoints({
        userId,
        source: 'daily_login',
        points: totalPoints,
      });
      
      return {
        success: true,
        message: `Daily check-in successful. Day ${newStreak} streak!`,
        data: {
          ...pointsResult.data,
          streak: newStreak,
        },
      };
    } catch (error) {
      console.error('Failed to process daily check-in:', error);
      return {
        success: false,
        error,
        message: 'Failed to process daily check-in',
      };
    }
  },
  
  /**
   * Process a habit log and award points
   * Updates habit streak if tracking is enabled
   * @param userId The user's ID
   * @param habitId The habit's ID
   * @param trackStreak Whether to track and update habit streak
   * @returns Response with success status and point event data
   */
  processHabitLog: async (
    userId: string,
    habitId: string,
    trackStreak = true
  ): Promise<PointsResponse> => {
    try {
      // Log the habit first
      const { data: habitLogData, error: habitLogError } = await supabase
        .from('habit_logs')
        .insert({
          user_id: userId,
          habit_id: habitId,
          completed: true,
          log_date: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (habitLogError) {
        throw habitLogError;
      }
      
      // Update habit streak if tracking is enabled
      let streakData = null;
      if (trackStreak) {
        streakData = await pointsService.updateHabitStreak(userId, habitId);
      }
      
      // Award points for logging the habit
      const points = 1; // Base points for logging a habit
      
      const pointsResult = await pointsService.awardPoints({
        userId,
        source: 'habit_log',
        points,
        referenceId: habitLogData.id,
      });
      
      return {
        success: true,
        message: `Habit logged successfully. Earned ${points} points!`,
        data: {
          ...pointsResult.data,
          streak: streakData?.data?.streak,
        },
      };
    } catch (error) {
      console.error('Failed to process habit log:', error);
      return {
        success: false,
        error,
        message: 'Failed to process habit log',
      };
    }
  },
  
  /**
   * Process community participation and award points
   * @param userId The user's ID
   * @param contentType Type of participation (post or comment)
   * @param contentId ID of the community content
   * @returns Response with success status and point event data
   */
  processCommunityParticipation: async (
    userId: string,
    contentType: 'post' | 'comment',
    contentId: string
  ): Promise<PointsResponse> => {
    try {
      // Different point values based on participation type
      const points = contentType === 'post' ? 5 : 1;
      
      const pointsResult = await pointsService.awardPoints({
        userId,
        source: 'discussion_participation',
        points,
        referenceId: contentId,
      });
      
      return {
        success: true,
        message: `Community ${contentType} rewarded with ${points} points!`,
        data: pointsResult.data,
      };
    } catch (error) {
      console.error('Failed to process community participation:', error);
      return {
        success: false,
        error,
        message: 'Failed to process community participation',
      };
    }
  },
  
  /**
   * Update a user's habit streak
   * @param userId The user's ID
   * @param habitId The habit's ID
   * @returns Response with success status and updated streak
   */
  updateHabitStreak: async (
    userId: string,
    habitId: string
  ): Promise<PointsResponse> => {
    try {
      const today = new Date();
      const currentDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Get current streak info
      const { data: streakData, error: streakError } = await supabase
        .from('user_habit_streaks')
        .select('current_streak, last_log_date')
        .match({ user_id: userId, habit_id: habitId })
        .maybeSingle();
      
      if (streakError) {
        throw streakError;
      }
      
      let newStreak = 1; // Default for first log or reset streak
      
      if (streakData) {
        const lastLogDate = streakData.last_log_date;
        
        if (lastLogDate) {
          const lastLog = new Date(lastLogDate);
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          // Compare dates without time component
          const lastLogDay = lastLog.toISOString().split('T')[0];
          const yesterdayDay = yesterday.toISOString().split('T')[0];
          const todayDay = currentDate;
          
          if (lastLogDay === yesterdayDay) {
            // Logged yesterday, increment streak
            newStreak = (streakData.current_streak || 0) + 1;
          } else if (lastLogDay === todayDay) {
            // Already logged today, maintain current streak
            newStreak = streakData.current_streak || 1;
            return {
              success: true,
              message: 'Habit already logged today',
              data: {
                streak: newStreak,
              },
            };
          }
        }
      }
      
      // Update or insert streak record
      const { error: upsertError } = await supabase
        .from('user_habit_streaks')
        .upsert({
          user_id: userId,
          habit_id: habitId,
          current_streak: newStreak,
          last_log_date: currentDate,
        });
      
      if (upsertError) {
        throw upsertError;
      }
      
      return {
        success: true,
        message: `Habit streak updated to ${newStreak}`,
        data: {
          streak: newStreak,
        },
      };
    } catch (error) {
      console.error('Failed to update habit streak:', error);
      return {
        success: false,
        error,
        message: 'Failed to update habit streak',
      };
    }
  },
  
  /**
   * Get a user's current point balance
   * @param userId The user's ID
   * @returns The user's total points and last update time
   */
  getUserPointBalance: async (userId: string): Promise<PointBalance> => {
  const { data, error } = await supabase.rpc('get_user_points_total', { user_id_param: userId });
  console.log('getUserPointBalance:', { userId, data, error });
    try {
      // Sum all points for the user
      const { data, error } = await supabase
        .rpc('get_user_points_total', { user_id_param: userId });
      
      if (error) {
        throw error;
      }
      
      return {
        total: data || 0,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to get user point balance:', error);
      // Return 0 points as fallback
      return {
        total: 0,
        lastUpdated: new Date().toISOString(),
      };
    }
  },
  
  /**
   * Get a user's point history
   * @param userId The user's ID
   * @returns Array of point events for the user
   */
  getUserPointHistory: async (userId: string): Promise<PointEvent[]> => {
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) {
        throw error;
      }
      return data as PointEvent[];
    } catch (error) {
      console.error('Failed to get user point history:', error);
      return [];
    }
  },
  /**
   * Get a user's login streak information
   * @param userId The user's ID
   * @returns Object containing login_streak count
   */
  getUserLoginStreak: async (userId: string): Promise<{ login_streak: number }> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('login_streak')
        .eq('id', userId)
        .single();
      
      if (error) {
        throw error;
      }
      
      return {
        login_streak: data?.login_streak || 0
      };
    } catch (error) {
      console.error('Failed to get login streak:', error);
      return { login_streak: 0 };
    }
  },
};

export default pointsService;
