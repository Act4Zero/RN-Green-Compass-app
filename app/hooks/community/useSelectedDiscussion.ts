import { useState, useCallback } from 'react';
import { discussionService } from '../../services/community';
import { analyticsService } from '../../services/analyticsService';
import { Discussion, SelectedDiscussionState } from './types';
import useCurrentUser from './useCurrentUser';

/**
 * Hook for managing a selected discussion
 */
const useSelectedDiscussion = () => {
  const { currentUser } = useCurrentUser();
  
  // State for selected discussion
  const [state, setState] = useState<SelectedDiscussionState>({
    discussion: null,
    isLoading: false,
    error: null
  });

  /**
   * Load a specific discussion by ID
   */
  const loadDiscussion = useCallback(async (discussionId: string) => {
    if (state.isLoading) return null;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const discussion = await discussionService.getDiscussionById(
        discussionId, 
        currentUser?.id
      );
      
      setState(prev => ({
        ...prev,
        discussion,
        isLoading: false
      }));

      // Track view in analytics
      analyticsService.trackEvent('view_discussion_detail', {
        discussion_id: discussionId,
        has_comments: discussion.comment_count > 0
      });

      return discussion;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load discussion';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      console.error(`Error loading discussion ${discussionId}:`, error);
      return null;
    }
  }, [state.isLoading, currentUser]);

  /**
   * Update the selected discussion after a comment is added or removed
   */
  const updateCommentCount = useCallback((increment: boolean) => {
    setState(prev => {
      if (!prev.discussion) return prev;
      
      const newCount = increment 
        ? (prev.discussion.comment_count || 0) + 1 
        : Math.max((prev.discussion.comment_count || 0) - 1, 0);
      
      return {
        ...prev,
        discussion: {
          ...prev.discussion,
          comment_count: newCount
        }
      };
    });
  }, []);

  /**
   * Update the selected discussion after a reaction is toggled
   */
  const updateReaction = useCallback((isReactionAdded: boolean) => {
    setState(prev => {
      if (!prev.discussion) return prev;
      
      const newCount = isReactionAdded 
        ? (prev.discussion.reaction_count || 0) + 1 
        : Math.max((prev.discussion.reaction_count || 0) - 1, 0);
      
      return {
        ...prev,
        discussion: {
          ...prev.discussion,
          reaction_count: newCount,
          user_has_reacted: isReactionAdded
        }
      };
    });
  }, []);

  /**
   * Clear the selected discussion
   */
  const clearDiscussion = useCallback(() => {
    setState({
      discussion: null,
      isLoading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    loadDiscussion,
    updateCommentCount,
    updateReaction,
    clearDiscussion
  };
};

export default useSelectedDiscussion;
