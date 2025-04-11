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
  Linking,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import useCommunityFeed from '../hooks/useCommunityFeed';
import FeedStyles from './styles/FeedStyles';
import Markdown, { MarkdownProps, RenderRules } from 'react-native-markdown-display';
import { sanitizeMarkdownInput } from './utils/sanitizeMarkdownInput';



// Custom renderer for Markdown images to make them clickable
const renderImage = (node: any, children: React.ReactNode, parent: any, styles: any) => {
  const { src } = node.attributes;
  
  return (
    <View style={{ width: '100%', alignItems: 'center', marginVertical: 8 }}>
      <TouchableOpacity 
        key={node.key} 
        onPress={() => Linking.openURL(src)}
        activeOpacity={0.8}
      >
        <Image 
          source={{ uri: src }} 
          style={[styles.image]} 
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

// Custom rules for Markdown rendering
const rules: RenderRules = {
  image: renderImage,
};

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
                <TouchableOpacity 
                  key={discussion.id} 
                  style={styles.postItem}
                  onPress={() => router.push(`/community/post/${discussion.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.postHeader}>
                    <View style={styles.authorContainer}>
                      {discussion.user?.avatar_url ? (
                        <Image 
                          source={{ uri: discussion.user.avatar_url }} 
                          style={styles.authorAvatar} 
                        />
                      ) : (
                        <View style={styles.defaultAvatar}>
                          <Text style={styles.defaultAvatarText}>
                            {(discussion.user?.full_name || '?').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.postAuthor}>
                        {discussion.user?.full_name || discussion.user_id.substring(0, 8)}
                      </Text>
                    </View>
                    <View style={styles.postHeaderRight}>
                      <Text style={styles.postTimestamp}>
                        {new Date(discussion.created_at).toLocaleDateString()}
                      </Text>
                      {/* Show options button if the post belongs to the current user */}
                      {discussion.user_id === user?.id && (
                        <TouchableOpacity
                          style={styles.optionsButton}
                          onPress={(e) => {
                            e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
                            togglePostOptions(discussion.id);
                          }}
                        >
                          <Ionicons name="ellipsis-vertical" size={20} color="#757575" />
                        </TouchableOpacity>
                      )}
                      {/* Post options menu */}
                      {postOptionsMap[discussion.id] && (
                        <View style={styles.optionsMenu}>
                          <TouchableOpacity 
                            style={styles.optionItem}
                            onPress={(e) => {
                              e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
                              handleEditPost(discussion.id);
                            }}
                          >
                            <Ionicons name="pencil-outline" size={16} color="#2E7D32" />
                            <Text style={styles.optionText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.optionItem}
                            onPress={(e) => {
                              e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
                              handleDeletePost(discussion.id);
                            }}
                          >
                            <Ionicons name="trash-outline" size={16} color="#D32F2F" />
                            <Text style={[styles.optionText, { color: '#D32F2F' }]}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                  {discussion.title && (
                    <Text style={styles.postTitle}>{discussion.title}</Text>
                  )}
                  <Markdown 
                    style={{
                      body: styles.postContent,
                      bullet: { color: '#2E7D32' },
                      strong: { fontWeight: 'bold' },
                      heading1: { fontSize: 22, fontWeight: 'bold', marginVertical: 10 },
                      heading2: { fontSize: 20, fontWeight: 'bold', marginVertical: 8 },
                      heading3: { fontSize: 18, fontWeight: 'bold', marginVertical: 6 },
                      code_block: { backgroundColor: '#f0f0f0', padding: 10, borderRadius: 4 },
                      code_inline: { backgroundColor: '#f0f0f0', padding: 2, borderRadius: 2 },
                      link: { color: '#1976D2', textDecorationLine: 'underline' },
                      image: { 
                        width: 300, 
                        height: 300, 
                        marginVertical: 8, 
                        borderRadius: 8
                      }
                    }}
                    rules={rules}
                    onLinkPress={(url: string) => {
                      Linking.openURL(url);
                      return false;
                    }}
                  >
                    {sanitizeMarkdownInput(discussion.content, 'post')}
                  </Markdown>
                  <View style={styles.divider} />
                  <View style={styles.postFooter}>
                    <TouchableOpacity 
                      style={[styles.reactionButton, discussion.user_has_reacted && styles.reactionButtonActive]}
                      onPress={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
                        handleLike(discussion.id);
                      }}
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
                      onPress={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
                        handleComment(discussion.id);
                      }}
                    >
                      <Ionicons name="chatbubble-outline" size={20} color="#757575" />
                      <Text style={styles.commentText}>{discussion.comment_count || 0}</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
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
