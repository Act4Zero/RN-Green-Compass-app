import { useCallback, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useBadges } from '@/context/BadgesContext';
import { getStreakMilestone } from '@/utils/badgeUtils';
import { StreakMilestone } from '@/types/community/badges';
import analyticsService from '@/services/analyticsService';

/**
 * Hook to check for streak milestones and award badges
 * This hooks bridges between habit tracking and the badges system
 */
function useStreakMilestones() {
  const { user } = useAuth();
  const { checkAndAwardStreakBadges } = useBadges();
  const [currentMilestone, setCurrentMilestone] = useState<StreakMilestone | null>(null);
  
  // Use a ref to track previous streak value to detect changes
  const previousStreakRef = useRef<number>(0);
  
  /**
   * Check if the current streak has reached a milestone
   * and award any applicable badges
   */
  const checkMilestones = useCallback(async (currentStreak: number): Promise<StreakMilestone | null> => {
    if (!user) return null;
    
    // Get the milestone, if any
    const milestone = getStreakMilestone(currentStreak, previousStreakRef.current);
    
    // Update our previous streak ref
    previousStreakRef.current = currentStreak;
    
    // If no milestone reached, return null
    if (!milestone) {
      setCurrentMilestone(null);
      return null;
    }
    
    // Update state with current milestone
    setCurrentMilestone(milestone);
    
    // Track milestone reached in analytics
    analyticsService.trackEvent('streak_milestone_reached', {
      streak_days: milestone.days,
      message: milestone.message
    });
    
    // Check and award any applicable badges
    if (milestone.badgeCode) {
      await checkAndAwardStreakBadges(currentStreak);
    }
    
    return milestone;
  }, [user, checkAndAwardStreakBadges]);
  
  /**
   * Reset the current milestone display
   */
  const resetMilestone = useCallback(() => {
    setCurrentMilestone(null);
  }, []);
  
  return {
    currentMilestone,
    checkMilestones,
    resetMilestone
  };
}

export default useStreakMilestones;
