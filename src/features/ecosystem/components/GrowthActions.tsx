import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useKnowledgeLocale } from '@/features/knowledge';
import { useAppTheme } from '@/theme';
import { ECOSYSTEM_GROWTH_RULES } from '../progression';

export function GrowthActions() {
  const { theme } = useAppTheme();
  const { t } = useKnowledgeLocale();
  const router = useRouter();
  const actions = [
    { source: 'habit_log', emoji: '🌱', title: t('Make a small change', 'Направи малка промяна'), detail: t('Log a sustainable habit', 'Запиши устойчив навик'), route: '/habits/log' },
    { source: 'learning_milestone', emoji: '💡', title: t('Learn something new', 'Научи нещо ново'), detail: t('Complete a learning milestone', 'Завърши учебна стъпка'), route: '/knowledge/learning' },
    { source: 'daily_challenge', emoji: '🎯', title: t('Try today’s challenge', 'Опитай днешната мисия'), detail: t('Complete the daily challenge', 'Изпълни дневното предизвикателство'), route: '/habits/today' },
  ];
  return <View style={{ gap: 10 }}>
    <Text accessibilityRole="header" style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 2 }]}>{t('Give your world a little growth', 'Дай малко растеж на своя свят')}</Text>
    {actions.map((action) => {
      const rule = ECOSYSTEM_GROWTH_RULES.find((entry) => entry.source === action.source)!;
      return <Pressable key={action.source} accessibilityRole="button" accessibilityLabel={`${action.title}. ${action.detail}. +${rule.units}. ${t(`Up to ${rule.dailyCap} per day`, `До ${rule.dailyCap} на ден`)}`}
        onPress={() => router.push(action.route as any)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: pressed ? theme.colors.primarySoft : theme.colors.surface })}>
        <View style={{ width: 46, height: 46, borderRadius: 16, backgroundColor: theme.colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 25 }}>{action.emoji}</Text></View>
        <View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>{action.title}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 }]}>{action.detail}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 11 }]}>{t(`Up to ${rule.dailyCap} per day`, `До ${rule.dailyCap} на ден`)}</Text></View>
        <View style={{ gap: 5, alignItems: 'center' }}><Text style={[theme.typography.label, { color: theme.colors.primary }]}>+{rule.units} 🌱</Text><Ionicons name="arrow-forward" color={theme.colors.primary} size={18} /></View>
      </Pressable>;
    })}
  </View>;
}
