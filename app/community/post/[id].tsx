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
import useCommunityFeed from '../../hooks/useCommunityFeed';
import Markdown from 'react-native-markdown-display';
import PostDetailStyles from '../styles/PostDetailStyles';
import { sanitizeMarkdownInput, getCharacterInfo } from '../utils/sanitizeMarkdownInput';

// Styles for this component
const styles = PostDetailStyles;

export default function PostDetail() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const discussionId = typeof id === 'string' ? id : '';
  
  const {
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
    
    // Methods - Comments
    createComment,
    
    // Methods - Reactions
    toggleDiscussionReaction,
  } = useCommunityFeed();
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Success!');
  
  // Calculate character info for comment
  const characterInfo = getCharacterInfo(newCommentContent, true);

  // Load discussion and comments when component mounts
  useEffect(() => {
    if (!authLoading && user && discussionId) {
      loadDiscussion(discussionId);
      loadComments();
    }
  }, [authLoading, user, discussionId, loadDiscussion, loadComments]);

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

  const showToastMessage = (message: string = 'Success!') => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  if (authLoading || isLoadingSelectedDiscussion) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  if (selectedDiscussionError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {selectedDiscussionError}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (!selectedDiscussion) {
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
              <Text style={styles.postAuthor}>
                {selectedDiscussion.user?.full_name || selectedDiscussion.user_id.substring(0, 8)}
              </Text>
              <Text style={styles.postTimestamp}>
                {new Date(selectedDiscussion.created_at).toLocaleDateString()}
              </Text>
            </View>
            {selectedDiscussion.title && (
              <Text style={styles.postTitle}>{selectedDiscussion.title}</Text>
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
              {sanitizeMarkdownInput(selectedDiscussion.content, 'post')}
            </Markdown>
            <View style={styles.postFooter}>
              <TouchableOpacity 
                style={[styles.likeButton, selectedDiscussion.user_has_reacted && styles.likeButtonActive]}
                onPress={handleLike}
              >
                <Ionicons 
                  name={selectedDiscussion.user_has_reacted ? "heart" : "heart-outline"} 
                  size={20} 
                  color={selectedDiscussion.user_has_reacted ? "#2E7D32" : "#757575"} 
                />
                <Text style={[styles.likeText, selectedDiscussion.user_has_reacted && styles.likeTextActive]}>
                  {selectedDiscussion.reaction_count || 0} likes
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.commentsContainer}>
            <Text style={styles.commentsTitle}>
              Comments ({comments.length})
            </Text>
            
            {isLoadingComments ? (
              <View style={styles.loadingCommentsContainer}>
                <ActivityIndicator size="small" color="#2E7D32" />
                <Text style={styles.loadingCommentsText}>Loading comments...</Text>
              </View>
            ) : commentsError ? (
              <View style={styles.errorCommentsContainer}>
                <Text style={styles.errorCommentsText}>Error loading comments: {commentsError}</Text>
              </View>
            ) : comments.length > 0 ? (
              comments.map(comment => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>
                      {comment.user?.full_name || comment.user_id.substring(0, 8)}
                    </Text>
                    <Text style={styles.commentTimestamp}>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </Text>
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

          <View style={styles.addCommentContainer}>
            <TextInput
              style={[styles.commentInput, characterInfo.isAtLimit ? styles.commentInputAtLimit : undefined]}
              placeholder="Add a comment..."
              placeholderTextColor="#757575"
              value={newCommentContent}
              onChangeText={setNewCommentContent}
              multiline
              maxLength={300}
            />
            <View style={styles.commentInputFooter}>
              <Text style={[styles.characterCount, characterInfo.isNearLimit ? styles.characterCountNearLimit : undefined, characterInfo.isAtLimit ? styles.characterCountAtLimit : undefined]}>
                {characterInfo.remaining} characters left
              </Text>
              <TouchableOpacity 
                style={[styles.submitButton, (!newCommentContent.trim() || characterInfo.isAtLimit || isSubmitting) ? styles.submitButtonDisabled : undefined]}
                onPress={handleSubmitComment}
                disabled={!newCommentContent.trim() || characterInfo.isAtLimit || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Post</Text>
                )}
              </TouchableOpacity>
              {submitError && (
                <Text style={styles.errorText}>{submitError}</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

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


