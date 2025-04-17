import { useState } from 'react';

// Time-bound frequency options for goals
export type TimeFrequency = 'daily' | 'weekly' | 'monthly' | 'one-time';

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

export type FocusArea = {
  id: string;
  name: string;
  icon: string;
  category: string;
};

export const [focusAreas] = useState<FocusArea[]>([
  { id: '1', name: 'Mobility', icon: 'bicycle-outline', category: 'Mobility' },
  { id: '2', name: 'Food', icon: 'nutrition-outline', category: 'Food' },
  { id: '3', name: 'Household Activities', icon: 'home-outline', category: 'Household Activities' },
  { id: '4', name: 'Heating', icon: 'thermometer-outline', category: 'Heating' }
]);
