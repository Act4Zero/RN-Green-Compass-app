import { useCallback } from 'react';
import { reactionService } from '../../services/community';
import { analyticsService } from '../../services/analyticsService';
import { ToggleResult } from './types';
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

      // Track in analytics
      analyticsService.trackEvent('toggle_discussion_reaction', {
        discussion_id: discussionId,
        action: isReactionAdded ? 'add' : 'remove'
      });

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

      // Track in analytics
      analyticsService.trackEvent('toggle_comment_reaction', {
        comment_id: commentId,
        action: isReactionAdded ? 'add' : 'remove'
      });

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
