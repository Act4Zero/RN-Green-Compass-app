/**
 * Types for the community badges feature
 */

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon_url: string | null;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
  badge?: Badge; // Optional joined badge details
}

export type BadgeCodeType =
  | 'first_habit'
  | 'seven_day_streak'
  | 'fourteen_day_streak'
  | 'thirty_day_streak'
  | 'plastic_free_champion'
  | 'eco_warrior'
  | 'sustainability_guru';

export interface BadgeNotification {
  badge: Badge;
  isNew: boolean;
  awarded_at: string;
}

export interface StreakMilestone {
  days: number;
  message: string;
  badgeCode?: BadgeCodeType;
}

// Milestone definitions
export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 7, message: "Congrats! You've maintained a 7-day streak!", badgeCode: 'seven_day_streak' },
  { days: 14, message: 'Amazing! 14 days of consistent sustainability habits!', badgeCode: 'fourteen_day_streak' },
  { days: 30, message: 'Incredible! Your 30-day streak shows real commitment!', badgeCode: 'thirty_day_streak' },
];
