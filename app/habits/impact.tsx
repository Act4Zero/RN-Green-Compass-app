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
      setError(loadError instanceof Error ? loadError.message : 'Данните за въздействието не можаха да се заредят.');
    } finally {
      setLoading(false);
    }
  }, [user, period]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Content>
          <PageHeader eyebrow="Въглероден баланс" title="Намаляването и компенсирането остават отделни" description="Проследените емисии, ориентировъчно избегнатите емисии и потвърдените компенсации се водят отделно. Остатъчният баланс е ориентировъчен и не е твърдение за въглеродна неутралност." />
          <SegmentedControl value={period} onChange={setPeriod} options={[{ value: 'day', label: 'Днес' }, { value: 'week', label: '7 дни' }, { value: 'month', label: '30 дни' }]} />
          {loading ? <Skeleton height={280} style={{ marginTop: theme.spacing.lg }} /> : error || !summary ? <StatePanel icon="cloud-offline-outline" title="Въздействието не е достъпно" message={error || 'Все още няма данни за въздействието.'} action={<AppButton label="Опитай отново" onPress={() => void load()} />} /> : (
            <View style={{ gap: theme.spacing.lg, marginTop: theme.spacing.lg }}>
              <CarbonBalanceCards summary={summary} />
              <Card><Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: theme.spacing.sm }]}>Ориентировъчно избегнат CO₂e по дни</Text><ImpactBars points={summary.series} /></Card>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                <MetricCard label="Избегнати пластмасови изделия" value={`${summary.metrics.plasticItemsAvoided}`} icon="water-outline" />
                <MetricCard label="Избегнати отпадъци" value={`${summary.metrics.wasteKgAvoided.toFixed(1)} kg`} icon="trash-outline" />
                <MetricCard label="Спестена вода" value={`${summary.metrics.waterLitresSaved.toFixed(0)} L`} icon="water-outline" />
              </View>
              <Card style={{ gap: theme.spacing.sm }}>
                <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Национален и световен ориентир</Text>
                {summary.countryBenchmark ? <Text style={[theme.typography.metric, { color: theme.colors.primary }]}>{summary.countryBenchmark.regionName}: {summary.countryBenchmark.tonnesCo2ePerCapita.toFixed(2)} t CO₂e/човек/година</Text> : <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Не е избран поддържан национален ориентир.</Text>}
                <Text style={[theme.typography.body, { color: theme.colors.text }]}>Световно: {summary.globalBenchmark.tonnesCo2ePerCapita.toFixed(2)} t CO₂e/човек/година · {summary.globalBenchmark.year}</Text>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.warning }]}>EDGAR отчита териториалните парникови газове без LULUCF. Green Compass обхваща само въведените от теб дейности, затова това е контекст, а не пряко сравнение.</Text>
                <AppButton label="Отвори методологията на EDGAR" icon="open-outline" variant="ghost" onPress={() => void Linking.openURL(summary.globalBenchmark.sourceUrl)} style={{ alignSelf: 'flex-start' }} />
              </Card>
              {summary.avoidedKgCo2e > 0 ? <Card style={{ gap: theme.spacing.xs, backgroundColor: theme.colors.primarySoft }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>Конкретен, но приблизителен еквивалент</Text><Text style={[theme.typography.metric, { color: theme.colors.primary }]}>{summary.treeSeedlingEquivalent.toFixed(2)} градски фиданки</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Годишен еквивалент на поглъщане според допусканията на EPA за растеж и оцеляване на фиданки за 10 години. Това не означава, че Green Compass е засадил дървета.</Text></Card> : null}
              <Card style={{ gap: theme.spacing.sm }}>
                <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Инерция на напредъка</Text>
                <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{summary.totalActions} проследени действия · {summary.challengeStreak} дни поред с дневно предизвикателство</Text>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Преките мерки остават в собствените си единици. Пластмаса, отпадъци, вода и CO₂e не се преобразуват едно в друго без документиран фактор.</Text>
              </Card>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                <AppButton label="Запиши измерима дейност" icon="add" onPress={() => router.push('/habits/activity' as any)} style={{ flex: 1 }} />
                <AppButton label="Проекти за компенсация" icon="leaf-outline" variant="secondary" onPress={() => router.push('/habits/offsets' as any)} style={{ flex: 1 }} />
                <AppButton label="Сподели обобщение" icon="share-outline" variant="secondary" onPress={() => void Share.share({ message: createPrivacySafeShareSummary({ metrics: summary.metrics, streak: summary.challengeStreak, locale: 'bg' }) })} style={{ flex: 1 }} />
              </View>
            </View>
          )}
        </Content>
      </ScrollView>
    </Screen>
  );
}
