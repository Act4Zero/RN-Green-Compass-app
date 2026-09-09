import { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { sanitizeMarkdownInput } from '@/utils/sanitizeMarkdownInput';
import useCommunityFeed from '../community/useCommunityFeed';
import type { DiscussionCategory } from '@/types/community/community';
import { useAppLocale } from '@/context/AppLocaleContext';

/**
 * Custom hook for managing new post creation and editing logic
 */
function useNewPost() {
  // Get post ID from URL parameters if in edit mode
  const { postId, prefillTitle, prefillContent } = useLocalSearchParams<{ postId?: string; prefillTitle?: string; prefillContent?: string }>();
  const isEditMode = Boolean(postId);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t } = useAppLocale();
  
  // Get community feed functionality
  const {
    // Form state
    newPostContent,
    setNewPostContent,
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

  // Get notification context
  const notification = useNotification();
  
  // UI state
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [category, setCategory] = useState<DiscussionCategory>('sustainable_living');
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
            message: t('Failed to load post data for editing.', 'Публикацията не можа да бъде заредена за редактиране.'),
            severity: 'error',
          });
          router.back();
        }
      }
    };
    
    loadPostData();
  }, [isEditMode, postId, user, loadDiscussion, notification, router, t]);
  
  // Update form when post data is loaded
  useEffect(() => {
    if (isEditMode && selectedDiscussion) {
      setNewPostContent(selectedDiscussion.content);
      setPostTitle(selectedDiscussion.title || '');
      setCategory(selectedDiscussion.category || 'sustainable_living');
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
      title: t('Permission Denied', 'Нямате разрешение'),
      message: t("You don't have permission to edit this post.", 'Нямате право да редактирате тази публикация.'),
      severity: 'error',
      action: {
        label: t('OK', 'Добре'),
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
          title: postTitle.trim() || undefined,
          category,
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
            message: t(`Failed to update post: ${submitError}`, 'Публикацията не можа да бъде обновена.'),
            severity: 'error',
          });
        }
      } else {
        // Create new post
        console.log('Creating new post');
        result = await createDiscussion(formattedContent, postTitle.trim() || undefined, category);
        
        if (result) {
          // Reset the form
          resetPostForm();
          setPostTitle('');

          // Show toast for successful creation
          notification?.addNotification({
            type: 'toast',
            message: t('Post created successfully!', 'Публикацията е създадена!'),
            severity: 'success',
          });

          // Navigate back to the feed (no params)
          router.replace('/community');
        } else if (submitError) {
          notification?.addNotification({
            type: 'toast',
            message: t(`Failed to create post: ${submitError}`, 'Публикацията не можа да бъде създадена.'),
            severity: 'error',
          });
        }
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} post:`, error);
      notification?.addNotification({
        type: 'toast',
        message: isEditMode ? t('Failed to update post. Please try again.', 'Публикацията не можа да бъде обновена. Опитайте отново.') : t('Failed to create post. Please try again.', 'Публикацията не можа да бъде създадена. Опитайте отново.'),
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
    category,
    setCategory,
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
