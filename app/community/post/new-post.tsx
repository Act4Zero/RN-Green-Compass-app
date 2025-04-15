import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import NewPostStyles from '../styles/NewPostStyles';
import { sanitizeMarkdownInput } from '../utils/sanitizeMarkdownInput';

// Import custom hook for screen logic
import useNewPost from '../hooks/useNewPost';

// Import components
import NewPostHeader from '../components/newpost/NewPostHeader';
import PostInput from '../components/newpost/PostInput';
import MarkdownHelp from '../components/newpost/MarkdownHelp';
import PostPreview from '../components/newpost/PostPreview';
import SubmitButton from '../components/newpost/SubmitButton';
import LoadingIndicator from '../components/newpost/LoadingIndicator';
import ToggleButton from '../components/newpost/ToggleButton';

// Components
function LoadingState() {
  return <LoadingIndicator />;
}

// Main component
export default function NewPost() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  
  // Use our custom hook for all screen logic
  const {
    // State
    isEditMode,
    postTitle,
    setPostTitle,
    newPostContent,
    setNewPostContent,
    showMarkdownHelp,
    isPreviewMode,
    isSubmitting,
    
    // Loading state
    isLoading,
    
    // Permissions
    hasEditPermission,
    handlePermissionDenied,
    
    // Actions
    handleSubmitPost,
    toggleMarkdownHelp,
    togglePreviewMode,
    goBack
  } = useNewPost();

  // Handle loading state
  if (isLoading) {
    return <LoadingState />;
  }
  
  // Handle permission check
  if (!hasEditPermission) {
    handlePermissionDenied();
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
            onBack={goBack}
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
                  onPress={toggleMarkdownHelp}
                />
                <ToggleButton 
                  icon={isPreviewMode ? "create-outline" : "eye-outline"}
                  label={isPreviewMode ? "Edit" : "Preview"}
                  onPress={togglePreviewMode}
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
