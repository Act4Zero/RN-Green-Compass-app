import supabase from '@/lib/supabase';
import {
  LeaderboardFilter,
  LeaderboardPagination,
  LeaderboardResponse,
  PointsLeaderboardEntry,
  StreakLeaderboardEntry,
} from '@/types/leaderboards';

/**
 * Fetches leaderboard data based on filter criteria
 */
export const fetchLeaderboard = async (
  filter: LeaderboardFilter,
  pagination: LeaderboardPagination,
  currentUserId: string
): Promise<LeaderboardResponse<PointsLeaderboardEntry | StreakLeaderboardEntry>> => {
  try {
    // Determine which leaderboard type to fetch
    if (filter.type === 'points') {
      return await fetchPointsLeaderboard(filter, pagination, currentUserId);
    } else {
      return await fetchStreakLeaderboard(filter, pagination, currentUserId);
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};

/**
 * Fetches the points leaderboard with appropriate filtering
 */
const fetchPointsLeaderboard = async (
  filter: LeaderboardFilter,
  pagination: LeaderboardPagination,
  currentUserId: string
): Promise<LeaderboardResponse<PointsLeaderboardEntry>> => {
  // Calculate offset for pagination
  const offset = (pagination.page - 1) * pagination.pageSize;
  
  // Start with base query that will apply to all filter types
  let query = supabase
    .from('leaderboard') // Using the materialized view defined in DB specs
    .select('user_id, display_name, total_points, avatar_url')
    .order('total_points', { ascending: false })
    .limit(pagination.pageSize)
    .range(offset, offset + pagination.pageSize - 1);

  // Apply scope filter based on filter type
  if (filter.scope === 'friends') {
    // Subquery to get user's friends
    query = query.in('user_id', function(sb) {
      return sb
        .from('user_connections')
        .select('connected_user_id')
        .eq('user_id', currentUserId)
        .eq('status', 'accepted');
    });
  } else if (filter.scope === 'groups' && filter.groupId) {
    // Filter by specific group membership
    query = query.in('user_id', function(sb) {
      return sb
        .from('group_members')
        .select('user_id')
        .eq('group_id', filter.groupId);
    });
  }
  // For 'community', no additional filter needed - show all users

  // Execute the query
  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching points leaderboard:', error);
    throw error;
  }

  // Get total count for pagination
  const { count: totalCount } = await supabase
    .from('leaderboard')
    .select('*', { count: 'exact', head: true });

  // Get current user's rank regardless of pagination
  const { data: currentUserData } = await supabase
    .from('leaderboard')
    .select('user_id, display_name, total_points, avatar_url')
    .eq('user_id', currentUserId)
    .single();

  // Calculate current user's rank if found
  let currentUserEntry: PointsLeaderboardEntry | undefined;
  
  if (currentUserData) {
    const { data: userRankData } = await supabase
      .from('leaderboard')
      .select('user_id')
      .gte('total_points', currentUserData.total_points)
      .order('total_points', { ascending: false });
      
    const userRank = userRankData?.length || 0;
    
    currentUserEntry = {
      userId: currentUserData.user_id,
      displayName: currentUserData.display_name,
      totalPoints: currentUserData.total_points,
      avatar: currentUserData.avatar_url,
      rank: userRank,
      isCurrentUser: true
    };
  }

  // Map results to the expected format
  const entries: PointsLeaderboardEntry[] = data?.map((item, index) => ({
    userId: item.user_id,
    displayName: item.display_name,
    totalPoints: item.total_points,
    avatar: item.avatar_url,
    rank: offset + index + 1,
    isCurrentUser: item.user_id === currentUserId
  })) || [];

  return {
    entries,
    currentUserEntry,
    totalEntries: totalCount || 0,
    hasMore: (offset + pagination.pageSize) < (totalCount || 0)
  };
};

/**
 * Fetches the streak leaderboard with appropriate filtering
 */
const fetchStreakLeaderboard = async (
  filter: LeaderboardFilter,
  pagination: LeaderboardPagination,
  currentUserId: string
): Promise<LeaderboardResponse<StreakLeaderboardEntry>> => {
  // Calculate offset for pagination
  const offset = (pagination.page - 1) * pagination.pageSize;
  
  // Start with base query that will apply to all filter types
  let query = supabase
    .from('profiles')
    .select('id, display_name, longest_streak, current_streak, avatar_url')
    .order('longest_streak', { ascending: false })
    .limit(pagination.pageSize)
    .range(offset, offset + pagination.pageSize - 1);

  // Apply scope filter based on filter type
  if (filter.scope === 'friends') {
    // Subquery to get user's friends
    query = query.in('id', function(sb) {
      return sb
        .from('user_connections')
        .select('connected_user_id')
        .eq('user_id', currentUserId)
        .eq('status', 'accepted');
    });
  } else if (filter.scope === 'groups' && filter.groupId) {
    // Filter by specific group membership
    query = query.in('id', function(sb) {
      return sb
        .from('group_members')
        .select('user_id')
        .eq('group_id', filter.groupId);
    });
  }
  // For 'community', no additional filter needed - show all users

  // Execute the query
  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching streak leaderboard:', error);
    throw error;
  }

  // Get total count for pagination
  const { count: totalCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Get current user's rank regardless of pagination
  const { data: currentUserData } = await supabase
    .from('profiles')
    .select('id, display_name, longest_streak, current_streak, avatar_url')
    .eq('id', currentUserId)
    .single();

  // Calculate current user's rank if found
  let currentUserEntry: StreakLeaderboardEntry | undefined;
  
  if (currentUserData) {
    const { data: userRankData } = await supabase
      .from('profiles')
      .select('id')
      .gte('longest_streak', currentUserData.longest_streak)
      .order('longest_streak', { ascending: false });
      
    const userRank = userRankData?.length || 0;
    
    currentUserEntry = {
      userId: currentUserData.id,
      displayName: currentUserData.display_name,
      longestStreak: currentUserData.longest_streak,
      currentStreak: currentUserData.current_streak,
      avatar: currentUserData.avatar_url,
      rank: userRank,
      isCurrentUser: true
    };
  }

  // Map results to the expected format
  const entries: StreakLeaderboardEntry[] = data?.map((item, index) => ({
    userId: item.id,
    displayName: item.display_name,
    longestStreak: item.longest_streak,
    currentStreak: item.current_streak,
    avatar: item.avatar_url,
    rank: offset + index + 1,
    isCurrentUser: item.id === currentUserId
  })) || [];

  return {
    entries,
    currentUserEntry,
    totalEntries: totalCount || 0,
    hasMore: (offset + pagination.pageSize) < (totalCount || 0)
  };
};

/**
 * Generates motivational messages based on the user's current ranking
 */
export const generateMotivationalMessage = (
  currentUser: PointsLeaderboardEntry | StreakLeaderboardEntry | undefined,
  entries: (PointsLeaderboardEntry | StreakLeaderboardEntry)[],
  leaderboardType: 'points' | 'streak'
) => {
  if (!currentUser) {
    return {
      message: "Start logging your habits to appear on the leaderboard!"
    };
  }

  // Case: User is in top 3
  if (currentUser.rank <= 3) {
    return {
      message: `Congratulations! You're in the top ${currentUser.rank === 1 ? 'spot' : currentUser.rank}!`
    };
  }

  // Case: Find the next user to surpass
  const nextUserUp = entries.find(entry => entry.rank === currentUser.rank - 1);
  
  if (nextUserUp && leaderboardType === 'points') {
    const currentPoints = (currentUser as PointsLeaderboardEntry).totalPoints;
    const nextPoints = (nextUserUp as PointsLeaderboardEntry).totalPoints;
    const pointsNeeded = nextPoints - currentPoints;
    
    return {
      nextMilestone: {
        rank: nextUserUp.rank,
        pointsNeeded,
        user: {
          displayName: nextUserUp.displayName,
          userId: nextUserUp.userId
        }
      },
      message: `You're only ${pointsNeeded} points away from passing ${nextUserUp.displayName}!`
    };
  }
  
  if (nextUserUp && leaderboardType === 'streak') {
    const currentStreak = (currentUser as StreakLeaderboardEntry).longestStreak;
    const nextStreak = (nextUserUp as StreakLeaderboardEntry).longestStreak;
    const daysNeeded = nextStreak - currentStreak;
    
    return {
      nextMilestone: {
        rank: nextUserUp.rank,
        daysNeeded,
        user: {
          displayName: nextUserUp.displayName,
          userId: nextUserUp.userId
        }
      },
      message: `Keep going! You need ${daysNeeded} more days to pass ${nextUserUp.displayName}'s streak!`
    };
  }

  // Default message for other cases
  return {
    message: leaderboardType === 'points' 
      ? "Keep logging sustainable actions to earn more points!" 
      : "Maintain your habits to build a longer streak!"
  };
};
