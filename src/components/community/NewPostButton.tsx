import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import FeedStyles from '@/styles/FeedStyles';
import { useAppTheme } from '@/theme';
import { useAppLocale } from '@/context/AppLocaleContext';

interface NewPostButtonProps {
  onPress: () => void;
}

const styles = FeedStyles;

function NewPostButton({ onPress }: NewPostButtonProps) {
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
  return (
    <TouchableOpacity 
      style={[styles.newPostButton, { backgroundColor: theme.colors.primary, borderRadius: 20 }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('Create a new post', 'Създай нова публикация')}
    >
      <Text style={[styles.newPostButtonText, { color: theme.colors.textInverse }]}>+</Text>
    </TouchableOpacity>
  );
}

export default NewPostButton;
