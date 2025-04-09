import supabase from '../lib/supabase';
import { Discussion, Comment, Reaction, PaginationParams, PaginatedResult } from '../types/community';

/**
 * Service for interacting with community feed in Supabase
 */
export const communityService = {
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
   * Get paginated comments for a discussion
   */
  getComments: async (
    discussionId: string,
    params: PaginationParams,
    userId?: string
  ): Promise<PaginatedResult<Comment>> => {
    const { page, limit } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // First get the count of all comments for this discussion
    const { count, error: countError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('discussion_id', discussionId);

    if (countError) {
      console.error(`Error counting comments for discussion ${discussionId}:`, countError);
      throw countError;
    }

    // Then get the paginated comments with related data
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        ),
        reactions:reactions (count)
      `)
      .eq('discussion_id', discussionId)
      .order('created_at', { ascending: true })
      .range(from, to);

    if (error) {
      console.error(`Error fetching comments for discussion ${discussionId}:`, error);
      throw error;
    }

    // If user is logged in, check which comments they've reacted to
    let userReactions: Record<string, boolean> = {};
    if (userId) {
      const { data: reactionsData, error: reactionsError } = await supabase
        .from('reactions')
        .select('comment_id')
        .eq('user_id', userId)
        .in('comment_id', data.map((comment: any) => comment.id));

      if (!reactionsError && reactionsData) {
        userReactions = reactionsData.reduce((acc: Record<string, boolean>, reaction: any) => {
          acc[reaction.comment_id] = true;
          return acc;
        }, {});
      }
    }

    // Transform the data to match our interface
    const comments = data.map((item: any): Comment => ({
      id: item.id,
      discussion_id: item.discussion_id,
      user_id: item.user_id,
      content: item.content,
      created_at: item.created_at,
      user: item.profiles,
      reaction_count: item.reactions,
      user_has_reacted: userReactions[item.id] || false
    }));

    return {
      data: comments,
      count: count || 0,
      hasMore: to < (count || 0) - 1
    };
  },

  /**
   * Create a new comment on a discussion
   */
  createComment: async (
    userId: string,
    discussionId: string,
    content: string
  ): Promise<Comment> => {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        discussion_id: discussionId,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error(`Error creating comment for discussion ${discussionId}:`, error);
      throw error;
    }

    return {
      ...data,
      reaction_count: 0,
      user_has_reacted: false
    };
  },

  /**
   * Update an existing comment
   */
  updateComment: async (
    commentId: string,
    content: string
  ): Promise<Comment> => {
    const { data, error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', commentId)
      .select()
      .single();

    if (error) {
      console.error(`Error updating comment ${commentId}:`, error);
      throw error;
    }

    return data;
  },

  /**
   * Delete a comment
   */
  deleteComment: async (commentId: string): Promise<void> => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error(`Error deleting comment ${commentId}:`, error);
      throw error;
    }
  },

  /**
   * Toggle a reaction (like/upvote) on a discussion
   */
  toggleDiscussionReaction: async (
    userId: string,
    discussionId: string,
    reactionType: string = 'like'
  ): Promise<boolean> => {
    // Check if the user has already reacted
    const { data: existingReaction, error: checkError } = await supabase
      .from('reactions')
      .select('id')
      .eq('user_id', userId)
      .eq('discussion_id', discussionId)
      .maybeSingle();

    if (checkError) {
      console.error(`Error checking existing reaction for discussion ${discussionId}:`, checkError);
      throw checkError;
    }

    // If the user has already reacted, remove the reaction (unlike)
    if (existingReaction) {
      const { error: deleteError } = await supabase
        .from('reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (deleteError) {
        console.error(`Error removing reaction for discussion ${discussionId}:`, deleteError);
        throw deleteError;
      }

      return false; // Reaction removed
    }

    // Otherwise, add a new reaction (like)
    const { error: insertError } = await supabase
      .from('reactions')
      .insert({
        user_id: userId,
        discussion_id: discussionId,
        comment_id: null,
        reaction_type: reactionType,
      });

    if (insertError) {
      console.error(`Error adding reaction for discussion ${discussionId}:`, insertError);
      throw insertError;
    }

    return true; // Reaction added
  },

  /**
   * Toggle a reaction (like/upvote) on a comment
   */
  toggleCommentReaction: async (
    userId: string,
    commentId: string,
    reactionType: string = 'like'
  ): Promise<boolean> => {
    // Check if the user has already reacted
    const { data: existingReaction, error: checkError } = await supabase
      .from('reactions')
      .select('id')
      .eq('user_id', userId)
      .eq('comment_id', commentId)
      .maybeSingle();

    if (checkError) {
      console.error(`Error checking existing reaction for comment ${commentId}:`, checkError);
      throw checkError;
    }

    // If the user has already reacted, remove the reaction (unlike)
    if (existingReaction) {
      const { error: deleteError } = await supabase
        .from('reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (deleteError) {
        console.error(`Error removing reaction for comment ${commentId}:`, deleteError);
        throw deleteError;
      }

      return false; // Reaction removed
    }

    // Otherwise, add a new reaction (like)
    const { error: insertError } = await supabase
      .from('reactions')
      .insert({
        user_id: userId,
        discussion_id: null,
        comment_id: commentId,
        reaction_type: reactionType,
      });

    if (insertError) {
      console.error(`Error adding reaction for comment ${commentId}:`, insertError);
      throw insertError;
    }

    return true; // Reaction added
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

export default communityService;
