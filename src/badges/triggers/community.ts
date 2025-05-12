import { BadgeTriggerFn, BadgeRule } from '../types';

/**
 * Community badge rules
 * Each rule maps to a badge in the DB with matching code
 */
export const communityBadgeRules: BadgeRule[] = [
  { code: 'discuss_first', custom: true },
  { code: 'helpful_bronze', custom: true },
  { code: 'helpful_silver', custom: true },
  { code: 'helpful_gold', custom: true },
  { code: 'flag_master', custom: true },
  { code: 'mentor_bronze', custom: true },
  { code: 'mentor_silver', custom: true },
  { code: 'mentor_gold', custom: true },
];

/**
 * discuss_first: First record in discussions table
 */
export const discussFirstTrigger: BadgeTriggerFn = ({ discussions }) => {
  return Array.isArray(discussions) && discussions.length > 0;
};

/**
 * helpful_bronze: Sum of reactions where reaction_type = 'like' on user’s comments ≥ 10
 */
export const helpfulBronzeTrigger: BadgeTriggerFn = ({ reactions, comments }) => {
  if (!Array.isArray(reactions) || !Array.isArray(comments)) return false;
  const userCommentIds = new Set(comments.map(c => c.id));
  const likeCount = reactions.filter(r => r.reaction_type === 'like' && userCommentIds.has(r.comment_id)).length;
  return likeCount >= 10;
};

/**
 * helpful_silver: Same sum ≥ 30
 */
export const helpfulSilverTrigger: BadgeTriggerFn = ({ reactions, comments }) => {
  if (!Array.isArray(reactions) || !Array.isArray(comments)) return false;
  const userCommentIds = new Set(comments.map(c => c.id));
  const likeCount = reactions.filter(r => r.reaction_type === 'like' && userCommentIds.has(r.comment_id)).length;
  return likeCount >= 30;
};

/**
 * helpful_gold: Same sum ≥ 100
 */
export const helpfulGoldTrigger: BadgeTriggerFn = ({ reactions, comments }) => {
  if (!Array.isArray(reactions) || !Array.isArray(comments)) return false;
  const userCommentIds = new Set(comments.map(c => c.id));
  const likeCount = reactions.filter(r => r.reaction_type === 'like' && userCommentIds.has(r.comment_id)).length;
  return likeCount >= 100;
};

/**
 * flag_master: 100 combined posts+comments by user where no flags in moderation logs
 */
export const flagMasterTrigger: BadgeTriggerFn = ({ posts, comments, moderationLogs }) => {
  if (!Array.isArray(posts) || !Array.isArray(comments) || !Array.isArray(moderationLogs)) return false;
  const allIds = new Set([...posts.map(p => p.id), ...comments.map(c => c.id)]);
  const flaggedIds = new Set(moderationLogs.filter(m => allIds.has(m.target_id)).map(m => m.target_id));
  const cleanCount = [...allIds].filter(id => !flaggedIds.has(id)).length;
  return cleanCount >= 100;
};

/**
 * mentor_bronze: Count of user’s comments with ≥1 upvote each ≥ 5
 */
export const mentorBronzeTrigger: BadgeTriggerFn = ({ comments }) => {
  if (!Array.isArray(comments)) return false;
  const upvotedComments = comments.filter(c => typeof c.upvotes === 'number' && c.upvotes >= 1).length;
  return upvotedComments >= 5;
};

/**
 * mentor_silver: Same count ≥ 25
 */
export const mentorSilverTrigger: BadgeTriggerFn = ({ comments }) => {
  if (!Array.isArray(comments)) return false;
  const upvotedComments = comments.filter(c => typeof c.upvotes === 'number' && c.upvotes >= 1).length;
  return upvotedComments >= 25;
};

/**
 * mentor_gold: Same count ≥ 50
 */
export const mentorGoldTrigger: BadgeTriggerFn = ({ comments }) => {
  if (!Array.isArray(comments)) return false;
  const upvotedComments = comments.filter(c => typeof c.upvotes === 'number' && c.upvotes >= 1).length;
  return upvotedComments >= 50;
};
