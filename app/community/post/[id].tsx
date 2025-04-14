import React, { useEffect, useState, useRef } from 'react';
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
  Linking,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import useCommunityFeed from '../../hooks/useCommunityFeed';
import { discussionService } from '../../services/community';
import { confirmAndDeletePost } from '../../utils/deletePost';
import Markdown, { RenderRules } from 'react-native-markdown-display';
import PostOptionsMenu from '../components/PostOptionsMenu';
import PostDetailStyles from '../styles/PostDetailStyles';
import { sanitizeMarkdownInput, getCharacterInfo } from '../utils/sanitizeMarkdownInput';

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
const styles = PostDetailStyles;

export default function PostDetail() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const discussionId = typeof id === 'string' ? id : '';
  
  const {
    // User state
    currentUser,
    
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
    
    // Methods - Discussions
    updateDiscussion,
    deleteDiscussion,
    
    // Methods - Comments
    createComment,
    updateComment,
    deleteComment,
    
    // Methods - Reactions
    toggleDiscussionReaction,
  } = useCommunityFeed();
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Success!');
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostContent, setEditPostContent] = useState('');
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [showPostOptions, setShowPostOptions] = useState(false);
  
  // Calculate character info for comment
  const characterInfo = getCharacterInfo(newCommentContent, true);
  const editPostCharacterInfo = getCharacterInfo(editPostContent, false);
  const editCommentCharacterInfo = getCharacterInfo(editCommentContent, true);

  // Load discussion and comments when component mounts
  useEffect(() => {
    if (!authLoading && user && discussionId) {
      loadDiscussion(discussionId);
      loadComments();
    }
  }, [authLoading, user, discussionId, loadDiscussion, loadComments]);
  
  // Initialize edit form when starting to edit post
  useEffect(() => {
    if (isEditingPost && selectedDiscussion) {
      setEditPostContent(selectedDiscussion.content);
      setEditPostTitle(selectedDiscussion.title || '');
    }
  }, [isEditingPost, selectedDiscussion]);
  
  // Close the options menu when clicking outside
  const handleClosePostOptions = () => {
    setShowPostOptions(false);
  };

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
  
  const handleEditPost = () => {
    setShowPostOptions(false);
    
    if (!selectedDiscussion) return;
    
    // Navigate to new-post screen with edit parameters
    router.push({
      pathname: '/community/new-post',
      params: { 
        edit: 'true',
        postId: selectedDiscussion.id,
        title: selectedDiscussion.title || '',
        content: selectedDiscussion.content
      }
    });
  };
  
  const handleDeletePost = () => {
    setShowPostOptions(false);
    console.log('[POST DETAIL] Delete post button clicked');
    
    if (!selectedDiscussion) {
      console.error('[POST DETAIL] Cannot delete post: No selected discussion');
      return;
    }
    
    if (!user) {
      console.error('[POST DETAIL] No user found for delete operation');
      showToastMessage('Error: You must be logged in to delete a post');
      return;
    }
    
    // Use the new direct deletion utility
    confirmAndDeletePost(
      selectedDiscussion.id,
      user.id,
      // On success callback
      () => {
        console.log(`[POST DETAIL] Post ${selectedDiscussion.id} deleted successfully`);
        showToastMessage('Post deleted successfully!');
        
        // Navigate back to community feed
        console.log('[POST DETAIL] Navigating back to community feed');
        router.push('/community');
      },
      // On error callback
      (errorMsg) => {
        console.error(`[POST DETAIL] Error deleting post: ${errorMsg}`);
        showToastMessage(`Error: ${errorMsg}`);
      }
    );
  };
  
  const handleSavePostEdit = async () => {
    if (!editPostContent.trim() || editPostCharacterInfo.isAtLimit || !selectedDiscussion) return;
    
    const updates = {
      content: sanitizeMarkdownInput(editPostContent, 'post'),
      title: editPostTitle.trim() || undefined
    };
    
    const result = await updateDiscussion(selectedDiscussion.id, updates);
    
    if (result) {
      setIsEditingPost(false);
      showToastMessage('Post updated!');
      // Reload the discussion to show the updated content
      loadDiscussion(selectedDiscussion.id);
    }
  };
  
  const handleCancelPostEdit = () => {
    setIsEditingPost(false);
  };
  
  const handleEditComment = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditCommentContent(content);
  };
  
  const handleSaveCommentEdit = async () => {
    if (!editingCommentId || !editCommentContent.trim() || editCommentCharacterInfo.isAtLimit) return;
    
    // Ensure the comment respects the 300 character limit
    const limitedComment = editCommentContent.length > 300 ? editCommentContent.substring(0, 300) : editCommentContent;
    
    const result = await updateComment(editingCommentId, sanitizeMarkdownInput(limitedComment, 'comment'));
    
    if (result) {
      setEditingCommentId(null);
      setEditCommentContent('');
      showToastMessage('Comment updated!');
    }
  };
  
  const handleCancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditCommentContent('');
  };
  
  const handleDeleteComment = (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteComment(commentId);
            if (success) {
              showToastMessage('Comment deleted!');
            }
          }
        }
      ]
    );
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
      {/* Overlay to detect clicks outside the menu */}
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
              <View style={styles.authorContainer}>
                {selectedDiscussion.user?.avatar_url ? (
                  <Image 
                    source={{ uri: selectedDiscussion.user.avatar_url }} 
                    style={styles.authorAvatar} 
                  />
                ) : (
                  <View style={styles.defaultAvatar}>
                    <Text style={styles.defaultAvatarText}>
                      {(selectedDiscussion.user?.full_name || '?').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={styles.postAuthor}>
                  {selectedDiscussion.user?.full_name || selectedDiscussion.user_id.substring(0, 8)}
                </Text>
              </View>
              <View style={styles.postHeaderRight}>
                <Text style={styles.postTimestamp}>
                  {new Date(selectedDiscussion.created_at).toLocaleDateString()}
                </Text>
                {/* Show options button if the post belongs to the current user */}
                {selectedDiscussion.user_id === user?.id && (
                  <TouchableOpacity
                    style={styles.optionsButton}
                    onPress={() => setShowPostOptions(!showPostOptions)}
                  >
                    <Ionicons name="ellipsis-vertical" size={20} color="#757575" />
                  </TouchableOpacity>
                )}
                {/* No inline options menu anymore - using the PostOptionsMenu component */}
              </View>
            </View>
            {!isEditingPost ? (
              <>
                {selectedDiscussion.title && (
                  <Text style={styles.postTitle}>{selectedDiscussion.title}</Text>
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
                    image: { width: 300, height: 300, marginVertical: 8, borderRadius: 8 }
                  }}
                  rules={rules}
                  onLinkPress={(url: string) => {
                    Linking.openURL(url);
                    return false;
                  }}
                >
                  {sanitizeMarkdownInput(selectedDiscussion.content, 'post')}
                </Markdown>
              </>
            ) : (
              <View style={styles.editPostContainer}>
                <TextInput
                  style={styles.editPostTitleInput}
                  placeholder="Title (optional)"
                  placeholderTextColor="#757575"
                  value={editPostTitle}
                  onChangeText={setEditPostTitle}
                  maxLength={100}
                />
                <TextInput
                  style={[styles.editPostContentInput, editPostCharacterInfo.isAtLimit ? styles.inputAtLimit : undefined]}
                  placeholder="What's on your mind?"
                  placeholderTextColor="#757575"
                  value={editPostContent}
                  onChangeText={setEditPostContent}
                  multiline
                  maxLength={1000}
                />
                <View style={styles.editPostFooter}>
                  <Text style={[styles.characterCount, editPostCharacterInfo.isNearLimit ? styles.characterCountNearLimit : undefined, editPostCharacterInfo.isAtLimit ? styles.characterCountAtLimit : undefined]}>
                    {editPostCharacterInfo.remaining} characters left
                  </Text>
                  <View style={styles.editPostButtons}>
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={handleCancelPostEdit}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.saveButton, (!editPostContent.trim() || editPostCharacterInfo.isAtLimit || isSubmitting) ? styles.saveButtonDisabled : undefined]}
                      onPress={handleSavePostEdit}
                      disabled={!editPostContent.trim() || editPostCharacterInfo.isAtLimit || isSubmitting}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.saveButtonText}>Save</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
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
                    <View style={styles.commentAuthorContainer}>
                      {comment.user?.avatar_url ? (
                        <Image 
                          source={{ uri: comment.user.avatar_url }} 
                          style={styles.commentAuthorAvatar} 
                        />
                      ) : (
                        <View style={styles.commentDefaultAvatar}>
                          <Text style={styles.commentDefaultAvatarText}>
                            {(comment.user?.full_name || '?').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.commentAuthor}>
                        {comment.user?.full_name || comment.user_id.substring(0, 8)}
                      </Text>
                    </View>
                    <View style={styles.commentHeaderRight}>
                      <Text style={styles.commentTimestamp}>
                        {new Date(comment.created_at).toLocaleDateString()}
                      </Text>
                      {/* Show options for user's own comments */}
                      {comment.user_id === user?.id && (
                        <View style={styles.commentOptions}>
                          <TouchableOpacity 
                            style={styles.commentOptionButton}
                            onPress={() => handleEditComment(comment.id, comment.content)}
                          >
                            <Ionicons name="pencil-outline" size={16} color="#2E7D32" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.commentOptionButton}
                            onPress={() => handleDeleteComment(comment.id)}
                          >
                            <Ionicons name="trash-outline" size={16} color="#D32F2F" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                  {editingCommentId === comment.id ? (
                    <View style={styles.editCommentContainer}>
                      <TextInput
                        style={[styles.editCommentInput, editCommentCharacterInfo.isAtLimit ? styles.inputAtLimit : undefined]}
                        placeholder="Edit your comment..."
                        placeholderTextColor="#757575"
                        value={editCommentContent}
                        onChangeText={setEditCommentContent}
                        multiline
                        maxLength={300}
                      />
                      <View style={styles.editCommentFooter}>
                        <Text style={[styles.characterCount, editCommentCharacterInfo.isNearLimit ? styles.characterCountNearLimit : undefined, editCommentCharacterInfo.isAtLimit ? styles.characterCountAtLimit : undefined]}>
                          {editCommentCharacterInfo.remaining} characters left
                        </Text>
                        <View style={styles.editCommentButtons}>
                          <TouchableOpacity 
                            style={styles.cancelButton}
                            onPress={handleCancelCommentEdit}
                          >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.saveButton, (!editCommentContent.trim() || editCommentCharacterInfo.isAtLimit || isSubmitting) ? styles.saveButtonDisabled : undefined]}
                            onPress={handleSaveCommentEdit}
                            disabled={!editCommentContent.trim() || editCommentCharacterInfo.isAtLimit || isSubmitting}
                          >
                            {isSubmitting ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <Text style={styles.saveButtonText}>Save</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.commentContent}>{comment.content}</Text>
                  )}
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


