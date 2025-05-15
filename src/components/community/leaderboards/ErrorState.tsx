import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LeaderboardStyles from '@/styles/LeaderboardStyles';

interface ErrorStateProps {
  error: Error | null;
  onRetry: () => void;
}

function ErrorState({ error, onRetry }: ErrorStateProps) {
  const styles = LeaderboardStyles;
  
  return (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={48} color="#D32F2F" />
      <Text style={styles.errorText}>
        {error?.message || 'An error occurred while loading the leaderboard'}
      </Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={onRetry}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

export default ErrorState;
