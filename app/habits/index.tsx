import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { ActionCard, ImpactBars, MetricCard, titleForTier } from '@/components/offsetting/OffsettingUI';
import { AppButton, Card, Content, PageHeader, Screen, Skeleton, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { offsettingService, type OffsettingDashboard } from '@/features/offsetting';
import type { KnowledgeItemSummary } from '@/features/knowledge';
import { fetchUserProfile } from '@/services/profile';
import { useAppTheme } from '@/theme';

const localDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export default function HabitsOverview() {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<OffsettingDashboard | null>(null);
  const [recommendations, setRecommendations] = useState<KnowledgeItemSummary[]>([]);
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
      const activeCategories = Object.keys(data.impact.byCategory || {});
      setRecommendations(await offsettingService.getPersonalizedKnowledge(interests, activeCategories, user.id, data.learningStage));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load your impact dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => {
    if (!authLoading && !user) router.replace('/auth/signin');
    else if (user) void load();
  }, [authLoading, user, router, load]));

  const quickActions = [
    { title: 'Log an action', description: 'Record a sustainable habit and its estimated impact.', icon: 'add-circle-outline' as const, route: '/habits/log' },
    { title: 'Set a goal', description: 'Turn a priority into a measurable target.', icon: 'flag-outline' as const, route: '/habits/goal' },
    { title: 'Review history', description: 'See completed habits, goals, and calendar activity.', icon: 'calendar-outline' as const, route: '/habits/history' },
    { title: 'Compare travel', description: 'Weigh plane, train, bus, boat, and car options.', icon: 'navigate-outline' as const, route: '/habits/travel' },
  ];

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}>
        <Content wide>
          <PageHeader eyebrow="Habit-based impact" title="Your sustainability compass" description="Build your green identity, choose one achievable action today, and keep estimated impact visible over time." action={isTablet ? <AppButton label="Today" icon="sunny-outline" onPress={() => router.push('/habits/today' as any)} /> : undefined} />

          {loading ? <View style={{ gap: theme.spacing.md }}><Skeleton height={190} /><Skeleton height={120} /></View> : error ? <StatePanel icon="cloud-offline-outline" title="Impact dashboard unavailable" message={error} action={<AppButton label="Try again" onPress={() => void load()} />} /> : dashboard ? (
            <>
              {!dashboard.identity ? (
                <Card elevated style={{ backgroundColor: theme.colors.primary, borderColor: theme.colors.primary, marginBottom: theme.spacing.lg }}>
                  <View style={{ maxWidth: 720, gap: theme.spacing.sm }}>
                    <Text style={[theme.typography.label, { color: theme.colors.accent, textTransform: 'uppercase' }]}>Start with your baseline</Text>
                    <Text style={[theme.typography.h1, { color: '#FFFFFF' }]}>Discover your green identity</Text>
                    <Text style={[theme.typography.body, { color: '#DDECE3' }]}>Answer a short guided assessment to estimate the travel and household-energy sources you track. Results are directional estimates, not verified offsets.</Text>
                    <AppButton label="Start assessment" icon="arrow-forward" variant="secondary" onPress={() => router.push('/habits/identity' as any)} style={{ alignSelf: 'flex-start', marginTop: 8 }} />
                  </View>
                </Card>
              ) : (
                <Card elevated style={{ backgroundColor: theme.colors.primary, borderColor: theme.colors.primary, marginBottom: theme.spacing.lg }}>
                  <View style={{ flexDirection: isTablet ? 'row' : 'column', justifyContent: 'space-between', gap: theme.spacing.lg }}>
                    <View style={{ flex: 1, gap: theme.spacing.xs }}>
                      <Text style={[theme.typography.label, { color: theme.colors.accent, textTransform: 'uppercase' }]}>{titleForTier(dashboard.identity.identityTier)}</Text>
                      <Text style={[theme.typography.h1, { color: '#FFFFFF' }]}>{dashboard.identity.identityScore}/100 identity score</Text>
                      <Text style={[theme.typography.body, { color: '#DDECE3' }]}>Estimated tracked baseline: {dashboard.identity.annualBaselineKgCo2e.toFixed(0)} kg CO₂e/year across assessed mobility and household electricity.</Text>
                    </View>
                    <AppButton label="Update identity" variant="secondary" onPress={() => router.push('/habits/identity' as any)} />
                  </View>
                </Card>
              )}

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
                <MetricCard label="CO₂e avoided" value={`${dashboard.impact.metrics.co2eKgAvoided.toFixed(1)} kg`} icon="cloud-outline" />
                <MetricCard label="Actions" value={`${dashboard.impact.totalActions}`} icon="checkmark-circle-outline" />
                <MetricCard label="Challenge streak" value={`${dashboard.impact.challengeStreak} days`} icon="flame-outline" />
              </View>

              {dashboard.dailyChallenge ? (
                <Card style={{ marginBottom: theme.spacing.lg, backgroundColor: dashboard.dailyChallenge.completedAt ? theme.colors.primarySoft : theme.colors.accentSoft }}>
                  <View style={{ flexDirection: isTablet ? 'row' : 'column', alignItems: isTablet ? 'center' : 'flex-start', gap: theme.spacing.md }}>
                    <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={dashboard.dailyChallenge.completedAt ? 'checkmark' : 'sparkles-outline'} size={23} color={theme.colors.accent} /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{dashboard.dailyChallenge.completedAt ? 'Completed today' : `${dashboard.learningStage} daily challenge`}</Text>
                      <Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 4 }]}>{dashboard.dailyChallenge.challenge.title}</Text>
                      <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 4 }]}>{dashboard.dailyChallenge.challenge.description}</Text>
                    </View>
                    <AppButton label={dashboard.dailyChallenge.completedAt ? 'Reflect' : 'Open today'} icon="arrow-forward" onPress={() => router.push('/habits/today' as any)} />
                  </View>
                </Card>
              ) : null}

              <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: theme.spacing.sm }]}>Your last seven days</Text>
              <Card style={{ marginBottom: theme.spacing.xl }}><ImpactBars points={dashboard.impact.series} /></Card>

              <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: theme.spacing.sm }]}>Choose your next move</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.xl }}>
                {quickActions.map((action) => <ActionCard key={action.title} title={action.title} description={action.description} icon={action.icon} onPress={() => router.push(action.route as any)} />)}
              </View>

              {recommendations.length ? (
                <>
                  <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: theme.spacing.sm }]}>Recommended for you</Text>
                  <View style={{ gap: theme.spacing.sm }}>
                    {recommendations.slice(0, 3).map((item) => (
                      <Card key={item.id} style={{ flexDirection: isTablet ? 'row' : 'column', alignItems: isTablet ? 'center' : 'flex-start', gap: theme.spacing.md }}>
                        <View style={{ flex: 1 }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{item.title}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 4 }]}>{item.summary}</Text></View>
                        <AppButton label={item.type === 'quiz' ? 'Take quiz' : 'Learn why'} variant="secondary" onPress={() => router.push((item.type === 'quiz' ? `/knowledge/quiz/${item.id}` : `/knowledge/content/${item.slug}`) as any)} />
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
