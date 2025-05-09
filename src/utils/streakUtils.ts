/**
 * Utilities for calculating and managing streaks
 */

/**
 * Determines whether a date is yesterday relative to another date
 * @param date The date to check
 * @param relativeTo The reference date (defaults to today)
 * @returns True if the date is yesterday
 */
export function isYesterday(date: Date | null | undefined, relativeTo: Date = new Date()): boolean {
  // Check for null or undefined
  if (!date) {
    return false;
  }
  
  try {
    // Ensure we have a valid Date object
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return false;
    }
    
    const yesterday = new Date(relativeTo);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Compare dates without time component
    return isSameDay(date, yesterday);
  } catch (error) {
    console.error('Error in isYesterday:', error);
    return false;
  }
}

/**
 * Determines whether a date is today
 * @param date The date to check
 * @returns True if the date is today
 */
export function isToday(date: Date | null | undefined): boolean {
  // Check for null or undefined
  if (!date) {
    return false;
  }
  
  try {
    // Ensure we have a valid Date object
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return false;
    }
    
    return isSameDay(date, new Date());
  } catch (error) {
    console.error('Error in isToday:', error);
    return false;
  }
}

/**
 * Checks if two dates represent the same day (ignoring time)
 * @param date1 First date to compare
 * @param date2 Second date to compare
 * @returns True if dates are the same day
 */
export function isSameDay(date1: Date | null | undefined, date2: Date | null | undefined): boolean {
  // Check for null or undefined values
  if (!date1 || !date2) {
    return false;
  }
  
  try {
    // Validate both dates
    if (!(date1 instanceof Date) || isNaN(date1.getTime()) ||
        !(date2 instanceof Date) || isNaN(date2.getTime())) {
      return false;
    }
    
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  } catch (error) {
    console.error('Error in isSameDay:', error);
    return false;
  }
}

/**
 * Formats a date to YYYY-MM-DD format
 * @param date The date to format
 * @returns The formatted date string
 */
export function formatDateToYYYYMMDD(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Calculates the new streak value based on the last activity date
 * @param lastActivityDate The date of the last activity
 * @param currentStreak The current streak count
 * @returns Object with new streak count and whether the streak was maintained
 */
export function calculateStreak(
  lastActivityDate: Date | string | null,
  currentStreak: number = 0
): { streak: number; maintained: boolean } {
  // No previous activity, start with streak of 1
  if (!lastActivityDate) {
    return { streak: 1, maintained: true };
  }
  
  try {
    // Convert string date to Date object if needed
    const lastDate = typeof lastActivityDate === 'string' 
      ? new Date(lastActivityDate) 
      : lastActivityDate;
    
    // Validate date object
    if (!(lastDate instanceof Date) || isNaN(lastDate.getTime())) {
      console.warn('Invalid date object in calculateStreak:', lastActivityDate);
      return { streak: 1, maintained: false };
    }
    
    // If activity was already done today, maintain current streak
    if (isToday(lastDate)) {
      return { 
        streak: Math.max(currentStreak, 1),  // Ensure streak is at least 1
        maintained: true 
      };
    }
    
    // If activity was done yesterday, increment streak
    if (isYesterday(lastDate)) {
      return { streak: currentStreak + 1, maintained: true };
    }
    
    // Otherwise reset streak to 1
    return { streak: 1, maintained: false };
  } catch (error) {
    console.error('Error in calculateStreak:', error);
    // Return safe default if we hit any errors
    return { streak: 1, maintained: false };
  }
}

/**
 * Calculate bonus points based on streak length
 * @param streak The current streak length
 * @param basePoints Base points for the activity
 * @param maxStreakBonus Maximum multiplier for streak bonus
 * @returns Total points including streak bonus
 */
export function calculateStreakBonus(
  streak: number,
  basePoints: number,
  maxStreakBonus: number = 5
): number {
  // No bonus for streak of 1 (first day)
  if (streak <= 1) {
    return basePoints;
  }
  
  // Calculate bonus (capped at maxStreakBonus)
  const bonusMultiplier = Math.min(streak - 1, maxStreakBonus);
  const bonusPoints = bonusMultiplier * 5; // 5 points per streak day
  
  return basePoints + bonusPoints;
}
