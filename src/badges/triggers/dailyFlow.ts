import { BadgeTriggerFn, BadgeRule } from '../types';

/**
 * Daily Flow category badge rules
 * Each rule maps to a badge in the DB with matching code
 */
export const dailyFlowBadgeRules: BadgeRule[] = [
  { code: 'login_first', field: 'login_streak', op: '>=', value: 1 },
  { code: 'streak_bronze', field: 'login_streak', op: '>=', value: 3 },
  { code: 'streak_silver', field: 'login_streak', op: '>=', value: 7 },
  { code: 'streak_gold', field: 'login_streak', op: '>=', value: 30 },
  { code: 'streak_platinum', field: 'login_streak', op: '>=', value: 90 },
  { code: 'login_night', custom: true }, // Uses custom trigger function
];

/**
 * Custom trigger function for night owl badge
 * Awarded when user logs in between 22:00-04:00
 */
export const nightOwlTrigger: BadgeTriggerFn = ({ activityLogs, now }) => {
  // Get all login activities, sorted by timestamp ascending
  const loginLogs = activityLogs
    .filter(log => log.type === 'login')
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Find the first login that occurred between 22:00–04:00
  const firstNightLogin = loginLogs.find(log => {
    const hour = new Date(log.timestamp).getHours();
    return hour >= 22 || hour < 4;
  });

  // If there is no night login, do not trigger
  if (!firstNightLogin) return false;

  // Check if the most recent login is the first night login
  const lastLogin = loginLogs[loginLogs.length - 1];
  return lastLogin === firstNightLogin;
};
