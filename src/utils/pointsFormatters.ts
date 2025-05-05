import { PointEvent, PointSource } from '../types/points';

/**
 * Utilities for formatting point data for display
 */

/**
 * Maps point sources to user-friendly display names
 * @param source The point source identifier
 * @returns A user-friendly display name
 */
export function formatPointSource(source: PointSource): string {
  const sourceMap: Record<PointSource, string> = {
    'daily_login': 'Daily Check-in',
    'habit_log': 'Sustainable Habit',
    'discussion_participation': 'Community Participation'
  };
  
  return sourceMap[source] || source;
}

/**
 * Creates a descriptive message for a point event
 * @param pointEvent The point event to describe
 * @returns A user-friendly description
 */
export function getPointEventDescription(pointEvent: PointEvent): string {
  const source = formatPointSource(pointEvent.source);
  
  switch (pointEvent.source) {
    case 'daily_login':
      return `${source} - You earned ${pointEvent.points} points!`;
    case 'habit_log':
      return `${source} - You logged a sustainable habit (+${pointEvent.points} points)`;
    case 'discussion_participation':
      return `${source} - Thanks for contributing (+${pointEvent.points} points)`;
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
    default:
      return `+${amount} Green Points!`;
  }
}
