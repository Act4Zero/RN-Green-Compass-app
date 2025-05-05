import { useCallback } from 'react';
import { usePoints } from '../context/PointsContext';

/**
 * Hook for handling point rewards and related animations
 * @returns Functions for triggering various point-earning activities
 */
function usePointRewards() {
  const { 
    awardDailyCheckIn, 
    logHabit, 
    trackCommunityActivity,
    lastAwardedPoints,
    isLoading 
  } = usePoints();

  /**
   * Perform a daily check-in to earn points
   * @returns Promise resolving to success status
   */
  const performDailyCheckIn = useCallback(async () => {
    return await awardDailyCheckIn();
  }, [awardDailyCheckIn]);

  /**
   * Log a sustainable habit to earn points
   * @param habitId The ID of the habit being logged
   * @returns Promise resolving to success status
   */
  const logSustainableHabit = useCallback(async (habitId: string) => {
    return await logHabit(habitId);
  }, [logHabit]);

  /**
   * Record community participation to earn points
   * @param type The type of participation (post or comment)
   * @param contentId The ID of the content created
   * @returns Promise resolving to success status
   */
  const recordCommunityParticipation = useCallback(async (
    type: 'post' | 'comment',
    contentId: string
  ) => {
    return await trackCommunityActivity(type, contentId);
  }, [trackCommunityActivity]);

  // Information about the last awarded points for animations
  const pointAnimation = lastAwardedPoints ? {
    isVisible: true,
    amount: lastAwardedPoints.amount,
    source: lastAwardedPoints.source,
    // Map source to display text
    message: getMessageForSource(lastAwardedPoints.source, lastAwardedPoints.amount)
  } : {
    isVisible: false,
    amount: 0,
    source: '',
    message: ''
  };

  return {
    performDailyCheckIn,
    logSustainableHabit,
    recordCommunityParticipation,
    pointAnimation,
    isProcessing: isLoading
  };
}

/**
 * Helper function to get a user-friendly message for point sources
 */
function getMessageForSource(source: string, amount: number): string {
  switch (source) {
    case 'daily_login':
      return `+${amount} Green Points! Daily check-in bonus!`;
    case 'habit_log':
      return `+${amount} Green Points! Sustainable habit logged!`;
    case 'discussion_participation':
      return `+${amount} Green Points! Thanks for contributing!`;
    default:
      return `+${amount} Green Points!`;
  }
}

export default usePointRewards;
