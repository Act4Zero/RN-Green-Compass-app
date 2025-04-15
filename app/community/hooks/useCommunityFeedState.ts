import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import useCommunityFeed from '../../hooks/useCommunityFeed';
import { discussionService } from '../../services/community';
import { confirmAndDeletePost } from '../../utils/deletePost';

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
    }, 2000);
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
    router.push('/community/post/new-post');
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
      pathname: '/community/post/new-post',
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
    console.log('[FEED] Delete post button clicked for post ID:', postId);
    
    if (!user) {
      console.error('[FEED] No user found for delete operation');
      showToastMessage('Error: You must be logged in to delete a post');
      return;
    }
    
    // Use the new utility function for deletion
    confirmAndDeletePost(
      postId,
      user.id,
      // On success
      () => {
        console.log(`[FEED] Post ${postId} deleted successfully`);
        showToastMessage('Post deleted successfully!');
        
        // Force refresh to update the UI
        refreshDiscussions().then(() => {
          console.log('[FEED] UI refreshed after deletion');
        });
      },
      // On error
      (errorMsg) => {
        console.error(`[FEED] Error deleting post: ${errorMsg}`);
        showToastMessage(`Error: ${errorMsg}`);
      }
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
    showToastMessage, // Expose toast handler
  };
}

export default useCommunityFeedState;
