import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import NewPostStyles from './styles/NewPostStyles';
import { sanitizeMarkdownInput } from './utils/sanitizeMarkdownInput';
import useCommunityFeed from '../hooks/useCommunityFeed';
import useCommunityFeedState from './hooks/useCommunityFeedState';

// Import components
import NewPostHeader from './components/NewPostHeader';
import PostInput from './components/PostInput';
import MarkdownHelp from './components/MarkdownHelp';
import PostPreview from './components/PostPreview';
import SubmitButton from './components/SubmitButton';
import LoadingIndicator from './components/LoadingIndicator';
import ToggleButton from './components/ToggleButton';

// Components
function LoadingState() {
  return <LoadingIndicator />;
}

// Main component
export default function NewPost() {
  // Get post ID from URL parameters if in edit mode
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const isEditMode = Boolean(postId);
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Get community feed functionality
  const {
    // Form state
    newPostContent,
    setNewPostContent,
    newPostTitle,
    setNewPostTitle,
    resetPostForm,
    isSubmitting,
    submitError,
    // Methods
    createDiscussion,
    updateDiscussion,
    // Discussion data
    selectedDiscussion,
    isLoadingSelectedDiscussion,
    loadDiscussion
  } = useCommunityFeed();

  // Get toast handler from feed state
  const { showToastMessage } = useCommunityFeedState();
  
  // UI state
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [postTitle, setPostTitle] = useState('');

  // Redirect to signin if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('No authenticated user found in new post, redirecting to signin');
      router.replace('/auth/signin');
    } else if (!authLoading && user) {
      console.log('Authenticated user in new post:', user.id);
    }
  }, [user, authLoading, router]);

  // Load existing post data if in edit mode
  useEffect(() => {
    const loadPostData = async () => {
      if (isEditMode && postId && user) {
        try {
          console.log('Loading post data for editing, postId:', postId);
          await loadDiscussion(postId);
        } catch (error) {
          console.error('Error loading post for editing:', error);
          Alert.alert('Error', 'Failed to load post data for editing.');
          router.back();
        }
      }
    };
    
    loadPostData();
    
    // Cleanup when leaving the page
    return () => {
      // No cleanup needed, the selected discussion will be replaced 
      // when another discussion is loaded
    };
  }, [isEditMode, postId, user, loadDiscussion, router]);
  
  // Update form when post data is loaded
  useEffect(() => {
    if (isEditMode && selectedDiscussion) {
      setNewPostContent(selectedDiscussion.content);
      setPostTitle(selectedDiscussion.title || '');
    }
  }, [isEditMode, selectedDiscussion, setNewPostContent]);

  const handleSubmitPost = async () => {
    if (!newPostContent?.trim()) return;
    
    try {
      // Sanitize the markdown input before submission to ensure it's safe
      const formattedContent = sanitizeMarkdownInput(newPostContent, 'post');
      let result;
      
      if (isEditMode && postId) {
        // Update existing post
        console.log('Updating existing post:', postId);
        result = await updateDiscussion(postId, {
          content: formattedContent,
          title: postTitle.trim() || undefined
        });
        
        if (result) {
          // Navigate back to the post detail with a success parameter
          router.replace({
            pathname: '/community/post/[id]',
            params: { id: postId, updated: 'true' }
          });
        } else if (submitError) {
          Alert.alert('Error', `Failed to update post: ${submitError}`);
        }
      } else {
        // Create new post
        console.log('Creating new post');
        result = await createDiscussion(formattedContent, postTitle.trim() || undefined);
        
        if (result) {
          // Reset the form
          resetPostForm();
          setPostTitle('');

          // Show toast for successful creation
          showToastMessage('Post created successfully!');

          // Navigate back to the feed (no params)
          router.replace('/community');
        } else if (submitError) {
          Alert.alert('Error', `Failed to create post: ${submitError}`);
        }
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} post:`, error);
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'create'} post. Please try again.`);
    }
  };

  const toggleMarkdownHelp = () => {
    setShowMarkdownHelp(!showMarkdownHelp);
  };

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  if (authLoading || (isEditMode && isLoadingSelectedDiscussion)) {
    return <LoadingState />;
  }
  
  // Check if we have permission to edit this post
  if (isEditMode && selectedDiscussion && selectedDiscussion.user_id !== user?.id) {
    Alert.alert(
      "Permission Denied",
      "You don't have permission to edit this post.",
      [{ text: "OK", onPress: () => router.back() }]
    );
    return null;
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
          {/* Header */}
          <NewPostHeader 
            title={isEditMode ? 'Edit Post' : 'Create Post'}
            onBack={() => router.back()}
          />

          {/* Input or Preview */}
          {isPreviewMode ? (
            <PostPreview 
              content={newPostContent} 
              sanitizeMarkdown={sanitizeMarkdownInput}
            />
          ) : (
            <PostInput 
              title={postTitle}
              setTitle={setPostTitle}
              content={newPostContent}
              setContent={setNewPostContent}
            />
          )}

          {/* Toggle buttons for preview and markdown help */}
          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <View style={styles.inputActions}>
                <ToggleButton 
                  icon="information-circle-outline"
                  label="Markdown"
                  onPress={() => setShowMarkdownHelp(!showMarkdownHelp)}
                />
                <ToggleButton 
                  icon={isPreviewMode ? "create-outline" : "eye-outline"}
                  label={isPreviewMode ? "Edit" : "Preview"}
                  onPress={() => setIsPreviewMode(!isPreviewMode)}
                />
              </View>
            </View>
          </View>

          {/* Markdown Help */}
          {showMarkdownHelp && <MarkdownHelp />}

          {/* Submit Button */}
          <SubmitButton 
            isEditMode={isEditMode}
            isSubmitting={isSubmitting}
            isDisabled={!newPostContent?.trim() || isSubmitting}
            onSubmit={handleSubmitPost}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles for this component
const styles = NewPostStyles;
