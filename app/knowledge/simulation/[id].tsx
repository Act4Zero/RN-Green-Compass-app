import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { knowledgeService, useKnowledgeLocale, type SimulationInputs } from '@/features/knowledge';
import { useAppTheme } from '@/theme';

const LABELS = {
  'home-energy': [['Monthly energy use', 'Месечно потребление'], ['Clean energy share', 'Дял чиста енергия'], ['Efficiency improvement', 'Подобрение на ефективността']],
  'food-waste': [['Food purchased', 'Закупена храна'], ['Avoidable waste share', 'Дял предотвратим отпадък'], ['Composted share', 'Компостиран дял']],
  mobility: [['Weekly travel distance', 'Седмично разстояние'], ['Walking and cycling share', 'Дял ходене и колоездене'], ['Public transport share', 'Дял обществен транспорт']],
} as const;

export default function KnowledgeSimulationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useAppTheme();
  const { locale, t } = useKnowledgeLocale();
  const router = useRouter();
  const simulation = useMemo(() => knowledgeService.getSimulation(id), [id]);
  const [inputs, setInputs] = useState<SimulationInputs>({ primary: 100, secondary: 20, tertiary: 15 });
  const result = simulation ? knowledgeService.runSimulation(id, inputs, locale) : null;
  if (!simulation || !result) return <Screen><Content><StatePanel title={t('Lab unavailable', 'Лабораторията не е налична')} message={t('Choose another interactive tool from the Hub.', 'Изберете друг интерактивен инструмент от Hub.')} /></Content></Screen>;
  const labels = LABELS[simulation.kind];
  const keys: (keyof SimulationInputs)[] = ['primary', 'secondary', 'tertiary'];
  return <Screen><ScrollView><Content>
    <PageHeader eyebrow={t('Interactive impact lab', 'Интерактивна лаборатория')} title={simulation.kind === 'home-energy' ? t('Home energy scenario', 'Домашен енергиен сценарий') : simulation.kind === 'food-waste' ? t('Food waste scenario', 'Сценарий за хранителни отпадъци') : t('Mobility scenario', 'Сценарий за мобилност')} description={t('Adjust each input and compare the result with the documented baseline.', 'Променете показателите и сравнете резултата с документираната базова стойност.')} />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}><Card style={{ flex: 2, minWidth: 300, gap: 18 }}>{keys.map((key, index) => <StepControl key={key} label={labels[index][locale === 'bg' ? 1 : 0]} value={inputs[key]} percent={index > 0} onChange={(value) => setInputs((current) => ({ ...current, [key]: value }))} />)}</Card><Card elevated style={{ flex: 1, minWidth: 260, backgroundColor: theme.colors.primary }}><Text style={[theme.typography.label, { color: theme.colors.accent }]}>{t('YOUR SCENARIO', 'ВАШИЯТ СЦЕНАРИЙ')}</Text><Text style={[theme.typography.metric, { color: '#FFFFFF', marginTop: 12 }]}>{result.score}</Text><Text style={[theme.typography.bodySmall, { color: '#D8EAE0' }]}>{result.unit}</Text><Text style={[theme.typography.h2, { color: '#FFFFFF', marginTop: 24 }]}>{result.improvementPercent}%</Text><Text style={[theme.typography.body, { color: '#D8EAE0', marginTop: 6 }]}>{result.summary}</Text><Text style={[theme.typography.bodySmall, { color: '#D8EAE0', marginTop: 20 }]}>{t('Methodology source is shown with the related lesson. Results are educational estimates, not an audit.', 'Методологичният източник е посочен в свързания урок. Резултатите са образователна оценка, не одит.')}</Text></Card></View>
    <AppButton label={t('Back to interactive tools', 'Към интерактивните инструменти')} variant="ghost" onPress={() => router.replace('/knowledge' as any)} style={{ marginTop: 22, alignSelf: 'center' }} />
  </Content></ScrollView></Screen>;
}

function StepControl({ label, value, percent, onChange }: { label: string; value: number; percent?: boolean; onChange: (value: number) => void }) {
  const { theme } = useAppTheme();
  const step = percent ? 5 : 10;
  return <View><Text style={[theme.typography.label, { color: theme.colors.text }]}>{label}</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}><AppButton accessibilityLabel={`Decrease ${label}`} label="−" variant="secondary" onPress={() => onChange(Math.max(0, value - step))} /><Text accessibilityLiveRegion="polite" style={[theme.typography.metric, { color: theme.colors.primary, minWidth: 100, textAlign: 'center' }]}>{value}{percent ? '%' : ''}</Text><AppButton accessibilityLabel={`Increase ${label}`} label="+" variant="secondary" onPress={() => onChange(percent ? Math.min(100, value + step) : value + step)} /></View></View>;
}
