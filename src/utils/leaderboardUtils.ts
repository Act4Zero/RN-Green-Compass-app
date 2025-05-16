import { 
  LeaderboardFilterType, 
  LeaderboardType,
  PointsLeaderboardEntry,
  StreakLeaderboardEntry
} from '@/types/leaderboards';

/**
 * Formats leaderboard filter type for display
 */
export function formatFilterTypeLabel(filterType: LeaderboardFilterType): string {
  switch (filterType) {
    case 'friends':
      return 'Friends';
    case 'groups':
      return 'Groups';
    case 'community':
      return 'Community';
    default:
      return 'Unknown';
  }
}

/**
 * Formats leaderboard type for display
 */
export function formatLeaderboardTypeLabel(leaderboardType: LeaderboardType): string {
  switch (leaderboardType) {
    case 'points':
      return 'Most Green Points';
    case 'streak':
      return 'Longest Habit Streak';
    default:
      return 'Unknown';
  }
}

/**
 * Gets the available filter options based on user data
 */
export function getAvailableFilterOptions(
  hasFriends: boolean, 
  hasGroups: boolean
): LeaderboardFilterType[] {
  const options: LeaderboardFilterType[] = ['community']; // Community is always available
  
  if (hasFriends) {
    options.push('friends');
  }
  
  if (hasGroups) {
    options.push('groups');
  }
  
  return options;
}

/**
 * Checks if a user is within the top N ranks
 */
export function isInTopRanks(
  entry: PointsLeaderboardEntry | StreakLeaderboardEntry | undefined, 
  topCount: number
): boolean {
  if (!entry) return false;
  return entry.rank <= topCount;
}

/**
 * Determines if an entry should be highlighted (current user, top 3, etc.)
 */
export function shouldHighlightEntry(
  entry: PointsLeaderboardEntry | StreakLeaderboardEntry
): boolean {
  return entry.isCurrentUser || entry.rank <= 3;
}

/**
 * Gets the points or streak gap between two entries
 */
export function getGapToNextRank(
  currentEntry: PointsLeaderboardEntry | StreakLeaderboardEntry,
  nextRankEntry: PointsLeaderboardEntry | StreakLeaderboardEntry | undefined,
  leaderboardType: LeaderboardType
): number {
  if (!nextRankEntry) return 0;
  
  if (leaderboardType === 'points') {
    return (nextRankEntry as PointsLeaderboardEntry).totalPoints - 
           (currentEntry as PointsLeaderboardEntry).totalPoints;
  } else {
    return (nextRankEntry as StreakLeaderboardEntry).longestStreak - 
           (currentEntry as StreakLeaderboardEntry).longestStreak;
  }
}

/**
 * Gets the previous page number for pagination
 * Ensures we don't go below page 1
 */
export function getPreviousPage(currentPage: number): number {
  return Math.max(1, currentPage - 1);
}

/**
 * Calculates what percentile the user is in
 */
export function calculatePercentile(
  rank: number,
  totalEntries: number
): number {
  if (totalEntries === 0) return 0;
  return Math.round((1 - (rank / totalEntries)) * 100);
}
