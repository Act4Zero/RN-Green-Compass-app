import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { GoalsHeader, GoalsList } from '@/components/home/GoalsList';
import EditGoalModal from '@/components/modals/EditGoalModal';
import { AppButton, Card, Content, PageHeader, Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { usePoints } from '@/context/PointsContext';
import { EcosystemHero, useEcosystem } from '@/features/ecosystem';
import { GrowthActions } from '@/features/ecosystem/components/GrowthActions';
import { KNOWLEDGE_ILLUSTRATIONS } from '@/features/knowledge/visuals';
import { knowledgeService, type KnowledgeItemDetail, useKnowledgeLocale } from '@/features/knowledge';
import { marketplaceService, type MarketplaceRecommendation } from '@/features/marketplace';
import useGoalsManager from '@/hooks/useGoalsManager';
import useHabitStats from '@/hooks/useHabitStats';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import useProfileManager from '@/hooks/useProfileManager';
import analyticsService from '@/services/analyticsService';
import { useAppTheme } from '@/theme';
import type { EnhancedGoal, TimeFrequency } from '@/types/goal.types';

export default function Home() {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const wide = width >= 768;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { locale, t } = useKnowledgeLocale();
  const ecosystemEnabled = useFeatureFlag('living_ecosystem_v1', true);
  const marketplaceEnabled = useFeatureFlag('sustainability_marketplace_mvp', true);
  const { pointHistory, awardDailyCheckIn } = usePoints();
  const { snapshot, loading: ecosystemLoading } = useEcosystem(user?.id, pointHistory);
  const { profile, isLoading: profileLoading, loadProfile, getProfileDisplayIdentifier } = useProfileManager();
  const { totalCO2Saved, totalActions, overallStreak, refreshStats } = useHabitStats();
  const { goals, updateGoal, deleteGoal, refreshGoals } = useGoalsManager();
  const [dailyDose, setDailyDose] = useState<KnowledgeItemDetail | null>(null);
  const [dailyProduct, setDailyProduct] = useState<MarketplaceRecommendation | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<EnhancedGoal | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    const timeout = setTimeout(() => {
      if (!authLoading && !user) void router.replace('/auth/signin');
      if (!authLoading && user) void loadProfile();
    }, 100);
    return () => clearTimeout(timeout);
  }, [authLoading, loadProfile, router, user]));

  useFocusEffect(useCallback(() => {
    let active = true;
    void Promise.allSettled([refreshStats(), refreshGoals()]).then((results) => {
      if (!active) return;
      const failed = results.some((result) => result.status === 'rejected');
      setRefreshError(failed ? t('Some progress data could not be refreshed.', 'Част от данните за напредъка не можаха да се обновят.') : null);
    });
    return () => { active = false; };
  }, [refreshGoals, refreshStats, t]));

  useEffect(() => {
    analyticsService.trackScreenView('Home');
    if (user) analyticsService.setUserProperties({ userEmail: user.email || 'unknown', userCreatedAt: user.created_at || 'unknown' });
  }, [user]);

  useEffect(() => {
    let current = true;
    void knowledgeService.getKnowledgeHome({ userId: user?.id, locale })
      .then((result) => { if (current) setDailyDose(result.dailyDose); })
      .catch(() => undefined);
    return () => { current = false; };
  }, [user?.id, locale]);

  useEffect(() => {
    if (!marketplaceEnabled) return;
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    void marketplaceService.getHome(locale, date)
      .then((result) => setDailyProduct(result.dailyPick))
      .catch(() => undefined);
  }, [locale, marketplaceEnabled]);

  useEffect(() => {
    if (!user || typeof document === 'undefined') return;
    const handleFirstActivity = async (event: Event) => {
      const detail = (event as CustomEvent<{ userId?: string }>).detail;
      if (detail?.userId === user.id) await awardDailyCheckIn();
    };
    document.addEventListener('firstDailyActivity', handleFirstActivity);
    return () => document.removeEventListener('firstDailyActivity', handleFirstActivity);
  }, [awardDailyCheckIn, user]);

  const displayIdentifier = profile ? getProfileDisplayIdentifier() : '';
  const metrics = [
    { label: t('Actions taken', 'Изпълнени действия'), value: `${totalActions || 0}`, icon: 'checkmark-circle-outline' as const },
    { label: t('CO₂ saved', 'Спестен CO₂'), value: `${totalCO2Saved?.toFixed(1) || '0.0'} kg`, icon: 'cloud-outline' as const },
    { label: t('Current streak', 'Текуща серия'), value: `${overallStreak || 0} ${t('days', 'дни')}`, icon: 'flame-outline' as const },
  ];
  const actions = [
    { label: t('Explore your interests', 'Открий своите теми'), detail: t('Quick reads, quizzes and ideas for real life.', 'Кратки четива, тестове и идеи за ежедневието.'), emoji: '💡', icon: 'bulb-outline' as const, route: '/knowledge' as const },
    { label: t('Explore the map', 'Разгледай картата'), detail: t('Find greener places nearby.', 'Открий по-зелени места наблизо.'), emoji: '🧭', icon: 'map-outline' as const, route: '/map' as const },
    { label: t('Join a challenge', 'Включи се в предизвикателство'), detail: t('Grow together with the community.', 'Развивайте се заедно с общността.'), emoji: '🤝', icon: 'people-outline' as const, route: '/community/challenges' as const },
  ];

  const handleUpdateGoal = async (goalId: string, updates: { goalName: string; category: string; targetValue: number; currentValue: number; timeFrequency: TimeFrequency }) => updateGoal(goalId, updates);
  const handleDeleteGoal = async (goalId: string) => deleteGoal(goalId);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Content wide>
          <PageHeader
            eyebrow={t('Your compass', 'Твоят компас')}
            title={t(`Hello${displayIdentifier ? `, ${displayIdentifier}` : ''} 👋`, `Здравей${displayIdentifier ? `, ${displayIdentifier}` : ''} 👋`)}
            description={t('A small step today. A greener world tomorrow.', 'Малка стъпка днес. По-зелен свят утре.')}
            action={<AppButton label={t('Log action', 'Запиши действие')} icon="add" onPress={() => router.push('/habits/log')} />}
          />

          {ecosystemEnabled ? <View style={{ flexDirection: width >= 1180 ? 'row' : 'column', gap: 20, marginBottom: 22 }}>
            <View style={{ flex: width >= 1180 ? 1.6 : undefined }}><EcosystemHero snapshot={snapshot} loading={ecosystemLoading} onOpen={() => router.push('/ecosystem' as any)} /></View>
            <View style={{ flex: width >= 1180 ? 1 : undefined, justifyContent: 'center' }}><GrowthActions /></View>
          </View> : null}

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28 }}>
            {metrics.map((metric) => (
              <Card key={metric.label} style={{ flex: 1, padding: wide ? 18 : 10 }}>
                <View style={{ flexDirection: wide ? 'row' : 'column-reverse', alignItems: wide ? 'center' : 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[theme.typography.metric, { color: theme.colors.text, fontSize: wide ? 25 : 18 }]}>{metric.value}</Text>
                    <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3, fontSize: wide ? 14 : 11, lineHeight: wide ? 21 : 16 }]}>{metric.label}</Text>
                  </View>
                  <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={metric.icon} size={20} color={theme.colors.primary} /></View>
                </View>
              </Card>
            ))}
          </View>

          <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 14 }]}>{t('A little inspiration ✨', 'Малко вдъхновение ✨')}</Text>
          <View style={{ flexDirection: wide ? 'row' : 'column', gap: 12, marginBottom: 30 }}>
            <Card style={{ flex: 1, padding: 20, backgroundColor: theme.colors.accentSoft }}>
              <View style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="sparkles-outline" size={22} color={theme.colors.accent} /></View>
              <Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase', marginTop: 16 }]}>{t("Today's eco practice", 'Днешната еко практика')}</Text>
              <Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 6, marginBottom: 16 }]}>{t('A small challenge and reflection are ready.', 'Кратко предизвикателство и размисъл те очакват.')}</Text>
              <AppButton label={t('See today’s challenge', 'Виж днешната мисия')} icon="arrow-forward" onPress={() => router.push('/habits/today' as any)} />
            </Card>
            {dailyDose ? (
              <Card style={{ flex: 1, padding: 20 }}>
                {dailyDose.topicSlugs[0] && KNOWLEDGE_ILLUSTRATIONS[dailyDose.topicSlugs[0]] ? <Image source={KNOWLEDGE_ILLUSTRATIONS[dailyDose.topicSlugs[0]]} resizeMode="cover" style={{ width: '100%', height: 130, borderRadius: 14, marginBottom: 14 }} /> : null}
                <View style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="bulb-outline" size={22} color={theme.colors.primary} /></View>
                <Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase', marginTop: 16 }]}>{t('Daily knowledge dose', 'Дневна доза знание')}</Text>
                <Text numberOfLines={2} style={[theme.typography.h3, { color: theme.colors.text, marginTop: 6, marginBottom: 16 }]}>{dailyDose.title}</Text>
                <AppButton label={t('Learn why', 'Научи защо')} variant="secondary" icon="arrow-forward" onPress={() => router.push(`/knowledge/content/${dailyDose.slug}` as any)} />
              </Card>
            ) : null}
          </View>

          {dailyProduct ? (
            <Card style={{ padding: 20, marginBottom: 28, flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'flex-start', gap: 18 }}>
              <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: theme.colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="storefront-outline" size={23} color={theme.colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase', letterSpacing: 1 }]}>{t("Today's verified product", 'Днешният проверен продукт')}</Text>
                <Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 5 }]}>{dailyProduct.product.name[locale]}</Text>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3 }]}>{dailyProduct.reasons[0]?.[locale]}</Text>
              </View>
              <AppButton label={t('View Daily Pick', 'Виж днешния избор')} variant="secondary" icon="arrow-forward" onPress={() => router.push(`/marketplace/product/${dailyProduct.product.slug}` as any)} />
            </Card>
          ) : null}

          <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 14 }]}>{t('Choose your next move', 'Избери следващата си стъпка')}</Text>
          <View style={{ flexDirection: wide ? 'row' : 'column', gap: 12, marginBottom: 30 }}>
            {actions.map((action) => (
              <Pressable key={action.label} accessibilityRole="button" accessibilityLabel={action.label} onPress={() => router.push(action.route as any)} style={({ pressed }) => ({ flex: 1, padding: 20, borderRadius: 22, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: pressed ? theme.colors.primarySoft : theme.colors.surface })}>
                <View style={{ width: 43, height: 43, borderRadius: 14, backgroundColor: theme.colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}><Text style={{ fontSize: 25 }}>{action.emoji}</Text></View>
                <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{action.label}</Text>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 4, marginBottom: 14 }]}>{action.detail}</Text>
                <Ionicons name="arrow-forward" size={22} color={theme.colors.primary} />
              </Pressable>
            ))}
          </View>

          {refreshError ? <Text accessibilityRole="alert" style={[theme.typography.bodySmall, { color: theme.colors.danger, marginBottom: 12 }]}>{refreshError}</Text> : null}
          <Card style={{ padding: 20, marginBottom: 26 }}><GoalsHeader onAddGoal={() => router.push('habits/goal' as any)} /><GoalsList goals={goals} onEditGoal={(goal) => { setSelectedGoal(goal); setIsEditModalVisible(true); }} /></Card>
        </Content>
      </ScrollView>

      <EditGoalModal visible={isEditModalVisible} goal={selectedGoal} onClose={() => setIsEditModalVisible(false)} onSave={handleUpdateGoal} onDelete={handleDeleteGoal} loading={profileLoading} />
    </Screen>
  );
}
