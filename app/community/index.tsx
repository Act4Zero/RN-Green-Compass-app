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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import useCommunityFeed from '../hooks/useCommunityFeed';
import FeedStyles from './styles/FeedStyles';
import Markdown from 'react-native-markdown-display';
import { sanitizeMarkdownInput } from './utils/sanitizeMarkdownInput';



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
    
    // Methods - Reactions
    toggleDiscussionReaction,
  } = useCommunityFeed();
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Check for success message from new post creation
  useEffect(() => {
    if (params.success === 'true') {
      showToastMessage('Post created successfully!');
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
    // Navigate to post detail screen (to be implemented)
    router.push(`/community/post/${postId}`);
  };

  const handleNewPost = () => {
    // Navigate to new post screen (to be implemented)
    router.push('/community/new-post');
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
                <View key={discussion.id} style={styles.postItem}>
                  <View style={styles.postHeader}>
                    <Text style={styles.postAuthor}>
                      {discussion.user?.full_name || discussion.user_id.substring(0, 8)}
                    </Text>
                    <Text style={styles.postTimestamp}>
                      {new Date(discussion.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  {discussion.title && (
                    <Text style={styles.postTitle}>{discussion.title}</Text>
                  )}
                  <Markdown style={{
                    body: styles.postContent,
                    bullet: { color: '#2E7D32' },
                    strong: { fontWeight: 'bold' },
                    heading1: { fontSize: 22, fontWeight: 'bold', marginVertical: 10 },
                    heading2: { fontSize: 20, fontWeight: 'bold', marginVertical: 8 },
                    heading3: { fontSize: 18, fontWeight: 'bold', marginVertical: 6 },
                    code_block: { backgroundColor: '#f0f0f0', padding: 10, borderRadius: 4 },
                    code_inline: { backgroundColor: '#f0f0f0', padding: 2, borderRadius: 2 },
                    link: { color: '#1976D2', textDecorationLine: 'underline' },
                    image: { width: '100%', height: 200, resizeMode: 'contain', marginVertical: 8, borderRadius: 8 }
                  }}>
                    {sanitizeMarkdownInput(discussion.content, 'post')}
                  </Markdown>
                  <View style={styles.divider} />
                  <View style={styles.postFooter}>
                    <TouchableOpacity 
                      style={[styles.reactionButton, discussion.user_has_reacted && styles.reactionButtonActive]}
                      onPress={() => handleLike(discussion.id)}
                    >
                      <Ionicons 
                        name={discussion.user_has_reacted ? "heart" : "heart-outline"} 
                        size={20} 
                        color={discussion.user_has_reacted ? "#2E7D32" : "#757575"} 
                      />
                      <Text style={[styles.reactionText, discussion.user_has_reacted && styles.reactionTextActive]}>
                        {discussion.reaction_count || 0}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.commentButton}
                      onPress={() => handleComment(discussion.id)}
                    >
                      <Ionicons name="chatbubble-outline" size={20} color="#757575" />
                      <Text style={styles.commentText}>{discussion.comment_count || 0}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
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

      {showToast && (
        <View style={styles.toastWrapper}>
          <View style={styles.toastContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
