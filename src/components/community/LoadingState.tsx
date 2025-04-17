import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import FeedStyles from '@/styles/FeedStyles';

const styles = FeedStyles;

function LoadingState() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2E7D32" />
    </View>
  );
}

export default LoadingState;
