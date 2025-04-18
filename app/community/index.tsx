import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import FeedStyles from '@/styles/FeedStyles';
import { useRouter } from 'expo-router';

// Import custom hooks
import useCommunityFeedState from '@/hooks/community/useCommunityFeedState';

// Import components
import PostItem from '@/components/community/PostItem';
import { Toast } from '@/components/community/Toast';
import LoadingState from '@/components/community/LoadingState';
import ErrorState from '@/components/community/ErrorState';
import EmptyState from '@/components/community/EmptyState';
import FeedHeader from '@/components/community/FeedHeader';
import { Ionicons } from '@expo/vector-icons';
import NewPostButton from '@/components/community/NewPostButton';
import PostOptionsMenu from '@/components/community/postdetails/PostOptionsMenu';

// Styles for this component
const styles = FeedStyles;

export default function CommunityFeed() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  
  // Use router for navigation
  const router = useRouter();
  
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
          
          {/* Challenges Button */}
          <TouchableOpacity 
            style={{
              backgroundColor: '#2E7D32',
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }} 
            onPress={() => router.push('./challenges')}
          >
            <Ionicons name="people" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
              Sustainability Challenges
            </Text>
          </TouchableOpacity>

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
