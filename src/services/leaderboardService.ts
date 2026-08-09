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
  
  // Start with base query to get leaderboard data
  let query = supabase
    .from('leaderboard')
    .select('user_id, display_name, total_points')
    .order('total_points', { ascending: false })
    .limit(pagination.pageSize)
    .range(offset, offset + pagination.pageSize - 1);

  // Apply scope filter based on filter type
  if (filter.scope === 'friends') {
    // First, get the list of friend user IDs
    const { data: friends, error: friendsError } = await supabase
      .from('user_connections')
      .select('connected_user_id')
      .eq('user_id', currentUserId)
      .eq('status', 'accepted');

    if (friendsError) throw friendsError;
    
    const friendIds = friends.map(f => f.connected_user_id);
    
    // If user has no friends, return empty result
    if (friendIds.length === 0) {
      return {
        entries: [],
        currentUserEntry: undefined,
        totalEntries: 0,
        hasMore: false
      };
    }
    
    // Filter leaderboard to only show friends
    query = query.in('user_id', friendIds);
  } else if (filter.scope === 'groups' && filter.groupId) {
    // First, get the list of group member IDs
    const { data: members } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', filter.groupId);
      
    if (members?.length) {
      const memberIds = members.map(m => m.user_id);
      query = query.in('user_id', memberIds);
    } else {
      return {
        entries: [],
        currentUserEntry: undefined,
        totalEntries: 0,
        hasMore: false
      };
    }
  }
  // For 'community', no additional filter needed - show all users

  // Execute the query
  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching points leaderboard:', error);
    throw error;
  }

  // Get total count for pagination based on current filter
  let countQuery = supabase
    .from('leaderboard')
    .select('*', { count: 'exact', head: true });
    
  // Apply the same filters to the count query
  if (filter.scope === 'friends') {
    const { data: friends } = await supabase
      .from('user_connections')
      .select('connected_user_id')
      .eq('user_id', currentUserId)
      .eq('status', 'accepted');
      
    if (friends?.length) {
      const friendIds = friends.map((f: { connected_user_id: string }) => f.connected_user_id);
      countQuery = countQuery.in('user_id', friendIds);
    } else {
      return {
        entries: [],
        currentUserEntry: undefined,
        totalEntries: 0,
        hasMore: false
      };
    }
  } else if (filter.scope === 'groups' && filter.groupId) {
    // Get group members for the count query
    const { data: groupMembers } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', filter.groupId);
      
    if (groupMembers?.length) {
      const memberIds = groupMembers.map((m: { user_id: string }) => m.user_id);
      countQuery = countQuery.in('user_id', memberIds);
    } else {
      return {
        entries: [],
        currentUserEntry: undefined,
        totalEntries: 0,
        hasMore: false
      };
    }
  }
  
  const { count: totalEntries } = await countQuery;

  // Get current user's rank and data from the leaderboard
  const { data: currentUserData } = await supabase
    .from('leaderboard')
    .select('user_id, display_name, total_points')
    .eq('user_id', currentUserId)
    .single();
    
  // Fetch avatar URLs for all users in the leaderboard
  const userIds = [...(data?.map(item => item.user_id) || [])];
  if (currentUserData?.user_id && !userIds.includes(currentUserData.user_id)) {
    userIds.push(currentUserData.user_id);
  }
  
  let avatarUrls: Record<string, string | null> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, avatar_url')
      .in('id', userIds);
      
    profiles?.forEach(profile => {
      avatarUrls[profile.id] = profile.avatar_url;
    });
  }

  // Calculate current user's rank if found
  let currentUserEntry: PointsLeaderboardEntry | undefined;
  
  if (currentUserData) {
    // Get user's rank by counting users with higher or equal points
    const { count: userRank } = await supabase
      .from('leaderboard')
      .select('*', { count: 'exact', head: true })
      .gte('total_points', currentUserData.total_points);
    
    currentUserEntry = {
      userId: currentUserData.user_id,
      displayName: currentUserData.display_name,
      totalPoints: currentUserData.total_points,
      avatar: avatarUrls[currentUserData.user_id] || undefined,
      rank: userRank || 0,
      isCurrentUser: true
    };
  }

  // Map results to the expected format
  const entries: PointsLeaderboardEntry[] = data?.map((item: any, index: number) => ({
    userId: item.user_id,
    displayName: item.display_name,
    totalPoints: item.total_points,
    avatar: avatarUrls[item.user_id] || undefined,
    rank: offset + index + 1,
    isCurrentUser: item.user_id === currentUserId
  })) || [];

  return {
    entries,
    currentUserEntry,
    totalEntries: totalEntries || 0,
    hasMore: (offset + pagination.pageSize) < (totalEntries || 0)
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
  let scopedUserIds: string[] | null = null;

  if (filter.scope === 'friends') {
    const { data: connections, error: connectionsError } = await supabase
      .from('user_connections')
      .select('connected_user_id')
      .eq('user_id', currentUserId)
      .eq('status', 'accepted');
    if (connectionsError) throw connectionsError;
    scopedUserIds = connections?.map((connection) => connection.connected_user_id) || [];
  } else if (filter.scope === 'groups' && filter.groupId) {
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', filter.groupId);
    if (membersError) throw membersError;
    scopedUserIds = members?.map((member) => member.user_id) || [];
  }
  
  // Start with base query that will apply to all filter types
  let query = supabase
    .from('profiles')
    .select('id, display_name, login_streak, avatar_url')
    .order('login_streak', { ascending: false })
    .limit(pagination.pageSize)
    .range(offset, offset + pagination.pageSize - 1);

  if (scopedUserIds) query = query.in('id', scopedUserIds.length > 0 ? scopedUserIds : ['00000000-0000-0000-0000-000000000000']);
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
    .select('id, display_name, login_streak, avatar_url')
    .eq('id', currentUserId)
    .single();

  // Calculate current user's rank if found
  let currentUserEntry: StreakLeaderboardEntry | undefined;
  
  if (currentUserData) {
    const { data: userRankData } = await supabase
      .from('profiles')
      .select('id')
      .gte('login_streak', currentUserData.login_streak)
      .order('login_streak', { ascending: false });
      
    const userRank = userRankData?.length || 0;
    
    currentUserEntry = {
      userId: currentUserData.id,
      displayName: currentUserData.display_name,
      longestStreak: currentUserData.login_streak,
      currentStreak: currentUserData.login_streak,
      avatar: currentUserData.avatar_url,
      rank: userRank,
      isCurrentUser: true
    };
  }

  // Map results to the expected format
  const entries: StreakLeaderboardEntry[] = data?.map((item, index) => ({
    userId: item.id,
    displayName: item.display_name,
    longestStreak: item.login_streak,
    currentStreak: item.login_streak,
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
