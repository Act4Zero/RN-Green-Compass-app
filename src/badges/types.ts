import { Badge } from '@/types/community/badges';

// Core types needed for the badge trigger system
export interface Profile {
  id: string;
  streak_login: number;
  login_count: number;
  // Add other relevant profile fields
  
  // Allow dynamic access to profile properties by string key
  [key: string]: string | number | boolean | undefined;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  timestamp: string;
  type: string;
  habit_id?: string;
  // Add other relevant activity log fields
  
  // Allow dynamic access to activity log properties by string key
  [key: string]: string | number | boolean | undefined;
}

// The context passed to badge trigger functions
export type BadgeTriggerContext = {
  userId: string;
  profile: Profile;
  activityLogs: ActivityLog[];
  now: Date;
};

// A function that determines if a badge should be awarded
export type BadgeTriggerFn = (context: BadgeTriggerContext) => boolean | Promise<boolean>;

// Simple rule definition for badges with declarative rules
export type BadgeRule = {
  code: string;
  field?: string;
  op?: string;
  value?: number;
  custom?: boolean;
};

// Result from badge evaluation
export type BadgeEvaluationResult = {
  badgeCode: string;
  shouldAward: boolean;
};
