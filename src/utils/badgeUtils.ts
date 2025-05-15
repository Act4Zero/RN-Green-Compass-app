import { Badge, StreakMilestone, STREAK_MILESTONES } from '@/types/community/badges';

/**
 * Utility functions for the badges feature
 */

/**
 * Check if a streak has reached any milestones
 * @param currentStreak Current streak count
 * @param previousStreak Previous streak count (optional)
 * @returns The milestone reached, or null if no milestone was reached
 */
export function getStreakMilestone(currentStreak: number, previousStreak?: number): StreakMilestone | null {
  // If previous streak is provided, check if we've crossed a milestone boundary
  if (previousStreak !== undefined) {
    for (const milestone of STREAK_MILESTONES) {
      if (currentStreak >= milestone.days && previousStreak < milestone.days) {
        return milestone;
      }
    }
    return null;
  }
  
  // If no previous streak, just return the highest applicable milestone
  return STREAK_MILESTONES
    .filter(m => currentStreak >= m.days)
    .sort((a, b) => b.days - a.days)[0] || null;
}

/**
 * Format the awarded date for display
 * @param date ISO date string
 * @returns Formatted date string (e.g., "May 3, 2025")
 */
export function formatAwardedDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Sort badges by award date (newest first)
 */
export function sortBadgesByDate(badges: Badge[]): Badge[] {
  return [...badges].sort((a, b) => {
    const dateA = a.awarded_at ? new Date(a.awarded_at).getTime() : 0;
    const dateB = b.awarded_at ? new Date(b.awarded_at).getTime() : 0;
    return dateB - dateA;
  });
}

/**
 * Get description text for a badge with awarded date
 */
export function getBadgeDetailText(badge: Badge, awardedDate: string): string {
  const formattedDate = formatAwardedDate(awardedDate);
  
  // Custom descriptions based on badge type
  switch (badge.code) {
    case 'seven_day_streak':
      return `Earned for maintaining a 7-day sustainability streak on ${formattedDate}`;
    case 'fourteen_day_streak':
      return `Earned for maintaining a 14-day sustainability streak on ${formattedDate}`;
    case 'thirty_day_streak':
      return `Earned for maintaining a 30-day sustainability streak on ${formattedDate}`;
    case 'first_habit':
      return `Earned for logging your first sustainability habit on ${formattedDate}`;
    default:
      return badge.description 
        ? `${badge.description} Earned on ${formattedDate}`
        : `Earned on ${formattedDate}`;
  }
}
