import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, Card, Content, PageHeader, Screen, Skeleton, StatePanel } from '@/components/ui';
import { useAppLocale } from '@/context/AppLocaleContext';
import { useAuth } from '@/context/AuthContext';
import { sustainabilityMapService } from '@/features/sustainability-map';
import { useAppTheme } from '@/theme';
import { PersonalMapImpact } from '@/types/map';
import { getCategoryConfig } from '@/utils/categoryUtils';

export default function MapImpactScreen() {
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
  const router = useRouter();
  const { user } = useAuth();
  const [impact, setImpact] = useState<PersonalMapImpact | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { if (user) void sustainabilityMapService.getMyImpact().then(setImpact).catch(() => setError(t('Unable to load impact.', 'Въздействието не може да бъде заредено.'))); }, [t, user]);
  if (!user) return <Screen><Content><StatePanel icon="lock-closed-outline" title={t('Sign in to view impact', 'Влезте, за да видите въздействието')} message={t('Your visit history and estimates are private to your account.', 'Историята на посещенията и оценките са видими само във вашия профил.')} action={<AppButton label={t('Sign in', 'Вход')} onPress={() => router.replace({ pathname: '/auth/signin', params: { next: '/map/impact' } })} />} /></Content></Screen>;
  return <Screen><ScrollView><Content>
    <PageHeader eyebrow={t('Private impact', 'Лично въздействие')} title={t('Your sustainability map journey', 'Твоето устойчиво пътуване по картата')} description={t('Visits are factual check-ins. Resource estimates appear only when a published methodology and measurable input are available.', 'Посещенията са реални отбелязвания. Оценки за ресурсите се показват само при публикувана методология и измерими данни.')} action={<AppButton label={t('Back to map', 'Назад към картата')} icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />
    {error ? <StatePanel icon="alert-circle-outline" title={t('Impact unavailable', 'Въздействието не е достъпно')} message={error} /> : !impact ? <><Skeleton height={140} /><Skeleton height={180} style={{ marginTop: 12 }} /></> : <View style={{ gap: theme.spacing.md }}>
      <View style={{ flexDirection: 'row', gap: theme.spacing.md, flexWrap: 'wrap' }}><Card elevated style={{ flex: 1, minWidth: 220 }}><Text style={[theme.typography.h1, { color: theme.colors.primary }]}>{impact.visitCount}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('recorded visits', 'записани посещения')}</Text></Card><Card elevated style={{ flex: 1, minWidth: 220 }}><Text style={[theme.typography.h1, { color: theme.colors.primary }]}>{impact.uniqueLocations}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('unique verified places', 'уникални проверени места')}</Text></Card></View>
      <Card style={{ gap: 10 }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{t('Visits by category', 'Посещения по категория')}</Text>{Object.entries(impact.byCategory).length ? Object.entries(impact.byCategory).map(([id, count]) => { const category = getCategoryConfig(id as any); return <View key={id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}><Text style={[theme.typography.body, { color: theme.colors.text }]}>{t(category.label, category.labelBg)}</Text><Text style={[theme.typography.label, { color: theme.colors.primary }]}>{count}</Text></View>; }) : <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('Check in at your first verified place to begin.', 'Отбележете първото си проверено място, за да започнете.')}</Text>}</Card>
      <Card style={{ gap: 10 }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{t('Documented estimates', 'Документирани оценки')}</Text>{impact.estimates.length ? impact.estimates.map((estimate) => <View key={`${estimate.metric}:${estimate.methodologyVersion}`}><Text style={[theme.typography.label, { color: theme.colors.text }]}>{estimate.value.toFixed(2)} {estimate.unit}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('Estimate', 'Оценка')} · {t('methodology', 'методология')} {estimate.methodologyVersion}</Text></View>) : <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('No resource estimate is shown from a visit alone. Green Compass will never translate an EV-station check-in directly into avoided CO₂.', 'Само посещение не е достатъчно за оценка на ресурсите. Green Compass никога няма да превърне отбелязване на зарядна станция директно в избегнати емисии CO₂.')}</Text>}</Card>
    </View>}
  </Content></ScrollView></Screen>;
}
