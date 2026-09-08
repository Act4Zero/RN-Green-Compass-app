import React from 'react';
import { View, Text } from 'react-native';
import ChallengeStyles from '@/styles/community/ChallengeStyles';
import { useAppLocale } from '@/context/AppLocaleContext';

interface ChallengeProgressProps {
  value: number;
  total: number;
  color?: string;
}

const styles = ChallengeStyles;

function ChallengeProgress({ value, total, color = '#4CAF50' }: ChallengeProgressProps) {
  const { t } = useAppLocale();
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
          {value} / {total} {t('points', 'точки')}
        </Text>
      </View>
    </View>
  );
}

export default ChallengeProgress;
