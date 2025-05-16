import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  fetchLeaderboard, 
  generateMotivationalMessage 
} from '@/services/leaderboardService';
import { 
  hasUserFriends,
  hasUserGroups,
  getUserGroups
} from '@/services/relationshipService';
import { 
  LeaderboardFilter, 
  LeaderboardFilterType,
  LeaderboardType,
  LeaderboardPagination,
  PointsLeaderboardEntry,
  StreakLeaderboardEntry,
  MotivationalInfo
} from '@/types/leaderboards';
import analyticsService from '@/services/analyticsService';

/**
 * Custom hook for managing leaderboard state and interactions
 */
function useLeaderboardState() {
  // User authentication state
  const { user } = useAuth();
  
  // Leaderboard data state
  const [entries, setEntries] = useState<(PointsLeaderboardEntry | StreakLeaderboardEntry)[]>([]);
  const [currentUserEntry, setCurrentUserEntry] = useState<(PointsLeaderboardEntry | StreakLeaderboardEntry) | undefined>(undefined);
  const [totalEntries, setTotalEntries] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Available filter options state
  // TODO: Enable 'friends' and 'groups' filters once user_connections and group_members tables exist in the DB
  const [availableScopes, setAvailableScopes] = useState<LeaderboardFilterType[]>(['community']);
  const [userGroups, setUserGroups] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  
  // Filter and pagination state
  const [filter, setFilter] = useState<LeaderboardFilter>({
    type: 'points',
    scope: 'community' // Default to community-wide view
  });
  
  const [pagination, setPagination] = useState<LeaderboardPagination>({
    page: 1,
    pageSize: 10
  });
  
  // Motivational message state
  const [motivationalInfo, setMotivationalInfo] = useState<MotivationalInfo>({ message: '' });
  
  /**
   * Load leaderboard data based on current filter and pagination
   */
  const loadLeaderboard = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Track screen view in analytics
      analyticsService.trackScreenView('leaderboard', JSON.stringify({
        leaderboardType: filter.type,
        leaderboardScope: filter.scope
      }));
      
      const response = await fetchLeaderboard(
        filter, 
        pagination, 
        user.id
      );
      
      setEntries(response.entries);
      setCurrentUserEntry(response.currentUserEntry);
      setTotalEntries(response.totalEntries);
      setHasMore(response.hasMore);
      
      // Generate motivational message
      const message = generateMotivationalMessage(
        response.currentUserEntry,
        response.entries,
        filter.type
      );
      
      setMotivationalInfo(message);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load leaderboard'));
      console.error('Error loading leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filter, pagination, user]);
  
  /**
   * Handle changing the leaderboard type (points or streak)
   */
  const setLeaderboardType = useCallback((type: LeaderboardType) => {
    setFilter(prev => ({ ...prev, type }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on type change
  }, []);
  
  /**
   * Handle changing the leaderboard scope (friends, groups, community)
   */
  const setLeaderboardScope = useCallback((scope: LeaderboardFilterType, groupId?: string) => {
    setFilter(prev => ({ 
      ...prev, 
      scope,
      // Only set groupId if scope is 'groups' and groupId is provided
      groupId: scope === 'groups' ? groupId : undefined
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on scope change
  }, []);
  
  /**
   * Load the next page of results
   */
  const loadMoreEntries = useCallback(() => {
    if (hasMore && !isLoading) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [hasMore, isLoading]);
  
  /**
   * Refresh the leaderboard data
   */
  const refreshLeaderboard = useCallback(() => {
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    loadLeaderboard();
  }, [loadLeaderboard]);
  
  /**
   * Load available filter options (friends and groups)
   */
  // Temporarily disable friends/groups leaderboard filters until backend tables exist.
  // TODO: Remove this override and use the code below once user_connections and group_members tables are implemented in the DB.
  const loadFilterOptions = useCallback(async () => {
    setAvailableScopes(['community']);
    setUserGroups([]);
    setIsLoadingFilters(false);
    return;

    /*
    // --- ENABLE THIS WHEN BACKEND TABLES EXIST ---
    if (!user) return;
    setIsLoadingFilters(true);
    try {
      // Check if user has friends
      const hasFriends = await hasUserFriends(user.id);
      // Check if user has groups
      const hasGroups = await hasUserGroups(user.id);
      // Set available scopes
      const scopes: LeaderboardFilterType[] = ['community'];
      if (hasFriends) scopes.push('friends');
      if (hasGroups) scopes.push('groups');
      setAvailableScopes(scopes);
      // If user has groups, load them
      if (hasGroups) {
        const groups = await getUserGroups(user.id);
        setUserGroups(groups.map(group => ({ id: group.id, name: group.name })));
      }
    } catch (err) {
      console.error('Error loading filter options:', err);
    } finally {
      setIsLoadingFilters(false);
    }
    // --- END ENABLE ---
    */
  }, [user]);

  // Load filter options when user changes
  useEffect(() => {
    if (user) {
      loadFilterOptions();
    }
  }, [user, loadFilterOptions]);
  
  // Load leaderboard when filter, pagination, or user changes
  useEffect(() => {
    if (user) {
      loadLeaderboard();
    }
  }, [user, filter, pagination.page, loadLeaderboard]);
  
  return {
    // Data
    entries,
    currentUserEntry,
    totalEntries,
    hasMore,
    motivationalInfo,
    
    // Filter options
    availableScopes,
    userGroups,
    
    // State
    isLoading,
    isLoadingFilters,
    error,
    filter,
    
    // Actions
    setLeaderboardType,
    setLeaderboardScope,
    loadMoreEntries,
    refreshLeaderboard
  };
}

export default useLeaderboardState;
