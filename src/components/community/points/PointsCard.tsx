import React from 'react';
import { View, Text } from 'react-native';
import pointsStyles from '@/styles/community/Points.styles';
import { useAppLocale } from '@/context/AppLocaleContext';

interface PointsCardProps {
  points: string;
  streak: number;
}

function PointsCard({ points, streak }: PointsCardProps) {
  const { t } = useAppLocale();
  return (
    <View style={pointsStyles.summaryContainer}>
      <View style={pointsStyles.pointsCard}>
        <Text style={pointsStyles.pointsValue}>{points}</Text>
        <Text style={pointsStyles.pointsLabel}>{t('Green Points', 'Зелени точки')}</Text>
      </View>
      
      <View style={pointsStyles.divider} />
      
      <View style={pointsStyles.streakContainer}>
        <Text style={pointsStyles.streakValue}>{streak}</Text>
        <Text style={pointsStyles.streakLabel}>{t('Day Streak', 'Дневна серия')}</Text>
      </View>
    </View>
  );
}

export default PointsCard;
