import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FeedStyles from '@/styles/FeedStyles';
import { useAppTheme } from '@/theme';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const styles = FeedStyles;

function ErrorState({ error, onRetry }: ErrorStateProps) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.errorContainer, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.danger, borderWidth: 1 }]}>
      <Text style={[styles.errorText, { color: theme.colors.danger }]}>We couldn’t load the conversation: {error}</Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
        onPress={onRetry}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

export default ErrorState;
