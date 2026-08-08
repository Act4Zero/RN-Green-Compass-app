import { Database } from '../supabase';

// Type for a challenge
export interface Challenge {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  created_at: string;
  // Joined fields
  creator?: {
    id?: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  participant_count?: number;
  is_participant?: boolean;
  progress_metric?: number;
  group_progress_metric?: number;
}

// Type for a challenge participant
export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  joined_at: string;
  progress_metric: number;
  // Joined fields
  user?: {
    id?: string;
    full_name?: string | null;
    display_name: string | null;
    avatar_url: string | null;
    // Signed URL for avatar fetched server-side
    avatar_signed_url?: string | null;
  };
}

// Type for activity log entry
export interface ActivityLog {
  id: string;
  challenge_id: string;
  user_id: string;
  title: string; // New field for activity title
  description: string;
  impact_value: number;
  created_at: string;
  // Joined fields
  user?: {
    id?: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

// Type for pagination parameters
export interface PaginationParams {
  page: number;
  limit: number;
}

// Type for pagination result
export interface PaginatedResult<T> {
  data: T[];
  count: number;
  hasMore: boolean;
}

// Update the Database interface to include the challenge tables
export interface ChallengeTables extends Database {
  public: {
    Tables: {
      challenges: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          description: string;
          start_date: string;
          end_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          title: string;
          description: string;
          start_date: string;
          end_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          title?: string;
          description?: string;
          start_date?: string;
          end_date?: string;
          created_at?: string;
        };
      };
      challenge_participants: {
        Row: {
          id: string;
          challenge_id: string;
          user_id: string;
          joined_at: string;
          progress_metric: number;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          user_id: string;
          joined_at?: string;
          progress_metric?: number;
        };
        Update: {
          id?: string;
          challenge_id?: string;
          user_id?: string;
          joined_at?: string;
          progress_metric?: number;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          challenge_id: string;
          user_id: string;
          description: string;
          impact_value: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          user_id: string;
          description: string;
          impact_value: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          challenge_id?: string;
          user_id?: string;
          description?: string;
          impact_value?: number;
          created_at?: string;
        };
      };
    } & Database['public']['Tables'];
    Views: Database['public']['Views'];
    Functions: Database['public']['Functions'];
    Enums: Database['public']['Enums'];
  };
}
