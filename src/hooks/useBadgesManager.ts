import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import badgesService from '@/services/community/badgesService';
import { Badge, UserBadge, BadgeNotification } from '@/types/community/badges';
import analyticsService from '@/services/analyticsService';

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
  const loadAllBadges = useCallback(async () => {
    if (!user) return;
    
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
      const newBadges = await badgesService.checkAndAwardStreakBadges(user.id, currentStreak);
      
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
      const badge = await badgesService.checkAndAwardFirstHabitBadge(user.id);
      
      if (badge) {
        // Track badge earned in analytics
        analyticsService.trackEvent('badge_earned', {
          badge_code: badge.code,
          badge_name: badge.name,
          trigger: 'first_habit'
        });
        
        // Reload user badges
        await loadUserBadges();
        
        // Show notification
        setNewBadgeNotification({
          badge,
          isNew: true, 
          awarded_at: new Date().toISOString()
        });
        
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error checking first habit badge:', err);
      return false;
    }
  }, [user, loadUserBadges]);
  
  // Initial load of user badges
  useEffect(() => {
    if (user && !isLoadingRef.current && userBadges.length === 0) {
      loadUserBadges().catch(err => {
        console.error('Failed to load user badges during initialization:', err);
      });
    }
  }, [user, loadUserBadges, userBadges.length]);
  
  return {
    allBadges,
    userBadges,
    isLoading,
    error,
    newBadgeNotification,
    loadAllBadges,
    loadUserBadges,
    hasBadge,
    dismissBadgeNotification,
    checkAndAwardStreakBadges,
    checkAndAwardFirstHabitBadge
  };
}

export default useBadgesManager;
