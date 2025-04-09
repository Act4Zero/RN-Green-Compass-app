import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import supabase from '../lib/supabase';
import communityService from '../services/communityService';
import { Discussion, Comment, PaginationParams, PaginatedResult } from '../types/community';
import { analyticsService } from '../services/analyticsService';

/**
 * Custom hook for community feed functionality
 */
const useCommunityFeed = () => {
  // State for discussions
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [discussionsCount, setDiscussionsCount] = useState(0);
  const [discussionsPage, setDiscussionsPage] = useState(1);
  const [hasMoreDiscussions, setHasMoreDiscussions] = useState(false);
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(false);
  const [discussionsError, setDiscussionsError] = useState<string | null>(null);

  // State for selected discussion
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [isLoadingSelectedDiscussion, setIsLoadingSelectedDiscussion] = useState(false);
  const [selectedDiscussionError, setSelectedDiscussionError] = useState<string | null>(null);

  // State for comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  // State for new post/comment
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Get current user
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  
  // Router for navigation
  const router = useRouter();

  // Fetch current user on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setCurrentUser({ id: data.user.id });
      }
    };

    fetchCurrentUser();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setCurrentUser({ id: session.user.id });
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  /**
   * Load discussions with pagination
   */
  const loadDiscussions = useCallback(async (page: number = 1, limit: number = 10) => {
    if (isLoadingDiscussions) return;

    setIsLoadingDiscussions(true);
    setDiscussionsError(null);

    try {
      const params: PaginationParams = { page, limit };
      const result: PaginatedResult<Discussion> = await communityService.getDiscussions(params);

      if (page === 1) {
        setDiscussions(result.data);
      } else {
        setDiscussions(prevDiscussions => [...prevDiscussions, ...result.data]);
      }

      setDiscussionsCount(result.count);
      setHasMoreDiscussions(result.hasMore);
      setDiscussionsPage(page);

      // Track view in analytics
      analyticsService.trackEvent('view_community_feed', {
        page_number: page,
        items_count: result.data.length,
        total_count: result.count
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load discussions';
      setDiscussionsError(errorMessage);
      console.error('Error loading discussions:', error);
      return null;
    } finally {
      setIsLoadingDiscussions(false);
    }
  }, [isLoadingDiscussions]);

  /**
   * Load more discussions (pagination)
   */
  const loadMoreDiscussions = useCallback(() => {
    if (hasMoreDiscussions && !isLoadingDiscussions) {
      return loadDiscussions(discussionsPage + 1);
    }
    return null;
  }, [hasMoreDiscussions, isLoadingDiscussions, discussionsPage, loadDiscussions]);

  /**
   * Refresh discussions (pull to refresh)
   */
  const refreshDiscussions = useCallback(() => {
    return loadDiscussions(1);
  }, [loadDiscussions]);

  /**
   * Load a specific discussion by ID
   */
  const loadDiscussion = useCallback(async (discussionId: string) => {
    if (isLoadingSelectedDiscussion) return;

    setIsLoadingSelectedDiscussion(true);
    setSelectedDiscussionError(null);

    try {
      const discussion = await communityService.getDiscussionById(
        discussionId, 
        currentUser?.id
      );
      
      setSelectedDiscussion(discussion);

      // Track view in analytics
      analyticsService.trackEvent('view_discussion_detail', {
        discussion_id: discussionId,
        has_comments: discussion.comment_count > 0
      });

      return discussion;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load discussion';
      setSelectedDiscussionError(errorMessage);
      console.error(`Error loading discussion ${discussionId}:`, error);
      return null;
    } finally {
      setIsLoadingSelectedDiscussion(false);
    }
  }, [isLoadingSelectedDiscussion, currentUser]);

  /**
   * Load comments for a discussion with pagination
   */
  const loadComments = useCallback(async (
    discussionId: string,
    page: number = 1,
    limit: number = 20
  ) => {
    if (isLoadingComments) return;

    setIsLoadingComments(true);
    setCommentsError(null);

    try {
      const params: PaginationParams = { page, limit };
      const result = await communityService.getComments(
        discussionId, 
        params, 
        currentUser?.id
      );

      if (page === 1) {
        setComments(result.data);
      } else {
        setComments(prevComments => [...prevComments, ...result.data]);
      }

      setCommentsCount(result.count);
      setHasMoreComments(result.hasMore);
      setCommentsPage(page);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load comments';
      setCommentsError(errorMessage);
      console.error(`Error loading comments for discussion ${discussionId}:`, error);
      return null;
    } finally {
      setIsLoadingComments(false);
    }
  }, [isLoadingComments, currentUser]);

  /**
   * Load more comments (pagination)
   */
  const loadMoreComments = useCallback(() => {
    if (hasMoreComments && !isLoadingComments && selectedDiscussion) {
      return loadComments(selectedDiscussion.id, commentsPage + 1);
    }
    return null;
  }, [hasMoreComments, isLoadingComments, commentsPage, loadComments, selectedDiscussion]);

  /**
   * Refresh comments (pull to refresh)
   */
  const refreshComments = useCallback(() => {
    if (selectedDiscussion) {
      return loadComments(selectedDiscussion.id, 1);
    }
    return null;
  }, [loadComments, selectedDiscussion]);

  /**
   * Create a new discussion/post
   */
  const createDiscussion = useCallback(async (
    content: string,
    title?: string
  ) => {
    if (!currentUser) {
      setSubmitError('You must be logged in to create a post');
      return null;
    }

    if (!content.trim()) {
      setSubmitError('Post content cannot be empty');
      return null;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const newDiscussion = await communityService.createDiscussion(
        currentUser.id,
        content,
        title
      );

      // Update the discussions list with the new post
      setDiscussions(prevDiscussions => [newDiscussion, ...prevDiscussions]);
      setDiscussionsCount(prevCount => prevCount + 1);

      // Reset form
      setNewPostContent('');
      setNewPostTitle('');

      // Track in analytics
      analyticsService.trackEvent('create_discussion', {
        has_title: !!title,
        content_length: content.length
      });

      return newDiscussion;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
      setSubmitError(errorMessage);
      console.error('Error creating discussion:', error);
      return null;
    } finally {
      setIsSubmitting(false);
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
      setSubmitError('You must be logged in to update a post');
      return null;
    }

    if (updates.content && !updates.content.trim()) {
      setSubmitError('Post content cannot be empty');
      return null;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const updatedDiscussion = await communityService.updateDiscussion(
        discussionId,
        updates
      );

      // Update the discussions list and selected discussion if needed
      setDiscussions(prevDiscussions => 
        prevDiscussions.map(d => 
          d.id === discussionId ? { ...d, ...updates } : d
        )
      );

      if (selectedDiscussion?.id === discussionId) {
        setSelectedDiscussion(prevDiscussion => 
          prevDiscussion ? { ...prevDiscussion, ...updates } : null
        );
      }

      // Track in analytics
      analyticsService.trackEvent('update_discussion', {
        discussion_id: discussionId,
        updated_fields: Object.keys(updates)
      });

      return updatedDiscussion;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update post';
      setSubmitError(errorMessage);
      console.error(`Error updating discussion ${discussionId}:`, error);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [currentUser, selectedDiscussion]);

  /**
   * Delete a discussion/post
   */
  const deleteDiscussion = useCallback(async (discussionId: string) => {
    if (!currentUser) {
      setSubmitError('You must be logged in to delete a post');
      return false;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await communityService.deleteDiscussion(discussionId);

      // Remove from the discussions list
      setDiscussions(prevDiscussions => 
        prevDiscussions.filter(d => d.id !== discussionId)
      );
      setDiscussionsCount(prevCount => prevCount - 1);

      // If this was the selected discussion, clear it
      if (selectedDiscussion?.id === discussionId) {
        setSelectedDiscussion(null);
        setComments([]);
        setCommentsCount(0);
        
        // Navigate back to the feed
        router.back();
      }

      // Track in analytics
      analyticsService.trackEvent('delete_discussion', {
        discussion_id: discussionId
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete post';
      setSubmitError(errorMessage);
      console.error(`Error deleting discussion ${discussionId}:`, error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [currentUser, selectedDiscussion, router]);

  /**
   * Create a new comment on a discussion
   */
  const createComment = useCallback(async (
    discussionId: string,
    content: string
  ) => {
    if (!currentUser) {
      setSubmitError('You must be logged in to comment');
      return null;
    }

    if (!content.trim()) {
      setSubmitError('Comment cannot be empty');
      return null;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const newComment = await communityService.createComment(
        currentUser.id,
        discussionId,
        content
      );

      // Add to comments list
      setComments(prevComments => [...prevComments, newComment]);
      setCommentsCount(prevCount => prevCount + 1);

      // Update comment count in the selected discussion
      if (selectedDiscussion?.id === discussionId) {
        setSelectedDiscussion(prevDiscussion => 
          prevDiscussion 
            ? { 
                ...prevDiscussion, 
                comment_count: (prevDiscussion.comment_count || 0) + 1 
              } 
            : null
        );
      }

      // Also update in the discussions list
      setDiscussions(prevDiscussions => 
        prevDiscussions.map(d => 
          d.id === discussionId 
            ? { ...d, comment_count: (d.comment_count || 0) + 1 } 
            : d
        )
      );

      // Reset form
      setNewCommentContent('');

      // Track in analytics
      analyticsService.trackEvent('create_comment', {
        discussion_id: discussionId,
        content_length: content.length
      });

      return newComment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create comment';
      setSubmitError(errorMessage);
      console.error(`Error creating comment for discussion ${discussionId}:`, error);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [currentUser, selectedDiscussion]);

  /**
   * Update an existing comment
   */
  const updateComment = useCallback(async (
    commentId: string,
    content: string
  ) => {
    if (!currentUser) {
      setSubmitError('You must be logged in to update a comment');
      return null;
    }

    if (!content.trim()) {
      setSubmitError('Comment cannot be empty');
      return null;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const updatedComment = await communityService.updateComment(
        commentId,
        content
      );

      // Update in comments list
      setComments(prevComments => 
        prevComments.map(c => 
          c.id === commentId ? { ...c, content } : c
        )
      );

      // Track in analytics
      analyticsService.trackEvent('update_comment', {
        comment_id: commentId,
        content_length: content.length
      });

      return updatedComment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update comment';
      setSubmitError(errorMessage);
      console.error(`Error updating comment ${commentId}:`, error);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [currentUser]);

  /**
   * Delete a comment
   */
  const deleteComment = useCallback(async (commentId: string, discussionId: string) => {
    if (!currentUser) {
      setSubmitError('You must be logged in to delete a comment');
      return false;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await communityService.deleteComment(commentId);

      // Remove from comments list
      setComments(prevComments => 
        prevComments.filter(c => c.id !== commentId)
      );
      setCommentsCount(prevCount => prevCount - 1);

      // Update comment count in the selected discussion
      if (selectedDiscussion?.id === discussionId) {
        setSelectedDiscussion(prevDiscussion => 
          prevDiscussion 
            ? { 
                ...prevDiscussion, 
                comment_count: Math.max((prevDiscussion.comment_count || 0) - 1, 0) 
              } 
            : null
        );
      }

      // Also update in the discussions list
      setDiscussions(prevDiscussions => 
        prevDiscussions.map(d => 
          d.id === discussionId 
            ? { ...d, comment_count: Math.max((d.comment_count || 0) - 1, 0) } 
            : d
        )
      );

      // Track in analytics
      analyticsService.trackEvent('delete_comment', {
        comment_id: commentId,
        discussion_id: discussionId
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment';
      setSubmitError(errorMessage);
      console.error(`Error deleting comment ${commentId}:`, error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [currentUser, selectedDiscussion]);

  /**
   * Toggle a reaction (like/upvote) on a discussion
   */
  const toggleDiscussionReaction = useCallback(async (
    discussionId: string
  ) => {
    if (!currentUser) {
      setSubmitError('You must be logged in to react to a post');
      return false;
    }

    try {
      const isReactionAdded = await communityService.toggleDiscussionReaction(
        currentUser.id,
        discussionId
      );

      // Update reaction count and user_has_reacted in the discussions list
      setDiscussions(prevDiscussions => 
        prevDiscussions.map(d => {
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
      );

      // Also update in the selected discussion if needed
      if (selectedDiscussion?.id === discussionId) {
        setSelectedDiscussion(prevDiscussion => {
          if (!prevDiscussion) return null;
          
          const newReactionCount = isReactionAdded 
            ? (prevDiscussion.reaction_count || 0) + 1 
            : Math.max((prevDiscussion.reaction_count || 0) - 1, 0);
          
          return { 
            ...prevDiscussion, 
            reaction_count: newReactionCount,
            user_has_reacted: isReactionAdded
          };
        });
      }

      // Track in analytics
      analyticsService.trackEvent('toggle_discussion_reaction', {
        discussion_id: discussionId,
        action: isReactionAdded ? 'add' : 'remove'
      });

      return isReactionAdded;
    } catch (error) {
      console.error(`Error toggling reaction for discussion ${discussionId}:`, error);
      return false;
    }
  }, [currentUser, selectedDiscussion]);

  /**
   * Toggle a reaction (like/upvote) on a comment
   */
  const toggleCommentReaction = useCallback(async (
    commentId: string
  ) => {
    if (!currentUser) {
      setSubmitError('You must be logged in to react to a comment');
      return false;
    }

    try {
      const isReactionAdded = await communityService.toggleCommentReaction(
        currentUser.id,
        commentId
      );

      // Update reaction count and user_has_reacted in the comments list
      setComments(prevComments => 
        prevComments.map(c => {
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
      );

      // Track in analytics
      analyticsService.trackEvent('toggle_comment_reaction', {
        comment_id: commentId,
        action: isReactionAdded ? 'add' : 'remove'
      });

      return isReactionAdded;
    } catch (error) {
      console.error(`Error toggling reaction for comment ${commentId}:`, error);
      return false;
    }
  }, [currentUser]);

  /**
   * Get discussions created by the current user
   */
  const loadUserDiscussions = useCallback(async (
    page: number = 1,
    limit: number = 10
  ) => {
    if (!currentUser || isLoadingDiscussions) return null;

    setIsLoadingDiscussions(true);
    setDiscussionsError(null);

    try {
      const params: PaginationParams = { page, limit };
      const result = await communityService.getUserDiscussions(currentUser.id, params);

      if (page === 1) {
        setDiscussions(result.data);
      } else {
        setDiscussions(prevDiscussions => [...prevDiscussions, ...result.data]);
      }

      setDiscussionsCount(result.count);
      setHasMoreDiscussions(result.hasMore);
      setDiscussionsPage(page);

      // Track view in analytics
      analyticsService.trackEvent('view_user_discussions', {
        page_number: page,
        items_count: result.data.length,
        total_count: result.count
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load your posts';
      setDiscussionsError(errorMessage);
      console.error('Error loading user discussions:', error);
      return null;
    } finally {
      setIsLoadingDiscussions(false);
    }
  }, [currentUser, isLoadingDiscussions]);

  return {
    // State
    discussions,
    discussionsCount,
    discussionsPage,
    hasMoreDiscussions,
    isLoadingDiscussions,
    discussionsError,
    
    selectedDiscussion,
    isLoadingSelectedDiscussion,
    selectedDiscussionError,
    
    comments,
    commentsCount,
    commentsPage,
    hasMoreComments,
    isLoadingComments,
    commentsError,
    
    newPostContent,
    setNewPostContent,
    newPostTitle,
    setNewPostTitle,
    newCommentContent,
    setNewCommentContent,
    isSubmitting,
    submitError,
    
    currentUser,
    
    // Methods
    loadDiscussions,
    loadMoreDiscussions,
    refreshDiscussions,
    loadDiscussion,
    loadComments,
    loadMoreComments,
    refreshComments,
    createDiscussion,
    updateDiscussion,
    deleteDiscussion,
    createComment,
    updateComment,
    deleteComment,
    toggleDiscussionReaction,
    toggleCommentReaction,
    loadUserDiscussions,
  };
};

export default useCommunityFeed;
