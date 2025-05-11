import { BadgeTriggerFn, BadgeRule } from '../types';

/**
 * Habit Tracker category badge rules
 * Each rule maps to a badge in the DB with matching code
 */
export const habitTrackerBadgeRules: BadgeRule[] = [
  { code: 'first_habit', custom: true },
  { code: 'five_habits', custom: true },
  { code: 'habit_streak_7', custom: true },
  // Add more habit badges as needed
];

/**
 * Custom trigger for first habit badge
 * Awarded when user logs their first habit
 */
export const firstHabitTrigger: BadgeTriggerFn = ({ activityLogs }) => {
  return activityLogs.some(log => log.type === 'habit_log');
};

/**
 * Custom trigger for five habits badge
 * Awarded when user has logged at least 5 unique habits
 */
export const fiveHabitsTrigger: BadgeTriggerFn = ({ activityLogs }) => {
  // Count unique habit types
  const uniqueHabits = new Set(
    activityLogs
      .filter(log => log.type === 'habit_log')
      .map(log => log.habit_id || '')
  );
  
  return uniqueHabits.size >= 5;
};

/**
 * Custom trigger for 7-day habit streak badge
 * Awarded when user maintains same habit for 7 consecutive days
 */
export const habitStreak7Trigger: BadgeTriggerFn = ({ activityLogs }) => {
  // This would require more complex logic to check consecutive days
  // For simplicity, this is a placeholder
  return false;
};
