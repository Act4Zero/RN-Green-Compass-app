import { BadgeTriggerFn, BadgeRule } from '../types';

/**
 * Meta badge rules
 * Each rule maps to a badge in the DB with matching code
 */
export const metaBadgeRules: BadgeRule[] = [
  { code: 'early_adopter', custom: true },
  { code: 'bug_spotter', custom: true },
  { code: 'earth_day_hero', custom: true },
  { code: 'night_garden', custom: true },
];

/**
 * early_adopter: Boolean flag on user’s profile set if they’re in that cohort (e.g. user_rank ≤ 1,000 or manual tag)
 */
export const earlyAdopterTrigger: BadgeTriggerFn = ({ profile }) => {
  // Check for manual tag or user_rank
  return Boolean(profile.early_adopter) || (typeof profile.user_rank === 'number' && profile.user_rank <= 1000);
};

/**
 * bug_spotter: First support_tickets record with type='bug' and status='confirmed'
 */
export const bugSpotterTrigger: BadgeTriggerFn = ({ supportTickets }) => {
  if (!Array.isArray(supportTickets)) return false;
  return supportTickets.some(ticket => ticket.type === 'bug' && ticket.status === 'confirmed');
};

/**
 * earth_day_hero: Any habit_logs entry on April 22 (extract month/day = 04-22)
 */
export const earthDayHeroTrigger: BadgeTriggerFn = ({ activityLogs }) => {
  return activityLogs.some(log => {
    if (log.type !== 'habit_log' || !log.timestamp) return false;
    const date = new Date(log.timestamp);
    return date.getMonth() === 3 && date.getDate() === 22; // Months are 0-indexed
  });
};

/**
 * night_garden: learning_path_progress with status='completed' and timestamp between 02:00–04:00 local time
 */
export const nightGardenTrigger: BadgeTriggerFn = ({ learningPathProgress }) => {
  if (!Array.isArray(learningPathProgress)) return false;
  return learningPathProgress.some(progress => {
    if (progress.status !== 'completed' || !progress.timestamp) return false;
    const hour = new Date(progress.timestamp).getHours();
    return hour >= 2 && hour < 4;
  });
};
