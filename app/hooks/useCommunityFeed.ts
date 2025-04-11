/**
 * Main hook for community feed functionality
 * 
 * This hook composes all the individual community hooks into a single interface.
 * For more granular control, you can use the individual hooks directly.
 */
import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import {
  useCurrentUser,
  useDiscussions,
  useSelectedDiscussion,
  useComments,
  useReactions,
  useFormState
} from './community';

/**
 * Custom hook for community feed functionality
 */
const useCommunityFeed = () => {
  const router = useRouter();
  
  // User state
  const { currentUser, isAuthenticated } = useCurrentUser();
  
  // Discussions state
  const {
    discussions,
    count: discussionsCount,
    page: discussionsPage,
    hasMore: hasMoreDiscussions,
    isLoading: isLoadingDiscussions,
    error: discussionsError,
    loadDiscussions,
    loadMore: loadMoreDiscussions,
    refresh: refreshDiscussions,
    createDiscussion,
    updateDiscussion,
    deleteDiscussion,
    loadUserDiscussions,
    updateDiscussionInState
  } = useDiscussions();
  
  // Selected discussion state
  const {
    discussion: selectedDiscussion,
    isLoading: isLoadingSelectedDiscussion,
    error: selectedDiscussionError,
    loadDiscussion,
    updateCommentCount,
    updateReaction: updateSelectedDiscussionReaction,
    clearDiscussion
  } = useSelectedDiscussion();
  
  // Comments state - we'll use a memoized discussionId to prevent infinite loops
  // This is a key fix for the infinite loop issue - we only update the discussionId
  // when selectedDiscussion changes, not on every render
  const currentDiscussionId = selectedDiscussion?.id || '';
  
  const {
    comments,
    count: commentsCount,
    page: commentsPage,
    hasMore: hasMoreComments,
    isLoading: isLoadingComments,
    error: commentsError,
    loadComments: loadCommentsBase,
    loadMore: loadMoreComments,
    refresh: refreshComments,
    createComment: createCommentBase,
    updateComment,
    deleteComment: deleteCommentBase,
    updateCommentReaction
  } = useComments({
    discussionId: currentDiscussionId,
    initialPage: 1,
    pageSize: 20
  });
  
  // Wrapper for loadComments that ensures we're using the latest discussionId
  const loadComments = useCallback(() => {
    if (selectedDiscussion?.id) {
      return loadCommentsBase();
    }
    return Promise.resolve(null);
  }, [selectedDiscussion?.id, loadCommentsBase]);
  
  // Reactions state
  const {
    toggleDiscussionReaction: toggleDiscussionReactionBase,
    toggleCommentReaction: toggleCommentReactionBase
  } = useReactions();
  
  // Form state
  const {
    newPostContent,
    setNewPostContent,
    newPostTitle,
    setNewPostTitle,
    resetPostForm,
    newCommentContent,
    setNewCommentContent,
    resetCommentForm,
    isSubmitting,
    error: submitError,
    setSubmitting,
    setError: setSubmitError
  } = useFormState();

  /**
   * Create a comment with side effects
   */
  const createComment = useCallback(async (content: string) => {
    if (!selectedDiscussion) return null;
    
    setSubmitting(true);
    
    try {
      // The discussionId is already set in the useComments hook
      const result = await createCommentBase(content);
      
      if (result) {
        // Update comment count in the selected discussion
        updateCommentCount(true);
        
        // Reset form
        resetCommentForm();
      }
      
      return result;
    } finally {
      setSubmitting(false);
    }
  }, [selectedDiscussion, createCommentBase, updateCommentCount, resetCommentForm, setSubmitting]);

  /**
   * Delete a comment with side effects
   */
  const deleteComment = useCallback(async (commentId: string) => {
    if (!selectedDiscussion) return false;
    
    setSubmitting(true);
    
    try {
      // The discussionId is already set in the useComments hook
      const result = await deleteCommentBase(commentId);
      
      if (result) {
        // Update comment count in the selected discussion
        updateCommentCount(false);
      }
      
      return result;
    } finally {
      setSubmitting(false);
    }
  }, [selectedDiscussion, deleteCommentBase, updateCommentCount, setSubmitting]);

  /**
   * Toggle a reaction on a discussion with side effects
   */
  const toggleDiscussionReaction = useCallback(async (discussionId: string) => {
    const result = await toggleDiscussionReactionBase(discussionId);
    
    if (result.success) {
      // Update the discussion in the list
      updateDiscussionInState(discussionId, result.isAdded!);
      
      // If this is the selected discussion, update it too
      if (selectedDiscussion?.id === discussionId) {
        updateSelectedDiscussionReaction(result.isAdded!);
      }
    }
    
    return result.success;
  }, [
    toggleDiscussionReactionBase, 
    updateDiscussionInState, 
    selectedDiscussion, 
    updateSelectedDiscussionReaction
  ]);

  /**
   * Toggle a reaction on a comment with side effects
   */
  const toggleCommentReaction = useCallback(async (commentId: string) => {
    const result = await toggleCommentReactionBase(commentId);
    
    if (result.success) {
      // Update the comment in the list
      updateCommentReaction(commentId, result.isAdded!);
    }
    
    return result.success;
  }, [toggleCommentReactionBase, updateCommentReaction]);

  /**
   * Handle navigation after deleting a discussion
   */
  const handleDeleteDiscussion = useCallback(async (discussionId: string) => {
    const success = await deleteDiscussion(discussionId);
    
    if (success && selectedDiscussion?.id === discussionId) {
      clearDiscussion();
      router.back();
    }
    
    return success;
  }, [deleteDiscussion, selectedDiscussion, clearDiscussion, router]);

  return {
    // User state
    currentUser,
    isAuthenticated,
    
    // Discussions state
    discussions,
    discussionsCount,
    discussionsPage,
    hasMoreDiscussions,
    isLoadingDiscussions,
    discussionsError,
    
    // Selected discussion state
    selectedDiscussion,
    isLoadingSelectedDiscussion,
    selectedDiscussionError,
    
    // Comments state
    comments,
    commentsCount,
    commentsPage,
    hasMoreComments,
    isLoadingComments,
    commentsError,
    
    // Form state
    newPostContent,
    setNewPostContent,
    newPostTitle,
    setNewPostTitle,
    newCommentContent,
    setNewCommentContent,
    isSubmitting,
    submitError,
    
    // Methods - Discussions
    loadDiscussions,
    loadMoreDiscussions,
    refreshDiscussions,
    loadDiscussion,
    createDiscussion,
    updateDiscussion,
    deleteDiscussion: handleDeleteDiscussion,
    loadUserDiscussions,
    
    // Methods - Comments
    loadComments,
    loadMoreComments,
    refreshComments,
    createComment,
    updateComment,
    deleteComment,
    
    // Methods - Reactions
    toggleDiscussionReaction,
    toggleCommentReaction,
    
    // Methods - Form
    resetPostForm,
    resetCommentForm
  };
};

export default useCommunityFeed;