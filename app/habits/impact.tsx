import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, Share, Text, View } from 'react-native';
import { ImpactBars, MetricCard } from '@/components/offsetting/OffsettingUI';
import { AppButton, Card, Content, PageHeader, Screen, SegmentedControl, Skeleton, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { createPrivacySafeShareSummary, offsettingService, type ImpactSummary } from '@/features/offsetting';
import { useAppTheme } from '@/theme';

export default function ImpactScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [period, setPeriod] = useState<ImpactSummary['period']>('week');
  const [summary, setSummary] = useState<ImpactSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setSummary(await offsettingService.getImpactSummary(user.id, period));
    } catch (loadError) {
      setSummary(null);
      setError(loadError instanceof Error ? loadError.message : 'Unable to load impact data.');
    } finally {
      setLoading(false);
    }
  }, [user, period]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Content>
          <PageHeader eyebrow="Impact tracker" title="Small actions add up" description="These figures combine logged habits, completed daily challenges, and saved travel comparisons. They are estimates, not verified carbon offsets." />
          <SegmentedControl value={period} onChange={setPeriod} options={[{ value: 'day', label: 'Today' }, { value: 'week', label: '7 days' }, { value: 'month', label: '30 days' }]} />
          {loading ? <Skeleton height={280} style={{ marginTop: theme.spacing.lg }} /> : error || !summary ? <StatePanel icon="cloud-offline-outline" title="Impact is unavailable" message={error || 'No impact data is available yet.'} action={<AppButton label="Try again" onPress={() => void load()} />} /> : (
            <View style={{ gap: theme.spacing.lg, marginTop: theme.spacing.lg }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                <MetricCard label="CO₂e avoided" value={`${summary.metrics.co2eKgAvoided.toFixed(1)} kg`} icon="cloud-outline" />
                <MetricCard label="Plastic items" value={`${summary.metrics.plasticItemsAvoided}`} icon="water-outline" />
                <MetricCard label="Waste avoided" value={`${summary.metrics.wasteKgAvoided.toFixed(1)} kg`} icon="trash-outline" />
                <MetricCard label="Water saved" value={`${summary.metrics.waterLitresSaved.toFixed(0)} L`} icon="water-outline" />
              </View>
              <Card><Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: theme.spacing.sm }]}>Estimated CO₂e avoided by day</Text><ImpactBars points={summary.series} /></Card>
              <Card style={{ gap: theme.spacing.sm }}>
                <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Momentum</Text>
                <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{summary.totalActions} tracked actions · {summary.challengeStreak}-day daily-challenge streak</Text>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Direct measures stay in their own units. Plastic, waste, water, and CO₂e are never converted into one another without a documented factor.</Text>
              </Card>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                <AppButton label="Log another action" icon="add" onPress={() => router.push('/habits/log')} style={{ flex: 1 }} />
                <AppButton label="Share summary" icon="share-outline" variant="secondary" onPress={() => void Share.share({ message: createPrivacySafeShareSummary({ metrics: summary.metrics, streak: summary.challengeStreak }) })} style={{ flex: 1 }} />
              </View>
            </View>
          )}
        </Content>
      </ScrollView>
    </Screen>
  );
}
