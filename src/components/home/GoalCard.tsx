import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { EnhancedGoal } from '@/types/goal.types';
import { useAppTheme } from '@/theme';
import { useAppLocale } from '@/context/AppLocaleContext';

interface GoalCardProps {
  goal: EnhancedGoal;
  onEdit: (goal: EnhancedGoal) => void;
}

export default function GoalCard({ goal, onEdit }: GoalCardProps) {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
  const progress = Math.max(0, Math.min(100, goal.target > 0 ? (goal.progress / goal.target) * 100 : 0));

  return (
    <View style={{ backgroundColor: theme.colors.backgroundElevated, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radii.lg, padding: 18, width: 280, minWidth: 240, marginRight: 12 }}>
      <View style={{ marginBottom: 14 }}>
        <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{goal.title}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[theme.typography.label, { color: theme.colors.primary, marginTop: 5 }]}>
            {goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
          </Text>
          {goal.timeFrequency && (
            <View style={{ paddingHorizontal: 9, paddingVertical: 5, backgroundColor: theme.colors.primarySoft, borderRadius: theme.radii.pill }}>
              <Text style={[theme.typography.label, { color: theme.colors.primary, fontSize: 11 }]}>{goal.timeFrequency}</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={{ marginBottom: 16 }}>
        <View style={{ height: 8, backgroundColor: theme.colors.surfaceStrong, borderRadius: 4, marginBottom: 8, overflow: 'hidden' }}>
          <View 
            style={{ height: '100%', backgroundColor: theme.colors.accent, borderRadius: 4, width: `${progress}%` }}
          />
        </View>
        <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, textAlign: 'right', fontSize: 12 }]}>
          {goal.progress} {t('of', 'от')} {goal.target} {t('actions completed', 'изпълнени действия')}
        </Text>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
        <TouchableOpacity 
          accessibilityRole="button"
          style={{ minHeight: 40, justifyContent: 'center', backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radii.sm, paddingHorizontal: 14 }}
          onPress={() => onEdit(goal)}
        >
          <Text style={[theme.typography.label, { color: theme.colors.primary }]}>{t('Edit', 'Редактирай')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          accessibilityRole="button"
          style={{ minHeight: 40, justifyContent: 'center', backgroundColor: theme.colors.primary, borderRadius: theme.radii.sm, paddingHorizontal: 14 }}
          onPress={() => router.push({
            pathname: '/habits/log',
            params: { category: goal.category }
          } as any)}
        >
          <Text style={[theme.typography.label, { color: theme.colors.textInverse }]}>{t('Log action', 'Запиши действие')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
