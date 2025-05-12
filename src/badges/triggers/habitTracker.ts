import { BadgeTriggerFn, BadgeRule } from '../types';

/**
 * Habit Tracker category badge rules
 * Each rule maps to a badge in the DB with matching code
 */
export const habitTrackerBadgeRules: BadgeRule[] = [
  { code: 'hbt_first', custom: true },
  { code: 'hbt_seed', custom: true },
  { code: 'hbt_waste_rookie', custom: true },
  { code: 'hbt_waste_pro', custom: true },
  { code: 'hbt_waste_master', custom: true },
  { code: 'hbt_co2_cutter', custom: true },
  { code: 'hbt_all_rounder', custom: true },
];

/**
 * hbt_first: Any single habit_logs entry
 */
export const hbtFirstTrigger: BadgeTriggerFn = ({ activityLogs }) => {
  return activityLogs.some(log => log.type === 'habit_log');
};

/**
 * hbt_seed: 7 distinct days with ≥1 log per day
 */
export const hbtSeedTrigger: BadgeTriggerFn = ({ activityLogs }) => {
  const days = new Set(
    activityLogs
      .filter(log => log.type === 'habit_log' && log.timestamp)
      .map(log => new Date(log.timestamp).toISOString().slice(0, 10))
  );
  return days.size >= 7;
};

/**
 * hbt_waste_rookie: habits.subcategory = 'Recycling' count ≥ 10
 */
export const hbtWasteRookieTrigger: BadgeTriggerFn = ({ activityLogs }) => {
  const count = activityLogs.filter(
    log => log.type === 'habit_log' && log.subcategory === 'Recycling'
  ).length;
  return count >= 10;
};

/**
 * hbt_waste_pro: habits.subcategory = 'Recycling' count ≥ 50
 */
export const hbtWasteProTrigger: BadgeTriggerFn = ({ activityLogs }) => {
  const count = activityLogs.filter(
    log => log.type === 'habit_log' && log.subcategory === 'Recycling'
  ).length;
  return count >= 50;
};

/**
 * hbt_waste_master: habits.subcategory = 'Recycling' count ≥ 100
 */
export const hbtWasteMasterTrigger: BadgeTriggerFn = ({ activityLogs }) => {
  const count = activityLogs.filter(
    log => log.type === 'habit_log' && log.subcategory === 'Recycling'
  ).length;
  return count >= 100;
};

/**
 * hbt_co2_cutter: sum(habit_logs.co2_saving) ≥ 50
 */
export const hbtCo2CutterTrigger: BadgeTriggerFn = ({ activityLogs }) => {
  const total = activityLogs
    .filter(log => log.type === 'habit_log' && typeof log.co2_saving === 'number')
    .reduce((sum, log) => sum + (log.co2_saving as number), 0);
  return total >= 50;
};

/**
 * hbt_all_rounder: count of distinct habit_logs.category ≥ 4
 */
export const hbtAllRounderTrigger: BadgeTriggerFn = ({ activityLogs }) => {
  const categories = new Set(
    activityLogs
      .filter(log => log.type === 'habit_log' && log.category)
      .map(log => log.category)
  );
  return categories.size >= 4;
};

