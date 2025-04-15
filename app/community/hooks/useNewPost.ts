import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { sanitizeMarkdownInput } from '../utils/sanitizeMarkdownInput';
import useCommunityFeed from '../../hooks/useCommunityFeed';
import useCommunityFeedState from './useCommunityFeedState';

/**
 * Custom hook for managing new post creation and editing logic
 */
function useNewPost() {
  // Get post ID from URL parameters if in edit mode
  const { postId } = useLocalSearchParams<{ postId: string }>();
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
  
  // UI state
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [postTitle, setPostTitle] = useState('');

  // Redirect to signin if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('No authenticated user found in new post, redirecting to signin');
      router.replace('/auth/signin');
    } else if (!authLoading && user) {
      console.log('Authenticated user in new post:', user.id);
    }
  }, [user, authLoading, router]);

  // Load existing post data if in edit mode
  useEffect(() => {
    const loadPostData = async () => {
      if (isEditMode && postId && user) {
        try {
          console.log('Loading post data for editing, postId:', postId);
          await loadDiscussion(postId);
        } catch (error) {
          console.error('Error loading post for editing:', error);
          Alert.alert('Error', 'Failed to load post data for editing.');
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
    Alert.alert(
      "Permission Denied",
      "You don't have permission to edit this post.",
      [{ text: "OK", onPress: () => router.back() }]
    );
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
          Alert.alert('Error', `Failed to update post: ${submitError}`);
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
          showToastMessage('Post created successfully!');

          // Navigate back to the feed (no params)
          router.replace('/community');
        } else if (submitError) {
          Alert.alert('Error', `Failed to create post: ${submitError}`);
        }
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} post:`, error);
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'create'} post. Please try again.`);
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
    goBack: () => router.back(),
  };
}

export default useNewPost;
