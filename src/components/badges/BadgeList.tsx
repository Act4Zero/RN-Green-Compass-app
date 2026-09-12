import React from 'react';
import { ScrollView, Text, Pressable, View } from 'react-native';
import { useAppLocale } from '@/context/AppLocaleContext';
import { useAppTheme } from '@/theme';
import type { Badge, BadgeCategoryType } from '@/types/community/badges';
import BadgeItem, { BADGE_CATEGORY_LABELS } from './BadgeItem';

type DisplayBadge = Badge & { imageUrl?: string; isEarned: boolean; awarded_at?: string };

interface BadgeListProps {
  title?: string;
  badges: DisplayBadge[];
  availableCategories: BadgeCategoryType[];
  selectedCategory: BadgeCategoryType | 'all';
  onSelectCategory: (category: BadgeCategoryType | 'all') => void;
  emptyMessage: string;
}

export default function BadgeList({ title, badges, availableCategories, selectedCategory, onSelectCategory, emptyMessage }: BadgeListProps) {
  const { theme } = useAppTheme();
  const { locale, t } = useAppLocale();

  return <View style={{ gap: theme.spacing.md }}>
    {title ? <Text style={[theme.typography.h2, { color: theme.colors.text }]}>{title}</Text> : null}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: theme.spacing.lg }}>
      {(['all', ...availableCategories] as const).map((category) => {
        const active = selectedCategory === category;
        const meta = category === 'all' ? null : BADGE_CATEGORY_LABELS[category];
        const label = category === 'all' ? t('All', 'Всички') : (locale === 'bg' ? meta?.bg : meta?.en) || category;
        return <Pressable key={category} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => onSelectCategory(category)} style={{ minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, borderRadius: theme.radii.pill, borderWidth: 1, borderColor: active ? theme.colors.primary : theme.colors.border, backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface }}>
          {meta ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: meta.color }} /> : null}
          <Text style={[theme.typography.label, { color: active ? theme.colors.primary : theme.colors.textMuted }]}>{label}</Text>
        </Pressable>;
      })}
    </ScrollView>

    {badges.length ? <View style={{ gap: theme.spacing.sm }}>{badges.map((badge) => <BadgeItem key={badge.id || badge.code} name={badge.name} description={badge.description} imageUrl={badge.imageUrl} isEarned={badge.isEarned} category={badge.category} earnedDate={badge.awarded_at} />)}</View> : <View style={{ alignItems: 'center', gap: theme.spacing.sm, padding: theme.spacing.xl, borderRadius: theme.radii.lg, backgroundColor: theme.colors.surfaceMuted }}><Text style={[theme.typography.body, { color: theme.colors.textMuted, textAlign: 'center' }]}>{emptyMessage}</Text></View>}
  </View>;
}
