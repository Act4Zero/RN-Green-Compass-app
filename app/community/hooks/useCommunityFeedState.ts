import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import useCommunityFeed from '../../hooks/useCommunityFeed';

/**
 * Custom hook to manage community feed state and logic
 * Separates business logic from the presentation layer
 */
function useCommunityFeedState() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get community feed data and methods from the main hook
  const {
    // Discussions state
    discussions,
    isLoadingDiscussions,
    discussionsError,
    
    // Methods - Discussions
    loadDiscussions,
    refreshDiscussions,
    updateDiscussion,
    deleteDiscussion,
    
    // Methods - Reactions
    toggleDiscussionReaction,
  } = useCommunityFeed();
  
  // UI state management
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [postOptionsMap, setPostOptionsMap] = useState<Record<string, boolean>>({});
  const [activePostId, setActivePostId] = useState<string | null>(null);

  // Use a ref to track if discussions have been loaded
  const discussionsLoadedRef = useRef(false);

  // Check for success message from post operations
  useEffect(() => {
    if (params.success === 'true') {
      // Use custom message if provided, otherwise use default
      const message = params.message as string || 'Post created successfully!';
      showToastMessage(message);
    }
  }, [params]);

  // Load discussions when component mounts (only once)
  useEffect(() => {
    if (!authLoading && user && !discussionsLoadedRef.current) {
      console.log('Loading discussions for the first time');
      loadDiscussions().then(() => {
        discussionsLoadedRef.current = true;
      });
    }
  }, [authLoading, user]); // Removed loadDiscussions from dependencies

  // Redirect to signin if user is not authenticated
  useEffect(() => {
    // Only check after auth loading is complete
    if (!authLoading && !user) {
      console.log('No authenticated user found in community feed, redirecting to signin');
      router.replace('/auth/signin');
    } else if (!authLoading && user) {
      console.log('Authenticated user in community feed:', user.id);
    }
  }, [user, authLoading, router]);

  // Toast message handler
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Post interaction handlers
  const handleLike = async (postId: string) => {
    const success = await toggleDiscussionReaction(postId);
    if (success) {
      showToastMessage('Post liked!');
    }
  };

  const handleComment = (postId: string) => {
    // Navigate to post detail screen
    router.push(`/community/post/${postId}`);
  };

  const handleNewPost = () => {
    // Navigate to new post screen
    router.push('/community/new-post');
  };
  
  const togglePostOptions = (postId: string) => {
    // Close any other open menus first
    const isCurrentlyOpen = postOptionsMap[postId];
    
    // Reset all options to closed
    setPostOptionsMap({});
    
    // If this menu wasn't already open, open it
    if (!isCurrentlyOpen) {
      setPostOptionsMap({ [postId]: true });
      setActivePostId(postId);
    } else {
      setActivePostId(null);
    }
  };
  
  // Close the options menu when clicking outside
  const handleCloseAllMenus = () => {
    setPostOptionsMap({});
    setActivePostId(null);
  };
  
  const handleEditPost = (postId: string) => {
    // Close the options menu
    togglePostOptions(postId);
    
    // Find the post to edit
    const postToEdit = discussions.find(discussion => discussion.id === postId);
    if (!postToEdit) return;
    
    // Navigate to new-post screen with edit parameters
    router.push({
      pathname: '/community/new-post',
      params: { 
        edit: 'true',
        postId: postId,
        title: postToEdit.title || '',
        content: postToEdit.content
      }
    });
  };
  
  const handleDeletePost = (postId: string) => {
    // Close the options menu
    togglePostOptions(postId);
    
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteDiscussion(postId);
            if (success) {
              showToastMessage('Post deleted!');
            }
          }
        }
      ]
    );
  };

  return {
    // Auth state
    user,
    authLoading,
    
    // Discussion data
    discussions,
    isLoadingDiscussions,
    discussionsError,
    refreshDiscussions,
    
    // UI state
    showToast,
    toastMessage,
    postOptionsMap,
    
    // Event handlers
    handleLike,
    handleComment,
    handleNewPost,
    togglePostOptions,
    handleCloseAllMenus,
    handleEditPost,
    handleDeletePost,
  };
}

export default useCommunityFeedState;
