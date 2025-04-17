import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import FeedStyles from '@/styles/FeedStyles';

interface NewPostButtonProps {
  onPress: () => void;
}

const styles = FeedStyles;

function NewPostButton({ onPress }: NewPostButtonProps) {
  return (
    <TouchableOpacity 
      style={styles.newPostButton}
      onPress={onPress}
    >
      <Text style={styles.newPostButtonText}>+</Text>
    </TouchableOpacity>
  );
}

export default NewPostButton;
