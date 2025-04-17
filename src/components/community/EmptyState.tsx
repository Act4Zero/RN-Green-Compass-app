import React from 'react';
import { View, Text } from 'react-native';
import FeedStyles from '@/styles/FeedStyles';

const styles = FeedStyles;

function EmptyState() {
  return (
    <View style={styles.noPostsContainer}>
      <Text style={styles.noPostsText}>No posts yet. Be the first to share!</Text>
    </View>
  );
}

export default EmptyState;
