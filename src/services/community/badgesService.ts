import { supabase } from '@/lib/supabase';
import { Badge, BadgeCode, UserBadge } from '@/types/community/badges';

/**
 * Service for handling badge-related operations
 */
const badgesService = {
  /**
   * Get all available badges in the system
   */
  async getAllBadges(): Promise<Badge[]> {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching badges:', error);
      throw new Error(`Failed to fetch badges: ${error.message}`);
    }
    
    return data || [];
  },
  
  /**
   * Get a specific badge by its code
   */
  async getBadgeByCode(code: BadgeCode): Promise<Badge | null> {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('code', code)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error(`Error fetching badge with code ${code}:`, error);
      throw new Error(`Failed to fetch badge: ${error.message}`);
    }
    
    return data;
  },
  
  /**
   * Get all badges earned by a user
   */
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badge: badges (*)
      `)
      .eq('user_id', userId)
      .order('awarded_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user badges:', error);
      throw new Error(`Failed to fetch user badges: ${error.message}`);
    }
    
    return data || [];
  },
  
  /**
   * Check if user has a specific badge
   */
  async hasUserBadge(userId: string, badgeCode: BadgeCode): Promise<boolean> {
    // First get the badge ID
    const badge = await this.getBadgeByCode(badgeCode);
    if (!badge) return false;
    
    const { data, error } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badge.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking user badge:', error);
      throw new Error(`Failed to check user badge: ${error.message}`);
    }
    
    return !!data;
  },
  
  /**
   * Award a badge to a user if they don't already have it
   * This follows the idempotent pattern - safe to call multiple times
   */
  async awardBadgeIfNotExists(userId: string, badgeCode: BadgeCode): Promise<{awarded: boolean, badge: Badge | null}> {
    try {
      // Check if the badge exists
      const badge = await this.getBadgeByCode(badgeCode);
      if (!badge) {
        console.warn(`Badge with code ${badgeCode} does not exist`);
        return { awarded: false, badge: null };
      }
      
      // Check if user already has this badge
      const hasAlready = await this.hasUserBadge(userId, badgeCode);
      if (hasAlready) {
        return { awarded: false, badge };
      }
      
      // Award the badge
      const { error } = await supabase
        .from('user_badges')
        .insert([{
          user_id: userId,
          badge_id: badge.id
        }]);
      
      if (error) {
        console.error('Error awarding badge:', error);
        throw new Error(`Failed to award badge: ${error.message}`);
      }
      
      return { awarded: true, badge };
    } catch (error) {
      console.error('Error in awardBadgeIfNotExists:', error);
      throw error;
    }
  },
  
  /**
   * Check for streak milestones and award badges if applicable
   * @param userId - The user ID
   * @param currentStreak - The user's current streak count
   * @returns Array of newly awarded badges (if any)
   */
  async checkAndAwardStreakBadges(userId: string, currentStreak: number): Promise<Badge[]> {
    try {
      const awardedBadges: Badge[] = [];
      
      // Check which streak badges should be awarded based on current streak
      const badgeCodesToCheck: BadgeCode[] = [];
      
      if (currentStreak >= 7) {
        badgeCodesToCheck.push(BadgeCode.SEVEN_DAY_STREAK);
      }
      
      if (currentStreak >= 14) {
        badgeCodesToCheck.push(BadgeCode.FOURTEEN_DAY_STREAK);
      }
      
      if (currentStreak >= 30) {
        badgeCodesToCheck.push(BadgeCode.THIRTY_DAY_STREAK);
      }
      
      // Award each applicable badge if the user doesn't already have it
      for (const badgeCode of badgeCodesToCheck) {
        const { awarded, badge } = await this.awardBadgeIfNotExists(userId, badgeCode);
        if (awarded && badge) {
          awardedBadges.push(badge);
        }
      }
      
      return awardedBadges;
    } catch (error) {
      console.error('Error checking and awarding streak badges:', error);
      throw error;
    }
  },
  
  /**
   * Award the first habit badge if this is the user's first habit log
   */
  async checkAndAwardFirstHabitBadge(userId: string): Promise<Badge | null> {
    try {
      const { awarded, badge } = await this.awardBadgeIfNotExists(userId, BadgeCode.FIRST_HABIT);
      return awarded ? badge : null;
    } catch (error) {
      console.error('Error awarding first habit badge:', error);
      throw error;
    }
  }
};

export default badgesService;
