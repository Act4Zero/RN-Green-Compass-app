import { useState, useCallback } from 'react';
import { SubmitState } from '../../types/community/types';

/**
 * Hook for managing form state in the community feed
 */
const useFormState = () => {
  // State for new post
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  
  // State for new comment
  const [newCommentContent, setNewCommentContent] = useState('');
  
  // State for submission
  const [submitState, setSubmitState] = useState<SubmitState>({
    isSubmitting: false,
    error: null
  });

  /**
   * Reset post form
   */
  const resetPostForm = useCallback(() => {
    setNewPostContent('');
    setNewPostTitle('');
    setSubmitState({ isSubmitting: false, error: null });
  }, []);

  /**
   * Reset comment form
   */
  const resetCommentForm = useCallback(() => {
    setNewCommentContent('');
    setSubmitState({ isSubmitting: false, error: null });
  }, []);

  /**
   * Set submitting state
   */
  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setSubmitState(prev => ({ ...prev, isSubmitting }));
  }, []);

  /**
   * Set error state
   */
  const setError = useCallback((error: string | null) => {
    setSubmitState(prev => ({ ...prev, error }));
  }, []);

  return {
    // Post form
    newPostContent,
    setNewPostContent,
    newPostTitle,
    setNewPostTitle,
    resetPostForm,
    
    // Comment form
    newCommentContent,
    setNewCommentContent,
    resetCommentForm,
    
    // Submit state
    isSubmitting: submitState.isSubmitting,
    error: submitState.error,
    setSubmitting,
    setError
  };
};

export default useFormState;
