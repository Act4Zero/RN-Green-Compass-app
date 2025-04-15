import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import PostDetailStyles from '../styles/PostDetailStyles';

const styles = PostDetailStyles;

interface CommentEditFormProps {
  content: string;
  onContentChange: (text: string) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  characterInfo: {
    remaining: number;
    isNearLimit: boolean;
    isAtLimit: boolean;
  };
}

function CommentEditForm({
  content,
  onContentChange,
  onSave,
  onCancel,
  isSubmitting,
  characterInfo
}: CommentEditFormProps) {
  const isDisabled = !content.trim() || characterInfo.isAtLimit || isSubmitting;

  return (
    <View style={styles.editCommentContainer}>
      <TextInput
        style={[
          styles.editCommentInput, 
          characterInfo.isAtLimit ? styles.inputAtLimit : undefined
        ]}
        placeholder="Edit your comment..."
        placeholderTextColor="#757575"
        value={content}
        onChangeText={onContentChange}
        multiline
        maxLength={300}
      />
      <View style={styles.editCommentFooter}>
        <Text style={[
          styles.characterCount, 
          characterInfo.isNearLimit ? styles.characterCountNearLimit : undefined,
          characterInfo.isAtLimit ? styles.characterCountAtLimit : undefined
        ]}>
          {characterInfo.remaining} characters left
        </Text>
        <View style={styles.editCommentButtons}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.saveButton, 
              isDisabled ? styles.saveButtonDisabled : undefined
            ]}
            onPress={onSave}
            disabled={isDisabled}
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
  );
}

export default CommentEditForm;
