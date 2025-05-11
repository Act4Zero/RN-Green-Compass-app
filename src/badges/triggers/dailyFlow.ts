import { BadgeTriggerFn, BadgeRule } from '../types';

/**
 * Daily Flow category badge rules
 * Each rule maps to a badge in the DB with matching code
 */
export const dailyFlowBadgeRules: BadgeRule[] = [
  { code: 'first_login', field: 'login_count', op: '>=', value: 1 },
  { code: 'streak_login_3', field: 'streak_login', op: '>=', value: 3 },
  { code: 'streak_login_7', field: 'streak_login', op: '>=', value: 7 },
  { code: 'streak_login_30', field: 'streak_login', op: '>=', value: 30 },
  { code: 'streak_login_90', field: 'streak_login', op: '>=', value: 90 },
  { code: 'night_owl_login', custom: true }, // Uses custom trigger function
];

/**
 * Custom trigger function for night owl badge
 * Awarded when user logs in between 22:00-04:00
 */
export const nightOwlTrigger: BadgeTriggerFn = ({ activityLogs, now }) => {
  // Get only login activities from the last 24 hours
  const recentLoginLogs = activityLogs
    .filter(log => log.type === 'login')
    .filter(log => {
      const logTime = new Date(log.timestamp);
      const timeDiff = now.getTime() - logTime.getTime();
      return timeDiff <= 24 * 60 * 60 * 1000; // Last 24 hours
    });

  // Check if any login was during night hours
  return recentLoginLogs.some(log => {
    const hour = new Date(log.timestamp).getHours();
    return hour >= 22 || hour < 4;
  });
};
