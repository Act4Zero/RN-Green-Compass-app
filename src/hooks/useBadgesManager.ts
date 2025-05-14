import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import badgesService, { groupBadgesByCategory } from '@/services/community/badgesService';
import { Badge, UserBadge, BadgeNotification, BadgeCategoryType } from '@/types/community/badges';
import analyticsService from '@/services/analyticsService';
import { processUserEvent, evaluateAndAwardBadges } from '@/badges/badgeEngine';
import { BadgeTriggerContext } from '@/badges/types';

/**
 * Hook for managing user badges
 * Follows functional programming patterns and avoids circular dependencies
 */
function useBadgesManager() {
  const { user } = useAuth();
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newBadgeNotification, setNewBadgeNotification] = useState<BadgeNotification | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to prevent unnecessary re-renders and avoid circular dependencies
  const isLoadingRef = useRef(false);
  const loadingPromiseRef = useRef<Promise<void> | null>(null);
  
  /**
   * Fetch all available badges in the system
   */
  const loadAllBadges = useCallback(async (): Promise<Badge[]> => {
    if (!user) return [];
    
    try {
      const badges = await badgesService.getAllBadges();
      setAllBadges(badges);
      return badges;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load badges';
      setError(errorMessage);
      console.error('Error loading badges:', err);
      return [];
    }
  }, [user]);
  
  /**
   * Load user's earned badges
   * Using promise caching to prevent duplicate calls
   */
  const loadUserBadges = useCallback(async (): Promise<void> => {
    if (!user || isLoadingRef.current) return;
    
    // If we already have a loading promise in progress, return it
    if (loadingPromiseRef.current) {
      return loadingPromiseRef.current;
    }
    
    isLoadingRef.current = true;
    setIsLoading(true);
    
    try {
      // Create and store the promise
      loadingPromiseRef.current = (async () => {
        try {
          const badges = await badgesService.getUserBadges(user.id);
          setUserBadges(badges);
          setError(null);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load user badges';
          setError(errorMessage);
          console.error('Error loading user badges:', err);
          throw err; // Re-throw to maintain promise rejection
        } finally {
          isLoadingRef.current = false;
          setIsLoading(false);
          loadingPromiseRef.current = null;
        }
      })();
      
      return loadingPromiseRef.current;
    } catch (err) {
      isLoadingRef.current = false;
      setIsLoading(false);
      loadingPromiseRef.current = null;
      throw err;
    }
  }, [user]);
  
  /**
   * Check if user has a specific badge
   */
  const hasBadge = useCallback((badgeCode: string): boolean => {
    return userBadges.some(ub => ub.badge?.code === badgeCode);
  }, [userBadges]);

  /**
   * Get all badges with a flag indicating if the user has earned them
   * This is useful for UI rendering (e.g., colored vs grayscale)
   */
  const getAllBadgesWithEarnedStatus = useCallback((): (Badge & { isEarned: boolean })[] => {
    return allBadges.map(badge => ({
      ...badge,
      isEarned: hasBadge(badge.code)
    }));
  }, [allBadges, hasBadge]);

  /**
   * Filter badges by category
   * Works with both regular badges and badges with earned status
   */
  const getBadgesByCategory = useCallback(<T extends Badge>(badges: T[], category: BadgeCategoryType | 'all'): T[] => {
    if (category === 'all') return badges;
    return badges.filter(badge => badge.category === category);
  }, []);

  /**
   * Get available badge categories from loaded badges
   * Useful for building category filters in the UI
   */
  const availableCategories = useMemo((): BadgeCategoryType[] => {
    const categories = new Set<BadgeCategoryType>();
    allBadges.forEach(badge => categories.add(badge.category));
    return Array.from(categories);
  }, [allBadges]);
  
  /**
   * Handle badge notification dismissal
   */
  const dismissBadgeNotification = useCallback(() => {
    setNewBadgeNotification(null);
  }, []);
  
  /**
   * Check and award streak badges based on current streak
   * Returns true if any new badges were awarded
   */
  const checkAndAwardStreakBadges = useCallback(async (currentStreak: number): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Prepare context for badge evaluation
      const context: BadgeTriggerContext = {
        userId: user.id,
        profile: {
          id: user.id,
          login_streak: currentStreak,

        },
        activityLogs: [], // Would be populated with actual data
        now: new Date()
      };
      
      // Use the badge engine to evaluate and award badges
      const newBadges = await evaluateAndAwardBadges(user.id, context, 'daily_flow');
      
      // If new badges were awarded, reload user badges and show notification
      if (newBadges.length > 0) {
        // Track badges earned in analytics
        newBadges.forEach(badge => {
          analyticsService.trackEvent('badge_earned', {
            badge_code: badge.code,
            badge_name: badge.name,
            trigger: 'streak',
            streak_value: currentStreak
          });
        });
        
        // Reload user badges
        await loadUserBadges();
        
        // Show notification for the first awarded badge
        setNewBadgeNotification({
          badge: newBadges[0],
          isNew: true,
          awarded_at: new Date().toISOString()
        });
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error checking streak badges:', err);
      return false;
    }
  }, [user, loadUserBadges]);
  
  /**
   * Check and award first habit badge if it's the user's first habit
   * Returns true if the badge was newly awarded
   */
  const checkAndAwardFirstHabitBadge = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Use the badge engine to process a habit logging event
      const newBadges = await processUserEvent(user.id, 'habit_log');
      
      if (newBadges.length > 0) {
        // Track badges earned in analytics
        newBadges.forEach(badge => {
          analyticsService.trackEvent('badge_earned', {
            badge_code: badge.code,
            badge_name: badge.name,
            trigger: 'habit_log'
          });
        });
        
        // Reload user badges
        await loadUserBadges();
        
        // Show notification for the first awarded badge
        setNewBadgeNotification({
          badge: newBadges[0],
          isNew: true, 
          awarded_at: new Date().toISOString()
        });
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error checking habit badges:', err);
      return false;
    }
  }, [user, loadUserBadges]);
  
  // Initial load of user badges
  useEffect(() => {
    if (user && !isLoadingRef.current && userBadges.length === 0) {
      loadUserBadges().catch(err => {
        console.error('Failed to load user badges during initialization:', err);
      });
      
      // Check for login badges when user is authenticated
      processUserEvent(user.id, 'login')
        .then(newBadges => {
          if (newBadges.length > 0) {
            // Track badges earned in analytics
            newBadges.forEach(badge => {
              analyticsService.trackEvent('badge_earned', {
                badge_code: badge.code,
                badge_name: badge.name,
                trigger: 'login'
              });
            });
            
            // Reload user badges and show notification
            loadUserBadges();
            setNewBadgeNotification({
              badge: newBadges[0],
              isNew: true,
              awarded_at: new Date().toISOString()
            });
          }
        })
        .catch(err => {
          console.error('Failed to process login event for badges:', err);
        });
    }
  }, [user, loadUserBadges, userBadges.length]);
  
  // Generalized method to check and award badges for any event type
  const processUserEventWithType = useCallback(async (eventType: 'login' | 'habit_log' | 'goal_completion' | 'community_activity', contextData: Partial<BadgeTriggerContext> = {}): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const newBadges = await processUserEvent(user.id, eventType, contextData);
      
      if (newBadges.length > 0) {
        // Track badges earned in analytics
        newBadges.forEach(badge => {
          analyticsService.trackEvent('badge_earned', {
            badge_code: badge.code,
            badge_name: badge.name,
            trigger: eventType
          });
        });
        
        // Reload user badges
        await loadUserBadges();
        
        // Show notification for the first awarded badge
        setNewBadgeNotification({
          badge: newBadges[0],
          isNew: true,
          awarded_at: new Date().toISOString()
        });
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error(`Error processing ${eventType} for badges:`, err);
      return false;
    }
  }, [user, loadUserBadges]);
  
  return {
    // Data
    allBadges,
    userBadges,
    isLoading,
    error,
    newBadgeNotification,
    
    // Enhanced data for UI
    badgesWithEarnedStatus: getAllBadgesWithEarnedStatus(),
    availableCategories,
    
    // Actions
    loadAllBadges,
    loadUserBadges,
    hasBadge,
    getBadgesByCategory,
    dismissBadgeNotification,
    checkAndAwardStreakBadges,
    checkAndAwardFirstHabitBadge,
    processUserEventWithType
  };
}

export default useBadgesManager;
