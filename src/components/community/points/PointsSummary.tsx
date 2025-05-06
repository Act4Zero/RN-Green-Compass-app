import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import profileStyles from '@/styles/Profile.styles';

interface PointsSummaryProps {
  points: string;
  streak: number;
}

function PointsSummary({ points, streak }: PointsSummaryProps) {
  // Use a safe default value to prevent rendering issues
  const safeStreak = typeof streak === 'number' && !isNaN(streak) ? streak : 0;
  
  return (
    <View style={profileStyles.pointsSummaryCard}>
      <View style={profileStyles.pointsCol}>
        <Ionicons name="leaf" size={20} color="#2E7D32" />
        <Text style={profileStyles.pointsValue}>{points}</Text>
        <Text style={profileStyles.pointsLabel}>Green Points</Text>
      </View>
      
      {/* Temporarily disable streak display to prevent errors */}
      <View style={profileStyles.pointsDivider} />
      
      <View style={profileStyles.pointsCol}>
        <Ionicons name="star" size={20} color="#FFD700" />
        <Text style={profileStyles.streakValue}>⭐</Text>
        <Text style={profileStyles.streakLabel}>Rewards</Text>
      </View>
    </View>
  );
}

export default PointsSummary;
