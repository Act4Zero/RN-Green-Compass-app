import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { ChoiceChips } from '@/components/offsetting/OffsettingUI';
import { AppButton, AppInput, Card, Content, PageHeader, Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { FACTOR_SOURCE_URL, offsettingService, type TravelEstimate, type TravelMode } from '@/features/offsetting';
import { useAppTheme } from '@/theme';

const modes: { value: TravelMode; label: string }[] = [{ value: 'plane', label: 'Самолет' }, { value: 'train', label: 'Влак' }, { value: 'bus', label: 'Автобус' }, { value: 'boat', label: 'Кораб' }, { value: 'car', label: 'Автомобил' }];
const modeLabels = Object.fromEntries(modes.map((mode) => [mode.value, mode.label])) as Record<TravelMode, string>;

export default function TravelFootprintScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [distance, setDistance] = useState('100');
  const [roundTrip, setRoundTrip] = useState(false);
  const [occupancy, setOccupancy] = useState('1');
  const [selectedMode, setSelectedMode] = useState<TravelMode>('train');
  const [comparisonMode, setComparisonMode] = useState<TravelMode>('car');
  const [estimate, setEstimate] = useState<TravelEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const calculate = () => {
    try {
      setEstimate(offsettingService.calculateTravel({ distanceKm: Number(distance.replace(',', '.')), roundTrip, carOccupancy: Number(occupancy), selectedMode, comparisonMode }));
      setError(null);
    } catch (calculationError) {
      setEstimate(null);
      setError(calculationError instanceof Error ? calculationError.message : 'Въведи валидно разстояние.');
    }
  };

  const save = async () => {
    if (!user || !estimate) return;
    setSaving(true);
    await offsettingService.saveTravelEstimate(user.id, estimate);
    setSaving(false);
    router.replace('/habits/impact' as any);
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Content>
          <PageHeader eyebrow="Отпечатък от пътуване" title="Сравни възможностите" description="Изчисли ориентировъчните емисии за едно и също пътуване със самолет, влак, автобус, кораб или автомобил. Запазването е по избор." />
          <View style={{ gap: theme.spacing.lg }}>
            <Card style={{ gap: theme.spacing.lg }}>
              <AppInput label="Разстояние в едната посока (km)" keyboardType="decimal-pad" value={distance} onChangeText={setDistance} error={error || undefined} />
              <ChoiceChips label="Пътуване" value={roundTrip ? 'round' : 'one'} onChange={(value) => setRoundTrip(value === 'round')} options={[{ value: 'one', label: 'Еднопосочно' }, { value: 'round', label: 'Двупосочно' }]} />
              <ChoiceChips label="Планиран транспорт" value={selectedMode} onChange={setSelectedMode} options={modes} />
              <ChoiceChips label="Сравни с" value={comparisonMode} onChange={setComparisonMode} options={modes} />
              <AppInput label="Хора в автомобила" keyboardType="number-pad" value={occupancy} onChangeText={setOccupancy} />
              <AppButton label="Сравни транспорта" icon="calculator-outline" onPress={calculate} />
            </Card>

            {estimate ? (
              <Card elevated style={{ gap: theme.spacing.md }}>
                <Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{estimate.totalDistanceKm.toFixed(0)} km пътуване</Text>
                {estimate.options.sort((a, b) => a.emissionsKgCo2e - b.emissionsKgCo2e).map((option) => {
                  const selected = option.mode === selectedMode;
                  return <View key={option.mode} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: theme.radii.md, padding: theme.spacing.md, backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surfaceMuted }}><Text style={[theme.typography.body, { color: theme.colors.text }]}>{modeLabels[option.mode]}{selected ? ' · планиран' : ''}</Text><Text style={[theme.typography.label, { color: theme.colors.text }]}>{option.emissionsKgCo2e.toFixed(2)} kg CO₂e</Text></View>;
                })}
                <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.md }}>
                  <Text style={[theme.typography.h3, { color: estimate.differenceKgCo2e <= 0 ? theme.colors.success : theme.colors.warning }]}>{estimate.differenceKgCo2e <= 0 ? `${estimate.avoidedKgCo2e.toFixed(2)} kg CO₂e по-малко` : `${estimate.differenceKgCo2e.toFixed(2)} kg CO₂e повече`} спрямо {modeLabels[comparisonMode]}</Text>
                </View>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Версия на фактора {estimate.selected.factor.version}. Включени са преките емисии и тези от добива до резервоара; при полетите е включено радиационното въздействие. Автомобилът се изчислява на километър и се разделя на броя пътници.</Text>
                <AppButton label="Запази сравнението" icon="bookmark-outline" loading={saving} onPress={() => void save()} />
              </Card>
            ) : null}

            <Card style={{ gap: theme.spacing.xs }}>
              <Text style={[theme.typography.label, { color: theme.colors.warning }]}>Ориентировъчна оценка</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Факторите използват актуализирания набор DESNZ от юли 2026 г. Реалните емисии зависят от превозното средство, маршрута, пътниците, горивото и условията.</Text>
              <AppButton label="Виж източника на методологията" icon="open-outline" variant="ghost" onPress={() => void Linking.openURL(FACTOR_SOURCE_URL)} style={{ alignSelf: 'flex-start' }} />
            </Card>
          </View>
        </Content>
      </ScrollView>
    </Screen>
  );
}
