import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

// Import custom hooks
import usePostDetailState from '@/hooks/community/usePostDetailState';

// Import UI components
import PostDetailHeader from '@/components/community/postdetails/PostDetailHeader';
import PostContent from '@/components/community/postdetails/PostContent';
import PostEditForm from '@/components/community/postdetails/PostEditForm';
import CommentsSection from '@/components/community/postdetails/CommentsSection';
import CommentForm from '@/components/community/postdetails/CommentForm';
import DeleteConfirmationModal from '@/components/community/postdetails/DeleteConfirmationModal';
import PostOptionsMenu from '@/components/community/postdetails/PostOptionsMenu';
import NotFoundState from '@/components/community/postdetails/NotFoundState';
import LoadingState from '@/components/community/LoadingState';
import ErrorState from '@/components/community/ErrorState';
import { Toast } from '@/components/community/Toast';

// Styles for this component
import PostDetailStyles from '@/styles/PostDetailStyles';
const styles = PostDetailStyles;

export default function PostDetail() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { id } = useLocalSearchParams();
  const discussionId = typeof id === 'string' ? id : '';

  // Use our custom hook for all state management and event handlers
  const {
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
    
    // Event handlers
    setNewCommentContent,
    setEditCommentContent,
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
  } = usePostDetailState(discussionId);

  // Render loading state
  if (authLoading || isLoadingSelectedDiscussion) {
    return <LoadingState />;
  }

  // Render error state
  if (selectedDiscussionError) {
    return <ErrorState error={selectedDiscussionError} onRetry={() => window.location.reload()} />;
  }
  
  // Render not found state
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


