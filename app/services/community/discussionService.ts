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
    params: PaginationParams
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
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching discussions:', error);
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
      reaction_count: item.reactions
    }));

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
        ),
        comments:comments (count),
        reactions:reactions (count)
      `)
      .eq('id', discussionId)
      .single();

    if (error) {
      console.error(`Error fetching discussion with ID ${discussionId}:`, error);
      throw error;
    }

    // Check if the current user has reacted to this discussion
    let userHasReacted = false;
    if (userId) {
      const { data: reactionData, error: reactionError } = await supabase
        .from('reactions')
        .select('id')
        .eq('discussion_id', discussionId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!reactionError) {
        userHasReacted = !!reactionData;
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
      comment_count: data.comments,
      reaction_count: data.reactions,
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

    return {
      ...data,
      comment_count: 0,
      reaction_count: 0,
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
