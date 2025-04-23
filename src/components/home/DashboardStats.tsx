import React from 'react';
import { View, Text } from 'react-native';
import { homeStyles } from '../../styles/Home.styles';

interface DashboardStatsProps {
  totalActions: number;
  totalCO2Saved: number;
  overallStreak: number;
}

export function DashboardStats({ totalActions, totalCO2Saved, overallStreak }: DashboardStatsProps) {
  return (
    <View style={homeStyles.card}>
      <Text style={homeStyles.cardTitle}>Your Sustainability Dashboard</Text>
      <Text style={homeStyles.cardContent}>
        Track your progress and see how your actions are making a difference.
      </Text>

      <View style={homeStyles.statsContainer}>
        <View style={homeStyles.statItem}>
          <Text style={homeStyles.statValue}>{totalActions || 0}</Text>
          <Text style={homeStyles.statLabel}>Actions Taken</Text>
        </View>
        <View style={homeStyles.statItem}>
          <Text style={homeStyles.statValue}>{totalCO2Saved?.toFixed(1) || '0'}</Text>
          <Text style={homeStyles.statLabel}>CO₂ Saved (kg)</Text>
        </View>
        <View style={homeStyles.statItem}>
          <Text style={homeStyles.statValue}>{overallStreak || 0}</Text>
          <Text style={homeStyles.statLabel}>Streak Days</Text>
        </View>
      </View>
    </View>
  );
}

// Default export to fix the "missing required default export" warning
export default DashboardStats;
