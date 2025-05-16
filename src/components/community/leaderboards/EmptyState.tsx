import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LeaderboardStyles from '@/styles/LeaderboardStyles';

function EmptyState() {
  const styles = LeaderboardStyles;
  
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="trophy-outline" size={48} color="#AAAAAA" />
      <Text style={styles.emptyText}>
        No leaderboard entries found. Start tracking your habits to appear on the leaderboard!
      </Text>
    </View>
  );
}

export default EmptyState;
