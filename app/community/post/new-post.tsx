import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Pressable,
  Text,
} from 'react-native';
import NewPostStyles from '@/styles/community/NewPostStyles';
import { sanitizeMarkdownInput } from '@/utils/sanitizeMarkdownInput';

// Import custom hook for screen logic
import useNewPost from '@/hooks/community/useNewPost';

// Import components
import NewPostHeader from '@/components/community/newpost/NewPostHeader';
import PostInput from '@/components/community/newpost/PostInput';
import MarkdownHelp from '@/components/community/newpost/MarkdownHelp';
import PostPreview from '@/components/community/newpost/PostPreview';
import SubmitButton from '@/components/community/newpost/SubmitButton';
import LoadingIndicator from '@/components/community/newpost/LoadingIndicator';
import ToggleButton from '@/components/community/newpost/ToggleButton';
import type { DiscussionCategory } from '@/types/community/community';
import { useAppTheme } from '@/theme';
import { useAppLocale } from '@/context/AppLocaleContext';

const CATEGORIES: { value: DiscussionCategory; label: string }[] = [
  { value: 'sustainable_living', label: 'Living tips' },
  { value: 'diy_projects', label: 'DIY projects' },
  { value: 'carbon_reduction', label: 'Carbon reduction' },
  { value: 'community_projects', label: 'Community projects' },
  { value: 'questions', label: 'Questions' },
];

// Components
function LoadingState() {
  return <LoadingIndicator />;
}

// Main component
export default function NewPost() {
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  
  // Use our custom hook for all screen logic
  const {
    // State
    isEditMode,
    postTitle,
    setPostTitle,
    category,
    setCategory,
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
            title={isEditMode ? t('Edit Post', 'Редактиране на публикация') : t('Create Post', 'Нова публикация')}
            onBack={goBack}
          />

          {/* Input or Preview */}
          {!isPreviewMode ? <View style={{ marginBottom: 14, gap: 8 }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>{t('Forum category', 'Категория във форума')}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{CATEGORIES.map((option) => { const active = category === option.value; const bg = option.value === 'sustainable_living' ? 'Устойчив живот' : option.value === 'diy_projects' ? 'Направи си сам' : option.value === 'carbon_reduction' ? 'Намаляване на въглерода' : option.value === 'community_projects' ? 'Общностни проекти' : 'Въпроси'; return <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ selected: active }} onPress={() => setCategory(option.value)} style={{ minHeight: 40, justifyContent: 'center', paddingHorizontal: 12, borderRadius: theme.radii.pill, borderWidth: 1, borderColor: active ? theme.colors.primary : theme.colors.border, backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface }}><Text style={[theme.typography.label, { color: active ? theme.colors.primary : theme.colors.textMuted }]}>{t(option.label, bg)}</Text></Pressable>; })}</View></View> : null}
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
                  label={isPreviewMode ? t('Edit', 'Редактирай') : t('Preview', 'Преглед')}
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
