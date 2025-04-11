import { useState, useCallback } from 'react';
import { discussionService } from '../../services/community';
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
      const discussion = await discussionService.getDiscussionById(
        discussionId, 
        currentUser?.id
      );
      
      setState(prev => ({
        ...prev,
        discussion,
        isLoading: false
      }));

      // Analytics tracking removed

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
  }, [currentUser]); // Removed state.isLoading from dependencies

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
