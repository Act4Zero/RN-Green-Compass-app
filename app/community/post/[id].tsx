import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import useCommunityFeed from '../../hooks/useCommunityFeed';
import { confirmAndDeletePost } from '../../utils/deletePost';
import { sanitizeMarkdownInput, getCharacterInfo } from '../utils/sanitizeMarkdownInput';

// Import UI components
import PostDetailHeader from '../components/PostDetailHeader';
import PostContent from '../components/PostContent';
import PostEditForm from '../components/PostEditForm';
import CommentsSection from '../components/CommentsSection';
import CommentForm from '../components/CommentForm';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import PostOptionsMenu from '../components/PostOptionsMenu';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import NotFoundState from '../components/NotFoundState';
import { Toast } from '../components/Toast';

// Styles for this component
import PostDetailStyles from '../styles/PostDetailStyles';
const styles = PostDetailStyles;

export default function PostDetail() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const discussionId = typeof id === 'string' ? id : '';
  
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
  
  // Calculate character info for comment
  const characterInfo = getCharacterInfo(newCommentContent, true);
  const editPostCharacterInfo = getCharacterInfo(editPostContent, false);
  const editCommentCharacterInfo = getCharacterInfo(editCommentContent, true);

  // Load discussion and comments when component mounts
  useEffect(() => {
    if (!authLoading && user && discussionId) {
      loadDiscussion(discussionId);
      loadComments();
    }
  }, [authLoading, user, discussionId, loadDiscussion, loadComments]);
  
  // Initialize edit form when starting to edit post
  useEffect(() => {
    if (isEditingPost && selectedDiscussion) {
      setEditPostContent(selectedDiscussion.content);
      setEditPostTitle(selectedDiscussion.title || '');
    }
  }, [isEditingPost, selectedDiscussion]);
  
  // Close the options menu when clicking outside
  const handleClosePostOptions = () => {
    setShowPostOptions(false);
  };

  // Redirect to signin if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('No authenticated user found in post detail, redirecting to signin');
      router.replace('/auth/signin');
    } else if (!authLoading && user) {
      console.log('Authenticated user in post detail:', user.id);
    }
  }, [user, authLoading, router]);

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
    
    // Use the new direct deletion utility
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

  const showToastMessage = (message: string = 'Success!') => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  if (authLoading || isLoadingSelectedDiscussion) {
    return <LoadingState />;
  }

  if (selectedDiscussionError) {
    return <ErrorState error={selectedDiscussionError} onRetry={() => router.back()} />;
  }
  
  if (!selectedDiscussion) {
    return <NotFoundState />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteComment}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
      />
      
      {/* Post Options Menu */}
      <PostOptionsMenu
        postId={discussionId}
        isOpen={showPostOptions}
        onClose={handleClosePostOptions}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, isTabletOrLarger && { alignSelf: 'center', width: '60%', maxWidth: 700 }]}>
          {/* Header */}
          <PostDetailHeader />

          {/* Post Content */}
          {!isEditingPost ? (
            <PostContent
              userId={user?.id || ''}
              discussionId={discussionId}
              title={selectedDiscussion.title || null}
              content={selectedDiscussion.content}
              authorName={selectedDiscussion.user?.full_name || selectedDiscussion.user_id.substring(0, 8)}
              authorAvatarUrl={selectedDiscussion.user?.avatar_url || null}
              timestamp={new Date(selectedDiscussion.created_at).toLocaleDateString()}
              reactionCount={selectedDiscussion.reaction_count || 0}
              userHasReacted={!!selectedDiscussion.user_has_reacted}
              isAuthor={selectedDiscussion.user_id === user?.id}
              onLike={handleLike}
              onToggleOptions={() => setShowPostOptions(!showPostOptions)}
            />
          ) : (
            <PostEditForm
              title={editPostTitle}
              content={editPostContent}
              onTitleChange={setEditPostTitle}
              onContentChange={setEditPostContent}
              onSave={handleSavePostEdit}
              onCancel={handleCancelPostEdit}
              isSubmitting={isSubmitting}
              characterInfo={editPostCharacterInfo}
            />
          )}

          {/* Comments Section */}
          <CommentsSection
            comments={comments}
            isLoading={isLoadingComments}
            error={commentsError || undefined}
            currentUserId={user?.id || ''}
            editingCommentId={editingCommentId}
            editCommentContent={editCommentContent}
            editCommentCharacterInfo={editCommentCharacterInfo}
            isSubmitting={isSubmitting}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            onEditContentChange={setEditCommentContent}
            onSaveEdit={handleSaveCommentEdit}
            onCancelEdit={handleCancelCommentEdit}
          />

          {/* Add Comment Form */}
          <CommentForm
            content={newCommentContent}
            onContentChange={setNewCommentContent}
            onSubmit={handleSubmitComment}
            isSubmitting={isSubmitting}
            submitError={submitError}
            characterInfo={characterInfo}
          />
        </View>
      </ScrollView>

      {/* Toast Notification */}
      <Toast message={toastMessage} visible={showToast} />
    </KeyboardAvoidingView>
  );
}


