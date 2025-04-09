import { useState, useCallback } from 'react';
import { discussionService } from '../../services/community';
import { analyticsService } from '../../services/analyticsService';
import { Discussion, PaginationParams, DiscussionsState, UseDiscussionsProps } from './types';
import useCurrentUser from './useCurrentUser';

/**
 * Hook for managing discussions in the community feed
 */
const useDiscussions = ({ initialPage = 1, pageSize = 10 }: UseDiscussionsProps = {}) => {
  const { currentUser } = useCurrentUser();
  
  // State for discussions
  const [state, setState] = useState<DiscussionsState>({
    discussions: [],
    count: 0,
    page: initialPage,
    hasMore: false,
    isLoading: false,
    error: null
  });

  /**
   * Load discussions with pagination
   */
  const loadDiscussions = useCallback(async (page: number = 1, limit: number = pageSize) => {
    if (state.isLoading) return null;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const params: PaginationParams = { page, limit };
      const result = await discussionService.getDiscussions(params);

      setState(prev => ({
        discussions: page === 1 ? result.data : [...prev.discussions, ...result.data],
        count: result.count,
        page,
        hasMore: result.hasMore,
        isLoading: false,
        error: null
      }));

      // Track view in analytics
      analyticsService.trackEvent('view_community_feed', {
        page_number: page,
        items_count: result.data.length,
        total_count: result.count
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load discussions';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      console.error('Error loading discussions:', error);
      return null;
    }
  }, [state.isLoading, pageSize]);

  /**
   * Load more discussions (pagination)
   */
  const loadMore = useCallback(() => {
    if (state.hasMore && !state.isLoading) {
      return loadDiscussions(state.page + 1);
    }
    return null;
  }, [state.hasMore, state.isLoading, state.page, loadDiscussions]);

  /**
   * Refresh discussions (pull to refresh)
   */
  const refresh = useCallback(() => {
    return loadDiscussions(1);
  }, [loadDiscussions]);

  /**
   * Create a new discussion/post
   */
  const createDiscussion = useCallback(async (
    content: string,
    title?: string
  ) => {
    if (!currentUser) {
      setState(prev => ({ ...prev, error: 'You must be logged in to create a post' }));
      return null;
    }

    if (!content.trim()) {
      setState(prev => ({ ...prev, error: 'Post content cannot be empty' }));
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const newDiscussion = await discussionService.createDiscussion(
        currentUser.id,
        content,
        title
      );

      // Update the discussions list with the new post
      setState(prev => ({
        ...prev,
        discussions: [newDiscussion, ...prev.discussions],
        count: prev.count + 1,
        isLoading: false
      }));

      // Track in analytics
      analyticsService.trackEvent('create_discussion', {
        has_title: !!title,
        content_length: content.length
      });

      return newDiscussion;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      console.error('Error creating discussion:', error);
      return null;
    }
  }, [currentUser]);

  /**
   * Update an existing discussion/post
   */
  const updateDiscussion = useCallback(async (
    discussionId: string,
    updates: { content?: string; title?: string }
  ) => {
    if (!currentUser) {
      setState(prev => ({ ...prev, error: 'You must be logged in to update a post' }));
      return null;
    }

    if (updates.content && !updates.content.trim()) {
      setState(prev => ({ ...prev, error: 'Post content cannot be empty' }));
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const updatedDiscussion = await discussionService.updateDiscussion(
        discussionId,
        updates
      );

      // Update the discussions list
      setState(prev => ({
        ...prev,
        discussions: prev.discussions.map(d => 
          d.id === discussionId ? { ...d, ...updates } : d
        ),
        isLoading: false
      }));

      // Track in analytics
      analyticsService.trackEvent('update_discussion', {
        discussion_id: discussionId,
        updated_fields: Object.keys(updates)
      });

      return updatedDiscussion;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update post';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      console.error(`Error updating discussion ${discussionId}:`, error);
      return null;
    }
  }, [currentUser]);

  /**
   * Delete a discussion/post
   */
  const deleteDiscussion = useCallback(async (discussionId: string) => {
    if (!currentUser) {
      setState(prev => ({ ...prev, error: 'You must be logged in to delete a post' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await discussionService.deleteDiscussion(discussionId);

      // Remove from the discussions list
      setState(prev => ({
        ...prev,
        discussions: prev.discussions.filter(d => d.id !== discussionId),
        count: prev.count - 1,
        isLoading: false
      }));

      // Track in analytics
      analyticsService.trackEvent('delete_discussion', {
        discussion_id: discussionId
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete post';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      console.error(`Error deleting discussion ${discussionId}:`, error);
      return false;
    }
  }, [currentUser]);

  /**
   * Get discussions created by the current user
   */
  const loadUserDiscussions = useCallback(async (
    page: number = 1,
    limit: number = pageSize
  ) => {
    if (!currentUser || state.isLoading) return null;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const params: PaginationParams = { page, limit };
      const result = await discussionService.getUserDiscussions(currentUser.id, params);

      setState(prev => ({
        discussions: page === 1 ? result.data : [...prev.discussions, ...result.data],
        count: result.count,
        page,
        hasMore: result.hasMore,
        isLoading: false,
        error: null
      }));

      // Track view in analytics
      analyticsService.trackEvent('view_user_discussions', {
        page_number: page,
        items_count: result.data.length,
        total_count: result.count
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load your posts';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      console.error('Error loading user discussions:', error);
      return null;
    }
  }, [currentUser, state.isLoading, pageSize]);

  /**
   * Update a discussion in the state after a reaction
   */
  const updateDiscussionInState = useCallback((
    discussionId: string,
    isReactionAdded: boolean
  ) => {
    setState(prev => ({
      ...prev,
      discussions: prev.discussions.map(d => {
        if (d.id === discussionId) {
          const newReactionCount = isReactionAdded 
            ? (d.reaction_count || 0) + 1 
            : Math.max((d.reaction_count || 0) - 1, 0);
          
          return { 
            ...d, 
            reaction_count: newReactionCount,
            user_has_reacted: isReactionAdded
          };
        }
        return d;
      })
    }));
  }, []);

  return {
    ...state,
    loadDiscussions,
    loadMore,
    refresh,
    createDiscussion,
    updateDiscussion,
    deleteDiscussion,
    loadUserDiscussions,
    updateDiscussionInState
  };
};

export default useDiscussions;
