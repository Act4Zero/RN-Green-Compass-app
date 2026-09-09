import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import PostDetailStyles from '@/styles/community/PostDetailStyles';
import { useAppLocale } from '@/context/AppLocaleContext';

const styles = PostDetailStyles;

interface NotFoundStateProps {
  message?: string;
  buttonText?: string;
}

function NotFoundState({ message, buttonText }: NotFoundStateProps) {
  const router = useRouter();
  const { t } = useAppLocale();
  
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{message || t('Post not found', 'Публикацията не е намерена')}</Text>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>{buttonText || t('Go Back', 'Назад')}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default NotFoundState;
