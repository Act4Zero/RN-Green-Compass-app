import React, { useEffect, useState } from 'react';
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
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import FeedStyles from './styles/FeedStyles';
import Markdown from 'react-native-markdown-display';

// Styles for this component
const styles = FeedStyles;

// Mock data for initial development
const MOCK_POSTS = [
  {
    id: '1',
    author: 'EcoFriend123',
    timestamp: '2 hours ago',
    content: 'Any tips for composting indoors? I live in an apartment and want to reduce my food waste.',
    likes: 5,
    comments: 2,
  },
  {
    id: '2',
    author: 'GreenThumb',
    timestamp: '1 day ago',
    content: 'Just switched to a bamboo toothbrush and it\'s amazing! **Highly recommend** for reducing plastic waste. Has anyone tried other bamboo products?',
    likes: 12,
    comments: 8,
  },
  {
    id: '3',
    author: 'SustainableLiving',
    timestamp: '3 days ago',
    content: 'I\'ve been tracking my carbon footprint using this app for a month now. It\'s incredible to see how small changes add up! \n\n- Reduced meat consumption by 50%\n- Started biking to work 3x a week\n- Switched to reusable shopping bags',
    likes: 24,
    comments: 15,
  },
];

export default function CommunityFeed() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Redirect to signin if user is not authenticated
  useEffect(() => {
    // Only check after auth loading is complete
    if (!authLoading && !user) {
      console.log('No authenticated user found in community feed, redirecting to signin');
      router.replace('/auth/signin');
    } else if (!authLoading && user) {
      console.log('Authenticated user in community feed:', user.id);
      // Simulate loading posts
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [user, authLoading, router]);

  const handleLike = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
    showToastMessage('Post liked!');
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

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2E7D32" />
            </View>
          ) : posts.length > 0 ? (
            <View style={styles.postsContainer}>
              {posts.map(post => (
                <View key={post.id} style={styles.postItem}>
                  <View style={styles.postHeader}>
                    <Text style={styles.postAuthor}>{post.author}</Text>
                    <Text style={styles.postTimestamp}>{post.timestamp}</Text>
                  </View>
                  <Markdown style={{
                    body: styles.postContent,
                    bullet: { color: '#2E7D32' },
                    strong: { fontWeight: 'bold' }
                  }}>
                    {post.content}
                  </Markdown>
                  <View style={styles.divider} />
                  <View style={styles.postFooter}>
                    <TouchableOpacity 
                      style={styles.reactionButton}
                      onPress={() => handleLike(post.id)}
                    >
                      <Ionicons name="heart-outline" size={20} color="#757575" />
                      <Text style={styles.reactionText}>{post.likes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.commentButton}
                      onPress={() => handleComment(post.id)}
                    >
                      <Ionicons name="chatbubble-outline" size={20} color="#757575" />
                      <Text style={styles.commentText}>{post.comments}</Text>
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
