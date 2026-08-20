import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { knowledgeService, useKnowledgeLocale } from '@/features/knowledge';
import { useAppTheme } from '@/theme';

export default function KnowledgeTourScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useAppTheme();
  const { locale, t } = useKnowledgeLocale();
  const router = useRouter();
  const tour = useMemo(() => knowledgeService.getTour(id), [id]);
  const [index, setIndex] = useState(0);
  if (!tour) return <Screen><Content><StatePanel title={t('Tour unavailable', 'Обиколката не е налична')} message={t('Return to the Hub and choose another experience.', 'Върнете се в Hub и изберете друго преживяване.')} /></Content></Screen>;
  const stop = tour.stops[index];
  const percent = Math.round(((index + 1) / tour.stops.length) * 100);
  return <Screen><ScrollView><Content>
    <PageHeader eyebrow={t('Interactive field visit', 'Интерактивно посещение')} title={stop.title[locale]} description={t(`${tour.durationMinutes} minutes • ${tour.stops.length} guided stops`, `${tour.durationMinutes} минути • ${tour.stops.length} спирки`)} />
    <View accessibilityLabel={`${percent}%`} style={{ height: 8, borderRadius: 4, backgroundColor: theme.colors.surfaceStrong, overflow: 'hidden', marginBottom: 24 }}><View style={{ height: '100%', width: `${percent}%`, backgroundColor: theme.colors.primary }} /></View>
    <Card elevated style={{ minHeight: 350, padding: 28, justifyContent: 'space-between' }}>
      <View><View style={{ width: 58, height: 58, borderRadius: 20, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={stop.icon as any} size={28} color={theme.colors.primary} /></View><Text accessibilityRole="header" style={[theme.typography.h1, { color: theme.colors.text, marginTop: 22 }]}>{stop.title[locale]}</Text><Text style={[theme.typography.body, { color: theme.colors.text, lineHeight: 28, marginTop: 14 }]}>{stop.body[locale]}</Text></View>
      <View style={{ backgroundColor: theme.colors.accentSoft, borderRadius: theme.radii.lg, padding: 18, marginTop: 28 }}><Text style={[theme.typography.label, { color: theme.colors.primary }]}>{t('FIELD NOTE', 'ТЕРЕННА БЕЛЕЖКА')}</Text><Text style={[theme.typography.body, { color: theme.colors.text, marginTop: 6 }]}>{stop.fact[locale]}</Text></View>
    </Card>
    <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}><AppButton label={t('Previous', 'Назад')} variant="ghost" disabled={index === 0} onPress={() => setIndex((value) => value - 1)} style={{ flex: 1 }} /><AppButton label={index === tour.stops.length - 1 ? t('Complete tour', 'Завърши') : t('Next stop', 'Следваща спирка')} icon="arrow-forward" onPress={() => index === tour.stops.length - 1 ? router.replace('/knowledge' as any) : setIndex((value) => value + 1)} style={{ flex: 1 }} /></View>
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20 }}>{tour.stops.map((entry, stopIndex) => <Pressable key={entry.id} accessibilityRole="button" accessibilityLabel={`${t('Stop', 'Спирка')} ${stopIndex + 1}`} onPress={() => setIndex(stopIndex)} style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: stopIndex === index ? theme.colors.primary : theme.colors.borderStrong }} />)}</View>
  </Content></ScrollView></Screen>;
}
