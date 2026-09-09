import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import PostDetailStyles from '@/styles/community/PostDetailStyles';
import { useAppLocale } from '@/context/AppLocaleContext';

const styles = PostDetailStyles;

interface PostDetailHeaderProps {
  title?: string;
}

function PostDetailHeader({ title }: PostDetailHeaderProps) {
  const router = useRouter();
  const { t } = useAppLocale();

  return (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => {
          if (typeof router.canGoBack === 'function' ? router.canGoBack() : false) {
            router.back();
          } else {
            router.replace('/community');
          }
        }}
      >
        <Ionicons name="arrow-back" size={24} color="#2E7D32" />
      </TouchableOpacity>
      <Text style={styles.title}>{title || t('Post Detail', 'Публикация')}</Text>
    </View>
  );
}

export default PostDetailHeader;
