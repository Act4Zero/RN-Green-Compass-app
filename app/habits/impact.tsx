import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Linking, ScrollView, Share, Text, View } from 'react-native';
import { CarbonBalanceCards, ImpactBars, MetricCard } from '@/components/offsetting/OffsettingUI';
import { AppButton, Card, Content, PageHeader, Screen, SegmentedControl, Skeleton, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { createPrivacySafeShareSummary, offsettingService, type CarbonBalanceSummary, type ImpactSummary } from '@/features/offsetting';
import { useAppTheme } from '@/theme';

export default function ImpactScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [period, setPeriod] = useState<ImpactSummary['period']>('week');
  const [summary, setSummary] = useState<CarbonBalanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setSummary(await offsettingService.getCarbonBalance(user.id, period));
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
          <PageHeader eyebrow="Carbon balance" title="Reduction and compensation stay separate" description="Tracked emissions, estimated avoidance, and provider-confirmed offsets use separate ledgers. The remaining balance is directional and never a carbon-neutrality claim." />
          <SegmentedControl value={period} onChange={setPeriod} options={[{ value: 'day', label: 'Today' }, { value: 'week', label: '7 days' }, { value: 'month', label: '30 days' }]} />
          {loading ? <Skeleton height={280} style={{ marginTop: theme.spacing.lg }} /> : error || !summary ? <StatePanel icon="cloud-offline-outline" title="Impact is unavailable" message={error || 'No impact data is available yet.'} action={<AppButton label="Try again" onPress={() => void load()} />} /> : (
            <View style={{ gap: theme.spacing.lg, marginTop: theme.spacing.lg }}>
              <CarbonBalanceCards summary={summary} />
              <Card><Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: theme.spacing.sm }]}>Estimated CO₂e avoided by day</Text><ImpactBars points={summary.series} /></Card>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                <MetricCard label="Plastic items directly avoided" value={`${summary.metrics.plasticItemsAvoided}`} icon="water-outline" />
                <MetricCard label="Waste directly avoided" value={`${summary.metrics.wasteKgAvoided.toFixed(1)} kg`} icon="trash-outline" />
                <MetricCard label="Water directly saved" value={`${summary.metrics.waterLitresSaved.toFixed(0)} L`} icon="water-outline" />
              </View>
              <Card style={{ gap: theme.spacing.sm }}>
                <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Country and global reference</Text>
                {summary.countryBenchmark ? <Text style={[theme.typography.metric, { color: theme.colors.primary }]}>{summary.countryBenchmark.regionName}: {summary.countryBenchmark.tonnesCo2ePerCapita.toFixed(2)} t CO₂e/person/year</Text> : <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>No supported country benchmark is selected.</Text>}
                <Text style={[theme.typography.body, { color: theme.colors.text }]}>Global: {summary.globalBenchmark.tonnesCo2ePerCapita.toFixed(2)} t CO₂e/person/year · {summary.globalBenchmark.year}</Text>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.warning }]}>EDGAR reports territorial greenhouse gases excluding LULUCF. Your Green Compass tracker covers only activities you enter, so this is context—not an above/below comparison.</Text>
                <AppButton label="Open EDGAR methodology" icon="open-outline" variant="ghost" onPress={() => void Linking.openURL(summary.globalBenchmark.sourceUrl)} style={{ alignSelf: 'flex-start' }} />
              </Card>
              {summary.avoidedKgCo2e > 0 ? <Card style={{ gap: theme.spacing.xs, backgroundColor: theme.colors.primarySoft }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>A concrete—but approximate—equivalent</Text><Text style={[theme.typography.metric, { color: theme.colors.primary }]}>{summary.treeSeedlingEquivalent.toFixed(2)} urban tree seedlings</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Annual sequestration equivalent using EPA growth and survival assumptions for seedlings grown for 10 years. This does not mean Green Compass planted trees.</Text></Card> : null}
              <Card style={{ gap: theme.spacing.sm }}>
                <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Momentum</Text>
                <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{summary.totalActions} tracked actions · {summary.challengeStreak}-day daily-challenge streak</Text>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Direct measures stay in their own units. Plastic, waste, water, and CO₂e are never converted into one another without a documented factor.</Text>
              </Card>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                <AppButton label="Log measured activity" icon="add" onPress={() => router.push('/habits/activity' as any)} style={{ flex: 1 }} />
                <AppButton label="Offset projects" icon="leaf-outline" variant="secondary" onPress={() => router.push('/habits/offsets' as any)} style={{ flex: 1 }} />
                <AppButton label="Share summary" icon="share-outline" variant="secondary" onPress={() => void Share.share({ message: createPrivacySafeShareSummary({ metrics: summary.metrics, streak: summary.challengeStreak }) })} style={{ flex: 1 }} />
              </View>
            </View>
          )}
        </Content>
      </ScrollView>
    </Screen>
  );
}
