import React from 'react';
import { View, Text } from 'react-native';
import pointsStyles from '@/styles/community/Points.styles';

interface PointsCardProps {
  points: string;
  streak: number;
}

function PointsCard({ points, streak }: PointsCardProps) {
  return (
    <View style={pointsStyles.summaryContainer}>
      <View style={pointsStyles.pointsCard}>
        <Text style={pointsStyles.pointsValue}>{points}</Text>
        <Text style={pointsStyles.pointsLabel}>Green Points</Text>
      </View>
      
      <View style={pointsStyles.divider} />
      
      <View style={pointsStyles.streakContainer}>
        <Text style={pointsStyles.streakValue}>{streak}</Text>
        <Text style={pointsStyles.streakLabel}>Day Streak</Text>
      </View>
    </View>
  );
}

export default PointsCard;
