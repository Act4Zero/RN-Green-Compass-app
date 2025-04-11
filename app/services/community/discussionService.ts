import supabase from '../../lib/supabase';
import { Discussion, PaginationParams, PaginatedResult } from './types';

/**
 * Service for managing discussions/posts in the community feed
 */
export const discussionService = {
  /**
   * Get paginated discussions/posts for the community feed
   */
  getDiscussions: async (
    params: PaginationParams,
    userId?: string
  ): Promise<PaginatedResult<Discussion>> => {
    const { page, limit } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // First get the count of all discussions
    const { count, error: countError } = await supabase
      .from('discussions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting discussions:', countError);
      throw countError;
    }

    // Then get the paginated discussions with user profiles
    const { data, error } = await supabase
      .from('discussions')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching discussions:', error);
      throw error;
    }

    // Get discussion IDs for batch operations
    const discussionIds = data.map(item => item.id);
    
    // Get comment counts for all discussions
    let commentCountMap: Record<string, number> = {};
    
    // For each discussion, count its comments
    for (const discussionId of discussionIds) {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('discussion_id', discussionId);
        
      if (error) {
        console.error(`Error counting comments for discussion ${discussionId}:`, error);
      } else {
        commentCountMap[discussionId] = count || 0;
      }
    }
      

    
    // Get reaction counts for all discussions
    let reactionCountMap: Record<string, number> = {};
    
    // For each discussion, count its reactions
    for (const discussionId of discussionIds) {
      const { count, error } = await supabase
        .from('reactions')
        .select('*', { count: 'exact', head: true })
        .eq('discussion_id', discussionId);
        
      if (error) {
        console.error(`Error counting reactions for discussion ${discussionId}:`, error);
      } else {
        reactionCountMap[discussionId] = count || 0;
      }
    }
      

    
    // If userId is provided, check which discussions the user has reacted to
    let userReactionsMap: Record<string, boolean> = {};
    if (userId) {
      const { data: userReactions, error: userReactionsError } = await supabase
        .from('reactions')
        .select('discussion_id')
        .eq('user_id', userId)
        .in('discussion_id', discussionIds);
        
      if (userReactionsError) {
        console.error('Error fetching user reactions:', userReactionsError);
      } else {
        userReactionsMap = (userReactions || []).reduce((map: Record<string, boolean>, item: any) => {
          map[item.discussion_id] = true;
          return map;
        }, {} as Record<string, boolean>);
      }
    }

    // Transform the data to match our interface
    const discussions = data.map((item: any): Discussion => {
      return {
        id: item.id,
        user_id: item.user_id,
        title: item.title,
        content: item.content,
        created_at: item.created_at,
        updated_at: item.updated_at,
        user: item.profiles,
        comment_count: commentCountMap[item.id] || 0,
        reaction_count: reactionCountMap[item.id] || 0,
        user_has_reacted: userId ? !!userReactionsMap[item.id] : false
      };
    });

    return {
      data: discussions,
      count: count || 0,
      hasMore: to < (count || 0) - 1
    };
  },

  /**
   * Get a specific discussion by ID with comments and reactions
   */
  getDiscussionById: async (discussionId: string, userId?: string): Promise<Discussion> => {
    const { data, error } = await supabase
      .from('discussions')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('id', discussionId)
      .single();

    if (error) {
      console.error(`Error fetching discussion with ID ${discussionId}:`, error);
      throw error;
    }

    // Get comment count for this discussion
    const { count: commentCount, error: commentError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('discussion_id', discussionId);
      
    if (commentError) {
      console.error(`Error counting comments for discussion ${discussionId}:`, commentError);
    }
    
    // Get reaction count for this discussion
    const { count: reactionCount, error: reactionError } = await supabase
      .from('reactions')
      .select('*', { count: 'exact', head: true })
      .eq('discussion_id', discussionId);
      
    if (reactionError) {
      console.error(`Error counting reactions for discussion ${discussionId}:`, reactionError);
    }

    // Check if the current user has reacted to this discussion
    let userHasReacted = false;
    if (userId) {
      const { data: userReactionData, error: userReactionError } = await supabase
        .from('reactions')
        .select('id')
        .eq('discussion_id', discussionId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!userReactionError) {
        userHasReacted = !!userReactionData;
      }
    }

    return {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      content: data.content,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user: data.profiles,
      comment_count: commentCount || 0,
      reaction_count: reactionCount || 0,
      user_has_reacted: userHasReacted
    };
  },

  /**
   * Create a new discussion/post
   */
  createDiscussion: async (
    userId: string,
    content: string,
    title?: string
  ): Promise<Discussion> => {
    const { data, error } = await supabase
      .from('discussions')
      .insert({
        user_id: userId,
        content,
        title: title || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating discussion:', error);
      throw error;
    }

    // Ensure we return a properly formatted Discussion object
    return {
      ...data,
      comment_count: 0,  // New discussions have no comments
      reaction_count: 0, // New discussions have no reactions
      user_has_reacted: false
    };
  },

  /**
   * Update an existing discussion/post
   */
  updateDiscussion: async (
    discussionId: string,
    updates: { content?: string; title?: string }
  ): Promise<Discussion> => {
    const { data, error } = await supabase
      .from('discussions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', discussionId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating discussion ${discussionId}:`, error);
      throw error;
    }

    return data;
  },

  /**
   * Delete a discussion/post
   */
  deleteDiscussion: async (discussionId: string): Promise<void> => {
    const { error } = await supabase
      .from('discussions')
      .delete()
      .eq('id', discussionId);

    if (error) {
      console.error(`Error deleting discussion ${discussionId}:`, error);
      throw error;
    }
  },

  /**
   * Get user's discussions/posts
   */
  getUserDiscussions: async (
    userId: string,
    params: PaginationParams
  ): Promise<PaginatedResult<Discussion>> => {
    const { page, limit } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // First get the count of all discussions by this user
    const { count, error: countError } = await supabase
      .from('discussions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      console.error(`Error counting discussions for user ${userId}:`, countError);
      throw countError;
    }

    // Then get the paginated discussions with related data
    const { data, error } = await supabase
      .from('discussions')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        ),
        comments:comments (count),
        reactions:reactions (count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error(`Error fetching discussions for user ${userId}:`, error);
      throw error;
    }

    // Transform the data to match our interface
    const discussions = data.map((item: any): Discussion => ({
      id: item.id,
      user_id: item.user_id,
      title: item.title,
      content: item.content,
      created_at: item.created_at,
      updated_at: item.updated_at,
      user: item.profiles,
      comment_count: item.comments,
      reaction_count: item.reactions,
      user_has_reacted: false // User can't react to their own posts
    }));

    return {
      data: discussions,
      count: count || 0,
      hasMore: to < (count || 0) - 1
    };
  },
};
