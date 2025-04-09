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
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import NewPostStyles from './styles/NewPostStyles';

export default function NewPost() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [postContent, setPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);

  // Redirect to signin if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('No authenticated user found in new post, redirecting to signin');
      router.replace('/auth/signin');
    } else if (!authLoading && user) {
      console.log('Authenticated user in new post:', user.id);
    }
  }, [user, authLoading, router]);

  const handleSubmitPost = () => {
    if (!postContent.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Navigate back to the feed with a success parameter
      router.replace({
        pathname: '/community',
        params: { success: 'true' }
      });
    }, 1000);
  };

  const toggleMarkdownHelp = () => {
    setShowMarkdownHelp(!showMarkdownHelp);
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
              <TouchableOpacity 
                style={styles.markdownHelpButton}
                onPress={toggleMarkdownHelp}
              >
                <Ionicons name="information-circle-outline" size={20} color="#2E7D32" />
                <Text style={styles.markdownHelpText}>Markdown</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.postInput}
              placeholder="What's on your mind? Share your sustainability journey, ask questions, or post tips..."
              value={postContent}
              onChangeText={setPostContent}
              multiline
              textAlignVertical="top"
            />
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
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!postContent.trim() || isSubmitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitPost}
            disabled={!postContent.trim() || isSubmitting}
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
