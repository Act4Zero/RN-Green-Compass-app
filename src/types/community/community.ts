import { Database } from '../supabase';

// Type for a discussion/post in the community feed
export interface Discussion {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  user?: {
    id?: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  comment_count?: number;
  reaction_count?: number;
  user_has_reacted?: boolean;
}

// Type for a comment on a discussion
export interface Comment {
  id: string;
  discussion_id: string;
  user_id: string;
  content: string;
  created_at: string;
  // Joined fields
  user?: {
    id?: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  reaction_count?: number;
  user_has_reacted?: boolean;
}

// Type for a reaction to a discussion or comment
export interface Reaction {
  id: string;
  user_id: string;
  discussion_id: string | null;
  comment_id: string | null;
  reaction_type: string;
  created_at: string;
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

// Update the Database interface to include the new tables
export interface CommunityTables extends Database {
  public: {
    Tables: {
      discussions: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          discussion_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          discussion_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          discussion_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      reactions: {
        Row: {
          id: string;
          user_id: string;
          discussion_id: string | null;
          comment_id: string | null;
          reaction_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          discussion_id?: string | null;
          comment_id?: string | null;
          reaction_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          discussion_id?: string | null;
          comment_id?: string | null;
          reaction_type?: string;
          created_at?: string;
        };
      };
    } & Database['public']['Tables'];
    Views: Database['public']['Views'];
    Functions: Database['public']['Functions'];
    Enums: Database['public']['Enums'];
  };
}
