import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import PostDetailStyles from '@/styles/PostDetailStyles';

const styles = PostDetailStyles;

interface CommentFormProps {
  content: string;
  onContentChange: (text: string) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  submitError?: string;
  characterInfo: {
    remaining: number;
    isNearLimit: boolean;
    isAtLimit: boolean;
  };
}

function CommentForm({
  content,
  onContentChange,
  onSubmit,
  isSubmitting,
  submitError,
  characterInfo
}: CommentFormProps) {
  const isDisabled = !content.trim() || characterInfo.isAtLimit || isSubmitting;

  return (
    <View style={styles.addCommentContainer}>
      <TextInput
        style={[
          styles.commentInput, 
          characterInfo.isAtLimit ? styles.commentInputAtLimit : undefined
        ]}
        placeholder="Add a comment..."
        placeholderTextColor="#757575"
        value={content}
        onChangeText={onContentChange}
        multiline
        maxLength={300}
      />
      <View style={styles.commentInputFooter}>
        <Text style={[
          styles.characterCount, 
          characterInfo.isNearLimit ? styles.characterCountNearLimit : undefined,
          characterInfo.isAtLimit ? styles.characterCountAtLimit : undefined
        ]}>
          {characterInfo.remaining} characters left
        </Text>
        <TouchableOpacity 
          style={[
            styles.submitButton, 
            isDisabled ? styles.submitButtonDisabled : undefined
          ]}
          onPress={onSubmit}
          disabled={isDisabled}
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
  );
}

export default CommentForm;
