import React from 'react';
import { View, Text } from 'react-native';
import ChallengeStyles from '@/styles/ChallengeStyles';

interface ChallengeProgressProps {
  value: number;
  total: number;
  color?: string;
}

const styles = ChallengeStyles;

function ChallengeProgress({ value, total, color = '#4CAF50' }: ChallengeProgressProps) {
  // Calculate percentage (capped at 100%)
  const percentage = Math.min(100, (value / total) * 100);
  
  return (
    <View>
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBarFill,
            { width: `${percentage}%`, backgroundColor: color }
          ]}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.progressValue}>{Math.round(percentage)}%</Text>
        <Text style={styles.progressText}>
          {value} / {total} points
        </Text>
      </View>
    </View>
  );
}

export default ChallengeProgress;
