import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import profileStyles from '@/styles/Profile.styles';
import { useAppLocale } from '@/context/AppLocaleContext';

interface PointsSummaryProps {
  points: string;
  streak: number;
}

function PointsSummary({ points, streak }: PointsSummaryProps) {
  const { t } = useAppLocale();
  return (
    <View style={profileStyles.pointsSummaryCard}>
      <View style={profileStyles.pointsCol}>
        <Ionicons name="leaf" size={20} color="#2E7D32" />
        <Text style={profileStyles.pointsValue}>{points}</Text>
        <Text style={profileStyles.pointsLabel}>{t('Green Points', 'Зелени точки')}</Text>
      </View>
      
      <View style={profileStyles.pointsDivider} />
      
      <View style={profileStyles.pointsCol}>
        <Ionicons name="medal" size={20} color="#FFD700" />
        <Text style={profileStyles.streakValue}>{streak}</Text>
        <Text style={profileStyles.streakLabel}>{t('Habits Streak', 'Серия от навици')}</Text>
      </View>
    </View>
  );
}

export default PointsSummary;
