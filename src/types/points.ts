/**
 * Types for the Green Points System
 */

// Point event sources
export type PointSource = 'daily_login' | 'habit_log' | 'discussion_participation';

// Point event record stored in database
export interface PointEvent {
  id: string;
  user_id: string;
  source: PointSource;
  reference_id?: string;
  points: number;
  created_at: string;
}

// User profile enhancements for streaks
export interface StreakProfile {
  last_login_date: string | null;
  login_streak: number;
}

// Habit streak tracking
export interface HabitStreak {
  id: string;
  user_id: string;
  habit_id: string;
  current_streak: number;
  last_log_date: string | null;
}

// Point balance summary
export interface PointBalance {
  total: number;
  lastUpdated: string;
}

// Parameters for awarding points
export interface AwardPointsParams {
  userId: string;
  source: PointSource;
  points: number;
  referenceId?: string;
}

// Parameters for updating a login streak
export interface UpdateLoginStreakParams {
  userId: string;
  lastLoginDate: string | null;
  currentStreak: number;
}

// Parameters for updating a habit streak
export interface UpdateHabitStreakParams {
  userId: string;
  habitId: string;
  lastLogDate: string | null;
  currentStreak: number;
}

// Response for point-related operations
export interface PointsResponse {
  success: boolean;
  message?: string;
  data?: {
    pointEvent?: PointEvent;
    pointBalance?: number;
    streak?: number;
  };
  error?: any;
}
