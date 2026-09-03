import { PointEvent, PointSource } from '../types/community/points';

/**
 * Utilities for formatting point data for display
 */

/**
 * Maps point sources to user-friendly display names
 * @param source The point source identifier
 * @returns A user-friendly display name
 */
export function formatPointSource(source: PointSource, locale: 'en' | 'bg' = 'en'): string {
  const sourceMap: Record<PointSource, { en: string; bg: string }> = {
    'daily_login': { en: 'Daily Check-in', bg: 'Ежедневно влизане' },
    'habit_log': { en: 'Sustainable Habit', bg: 'Устойчив навик' },
    'discussion_participation': { en: 'Community Participation', bg: 'Участие в общността' },
    'habit_streak': { en: 'Habit Streak', bg: 'Серия от навици' },
    'learning_milestone': { en: 'Learning Milestone', bg: 'Учебен етап' },
    'daily_challenge': { en: 'Daily Eco-Challenge', bg: 'Ежедневно еко предизвикателство' }
  };
  
  return sourceMap[source]?.[locale] || source;
}

/**
 * Creates a descriptive message for a point event
 * @param pointEvent The point event to describe
 * @returns A user-friendly description
 */
export function getPointEventDescription(pointEvent: PointEvent, locale: 'en' | 'bg' = 'en'): string {
  const source = formatPointSource(pointEvent.source, locale);

  if (locale === 'bg') {
    switch (pointEvent.source) {
      case 'habit_log': return `${source} — записахте устойчив навик (+${pointEvent.points} точки)`;
      case 'discussion_participation': return `${source} — благодарим за приноса (+${pointEvent.points} точки)`;
      case 'learning_milestone': return `${source} — завършихте етап в Центъра за знания (+${pointEvent.points} точки)`;
      case 'daily_challenge': return `${source} — завършихте днешното предизвикателство (+${pointEvent.points} точки)`;
      default: return `${source} — спечелихте ${pointEvent.points} точки`;
    }
  }
  
  switch (pointEvent.source) {
    case 'daily_login':
      return `${source} - You earned ${pointEvent.points} points!`;
    case 'habit_log':
      return `${source} - You logged a sustainable habit (+${pointEvent.points} points)`;
    case 'discussion_participation':
      return `${source} - Thanks for contributing (+${pointEvent.points} points)`;
    case 'learning_milestone':
      return `${source} - You completed a Knowledge Hub milestone (+${pointEvent.points} points)`;
    case 'daily_challenge':
      return `${source} - You completed today’s challenge (+${pointEvent.points} points)`;
    default:
      return `${source} - You earned ${pointEvent.points} points`;
  }
}

/**
 * Groups point events by date and sums points for each date
 * @param events Array of point events
 * @returns Object with dates as keys and point data for each date
 */
export function groupPointEventsByDate(events: PointEvent[]): Record<string, {
  totalPoints: number;
  events: PointEvent[];
}> {
  return events.reduce<Record<string, { totalPoints: number; events: PointEvent[] }>>(
    (acc, event) => {
      const date = new Date(event.created_at).toLocaleDateString();
      
      if (!acc[date]) {
        acc[date] = { totalPoints: 0, events: [] };
      }
      
      acc[date].totalPoints += event.points;
      acc[date].events.push(event);
      
      return acc;
    }, 
    {}
  );
}

/**
 * Calculates total points by source from an array of point events
 * @param events Array of point events
 * @returns Object with sources as keys and total points for each source
 */
export function calculatePointsBySource(events: PointEvent[]): Record<PointSource, number> {
  return events.reduce<Record<PointSource, number>>(
    (acc, event) => {
      if (!acc[event.source]) {
        acc[event.source] = 0;
      }
      
      acc[event.source] += event.points;
      
      return acc;
    }, 
    {} as Record<PointSource, number>
  );
}

/**
 * Creates a message for points animation
 * @param amount Number of points awarded
 * @param source Source of the points
 * @returns User-friendly message for animation
 */
export function createPointsAnimationMessage(amount: number, source: PointSource): string {
  switch (source) {
    case 'daily_login':
      return `+${amount} Green Points! Daily check-in bonus!`;
    case 'habit_log':
      return `+${amount} Green Points! Sustainable habit logged!`;
    case 'discussion_participation':
      return `+${amount} Green Points! Thanks for contributing!`;
    case 'learning_milestone':
      return `+${amount} Green Points! Learning milestone reached!`;
    case 'daily_challenge':
      return `+${amount} Green Points! Daily challenge completed!`;
    default:
      return `+${amount} Green Points!`;
  }
}
