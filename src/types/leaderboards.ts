/**
 * Types for the leaderboards feature
 */

// Leaderboard item representing a single user's ranking
export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  rank: number;
  avatar?: string;
  isCurrentUser: boolean;
}

// Points leaderboard entry
export interface PointsLeaderboardEntry extends LeaderboardEntry {
  totalPoints: number;
}

// Streak leaderboard entry
export interface StreakLeaderboardEntry extends LeaderboardEntry {
  longestStreak: number;
  currentStreak: number;
}

// Leaderboard filter options
export type LeaderboardFilterType = 'friends' | 'groups' | 'community';

// Type of leaderboard
export type LeaderboardType = 'points' | 'streak';

// Combined filter options
export interface LeaderboardFilter {
  type: LeaderboardType;
  scope: LeaderboardFilterType;
  groupId?: string; // Only needed when scope is 'groups'
}

// Pagination parameters
export interface LeaderboardPagination {
  page: number;
  pageSize: number;
}

// Response from leaderboard queries
export interface LeaderboardResponse<T extends LeaderboardEntry> {
  entries: T[];
  currentUserEntry?: T; // The current user's entry, regardless of whether they're in the visible page
  totalEntries: number;
  hasMore: boolean;
}

// Motivational message info
export interface MotivationalInfo {
  nextMilestone?: {
    rank: number;
    pointsNeeded?: number;
    daysNeeded?: number;
    user?: {
      displayName: string;
      userId: string;
    };
  };
  message: string;
}
