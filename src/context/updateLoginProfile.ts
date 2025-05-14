import supabase from '../lib/supabase';
import { Profile } from '../types/profiles';

/**
 * Updates the user's last_login_date and login_streak in the profiles table.
 * @param userId The user's UUID
 * @param prevLastLoginDate The previous last_login_date (ISO string or null)
 * @param prevLoginStreak The previous login_streak (number or null)
 * @param nowISO The current ISO date string
 */
export async function updateLoginProfile(
  userId: string,
  prevLastLoginDate: string | null,
  prevLoginStreak: number | null,
  nowISO: string
): Promise<{ error: Error | null }> {
  try {
    let newStreak = 1;
    if (prevLastLoginDate) {
      const prevDate = new Date(prevLastLoginDate);
      const nowDate = new Date(nowISO);
      // Calculate days between last login and now
      const diffDays = Math.floor((nowDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak = (prevLoginStreak || 1) + 1;
      } else if (diffDays === 0) {
        newStreak = prevLoginStreak || 1; // Same day, don't increment
      } else {
        newStreak = 1; // Reset streak
      }
    }
    const { error } = await supabase
      .from('profiles')
      .update({ last_login_date: nowISO, login_streak: newStreak })
      .eq('id', userId);
    return { error: error ? new Error(error.message) : null };
  } catch (err) {
    return { error: err as Error };
  }
}
