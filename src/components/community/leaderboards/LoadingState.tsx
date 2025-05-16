import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import LeaderboardStyles from '@/styles/LeaderboardStyles';

function LoadingState() {
  const styles = LeaderboardStyles;
  
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2E7D32" />
    </View>
  );
}

export default LoadingState;
