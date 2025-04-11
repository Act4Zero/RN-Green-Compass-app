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
  Image,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import Markdown from 'react-native-markdown-display';
import NewPostStyles, { markdownStyles } from './styles/NewPostStyles';
import { sanitizeMarkdownInput, getCharacterInfo } from './utils/sanitizeMarkdownInput';
import useCommunityFeed from '../hooks/useCommunityFeed';

export default function NewPost() {
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
    createDiscussion
  } = useCommunityFeed();
  
  // Character limit for posts
  const MAX_CHARACTERS = 2000;
  
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  
  // Calculate remaining characters using the utility function
  const characterInfo = getCharacterInfo(newPostContent || '');
  const { remaining: remainingChars, isNearLimit, isAtLimit } = characterInfo;

  // Redirect to signin if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('No authenticated user found in new post, redirecting to signin');
      router.replace('/auth/signin');
    } else if (!authLoading && user) {
      console.log('Authenticated user in new post:', user.id);
    }
  }, [user, authLoading, router]);

  const handleSubmitPost = async () => {
    if (!newPostContent?.trim() || isAtLimit) return;
    
    try {
      // Sanitize the markdown input before submission to ensure it's safe
      const formattedContent = sanitizeMarkdownInput(newPostContent, 'post');
      console.log('Submitting formatted post:', formattedContent);
      
      // Use the createDiscussion method from useCommunityFeed
      const result = await createDiscussion(formattedContent, postTitle.trim() || undefined);
      
      if (result) {
        // Reset the form
        resetPostForm();
        setPostTitle('');
        
        // Navigate back to the feed with a success parameter
        router.replace({
          pathname: '/community',
          params: { success: 'true' }
        });
      } else if (submitError) {
        Alert.alert('Error', `Failed to create post: ${submitError}`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }
  };

  const toggleMarkdownHelp = () => {
    setShowMarkdownHelp(!showMarkdownHelp);
  };

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
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
            <Text style={styles.title}>Create Post</Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>Share your thoughts or question</Text>
              <View style={styles.inputActions}>
                <TouchableOpacity 
                  style={styles.markdownHelpButton}
                  onPress={toggleMarkdownHelp}
                >
                  <Ionicons name="information-circle-outline" size={20} color="#2E7D32" />
                  <Text style={styles.markdownHelpText}>Markdown</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.previewButton}
                  onPress={togglePreviewMode}
                >
                  <Ionicons 
                    name={isPreviewMode ? "create-outline" : "eye-outline"} 
                    size={20} 
                    color="#2E7D32" 
                  />
                  <Text style={styles.previewButtonText}>
                    {isPreviewMode ? "Edit" : "Preview"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {isPreviewMode ? (
              <View style={styles.previewContainer}>
                <ScrollView style={styles.previewScroll}>
                  {newPostContent?.trim() ? (
                    <Markdown 
                      style={markdownStyles}
                      // Using the formatted text to preserve Markdown and remove harmful content
                      // Custom renderers for images and links
                      rules={{
                        image: (node, children, parent, styles) => {
                          return (
                            <Image 
                              key={node.key} 
                              source={{ uri: node.attributes.src }}
                              style={{
                                width: '100%',
                                height: 200,
                                resizeMode: 'contain',
                                marginVertical: 8,
                                borderRadius: 8,
                              }}
                            />
                          );
                        },
                        link: (node, children, parent, styles) => {
                          return (
                            <Text 
                              key={node.key}
                              style={markdownStyles.link}
                              onPress={() => {
                                // Handle external URLs properly
                                let url = node.attributes.href;
                                
                                // Handle URLs without protocol
                                if (url && !url.match(/^(https?|mailto|tel):\/\//i)) {
                                  // Check if it's likely a web URL (contains domain-like structure)
                                  if (url.match(/^[\w-]+(\.[\w-]+)+/)) {
                                    url = `https://${url}`;
                                  } else if (url.startsWith('/')) {
                                    // Relative path within the app - could be handled differently
                                    console.log('Relative path detected:', url);
                                    return;
                                  }
                                }
                                
                                // Open the URL if it seems valid
                                if (url) {
                                  console.log('Opening URL:', url);
                                  Linking.openURL(url).catch(err => {
                                    console.error('An error occurred opening the URL:', err);
                                  });
                                }
                              }}
                            >
                              {children}
                            </Text>
                          );
                        }
                      }}
                    >
                      {sanitizeMarkdownInput(newPostContent || '', 'post')}
                    </Markdown>
                  ) : (
                    <Text style={styles.previewPlaceholder}>
                      Your preview will appear here. Start typing in edit mode to see the preview.
                    </Text>
                  )}
                </ScrollView>
              </View>
            ) : (
              <View>
                <TextInput
                  style={styles.titleInput}
                  placeholder="Title (optional)"
                  value={postTitle}
                  onChangeText={setPostTitle}
                  maxLength={100}
                />
                <TextInput
                  style={[styles.postInput, isAtLimit && styles.inputLimitReached]}
                  placeholder="What's on your mind? Share your sustainability journey, ask questions, or post tips..."
                  value={newPostContent}
                  onChangeText={(text) => {
                    // Limit text input to MAX_CHARACTERS
                    if (text.length <= MAX_CHARACTERS) {
                      setNewPostContent(text);
                    } else {
                      setNewPostContent(text.slice(0, MAX_CHARACTERS));
                    }
                  }}
                  multiline
                  textAlignVertical="top"
                  maxLength={MAX_CHARACTERS}
                />
                <View style={styles.characterCountContainer}>
                  <Text 
                    style={[
                      styles.characterCount,
                      isNearLimit && styles.characterCountWarning,
                      isAtLimit && styles.characterCountLimit
                    ]}
                  >
                    {remainingChars} characters remaining
                  </Text>
                </View>
              </View>
            )}
          </View>

          {showMarkdownHelp && (
            <View style={styles.markdownHelpContainer}>
              <Text style={styles.markdownHelpTitle}>Markdown Formatting</Text>
              <View style={styles.markdownHelpItem}>
                <Text style={styles.markdownHelpCode}>**bold**</Text>
                <Text style={styles.markdownHelpDescription}>Bold text</Text>
              </View>
              <View style={styles.markdownHelpItem}>
                <Text style={styles.markdownHelpCode}>*italic*</Text>
                <Text style={styles.markdownHelpDescription}>Italic text</Text>
              </View>
              <View style={styles.markdownHelpItem}>
                <Text style={styles.markdownHelpCode}>- item</Text>
                <Text style={styles.markdownHelpDescription}>Bullet list</Text>
              </View>
              <View style={styles.markdownHelpItem}>
                <Text style={styles.markdownHelpCode}>[link](url)</Text>
                <Text style={styles.markdownHelpDescription}>Hyperlink</Text>
              </View>
              <View style={styles.markdownHelpItem}>
                <Text style={styles.markdownHelpCode}>![alt text](image_url)</Text>
                <Text style={styles.markdownHelpDescription}>Image</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!newPostContent?.trim() || isSubmitting || isAtLimit) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitPost}
            disabled={!newPostContent?.trim() || isSubmitting || isAtLimit}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Post</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles for this component
const styles = NewPostStyles;
