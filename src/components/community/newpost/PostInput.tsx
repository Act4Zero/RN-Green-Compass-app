import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { getCharacterInfo } from '@/utils/sanitizeMarkdownInput';

interface PostInputProps {
  title: string;
  setTitle: (text: string) => void;
  content: string | undefined;
  setContent: (text: string) => void;
}

// Character limit for posts
const MAX_CHARACTERS = 2000;

function PostInput({ title, setTitle, content, setContent }: PostInputProps) {
  // Calculate remaining characters using the utility function
  const characterInfo = getCharacterInfo(content || '');
  const { remaining: remainingChars, isNearLimit, isAtLimit } = characterInfo;

  return (
    <View style={styles.container}>
      <Text style={styles.inputLabel}>Share your thoughts or question</Text>
      <TextInput
        style={styles.titleInput}
        placeholder="Title (optional)"
        value={title}
        onChangeText={setTitle}
        maxLength={100}
      />
      <TextInput
        style={[styles.postInput, isAtLimit && styles.inputLimitReached]}
        placeholder="What's on your mind? Share your sustainability journey, ask questions, or post tips..."
        value={content}
        onChangeText={(text) => {
          // Limit text input to MAX_CHARACTERS
          if (text.length <= MAX_CHARACTERS) {
            setContent(text);
          } else {
            setContent(text.slice(0, MAX_CHARACTERS));
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
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333333',
  },
  titleInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  postInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 150,
  },
  inputLimitReached: {
    borderColor: '#D32F2F',
  },
  characterCountContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  characterCount: {
    fontSize: 14,
    color: '#757575',
  },
  characterCountWarning: {
    color: '#FFA000',
  },
  characterCountLimit: {
    color: '#D32F2F',
  },
});

export default PostInput;
