import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LeaderboardStyles from '@/styles/LeaderboardStyles';
import { useAppLocale } from '@/context/AppLocaleContext';

function EmptyState() {
  const styles = LeaderboardStyles;
  const { t } = useAppLocale();
  
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="trophy-outline" size={48} color="#AAAAAA" />
      <Text style={styles.emptyText}>
        {t('No leaderboard entries found. Start tracking your habits to appear on the leaderboard!', 'Все още няма участници в класацията. Започнете да проследявате навиците си, за да се включите!')}
      </Text>
    </View>
  );
}

export default EmptyState;
