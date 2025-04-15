import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import FeedStyles from './styles/FeedStyles';

// Import custom hooks
import useCommunityFeedState from './hooks/useCommunityFeedState';

// Import components
import PostItem from './components/PostItem';
import { Toast } from './components/Toast';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import EmptyState from './components/EmptyState';
import FeedHeader from './components/FeedHeader';
import NewPostButton from './components/NewPostButton';
import PostOptionsMenu from './components/postdetails/PostOptionsMenu';

// Styles for this component
const styles = FeedStyles;

export default function CommunityFeed() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  
  // Use our custom hook for all state management and event handlers
  const {
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
  } = useCommunityFeedState();

  // Render loading state
  if (authLoading) {
    return <LoadingState />;
  }
  
  // Render error state
  if (discussionsError) {
    return <ErrorState error={discussionsError} onRetry={refreshDiscussions} />;
  }

  // Main UI render
  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      {/* Render post options menus for any open post */}
      {Object.entries(postOptionsMap).map(([postId, isOpen]) => (
        <PostOptionsMenu
          key={postId}
          postId={postId}
          isOpen={isOpen}
          onClose={handleCloseAllMenus}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
        />
      ))}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, isTabletOrLarger && { alignSelf: 'center', width: '60%', maxWidth: 700 }]}>
          {/* Header */}
          <FeedHeader />

          {/* Content based on loading state */}
          {isLoadingDiscussions ? (
            <LoadingState />
          ) : discussions.length > 0 ? (
            <View style={styles.postsContainer}>
              {discussions.map(discussion => (
                <PostItem
                  key={discussion.id}
                  discussion={discussion}
                  userId={user?.id || ''}
                  postOptionsMap={postOptionsMap}
                  togglePostOptions={togglePostOptions}
                  handleEditPost={handleEditPost}
                  handleDeletePost={handleDeletePost}
                  handleLike={handleLike}
                  handleComment={handleComment}
                />
              ))}
            </View>
          ) : (
            <EmptyState />
          )}
        </View>
      </ScrollView>

      {/* New Post Button */}
      <NewPostButton onPress={handleNewPost} />

      {/* Toast Notifications */}
      <Toast message={toastMessage} visible={showToast} />
    </KeyboardAvoidingView>
  );
}
