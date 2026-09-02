import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { ActionCard, ImpactBars, MetricCard, titleForTier } from '@/components/offsetting/OffsettingUI';
import { AppButton, Card, Content, PageHeader, Screen, Skeleton, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { offsettingService, type CarbonBalanceSummary, type OffsettingDashboard, type PersonalizedCarbonTip } from '@/features/offsetting';
import type { KnowledgeItemSummary } from '@/features/knowledge';
import { fetchUserProfile } from '@/services/profile';
import { useAppTheme } from '@/theme';
import { useAppLocale } from '@/context/AppLocaleContext';
import { localizeCarbonTip, localizeChallenge } from '@/features/offsetting/localization';

const localDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export default function HabitsOverview() {
  const { theme } = useAppTheme();
  const { locale, t } = useAppLocale();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<OffsettingDashboard | null>(null);
  const [recommendations, setRecommendations] = useState<KnowledgeItemSummary[]>([]);
  const [carbonBalance, setCarbonBalance] = useState<CarbonBalanceSummary | null>(null);
  const [gamification, setGamification] = useState({ totalPoints: 0, level: 'Carbon Cutter' });
  const [carbonTips, setCarbonTips] = useState<PersonalizedCarbonTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (!user) return;
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const profile = await fetchUserProfile(user.id);
      const interests = profile?.interests || [];
      const data = await offsettingService.getDashboard(user.id, localDate(), interests);
      setDashboard(data);
      const [balance, progress, tips] = await Promise.all([offsettingService.getCarbonBalance(user.id, 'week'), offsettingService.getGamificationLevel(user.id), offsettingService.getPersonalizedCarbonTips(user.id, interests, Object.keys(data.impact.byCategory || {}))]);
      setCarbonBalance(balance); setGamification(progress); setCarbonTips(tips);
      const activeCategories = Object.keys(data.impact.byCategory || {});
      setRecommendations(await offsettingService.getPersonalizedKnowledge(interests, activeCategories, user.id, data.learningStage));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t('Unable to load your impact dashboard.', 'Таблото за въздействие не можа да се зареди.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t, user]);

  useFocusEffect(useCallback(() => {
    if (!authLoading && !user) router.replace('/auth/signin');
    else if (user) void load();
  }, [authLoading, user, router, load]));

  const quickActions = [
    { title: t('Log measured activity', 'Запиши измерена дейност'), description: t('Record emissions with a reviewed factor snapshot.', 'Запиши емисии с проверен коефициент.'), icon: 'calculator-outline' as const, route: '/habits/activity' },
    { title: t('Carbon goals', 'Въглеродни цели'), description: t('Create measurable reduction and consistency goals.', 'Създай измерими цели за намаляване и постоянство.'), icon: 'flag-outline' as const, route: '/habits/carbon-goals' },
    { title: t('Review history', 'Преглед на историята'), description: t('See completed habits, goals, and calendar activity.', 'Виж изпълнените навици, цели и дейности в календара.'), icon: 'calendar-outline' as const, route: '/habits/history' },
    { title: t('Compare travel', 'Сравни пътуване'), description: t('Weigh plane, train, bus, boat, and car options.', 'Сравни самолет, влак, автобус, кораб и автомобил.'), icon: 'navigate-outline' as const, route: '/habits/travel' },
    { title: t('Action reminders', 'Напомняния'), description: t('Schedule local nudges on this device.', 'Планирай напомняния на това устройство.'), icon: 'notifications-outline' as const, route: '/habits/reminders' },
    { title: t('Offset projects', 'Проекти за компенсация'), description: t('Review provider-hosted verified climate contributions.', 'Разгледай проверени климатични приноси от доставчици.'), icon: 'leaf-outline' as const, route: '/habits/offsets' },
    { title: t('Privacy & leaderboards', 'Поверителност и класации'), description: t('Choose whether aggregate points and streak may be ranked.', 'Избери дали общите точки и серията могат да участват в класация.'), icon: 'shield-outline' as const, route: '/habits/privacy' },
  ];
  const dailyChallengeCopy = dashboard?.dailyChallenge ? localizeChallenge(dashboard.dailyChallenge.challenge, locale) : null;
  const carbonTipCopies = carbonTips.map((tip) => localizeCarbonTip(tip, locale));

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}>
        <Content wide>
          <PageHeader eyebrow={t('Habit-based impact', 'Въздействие чрез навици')} title={t('Your sustainability compass', 'Твоят компас за устойчивост')} description={t('Build your green identity, choose one achievable action today, and keep estimated impact visible over time.', 'Изгради своята зелена идентичност, избери едно постижимо действие днес и следи оцененото въздействие във времето.')} action={isTablet ? <AppButton label={t('Today', 'Днес')} icon="sunny-outline" onPress={() => router.push('/habits/today' as any)} /> : undefined} />

          {loading ? <View style={{ gap: theme.spacing.md }}><Skeleton height={190} /><Skeleton height={120} /></View> : error ? <StatePanel icon="cloud-offline-outline" title={t('Impact dashboard unavailable', 'Таблото за въздействие не е достъпно')} message={error} action={<AppButton label={t('Try again', 'Опитай отново')} onPress={() => void load()} />} /> : dashboard ? (
            <>
              {!dashboard.identity ? (
                <Card elevated style={{ backgroundColor: theme.colors.primary, borderColor: theme.colors.primary, marginBottom: theme.spacing.lg }}>
                  <View style={{ maxWidth: 720, gap: theme.spacing.sm }}>
                    <Text style={[theme.typography.label, { color: theme.colors.accent, textTransform: 'uppercase' }]}>{t('Start with your baseline', 'Започни от своята основа')}</Text>
                    <Text style={[theme.typography.h1, { color: '#FFFFFF' }]}>{t('Discover your green identity', 'Открий своята зелена идентичност')}</Text>
                    <Text style={[theme.typography.body, { color: '#DDECE3' }]}>{t('Answer a short guided assessment to estimate the travel and household-energy sources you track. Results are directional estimates, not verified offsets.', 'Отговори на кратка насочена оценка за пътуването и домашната енергия. Резултатите са ориентировъчни оценки, а не проверени компенсации.')}</Text>
                    <AppButton label={t('Start assessment', 'Започни оценката')} icon="arrow-forward" variant="secondary" onPress={() => router.push('/habits/identity' as any)} style={{ alignSelf: 'flex-start', marginTop: 8 }} />
                  </View>
                </Card>
              ) : (
                <Card elevated style={{ backgroundColor: theme.colors.primary, borderColor: theme.colors.primary, marginBottom: theme.spacing.lg }}>
                  <View style={{ flexDirection: isTablet ? 'row' : 'column', justifyContent: 'space-between', gap: theme.spacing.lg }}>
                    <View style={{ flex: 1, gap: theme.spacing.xs }}>
                      <Text style={[theme.typography.label, { color: theme.colors.accent, textTransform: 'uppercase' }]}>{t(titleForTier(dashboard.identity.identityTier), dashboard.identity.identityTier === 'impact_leader' ? 'Лидер по въздействие' : dashboard.identity.identityTier === 'green_builder' ? 'Зелен създател' : 'Еко изследовател')}</Text>
                      <Text style={[theme.typography.h1, { color: '#FFFFFF' }]}>{dashboard.identity.identityScore}/100 {t('identity score', 'оценка на идентичността')}</Text>
                      <Text style={[theme.typography.body, { color: '#DDECE3' }]}>{t(`Estimated tracked baseline: ${dashboard.identity.annualBaselineKgCo2e.toFixed(0)} kg CO₂e/year across assessed mobility, energy, food, purchases, and waste.`, `Оценена проследявана база: ${dashboard.identity.annualBaselineKgCo2e.toFixed(0)} kg CO₂e/година за мобилност, енергия, храна, покупки и отпадъци.`)}</Text>
                      {dashboard.identity.assessmentVersion !== '2026.2' || dashboard.identity.isPartial ? <Text style={[theme.typography.bodySmall, { color: theme.colors.accent }]}>{t('Your saved assessment is partial. Update to 2026.2 for the expanded baseline and country benchmark.', 'Запазената оценка е частична. Обновете до версия 2026.2 за разширена база и сравнение по държава.')}</Text> : null}
                    </View>
                    <AppButton label={t('Update identity', 'Обнови идентичността')} variant="secondary" onPress={() => router.push('/habits/identity' as any)} />
                  </View>
                </Card>
              )}

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
                <MetricCard label={t('Gross tracked · 7 days', 'Общо проследено · 7 дни')} value={`${(carbonBalance?.grossTrackedKgCo2e || 0).toFixed(1)} kg`} icon="analytics-outline" />
                <MetricCard label={t('Estimated avoided', 'Оценено избегнато')} value={`${(carbonBalance?.avoidedKgCo2e || dashboard.impact.metrics.co2eKgAvoided).toFixed(1)} kg`} icon="leaf-outline" />
                <MetricCard label={t('Retired offsets', 'Приключени компенсации')} value={`${(carbonBalance?.retiredOffsetKgCo2e || 0).toFixed(1)} kg`} icon="shield-checkmark-outline" />
                <MetricCard label={t('Remaining balance', 'Оставащ баланс')} value={`${(carbonBalance?.netBalanceKgCo2e || 0).toFixed(1)} kg`} icon="scale-outline" />
                <MetricCard label={t(gamification.level, gamification.level === 'Carbon Cutter' ? 'Намаляване на въглерода' : gamification.level)} value={`${gamification.totalPoints} ${t('pts', 'т.')}`} icon="ribbon-outline" />
                <MetricCard label={t('Challenge streak', 'Серия от предизвикателства')} value={`${dashboard.impact.challengeStreak} ${t('days', 'дни')}`} icon="flame-outline" />
              </View>

              {dashboard.dailyChallenge ? (
                <Card style={{ marginBottom: theme.spacing.lg, backgroundColor: dashboard.dailyChallenge.completedAt ? theme.colors.primarySoft : theme.colors.accentSoft }}>
                  <View style={{ flexDirection: isTablet ? 'row' : 'column', alignItems: isTablet ? 'center' : 'flex-start', gap: theme.spacing.md }}>
                    <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={dashboard.dailyChallenge.completedAt ? 'checkmark' : 'sparkles-outline'} size={23} color={theme.colors.accent} /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{dashboard.dailyChallenge.completedAt ? t('Completed today', 'Завършено днес') : t(`${dashboard.learningStage} daily challenge`, `Дневно предизвикателство · ${dashboard.learningStage === 'advanced' ? 'напреднало' : dashboard.learningStage === 'intermediate' ? 'средно' : 'начално'}`)}</Text>
                      <Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 4 }]}>{dailyChallengeCopy?.title}</Text>
                      <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 4 }]}>{dailyChallengeCopy?.description}</Text>
                    </View>
                    <AppButton label={dashboard.dailyChallenge.completedAt ? t('Reflect', 'Направи равносметка') : t('Open today', 'Отвори за днес')} icon="arrow-forward" onPress={() => router.push('/habits/today' as any)} />
                  </View>
                </Card>
              ) : null}

              <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: theme.spacing.sm }]}>{t('Your last seven days', 'Последните ти седем дни')}</Text>
              <Card style={{ marginBottom: theme.spacing.xl }}><ImpactBars points={dashboard.impact.series} /></Card>

              <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: theme.spacing.sm }]}>{t('Choose your next move', 'Избери следващата си стъпка')}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.xl }}>
                {quickActions.map((action) => <ActionCard key={action.title} title={action.title} description={action.description} icon={action.icon} onPress={() => router.push(action.route as any)} />)}
              </View>

              {carbonTipCopies.length ? <><Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: theme.spacing.sm }]}>{t('Personalized carbon tips', 'Персонализирани въглеродни съвети')}</Text><View style={{ gap: theme.spacing.sm, marginBottom: theme.spacing.xl }}>{carbonTipCopies.map((tip) => <Card key={tip.id} style={{ gap: theme.spacing.xs }}><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{tip.category}</Text><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{tip.title}</Text><Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{tip.description}</Text><Text style={[theme.typography.label, { color: theme.colors.success }]}>{tip.expectedImpact}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('Assumption', 'Допуск')}: {tip.assumption}</Text><AppButton label={t('Learn the methodology', 'Виж методологията')} variant="ghost" onPress={() => router.push(`/knowledge/content/${tip.knowledgeSlug}` as any)} style={{ alignSelf: 'flex-start' }} /></Card>)}</View></> : null}

              {recommendations.length ? (
                <>
                  <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: theme.spacing.sm }]}>{t('Recommended for you', 'Препоръчано за теб')}</Text>
                  <View style={{ gap: theme.spacing.sm }}>
                    {recommendations.slice(0, 3).map((item) => (
                      <Card key={item.id} style={{ flexDirection: isTablet ? 'row' : 'column', alignItems: isTablet ? 'center' : 'flex-start', gap: theme.spacing.md }}>
                        <View style={{ flex: 1 }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{item.title}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 4 }]}>{item.summary}</Text></View>
                        <AppButton label={item.type === 'quiz' ? t('Take quiz', 'Реши теста') : t('Learn why', 'Научи защо')} variant="secondary" onPress={() => router.push((item.type === 'quiz' ? `/knowledge/quiz/${item.id}` : `/knowledge/content/${item.slug}`) as any)} />
                      </Card>
                    ))}
                  </View>
                </>
              ) : null}
            </>
          ) : null}
        </Content>
      </ScrollView>
    </Screen>
  );
}
