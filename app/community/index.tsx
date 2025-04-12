import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      {/* Menu overlay and options menu - rendered at the top level */}
      {Object.values(postOptionsMap).some(Boolean) && (
        <View style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 9999, 
          elevation: 9999 
        }}>
          {/* Full screen overlay that closes the menu when tapped */}
          <TouchableOpacity 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 9999
            }} 
            activeOpacity={1} 
            onPress={handleCloseAllMenus}
          />
          
          {/* Render the options menu for the active post */}
          {Object.entries(postOptionsMap).map(([postId, isOpen]) => {
            if (isOpen) {
              return (
                <View 
                  key={postId}
                  style={{
                    position: 'absolute',
                    top: '25%',
                    right: isTabletOrLarger ? '35%' : 20,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    padding: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 10000,
                    zIndex: 10000,
                    width: 150
                  }}
                >
                  <TouchableOpacity 
                    style={styles.optionItem}
                    onPress={() => handleEditPost(postId)}
                  >
                    <Ionicons name="pencil-outline" size={16} color="#2E7D32" />
                    <Text style={styles.optionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.optionItem}
                    onPress={() => handleDeletePost(postId)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#D32F2F" />
                    <Text style={[styles.optionText, { color: '#D32F2F' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              );
            }
            return null;
          })}
        </View>
      )}
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
