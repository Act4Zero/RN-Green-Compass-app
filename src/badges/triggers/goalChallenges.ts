import { BadgeTriggerFn, BadgeRule, ChallengeActivity } from '../types';

/**
 * Goal & Challenge badge rules
 * Each rule maps to a badge in the DB with matching code
 */
export const goalChallengesBadgeRules: BadgeRule[] = [
  { code: 'goal_first', custom: true },
  { code: 'goal_achieve_bronze', custom: true },
  { code: 'goal_achieve_silver', custom: true },
  { code: 'goal_achieve_gold', custom: true },
  { code: 'challenge_join', custom: true },
  { code: 'challenge_finish', custom: true },
  { code: 'trailblazer', custom: true },
  { code: 'power_of_we', custom: true },
];

/**
 * goal_first: user_goals record created
 */
export const goalFirstTrigger: BadgeTriggerFn = ({ userGoals }) => {
  return Array.isArray(userGoals) && userGoals.length > 0;
};

/**
 * goal_achieve_bronze: user_goals where current_value >= target count >= 1
 */
export const goalAchieveBronzeTrigger: BadgeTriggerFn = ({ userGoals }) => {
  if (!Array.isArray(userGoals)) return false;
  const achieved = userGoals.filter(g => g.current_value >= g.target).length;
  return achieved >= 1;
};

/**
 * goal_achieve_silver: user_goals where current_value >= target count >= 5
 */
export const goalAchieveSilverTrigger: BadgeTriggerFn = ({ userGoals }) => {
  if (!Array.isArray(userGoals)) return false;
  const achieved = userGoals.filter(g => g.current_value >= g.target).length;
  return achieved >= 5;
};

/**
 * goal_achieve_gold: user_goals where current_value >= target count >= 10
 */
export const goalAchieveGoldTrigger: BadgeTriggerFn = ({ userGoals }) => {
  if (!Array.isArray(userGoals)) return false;
  const achieved = userGoals.filter(g => g.current_value >= g.target).length;
  return achieved >= 10;
};

/**
 * challenge_join: first challenge_participants record
 */
export const challengeJoinTrigger: BadgeTriggerFn = ({ challengeParticipants }) => {
  return Array.isArray(challengeParticipants) && challengeParticipants.length > 0;
};

/**
 * challenge_finish: challenge_participants where status = 'completed' count >= 1
 */
export const challengeFinishTrigger: BadgeTriggerFn = ({ challengeParticipants }) => {
  if (!Array.isArray(challengeParticipants)) return false;
  return challengeParticipants.filter(p => p.status === 'completed').length >= 1;
};

/**
 * trailblazer: rank <= 10 percentile in challenge_activity.total_co2 leaderboard
 * Assumes challengeActivity is an object with userRank (1-based) and totalParticipants
 */
export const trailblazerTrigger: BadgeTriggerFn = ({ challengeActivity }) => {
  let activity: ChallengeActivity | undefined;
  if (Array.isArray(challengeActivity)) {
    activity = challengeActivity[0];
  } else {
    activity = challengeActivity;
  }
  if (!activity || typeof activity.userRank !== 'number' || typeof activity.totalParticipants !== 'number') return false;
  const percentile = (activity.userRank / activity.totalParticipants) * 100;
  return percentile <= 10;
};

/**
 * power_of_we: challenge_activity.user_co2 / challenge_activity.team_co2 >= 0.05 count >= 1
 * Assumes challengeActivity is an array of objects with user_co2 and team_co2
 */
export const powerOfWeTrigger: BadgeTriggerFn = ({ challengeActivity }) => {
  if (!Array.isArray(challengeActivity)) return false;
  return challengeActivity.filter(a => typeof a.user_co2 === 'number' && typeof a.team_co2 === 'number' && a.team_co2 > 0 && (a.user_co2 / a.team_co2) >= 0.05).length >= 1;
};
