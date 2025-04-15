import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FeedStyles from '../styles/FeedStyles';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const styles = FeedStyles;

function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Error loading posts: {error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={onRetry}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

export default ErrorState;
