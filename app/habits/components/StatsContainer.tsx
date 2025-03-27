import React from 'react';
import { View, Text } from 'react-native';
import { HistoryStyles } from '../styles/historyStyles';

interface StatsContainerProps {
  totalActions?: number;
  totalCO2Saved?: number;
  overallStreak?: number;
  styles: HistoryStyles;
}

export function StatsContainer({
  totalActions,
  totalCO2Saved,
  overallStreak,
  styles
}: StatsContainerProps) {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{totalActions || 12}</Text>
        <Text style={styles.statLabel}>Actions Taken</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{totalCO2Saved?.toFixed(1) || '6.3'}</Text>
        <Text style={styles.statLabel}>CO₂ Saved (kg)</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{overallStreak || 5}</Text>
        <Text style={styles.statLabel}>Day Streak</Text>
      </View>
    </View>
  );
}

export default StatsContainer;

