import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { ChoiceChips } from '@/components/offsetting/OffsettingUI';
import { AppButton, AppInput, Card, Content, PageHeader, Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { FACTOR_SOURCE_URL, offsettingService, type TravelEstimate, type TravelMode } from '@/features/offsetting';
import { useAppTheme } from '@/theme';

const modes: { value: TravelMode; label: string }[] = [{ value: 'plane', label: 'Plane' }, { value: 'train', label: 'Train' }, { value: 'bus', label: 'Bus' }, { value: 'boat', label: 'Boat' }, { value: 'car', label: 'Car' }];

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
      setError(calculationError instanceof Error ? calculationError.message : 'Enter a valid distance.');
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
          <PageHeader eyebrow="Travel footprint" title="Compare your options" description="Estimate emissions for the same journey across plane, train, bus, boat, and car. Saving is always optional." />
          <View style={{ gap: theme.spacing.lg }}>
            <Card style={{ gap: theme.spacing.lg }}>
              <AppInput label="One-way distance (km)" keyboardType="decimal-pad" value={distance} onChangeText={setDistance} error={error || undefined} />
              <ChoiceChips label="Journey" value={roundTrip ? 'round' : 'one'} onChange={(value) => setRoundTrip(value === 'round')} options={[{ value: 'one', label: 'One way' }, { value: 'round', label: 'Round trip' }]} />
              <ChoiceChips label="Your planned option" value={selectedMode} onChange={setSelectedMode} options={modes} />
              <ChoiceChips label="Compare against" value={comparisonMode} onChange={setComparisonMode} options={modes} />
              <AppInput label="People sharing the car" keyboardType="number-pad" value={occupancy} onChangeText={setOccupancy} />
              <AppButton label="Compare modes" icon="calculator-outline" onPress={calculate} />
            </Card>

            {estimate ? (
              <Card elevated style={{ gap: theme.spacing.md }}>
                <Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{estimate.totalDistanceKm.toFixed(0)} km journey</Text>
                {estimate.options.sort((a, b) => a.emissionsKgCo2e - b.emissionsKgCo2e).map((option) => {
                  const selected = option.mode === selectedMode;
                  return <View key={option.mode} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: theme.radii.md, padding: theme.spacing.md, backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surfaceMuted }}><Text style={[theme.typography.body, { color: theme.colors.text, textTransform: 'capitalize' }]}>{option.mode}{selected ? ' · planned' : ''}</Text><Text style={[theme.typography.label, { color: theme.colors.text }]}>{option.emissionsKgCo2e.toFixed(2)} kg CO₂e</Text></View>;
                })}
                <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.md }}>
                  <Text style={[theme.typography.h3, { color: estimate.differenceKgCo2e <= 0 ? theme.colors.success : theme.colors.warning }]}>{estimate.differenceKgCo2e <= 0 ? `${estimate.avoidedKgCo2e.toFixed(2)} kg CO₂e lower` : `${estimate.differenceKgCo2e.toFixed(2)} kg CO₂e higher`} than {comparisonMode}</Text>
                </View>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Factor version {estimate.selected.factor.version}. Direct and well-to-tank emissions are included; flights include radiative forcing. Car is calculated per vehicle-km then divided by the occupancy you entered. Other modes use passenger-km.</Text>
                <AppButton label="Save this comparison" icon="bookmark-outline" loading={saving} onPress={() => void save()} />
              </Card>
            ) : null}

            <Card style={{ gap: theme.spacing.xs }}>
              <Text style={[theme.typography.label, { color: theme.colors.warning }]}>Directional estimate</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Factors use the revised July 2026 DESNZ reporting set. Actual emissions vary by vehicle, route, occupancy, fuel, and operating conditions.</Text>
              <AppButton label="View methodology source" icon="open-outline" variant="ghost" onPress={() => void Linking.openURL(FACTOR_SOURCE_URL)} style={{ alignSelf: 'flex-start' }} />
            </Card>
          </View>
        </Content>
      </ScrollView>
    </Screen>
  );
}
