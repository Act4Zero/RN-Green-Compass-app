import React from 'react';
import { View, Text } from 'react-native';
import { MotivationalInfo } from '@/types/leaderboards';
import LeaderboardStyles from '@/styles/LeaderboardStyles';

interface MotivationalMessageProps {
  motivationalInfo: MotivationalInfo;
}

function MotivationalMessage({ motivationalInfo }: MotivationalMessageProps) {
  const styles = LeaderboardStyles;
  
  // If there's no message, don't render anything
  if (!motivationalInfo.message) {
    return null;
  }

  return (
    <View style={styles.motivationalContainer}>
      <Text style={styles.motivationalText}>
        {motivationalInfo.message}
      </Text>
    </View>
  );
}

export default MotivationalMessage;
