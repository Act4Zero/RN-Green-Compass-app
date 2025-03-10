export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
        }
      }
      habits: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          category: string | null
          subcategory: string | null
          estimated_co2_saving: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          category?: string | null
          subcategory?: string | null
          estimated_co2_saving?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          category?: string | null
          subcategory?: string | null
          estimated_co2_saving?: number | null
        }
      }
      user_habits: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          habit_id: string
          is_active: boolean
          target_frequency: number | null
          frequency_period: string | null
          start_date: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          habit_id: string
          is_active?: boolean
          target_frequency?: number | null
          frequency_period?: string | null
          start_date?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          habit_id?: string
          is_active?: boolean
          target_frequency?: number | null
          frequency_period?: string | null
          start_date?: string
        }
      }
      habit_logs: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          habit_id: string
          log_date: string
          completed: boolean
          quantity: number
          co2_saving: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          habit_id: string
          log_date?: string
          completed?: boolean
          quantity?: number
          co2_saving?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          habit_id?: string
          log_date?: string
          completed?: boolean
          quantity?: number
          co2_saving?: number | null
          notes?: string | null
        }
      }
      user_goals: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          title: string
          description: string | null
          category: string | null
          habit_id: string | null
          target_value: number
          current_value: number
          start_date: string
          end_date: string | null
          is_completed: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          title: string
          description?: string | null
          category?: string | null
          habit_id?: string | null
          target_value: number
          current_value?: number
          start_date?: string
          end_date?: string | null
          is_completed?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string | null
          habit_id?: string | null
          target_value?: number
          current_value?: number
          start_date?: string
          end_date?: string | null
          is_completed?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Type definitions for habit tracking
export type Habit = Database['public']['Tables']['habits']['Row'];
export type UserHabit = Database['public']['Tables']['user_habits']['Row'];
export type HabitLog = Database['public']['Tables']['habit_logs']['Row'];
export type UserGoal = Database['public']['Tables']['user_goals']['Row'];

// Default export to fix the 'missing required default export' warning
const SupabaseTypes = {};
export default SupabaseTypes;
