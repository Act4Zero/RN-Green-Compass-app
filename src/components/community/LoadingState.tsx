import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import FeedStyles from '@/styles/FeedStyles';
import { useAppTheme } from '@/theme';

const styles = FeedStyles;

function LoadingState() {
  const { theme } = useAppTheme();
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

export default LoadingState;
