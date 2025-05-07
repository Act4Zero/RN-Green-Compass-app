import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import profileStyles from '@/styles/Profile.styles';

interface PointsSummaryProps {
  points: string;
  streak: number;
}

function PointsSummary({ points, streak }: PointsSummaryProps) {
  return (
    <View style={profileStyles.pointsSummaryCard}>
      <View style={profileStyles.pointsCol}>
        <Ionicons name="leaf" size={20} color="#2E7D32" />
        <Text style={profileStyles.pointsValue}>{points}</Text>
        <Text style={profileStyles.pointsLabel}>Green Points</Text>
      </View>
      
      <View style={profileStyles.pointsDivider} />
      
      <View style={profileStyles.pointsCol}>
        <Ionicons name="medal" size={20} color="#FFD700" />
        <Text style={profileStyles.streakValue}>{streak}</Text>
        <Text style={profileStyles.streakLabel}>Habits Streak</Text>
      </View>
    </View>
  );
}

export default PointsSummary;
