// Time-bound frequency options for goals
export type TimeFrequency = 'daily' | 'weekly' | 'monthly' | 'none';

// Enhanced goal type with time-bound information
export interface EnhancedGoal {
  id: string;
  title: string;
  category: string;
  progress: number;
  target: number;
  timeFrequency: TimeFrequency;
  startDate: string;
  endDate?: string | null;
  originalGoal: any; // Original goal data from database
}

// Database goal structure (matches what comes from Supabase)
export interface DatabaseGoal {
  id: string;
  goal_name: string;
  category?: string | null; // Allow null to match Supabase response
  current_value: number;
  target_value: number;
  start_date: string;
  end_date?: string | null;
  updated_at: string;
  [key: string]: any; // Allow for additional fields
}

export default EnhancedGoal;
