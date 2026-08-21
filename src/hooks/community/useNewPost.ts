import { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { sanitizeMarkdownInput } from '@/utils/sanitizeMarkdownInput';
import useCommunityFeed from '../community/useCommunityFeed';
import useCommunityFeedState from './useCommunityFeedState';

/**
 * Custom hook for managing new post creation and editing logic
 */
function useNewPost() {
  // Get post ID from URL parameters if in edit mode
  const { postId, prefillTitle, prefillContent } = useLocalSearchParams<{ postId?: string; prefillTitle?: string; prefillContent?: string }>();
  const isEditMode = Boolean(postId);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Get community feed functionality
  const {
    // Form state
    newPostContent,
    setNewPostContent,
    newPostTitle,
    setNewPostTitle,
    resetPostForm,
    isSubmitting,
    submitError,
    // Methods
    createDiscussion,
    updateDiscussion,
    // Discussion data
    selectedDiscussion,
    isLoadingSelectedDiscussion,
    loadDiscussion
  } = useCommunityFeed();

  // Get toast handler from feed state
  const { showToastMessage } = useCommunityFeedState();
  
  // Get notification context
  const notification = useNotification();
  
  // UI state
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const didApplyPrefill = useRef(false);

  // Sharing routes only prefill a draft. The user still reviews and submits it,
  // and private reflection fields are never passed by the offsetting feature.
  useEffect(() => {
    if (isEditMode || didApplyPrefill.current) return;
    if (prefillTitle) setPostTitle(prefillTitle.slice(0, 120));
    if (prefillContent) setNewPostContent(prefillContent.slice(0, 5000));
    didApplyPrefill.current = Boolean(prefillTitle || prefillContent);
  }, [isEditMode, prefillTitle, prefillContent, setNewPostContent]);

  // Redirect to signin if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Load existing post data if in edit mode
  useEffect(() => {
    const loadPostData = async () => {
      if (isEditMode && postId && user) {
        try {
          await loadDiscussion(postId);
        } catch (error) {
          console.error('Error loading post for editing:', error);
          notification?.addNotification({
            type: 'toast',
            message: 'Failed to load post data for editing.',
            severity: 'error',
          });
          router.back();
        }
      }
    };
    
    loadPostData();
  }, [isEditMode, postId, user, loadDiscussion, router]);
  
  // Update form when post data is loaded
  useEffect(() => {
    if (isEditMode && selectedDiscussion) {
      setNewPostContent(selectedDiscussion.content);
      setPostTitle(selectedDiscussion.title || '');
    }
  }, [isEditMode, selectedDiscussion, setNewPostContent]);

  // Check if user has permission to edit this post
  const hasEditPermission = !isEditMode || 
    !selectedDiscussion || 
    selectedDiscussion.user_id === user?.id;

  // Handle permission denied
  const handlePermissionDenied = () => {
    notification?.addNotification({
      type: 'modal',
      title: 'Permission Denied',
      message: "You don't have permission to edit this post.",
      severity: 'error',
      action: {
        label: 'OK',
        onPress: () => router.back(),
      },
    });
  };

  // Handle post submission
  const handleSubmitPost = async () => {
    if (!newPostContent?.trim()) return;
    
    try {
      // Sanitize the markdown input before submission to ensure it's safe
      const formattedContent = sanitizeMarkdownInput(newPostContent, 'post');
      let result;
      
      if (isEditMode && postId) {
        // Update existing post
        console.log('Updating existing post:', postId);
        result = await updateDiscussion(postId, {
          content: formattedContent,
          title: postTitle.trim() || undefined
        });
        
        if (result) {
          // Navigate back to the post detail with a success parameter
          router.replace({
            pathname: '/community/post/[id]',
            params: { id: postId, updated: 'true' }
          });
        } else if (submitError) {
          notification?.addNotification({
            type: 'toast',
            message: `Failed to update post: ${submitError}`,
            severity: 'error',
          });
        }
      } else {
        // Create new post
        console.log('Creating new post');
        result = await createDiscussion(formattedContent, postTitle.trim() || undefined);
        
        if (result) {
          // Reset the form
          resetPostForm();
          setPostTitle('');

          // Show toast for successful creation
          notification?.addNotification({
            type: 'toast',
            message: 'Post created successfully!',
            severity: 'success',
          });

          // Navigate back to the feed (no params)
          router.replace('/community');
        } else if (submitError) {
          notification?.addNotification({
            type: 'toast',
            message: `Failed to create post: ${submitError}`,
            severity: 'error',
          });
        }
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} post:`, error);
      notification?.addNotification({
        type: 'toast',
        message: `Failed to ${isEditMode ? 'update' : 'create'} post. Please try again.`,
        severity: 'error',
      });
    }
  };

  // Toggle markdown help visibility
  const toggleMarkdownHelp = () => {
    setShowMarkdownHelp(!showMarkdownHelp);
  };

  // Toggle preview mode
  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  return {
    // State
    isEditMode,
    postTitle,
    setPostTitle,
    newPostContent,
    setNewPostContent,
    showMarkdownHelp,
    isPreviewMode,
    isSubmitting,
    
    // Loading state
    isLoading: authLoading || (isEditMode && isLoadingSelectedDiscussion),
    
    // Permissions
    hasEditPermission,
    handlePermissionDenied,
    
    // Actions
    handleSubmitPost,
    toggleMarkdownHelp,
    togglePreviewMode,
    goBack: () => {
      if (typeof router.canGoBack === 'function' ? router.canGoBack() : false) {
        router.back();
      } else {
        router.replace('/community');
      }
    },
  };
}

export default useNewPost;
