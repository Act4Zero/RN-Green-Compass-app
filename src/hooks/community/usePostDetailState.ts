import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import useCommunityFeed from '../community/useCommunityFeed';
import { deletePost } from '../../utils/deletePost';
import { useNotification } from '../../context/NotificationContext';
import { sanitizeMarkdownInput, getCharacterInfo } from '@/utils/sanitizeMarkdownInput';

/**
 * Custom hook to manage post detail state and logic
 * Separates business logic from the presentation layer
 */
function usePostDetailState(discussionId: string) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const {
    // User state
    currentUser,
    
    // Selected discussion state
    selectedDiscussion,
    isLoadingSelectedDiscussion,
    selectedDiscussionError,
    loadDiscussion,
    
    // Comments state
    comments,
    isLoadingComments,
    commentsError,
    loadComments,
    
    // Form state
    newCommentContent,
    setNewCommentContent,
    isSubmitting,
    submitError,
    
    // Methods - Discussions
    updateDiscussion,
    deleteDiscussion,
    
    // Methods - Comments
    createComment,
    updateComment,
    deleteComment,
    
    // Methods - Reactions
    toggleDiscussionReaction,
  } = useCommunityFeed();
  
  // Use notification context
  const { addNotification } = useNotification();
  
  // UI state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Success!');
  
  // Post editing state
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostContent, setEditPostContent] = useState('');
  const [editPostTitle, setEditPostTitle] = useState('');
  
  // Comment editing state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  
  // Options menu state
  const [showPostOptions, setShowPostOptions] = useState(false);
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  
  // Calculate character info for different input fields
  const characterInfo = getCharacterInfo(newCommentContent, true);
  const editPostCharacterInfo = getCharacterInfo(editPostContent, false);
  const editCommentCharacterInfo = getCharacterInfo(editCommentContent, true);

  // Load discussion and comments when component mounts
  useEffect(() => {
    if (!authLoading && user && discussionId) {
      loadDiscussion(discussionId);
      loadComments();
    }
  }, [authLoading, user, discussionId]);
  
  // Initialize edit form when starting to edit post
  useEffect(() => {
    if (isEditingPost && selectedDiscussion) {
      setEditPostContent(selectedDiscussion.content);
      setEditPostTitle(selectedDiscussion.title || '');
    }
  }, [isEditingPost, selectedDiscussion]);
  
  // Redirect to signin if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('No authenticated user found in post detail, redirecting to signin');
      router.replace('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Notification handler
  const showToastMessage = (message: string = 'Success!', severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    addNotification({
      type: 'toast',
      message,
      severity,
      duration: 3000,
    });
  };

  // Post interaction handlers
  const handleLike = async () => {
    if (!selectedDiscussion) return;
    
    const success = await toggleDiscussionReaction(selectedDiscussion.id);
    if (success) {
      showToastMessage('Post liked!', 'success');
    }
  };

  const handleSubmitComment = async () => {
    // Check if comment is empty or exceeds character limit
    if (!newCommentContent.trim() || characterInfo.isAtLimit) return;
    
    // Ensure the comment respects the 300 character limit
    const limitedComment = newCommentContent.length > 300 ? newCommentContent.substring(0, 300) : newCommentContent;
    
    // Create the comment
    const result = await createComment(sanitizeMarkdownInput(limitedComment, 'comment'));
    
    if (result) {
      showToastMessage('Comment added!', 'success');
      // Refresh comments to display the new comment and its user details
      loadComments();
      // Optionally clear the comment input for better UX
      setNewCommentContent('');
    }
  };
  
  const handleEditPost = () => {
    setShowPostOptions(false);
    
    if (!selectedDiscussion) return;
    
    // Navigate to new-post screen with edit parameters
    router.push({
      pathname: '/community/post/new-post',
      params: { 
        edit: 'true',
        postId: selectedDiscussion.id,
        title: selectedDiscussion.title || '',
        content: selectedDiscussion.content
      }
    });
  };
  
  const handleDeletePost = () => {
    setShowPostOptions(false);
    
    if (!selectedDiscussion) {
      console.error('[POST DETAIL] Cannot delete post: No selected discussion');
      return;
    }
    
    if (!user) {
      console.error('[POST DETAIL] No user found for delete operation');
      showToastMessage('Error: You must be logged in to delete a post', 'error');
      return;
    }
    
    // Show confirmation dialog with our notification system
    addNotification({
      type: 'modal',
      title: 'Delete Post',
      message: 'Are you sure you want to delete this post? This action cannot be undone.',
      severity: 'warning',
      autoClose: false,
      action: {
        label: 'Delete',
        onPress: () => {
          // Execute deletion after confirmation
          deletePost(
            selectedDiscussion.id,
            user.id,
            // On success callback
            () => {
              showToastMessage('Post deleted successfully!', 'success');
              
              // Navigate back to community feed
              router.push('/community');
            },
            // On error callback
            (errorMsg) => {
              console.error(`[POST DETAIL] Error deleting post: ${errorMsg}`);
              showToastMessage(`Error: ${errorMsg}`, 'error');
            }
          );
        }
      }
    });
  };
  
  const handleSavePostEdit = async () => {
    if (!editPostContent.trim() || editPostCharacterInfo.isAtLimit || !selectedDiscussion) return;
    
    const updates = {
      content: sanitizeMarkdownInput(editPostContent, 'post'),
      title: editPostTitle.trim() || undefined
    };
    
    const result = await updateDiscussion(selectedDiscussion.id, updates);
    
    if (result) {
      setIsEditingPost(false);
      showToastMessage('Post updated!', 'success');
      // Reload the discussion to show the updated content
      loadDiscussion(selectedDiscussion.id);
    }
  };
  
  const handleCancelPostEdit = () => {
    setIsEditingPost(false);
  };
  
  const handleEditComment = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditCommentContent(content);
  };
  
  const handleSaveCommentEdit = async () => {
    if (!editingCommentId || !editCommentContent.trim() || editCommentCharacterInfo.isAtLimit) return;
    
    // Ensure the comment respects the 300 character limit
    const limitedComment = editCommentContent.length > 300 ? editCommentContent.substring(0, 300) : editCommentContent;
    
    const result = await updateComment(editingCommentId, sanitizeMarkdownInput(limitedComment, 'comment'));
    
    if (result) {
      setEditingCommentId(null);
      setEditCommentContent('');
      showToastMessage('Comment updated!', 'success');
    }
  };
  
  const handleCancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditCommentContent('');
  };
  
  const handleDeleteComment = (commentId: string) => {
    // Use the modal approach for delete confirmation
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };
  
  // Function to handle actual deletion from the modal
  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    
    const success = await deleteComment(commentToDelete);
    
    if (success) {
      showToastMessage('Comment deleted!', 'success');
    }
    
    // Reset state
    setShowDeleteModal(false);
    setCommentToDelete(null);
  };
  
  // Function to close the post options menu
  const handleClosePostOptions = () => {
    setShowPostOptions(false);
  };

  return {
    // Auth state
    user,
    authLoading,
    
    // Discussion data
    selectedDiscussion,
    isLoadingSelectedDiscussion,
    selectedDiscussionError,
    
    // Comments data
    comments,
    isLoadingComments,
    commentsError,
    
    // UI state
    // Toast state is no longer needed as we use the notification system
    showPostOptions,
    setShowPostOptions,
    showDeleteModal,
    setShowDeleteModal,
    isEditingPost,
    setIsEditingPost,
    
    // Form state
    newCommentContent,
    isSubmitting,
    submitError,
    editingCommentId,
    editCommentContent,
    editPostContent,
    setEditPostContent,
    editPostTitle,
    setEditPostTitle,
    
    // Character info
    characterInfo,
    editPostCharacterInfo,
    editCommentCharacterInfo,
    
    // Methods
    setNewCommentContent,
    setEditCommentContent,
    
    // Event handlers
    handleLike,
    handleSubmitComment,
    handleEditPost,
    handleDeletePost,
    handleSavePostEdit,
    handleCancelPostEdit,
    handleEditComment,
    handleSaveCommentEdit,
    handleCancelCommentEdit,
    handleDeleteComment,
    confirmDeleteComment,
    handleClosePostOptions,
  };
}

export default usePostDetailState;
