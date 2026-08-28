import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import FeedStyles from '@/styles/FeedStyles';
import { useAppLocale } from '@/context/AppLocaleContext';

interface NewPostButtonProps {
  onPress: () => void;
}

const styles = FeedStyles;

function NewPostButton({ onPress }: NewPostButtonProps) {
  const { t } = useAppLocale();
  return (
    <TouchableOpacity 
      style={styles.newPostButton}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('Create a new post', 'Създай нова публикация')}
    >
      <Text style={styles.newPostButtonText}>+</Text>
    </TouchableOpacity>
  );
}

export default NewPostButton;
