import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import BadgeList from '@/components/badges/BadgeList';
import { AppButton, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { useAppLocale } from '@/context/AppLocaleContext';
import { useAuth } from '@/context/AuthContext';
import { useBadges } from '@/context/BadgesContext';
import { useAppTheme } from '@/theme';
import type { Badge, BadgeCategoryType } from '@/types/community/badges';

export default function BadgesScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
  const { user, loading: authLoading } = useAuth();
  const { userBadges, badgesWithEarnedStatus, availableCategories, getBadgesByCategory, isLoading, error, loadUserBadges, loadAllBadges } = useBadges();
  const [earnedCategory, setEarnedCategory] = useState<BadgeCategoryType | 'all'>('all');
  const [availableCategory, setAvailableCategory] = useState<BadgeCategoryType | 'all'>('all');

  useEffect(() => { if (!authLoading && !user) router.replace('/auth/signin'); }, [user, authLoading, router]);
  useFocusEffect(useCallback(() => { if (user) void Promise.all([loadAllBadges(), loadUserBadges()]); }, [user, loadAllBadges, loadUserBadges]));

  const earnedBadges = useMemo(() => userBadges
    .map((userBadge) => userBadge.badge ? { ...userBadge.badge, isEarned: true, awarded_at: userBadge.awarded_at, imageUrl: userBadge.badge.icon_url || undefined } : null)
    .filter((badge): badge is Badge & { isEarned: true; awarded_at: string; imageUrl?: string } => Boolean(badge)), [userBadges]);
  const earnedVisible = getBadgesByCategory(earnedBadges, earnedCategory);
  const allVisible = getBadgesByCategory(badgesWithEarnedStatus, availableCategory).map((badge) => ({ ...badge, imageUrl: badge.icon_url || undefined }));
  const total = badgesWithEarnedStatus.length;
  const progress = total ? Math.round((userBadges.length / total) * 100) : 0;

  if (isLoading && total === 0) return <Screen><Content><View style={{ minHeight: 360, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md }}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{t('Loading badges...', 'Зареждане на значките...')}</Text></View></Content></Screen>;
  if (error && total === 0) return <Screen><Content><StatePanel icon="ribbon-outline" title={t('Badges are unavailable', 'Значките не са достъпни')} message={error} action={<AppButton label={t('Back', 'Назад')} onPress={() => router.back()} />} /></Content></Screen>;

  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content>
    <PageHeader eyebrow={t('Your green milestones', 'Твоите зелени постижения')} title={t('Badge collection', 'Колекция от значки')} description={t('Every badge marks a real step in your sustainable journey.', 'Всяка значка отбелязва реална стъпка от твоето устойчиво пътуване.')} action={<AppButton label={t('Back', 'Назад')} icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />

    <Card elevated style={{ marginBottom: theme.spacing.xl, overflow: 'hidden', backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }}>
      <View style={{ position: 'absolute', right: -26, top: -34, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.09)' }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg }}>
        <View style={{ width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)' }}><Ionicons name="trophy" size={38} color="#FFE07A" /></View>
        <View style={{ flex: 1, gap: 5 }}><Text style={[theme.typography.label, { color: 'rgba(255,255,255,0.78)', textTransform: 'uppercase' }]}>{t('Collection progress', 'Напредък на колекцията')}</Text><Text style={[theme.typography.h1, { color: '#FFFFFF' }]}>{userBadges.length} / {total}</Text><Text style={[theme.typography.bodySmall, { color: 'rgba(255,255,255,0.82)' }]}>{t(`${progress}% of all badges unlocked`, `${progress}% от всички значки са отключени`)}</Text></View>
      </View>
      <View style={{ height: 9, marginTop: theme.spacing.lg, overflow: 'hidden', borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.2)' }}><View style={{ height: '100%', width: `${progress}%`, borderRadius: 5, backgroundColor: '#FFE07A' }} /></View>
    </Card>

    <View style={{ gap: theme.spacing.xl }}>
      <View style={{ gap: theme.spacing.md }}><View><Text style={[theme.typography.h2, { color: theme.colors.text }]}>{t('Earned badges', 'Спечелени значки')}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3 }]}>{t('Your achievements, ready to share.', 'Твоите постижения, готови за споделяне.')}</Text></View><BadgeList badges={earnedVisible} availableCategories={availableCategories} selectedCategory={earnedCategory} onSelectCategory={setEarnedCategory} emptyMessage={t('Complete an activity to unlock your first badge.', 'Изпълни дейност, за да отключиш първата си значка.')} /></View>
      <View style={{ gap: theme.spacing.md, paddingBottom: theme.spacing.xl }}><View><Text style={[theme.typography.h2, { color: theme.colors.text }]}>{t('Next milestones', 'Следващи постижения')}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3 }]}>{t('See what you can unlock next.', 'Виж какво можеш да отключиш следващо.')}</Text></View><BadgeList badges={allVisible} availableCategories={availableCategories} selectedCategory={availableCategory} onSelectCategory={setAvailableCategory} emptyMessage={t('No badges in this category.', 'Няма значки в тази категория.')} /></View>
    </View>
  </Content></ScrollView></Screen>;
}
