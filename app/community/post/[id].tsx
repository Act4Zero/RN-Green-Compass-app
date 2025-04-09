import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import Markdown from 'react-native-markdown-display';
import PostDetailStyles from '../styles/PostDetailStyles';

// Mock data for initial development
const MOCK_POSTS = [
  {
    id: '1',
    author: 'EcoFriend123',
    timestamp: '2 hours ago',
    content: 'Any tips for composting indoors? I live in an apartment and want to reduce my food waste.',
    likes: 5,
    comments: [
      { id: '1', author: 'GreenThumb', content: 'I use a small countertop composter with a charcoal filter to control odors. Works great!', timestamp: '1 hour ago' },
      { id: '2', author: 'SustainableLiving', content: 'Bokashi composting is perfect for apartments. It\'s an anaerobic process so no smell!', timestamp: '30 minutes ago' },
    ],
  },
  {
    id: '2',
    author: 'GreenThumb',
    timestamp: '1 day ago',
    content: 'Just switched to a bamboo toothbrush and it\'s amazing! **Highly recommend** for reducing plastic waste. Has anyone tried other bamboo products?',
    likes: 12,
    comments: [
      { id: '1', author: 'EcoWarrior', content: 'I use bamboo utensils for travel and they\'re great!', timestamp: '20 hours ago' },
    ],
  },
  {
    id: '3',
    author: 'SustainableLiving',
    timestamp: '3 days ago',
    content: 'I\'ve been tracking my carbon footprint using this app for a month now. It\'s incredible to see how small changes add up! \n\n- Reduced meat consumption by 50%\n- Started biking to work 3x a week\n- Switched to reusable shopping bags',
    likes: 24,
    comments: [],
  },
];

export default function PostDetail() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Redirect to signin if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('No authenticated user found in post detail, redirecting to signin');
      router.replace('/auth/signin');
    } else if (!authLoading && user) {
      console.log('Authenticated user in post detail:', user.id);
      // Fetch post data
      const postData = MOCK_POSTS.find(p => p.id === id);
      setTimeout(() => {
        setPost(postData);
        setIsLoading(false);
      }, 500);
    }
  }, [user, authLoading, router, id]);

  const handleLike = () => {
    setPost((prevPost: any) => ({
      ...prevPost,
      likes: prevPost.likes + 1
    }));
    showToastMessage();
  };

  const handleSubmitComment = () => {
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newComment = {
        id: Date.now().toString(),
        author: user?.email?.split('@')[0] || 'Anonymous',
        content: comment,
        timestamp: 'Just now'
      };
      
      setPost((prevPost: any) => ({
        ...prevPost,
        comments: [...prevPost.comments, newComment]
      }));
      
      setComment('');
      setIsSubmitting(false);
      showToastMessage();
    }, 1000);
  };

  const showToastMessage = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  if (authLoading || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Post not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
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
            <Text style={styles.title}>Post Detail</Text>
          </View>

          <View style={styles.postContainer}>
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
            <View style={styles.postFooter}>
              <TouchableOpacity 
                style={styles.likeButton}
                onPress={handleLike}
              >
                <Ionicons name="heart-outline" size={20} color="#757575" />
                <Text style={styles.likeText}>{post.likes} likes</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>
              Comments ({post.comments.length})
            </Text>
            
            {post.comments.length > 0 ? (
              post.comments.map((comment: any) => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{comment.author}</Text>
                    <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
                  </View>
                  <Text style={styles.commentContent}>{comment.content}</Text>
                </View>
              ))
            ) : (
              <View style={styles.noCommentsContainer}>
                <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
              </View>
            )}
          </View>

          <View style={styles.newCommentContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!comment.trim() || isSubmitting) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmitComment}
              disabled={!comment.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {showToast && (
        <View style={styles.toastWrapper}>
          <View style={styles.toastContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            <Text style={styles.toastText}>Success!</Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

// Styles for this component
const styles = PostDetailStyles;
