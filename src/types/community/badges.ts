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

export enum BadgeCode {
  FIRST_HABIT = 'first_habit',
  SEVEN_DAY_STREAK = 'seven_day_streak',
  FOURTEEN_DAY_STREAK = 'fourteen_day_streak',
  THIRTY_DAY_STREAK = 'thirty_day_streak',
  PLASTIC_FREE_CHAMPION = 'plastic_free_champion',
  ECO_WARRIOR = 'eco_warrior',
  SUSTAINABILITY_GURU = 'sustainability_guru',
}

export interface BadgeNotification {
  badge: Badge;
  isNew: boolean;
  awarded_at: string;
}

export interface StreakMilestone {
  days: number;
  message: string;
  badgeCode?: BadgeCode;
}

// Milestone definitions
export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 7, message: 'Congrats! You've maintained a 7-day streak!', badgeCode: BadgeCode.SEVEN_DAY_STREAK },
  { days: 14, message: 'Amazing! 14 days of consistent sustainability habits!', badgeCode: BadgeCode.FOURTEEN_DAY_STREAK },
  { days: 30, message: 'Incredible! Your 30-day streak shows real commitment!', badgeCode: BadgeCode.THIRTY_DAY_STREAK },
];
