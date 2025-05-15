import React, { createContext, ReactNode, useContext } from 'react';
import useLeaderboardState from '@/hooks/community/useLeaderboardState';
import { 
  LeaderboardFilter, 
  LeaderboardFilterType,
  LeaderboardType,
  PointsLeaderboardEntry,
  StreakLeaderboardEntry,
  MotivationalInfo
} from '@/types/leaderboards';

// Define the context interface
interface LeaderboardContextType {
  // Data
  entries: (PointsLeaderboardEntry | StreakLeaderboardEntry)[];
  currentUserEntry?: PointsLeaderboardEntry | StreakLeaderboardEntry;
  totalEntries: number;
  hasMore: boolean;
  motivationalInfo: MotivationalInfo;
  
  // State
  isLoading: boolean;
  error: Error | null;
  filter: LeaderboardFilter;
  
  // Actions
  setLeaderboardType: (type: LeaderboardType) => void;
  setLeaderboardScope: (scope: LeaderboardFilterType, groupId?: string) => void;
  loadMoreEntries: () => void;
  refreshLeaderboard: () => void;
}

// Create the context with default values
const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

// Provider component
export function LeaderboardProvider({ children }: { children: ReactNode }) {
  // Use our custom hook for all state management and event handlers
  const leaderboardState = useLeaderboardState();
  
  return (
    <LeaderboardContext.Provider value={leaderboardState}>
      {children}
    </LeaderboardContext.Provider>
  );
}

// Custom hook to use the leaderboard context
export function useLeaderboard() {
  const context = useContext(LeaderboardContext);
  
  if (context === undefined) {
    throw new Error('useLeaderboard must be used within a LeaderboardProvider');
  }
  
  return context;
}
