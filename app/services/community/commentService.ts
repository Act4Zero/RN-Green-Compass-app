import supabase from '../../lib/supabase';
import { Comment, PaginationParams, PaginatedResult } from './types';

/**
 * Service for managing comments in the community feed
 */
export const commentService = {
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
};
