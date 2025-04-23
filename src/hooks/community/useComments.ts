import { useState, useCallback, useEffect } from 'react';
import { commentService } from '../../services/community';
import { PaginationParams, CommentsState, UseCommentsProps } from './types';
import useCurrentUser from './useCurrentUser';

/**
 * Hook for managing comments on a discussion
 */
const useComments = ({ 
  discussionId, 
  initialPage = 1, 
  pageSize = 20 
}: UseCommentsProps) => {
  const { currentUser } = useCurrentUser();
  
  // State for comments
  const [state, setState] = useState<CommentsState>({
    comments: [],
    count: 0,
    page: initialPage,
    hasMore: false,
    isLoading: false,
    error: null
  });

  /**
   * Only fetch comments when currentUser and discussionId are available
   */
  useEffect(() => {
    if (currentUser && discussionId) {
      loadComments();
    }
  }, [currentUser, discussionId]);

  /**
   * Load comments for a discussion with pagination
   */
  const loadComments = useCallback(async (
    page: number = 1,
    limit: number = pageSize
  ) => {
    // Use a function to get the current state value instead of referencing state directly
    let shouldContinue = true;
    
    setState(prev => {
      // Check isLoading inside the state update function
      if (prev.isLoading) {
        shouldContinue = false;
        return prev; // No change if already loading
      }
      return { ...prev, isLoading: true, error: null };
    });

    // Early return if we determined we shouldn't continue
    if (!shouldContinue) return null;

    try {
      const params: PaginationParams = { page, limit };
      const result = await commentService.getComments(
        discussionId, 
        params, 
        currentUser?.id
      );

      setState(prev => ({
        comments: page === 1 ? result.data : [...prev.comments, ...result.data],
        count: result.count,
        page,
        hasMore: result.hasMore,
        isLoading: false,
        error: null
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load comments';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      console.error(`Error loading comments for discussion ${discussionId}:`, error);
      return null;
    }
  }, [discussionId, currentUser, pageSize]); // Removed state.isLoading from dependencies

  /**
   * Load more comments (pagination)
   */
  const loadMore = useCallback(() => {
    if (state.hasMore && !state.isLoading) {
      return loadComments(state.page + 1);
    }
    return null;
  }, [state.hasMore, state.isLoading, state.page, loadComments]);

  /**
   * Refresh comments (pull to refresh)
   */
  const refresh = useCallback(() => {
    return loadComments(1);
  }, [loadComments]);

  /**
   * Create a new comment on a discussion
   */
  const createComment = useCallback(async (content: string) => {
    if (!currentUser) {
      setState(prev => ({ ...prev, error: 'You must be logged in to comment' }));
      return null;
    }

    if (!content.trim()) {
      setState(prev => ({ ...prev, error: 'Comment cannot be empty' }));
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const newComment = await commentService.createComment(
        currentUser.id,
        discussionId,
        content
      );

      // Add to comments list
      setState(prev => ({
        ...prev,
        comments: [...prev.comments, newComment],
        count: prev.count + 1,
        isLoading: false
      }));

      // Analytics tracking removed

      return newComment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create comment';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      console.error(`Error creating comment for discussion ${discussionId}:`, error);
      return null;
    }
  }, [currentUser, discussionId]);

  /**
   * Update an existing comment
   */
  const updateComment = useCallback(async (
    commentId: string,
    content: string
  ) => {
    if (!currentUser) {
      setState(prev => ({ ...prev, error: 'You must be logged in to update a comment' }));
      return null;
    }

    if (!content.trim()) {
      setState(prev => ({ ...prev, error: 'Comment cannot be empty' }));
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const updatedComment = await commentService.updateComment(
        commentId,
        content
      );

      // Update in comments list
      setState(prev => ({
        ...prev,
        comments: prev.comments.map(c => 
          c.id === commentId ? { ...c, content } : c
        ),
        isLoading: false
      }));

      // Analytics tracking removed

      return updatedComment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update comment';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      console.error(`Error updating comment ${commentId}:`, error);
      return null;
    }
  }, [currentUser]);

  /**
   * Delete a comment
   */
  const deleteComment = useCallback(async (commentId: string) => {
    if (!currentUser) {
      setState(prev => ({ ...prev, error: 'You must be logged in to delete a comment' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await commentService.deleteComment(commentId);

      // Remove from comments list
      setState(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c.id !== commentId),
        count: prev.count - 1,
        isLoading: false
      }));

      // Analytics tracking removed

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      console.error(`Error deleting comment ${commentId}:`, error);
      return false;
    }
  }, [currentUser, discussionId]);

  /**
   * Update a comment in the state after a reaction
   */
  const updateCommentReaction = useCallback((
    commentId: string,
    isReactionAdded: boolean
  ) => {
    setState(prev => ({
      ...prev,
      comments: prev.comments.map(c => {
        if (c.id === commentId) {
          const newReactionCount = isReactionAdded 
            ? (c.reaction_count || 0) + 1 
            : Math.max((c.reaction_count || 0) - 1, 0);
          
          return { 
            ...c, 
            reaction_count: newReactionCount,
            user_has_reacted: isReactionAdded
          };
        }
        return c;
      })
    }));
  }, []);

  return {
    ...state,
    loadComments,
    loadMore,
    refresh,
    createComment,
    updateComment,
    deleteComment,
    updateCommentReaction
  };
};

export default useComments;
