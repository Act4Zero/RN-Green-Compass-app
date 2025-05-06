import { useCallback } from 'react';
import { reactionService } from '../../services/community';
import { ToggleResult } from '../../types/community/types';
import useCurrentUser from './useCurrentUser';

/**
 * Hook for managing reactions (likes/upvotes) in the community feed
 */
const useReactions = () => {
  const { currentUser, isAuthenticated } = useCurrentUser();

  /**
   * Toggle a reaction (like/upvote) on a discussion
   */
  const toggleDiscussionReaction = useCallback(async (
    discussionId: string
  ): Promise<ToggleResult> => {
    if (!isAuthenticated) {
      return { 
        success: false,
        isAdded: false
      };
    }

    try {
      const isReactionAdded = await reactionService.toggleDiscussionReaction(
        currentUser!.id,
        discussionId
      );

      // Analytics tracking removed

      return {
        success: true,
        isAdded: isReactionAdded
      };
    } catch (error) {
      console.error(`Error toggling reaction for discussion ${discussionId}:`, error);
      return {
        success: false,
        isAdded: false
      };
    }
  }, [currentUser, isAuthenticated]);

  /**
   * Toggle a reaction (like/upvote) on a comment
   */
  const toggleCommentReaction = useCallback(async (
    commentId: string
  ): Promise<ToggleResult> => {
    if (!isAuthenticated) {
      return { 
        success: false,
        isAdded: false
      };
    }

    try {
      const isReactionAdded = await reactionService.toggleCommentReaction(
        currentUser!.id,
        commentId
      );

      // Analytics tracking removed

      return {
        success: true,
        isAdded: isReactionAdded
      };
    } catch (error) {
      console.error(`Error toggling reaction for comment ${commentId}:`, error);
      return {
        success: false,
        isAdded: false
      };
    }
  }, [currentUser, isAuthenticated]);

  return {
    toggleDiscussionReaction,
    toggleCommentReaction,
    isAuthenticated
  };
};

export default useReactions;
