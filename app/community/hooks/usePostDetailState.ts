import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import useCommunityFeed from '../../hooks/useCommunityFeed';
import { confirmAndDeletePost } from '../../utils/deletePost';
import { sanitizeMarkdownInput, getCharacterInfo } from '../utils/sanitizeMarkdownInput';

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
    } else if (!authLoading && user) {
      console.log('Authenticated user in post detail:', user.id);
    }
  }, [user, authLoading, router]);

  // Toast message handler
  const showToastMessage = (message: string = 'Success!') => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Post interaction handlers
  const handleLike = async () => {
    if (!selectedDiscussion) return;
    
    const success = await toggleDiscussionReaction(selectedDiscussion.id);
    if (success) {
      showToastMessage('Post liked!');
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
      showToastMessage('Comment added!');
    }
  };
  
  const handleEditPost = () => {
    setShowPostOptions(false);
    
    if (!selectedDiscussion) return;
    
    // Navigate to new-post screen with edit parameters
    router.push({
      pathname: '/community/new-post',
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
    console.log('[POST DETAIL] Delete post button clicked');
    
    if (!selectedDiscussion) {
      console.error('[POST DETAIL] Cannot delete post: No selected discussion');
      return;
    }
    
    if (!user) {
      console.error('[POST DETAIL] No user found for delete operation');
      showToastMessage('Error: You must be logged in to delete a post');
      return;
    }
    
    // Use the direct deletion utility
    confirmAndDeletePost(
      selectedDiscussion.id,
      user.id,
      // On success callback
      () => {
        console.log(`[POST DETAIL] Post ${selectedDiscussion.id} deleted successfully`);
        showToastMessage('Post deleted successfully!');
        
        // Navigate back to community feed
        console.log('[POST DETAIL] Navigating back to community feed');
        router.push('/community');
      },
      // On error callback
      (errorMsg) => {
        console.error(`[POST DETAIL] Error deleting post: ${errorMsg}`);
        showToastMessage(`Error: ${errorMsg}`);
      }
    );
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
      showToastMessage('Post updated!');
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
      showToastMessage('Comment updated!');
    }
  };
  
  const handleCancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditCommentContent('');
  };
  
  const handleDeleteComment = (commentId: string) => {
    console.log('[POST DETAIL] Delete comment button clicked for comment:', commentId);
    
    // Use the modal approach for delete confirmation
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
    console.log('[POST DETAIL] Delete modal should be visible now');
  };
  
  // Function to handle actual deletion from the modal
  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    
    console.log('[POST DETAIL] Confirming delete from modal for comment:', commentToDelete);
    const success = await deleteComment(commentToDelete);
    
    if (success) {
      showToastMessage('Comment deleted!');
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
    showToast,
    toastMessage,
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
