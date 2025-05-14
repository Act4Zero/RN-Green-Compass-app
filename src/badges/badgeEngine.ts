import { Badge } from '@/types/community/badges';
import { BadgeTriggerContext, BadgeEvaluationResult } from './types';
import { badgeTriggerRegistry } from './triggerRegistry';
import badgesService from '@/services/community/badgesService';

/**
 * Evaluates which badges should be awarded to a user based on their current context
 * @param context The user's contextual information for badge evaluation
 * @param candidateBadges The badges to evaluate for awarding, filtered by relevant category
 * @returns Array of evaluation results with badgeCode and shouldAward flag
 */
export async function evaluateBadges(
  context: BadgeTriggerContext,
  candidateBadges: Badge[]
): Promise<BadgeEvaluationResult[]> {
  const results: BadgeEvaluationResult[] = [];

  // Process badges in parallel for better performance
  const evaluationPromises = candidateBadges.map(async (badge) => {
    // Get the trigger function for this badge code
    const triggerFn = badgeTriggerRegistry[badge.code];
    
    // Skip if no trigger defined for this badge
    if (!triggerFn) {
      return {
        badgeCode: badge.code,
        shouldAward: false
      };
    }

    try {
      // Evaluate if badge should be awarded
      const shouldAward = await Promise.resolve(triggerFn(context));
      
      return {
        badgeCode: badge.code,
        shouldAward
      };
    } catch (error) {
      console.error(`Error evaluating badge ${badge.code}:`, error);
      return {
        badgeCode: badge.code,
        shouldAward: false
      };
    }
  });

  // Wait for all evaluations to complete
  return Promise.all(evaluationPromises);
}

/**
 * Evaluates all badges in a category and awards those that should be awarded
 * @param userId User ID to award badges to
 * @param context Context information for badge evaluation
 * @param category Optional category to filter badges by
 * @returns Array of newly awarded badges
 */
export async function evaluateAndAwardBadges(
  userId: string,
  context: BadgeTriggerContext,
  category?: string
): Promise<Badge[]> {
  // Load all badges, optionally filtering by category
  const allBadges = await badgesService.getAllBadges();
  
  // Filter badges by category if specified
  const candidateBadges = category 
    ? allBadges.filter(badge => badge.category === category)
    : allBadges;

  // Evaluate which badges should be awarded
  const evaluationResults = await evaluateBadges(
    context,
    candidateBadges
  );

  const awardedBadges: Badge[] = [];

  // Award each badge that should be awarded
  for (const result of evaluationResults) {
    if (result.shouldAward) {
      const { awarded, badge } = await badgesService.awardBadgeIfNotExists(
        userId, 
        result.badgeCode
      );
      
      if (awarded && badge) {
        awardedBadges.push(badge);
      }
    }
  }

  return awardedBadges;
}

/**
 * Evaluates and awards badges for a specific event type
 * Convenience wrapper for common event patterns like login, habit logging, etc.
 */
export async function processUserEvent(
  userId: string,
  eventType: 'login' | 'habit_log' | 'goal_completion' | 'community_activity',
  context: Partial<BadgeTriggerContext> = {}
): Promise<Badge[]> {
  // Map event types to relevant badge categories
  const categoryMap: Record<string, string> = {
    'login': 'daily_flow',
    'habit_log': 'habit_tracker',
    'goal_completion': 'goals_challenges',
    'community_activity': 'community'
  };
  
  // Default context with current time
  const baseContext: BadgeTriggerContext = {
    userId,
    profile: { id: userId, login_streak: 0 },
    activityLogs: [],
    now: new Date(),
    ...context
  };
  
  // Get the relevant category for this event
  const category = categoryMap[eventType];
  
  // Evaluate and award badges for the relevant category
  return evaluateAndAwardBadges(userId, baseContext, category);
}
