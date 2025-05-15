import supabase from '@/lib/supabase';

/**
 * Service for handling user relationships (friends and groups)
 *
 * TODO: The following logic depends on tables that do NOT exist yet:
 *   - user_connections
 *   - group_members
 *   - groups
 * Do NOT use these functions in production until the backend tables are implemented.
 */

interface UserConnection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  createdBy: string;
  memberCount: number;
}

/**
 * Checks if the current user has any friends
 *
 * TODO: Depends on user_connections table. Not usable until backend exists.
 */
export const hasUserFriends = async (userId: string): Promise<boolean> => {
  try {
    const { count, error } = await supabase
      .from('user_connections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'accepted');
    
    if (error) {
      console.error('Error checking for user friends:', error);
      return false;
    }
    
    return (count || 0) > 0;
  } catch (error) {
    console.error('Error checking for user friends:', error);
    return false;
  }
};

/**
 * Checks if the current user belongs to any groups
 *
 * TODO: Depends on group_members table. Not usable until backend exists.
 */
export const hasUserGroups = async (userId: string): Promise<boolean> => {
  try {
    const { count, error } = await supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error checking for user groups:', error);
      return false;
    }
    
    return (count || 0) > 0;
  } catch (error) {
    console.error('Error checking for user groups:', error);
    return false;
  }
};

/**
 * Gets all friends of the current user
 *
 * TODO: Depends on user_connections table. Not usable until backend exists.
 */
export const getUserFriends = async (userId: string): Promise<UserConnection[]> => {
  try {
    const { data, error } = await supabase
      .from('user_connections')
      .select('id, user_id, connected_user_id, status, created_at')
      .eq('user_id', userId)
      .eq('status', 'accepted');
    
    if (error) {
      console.error('Error fetching user friends:', error);
      return [];
    }
    
    return data.map((connection: { id: string; user_id: string; connected_user_id: string; status: string; created_at: string }) => {
      // Ensure status is one of the expected values
      let typedStatus: 'pending' | 'accepted' | 'rejected';
      
      if (connection.status === 'pending' || connection.status === 'accepted' || connection.status === 'rejected') {
        typedStatus = connection.status;
      } else {
        // Default to pending if not a valid status
        console.warn(`Unexpected connection status: ${connection.status}`);
        typedStatus = 'pending';
      }
      
      return {
        id: connection.id,
        userId: connection.user_id,
        connectedUserId: connection.connected_user_id,
        status: typedStatus,
        createdAt: connection.created_at
      };
    });
  } catch (error) {
    console.error('Error fetching user friends:', error);
    return [];
  }
};

/**
 * Gets all groups the current user belongs to
 *
 * TODO: Depends on group_members and groups tables. Not usable until backend exists.
 */
export const getUserGroups = async (userId: string): Promise<Group[]> => {
  try {
    // First get all group IDs the user belongs to
    const { data: membershipData, error: membershipError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);
    
    if (membershipError || !membershipData?.length) {
      console.error('Error fetching user group memberships:', membershipError);
      return [];
    }
    
    const groupIds = membershipData.map((membership: { group_id: string }) => membership.group_id);
    
    // Then get the group details
    const { data: groupsData, error: groupsError } = await supabase
      .from('groups')
      .select('id, name, description, created_at, created_by')
      .in('id', groupIds);
    
    if (groupsError) {
      console.error('Error fetching user groups:', groupsError);
      return [];
    }
    
    // Get member counts for each group
    const groupsWithCounts = await Promise.all(
      groupsData.map(async (group: { id: string; name: string; description?: string; created_at: string; created_by: string }) => {
        const { count } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id);
          
        return {
          id: group.id,
          name: group.name,
          description: group.description,
          createdAt: group.created_at,
          createdBy: group.created_by,
          memberCount: count || 0
        };
      })
    );
    
    return groupsWithCounts;
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return [];
  }
};
