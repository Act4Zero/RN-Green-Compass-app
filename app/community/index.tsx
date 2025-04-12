import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import useCommunityFeed from '../hooks/useCommunityFeed';
import FeedStyles from './styles/FeedStyles';

// Import our extracted components
import PostItem from './components/PostItem';
import { Toast } from './components/Toast';

// Styles for this component
const styles = FeedStyles;

export default function CommunityFeed() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  
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

  // Check for success message from post operations
  useEffect(() => {
    if (params.success === 'true') {
      // Use custom message if provided, otherwise use default
      const message = params.message as string || 'Post created successfully!';
      showToastMessage(message);
    }
  }, [params]);

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

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }
  
  if (discussionsError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading posts: {discussionsError}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refreshDiscussions()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      {/* Overlay to detect clicks outside the menu */}
      {Object.values(postOptionsMap).some(Boolean) && (
        <TouchableOpacity 
          style={styles.menuOverlay} 
          activeOpacity={0} 
          onPress={handleCloseAllMenus}
        />
      )}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, isTabletOrLarger && { alignSelf: 'center', width: '60%', maxWidth: 700 }]}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#2E7D32" />
            </TouchableOpacity>
            <Text style={styles.title}>Community</Text>
          </View>
          <Text style={styles.subtitle}>Share and learn with fellow eco-enthusiasts</Text>

          {isLoadingDiscussions ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2E7D32" />
            </View>
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
            <View style={styles.noPostsContainer}>
              <Text style={styles.noPostsText}>No posts yet. Be the first to share!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.newPostButton}
        onPress={handleNewPost}
      >
        <Text style={styles.newPostButtonText}>+</Text>
      </TouchableOpacity>

      <Toast message={toastMessage} visible={showToast} />
    </KeyboardAvoidingView>
  );
}
