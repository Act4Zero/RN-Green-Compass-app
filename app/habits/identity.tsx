import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { ChoiceChips, titleForTier } from '@/components/offsetting/OffsettingUI';
import { AppButton, AppInput, Card, Content, PageHeader, Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { calculateGreenIdentity, FACTOR_SOURCE_URL, FACTOR_VERSION, offsettingService, type GreenIdentityAnswers, type GreenIdentityResult, type TravelMode } from '@/features/offsetting';
import { useAppTheme } from '@/theme';

const defaults: GreenIdentityAnswers = {
  weeklyDistanceKm: 80,
  primaryTravelMode: 'car',
  flightsPerYear: 1,
  householdEnergyKwhMonth: 250,
  renewableEnergyPercent: 0,
  householdSize: 2,
  diet: 'meat_some_days',
  reuseFrequency: 'sometimes',
  recyclingFrequency: 'sometimes',
};

export default function GreenIdentityScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [answers, setAnswers] = useState(defaults);
  const [preview, setPreview] = useState<GreenIdentityResult | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    void offsettingService.getIdentity(user.id).then((identity) => { if (identity) setAnswers(identity.answers); });
  }, [user]);

  const setNumber = (field: keyof GreenIdentityAnswers, value: string) => setAnswers((current) => ({ ...current, [field]: Math.max(0, Number(value.replace(',', '.')) || 0) }));
  const calculate = () => setPreview(calculateGreenIdentity(answers));
  const save = async () => {
    if (!user) return;
    setSaving(true);
    const result = preview || calculateGreenIdentity(answers);
    await offsettingService.saveIdentity(user.id, result);
    setSaving(false);
    router.replace('/habits' as any);
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Content>
          <PageHeader eyebrow="Green identity" title="Build your starting estimate" description="This guided assessment estimates only the mobility and household-electricity activities you provide. Food and circular-living answers shape your identity and recommendations without pretending to be a complete personal footprint." />
          <View style={{ gap: theme.spacing.lg }}>
            <Card style={{ gap: theme.spacing.lg }}>
              <Text style={[theme.typography.h2, { color: theme.colors.text }]}>Travel</Text>
              <ChoiceChips<TravelMode> label="Your main travel mode" value={answers.primaryTravelMode} onChange={(primaryTravelMode) => setAnswers((current) => ({ ...current, primaryTravelMode }))} options={[{ value: 'car', label: 'Car' }, { value: 'bus', label: 'Bus' }, { value: 'train', label: 'Train' }, { value: 'boat', label: 'Boat' }, { value: 'plane', label: 'Plane' }]} />
              <AppInput label="Distance travelled in a typical week (km)" keyboardType="decimal-pad" value={`${answers.weeklyDistanceKm}`} onChangeText={(value) => setNumber('weeklyDistanceKm', value)} />
              <AppInput label="One-way flights in a typical year" keyboardType="number-pad" value={`${answers.flightsPerYear}`} onChangeText={(value) => setNumber('flightsPerYear', value)} />
            </Card>

            <Card style={{ gap: theme.spacing.lg }}>
              <Text style={[theme.typography.h2, { color: theme.colors.text }]}>Home energy</Text>
              <AppInput label="Household electricity per month (kWh)" keyboardType="decimal-pad" value={`${answers.householdEnergyKwhMonth}`} onChangeText={(value) => setNumber('householdEnergyKwhMonth', value)} />
              <AppInput label="Renewable electricity share (%)" keyboardType="decimal-pad" value={`${answers.renewableEnergyPercent}`} onChangeText={(value) => setNumber('renewableEnergyPercent', value)} />
              <AppInput label="People in your household" keyboardType="number-pad" value={`${answers.householdSize}`} onChangeText={(value) => setNumber('householdSize', value)} />
            </Card>

            <Card style={{ gap: theme.spacing.lg }}>
              <Text style={[theme.typography.h2, { color: theme.colors.text }]}>Food and circular living</Text>
              <ChoiceChips label="Your usual diet" value={answers.diet} onChange={(diet) => setAnswers((current) => ({ ...current, diet }))} options={[{ value: 'meat_most_days', label: 'Meat most days' }, { value: 'meat_some_days', label: 'Meat some days' }, { value: 'vegetarian', label: 'Vegetarian' }, { value: 'vegan', label: 'Vegan' }]} />
              <ChoiceChips label="How often do you repair, borrow, or reuse?" value={answers.reuseFrequency} onChange={(reuseFrequency) => setAnswers((current) => ({ ...current, reuseFrequency }))} options={[{ value: 'rarely', label: 'Rarely' }, { value: 'sometimes', label: 'Sometimes' }, { value: 'often', label: 'Often' }]} />
              <ChoiceChips label="How often do you separate recyclable materials?" value={answers.recyclingFrequency} onChange={(recyclingFrequency) => setAnswers((current) => ({ ...current, recyclingFrequency }))} options={[{ value: 'rarely', label: 'Rarely' }, { value: 'sometimes', label: 'Sometimes' }, { value: 'often', label: 'Often' }]} />
            </Card>

            {preview ? (
              <Card elevated style={{ gap: theme.spacing.sm, backgroundColor: theme.colors.primarySoft }}>
                <Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{titleForTier(preview.identityTier)}</Text>
                <Text style={[theme.typography.h1, { color: theme.colors.text }]}>{preview.identityScore}/100</Text>
                <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{preview.annualBaselineKgCo2e.toFixed(0)} kg CO₂e/year estimated tracked baseline</Text>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Mobility: {preview.categoryFootprintKgCo2e.mobility.toFixed(0)} kg · Household electricity: {preview.categoryFootprintKgCo2e.energy.toFixed(0)} kg</Text>
              </Card>
            ) : null}

            <Card style={{ gap: theme.spacing.xs }}>
              <Text style={[theme.typography.label, { color: theme.colors.warning }]}>Estimate, not an offset claim</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Factor version {FACTOR_VERSION}. Results omit many sources and should guide choices rather than certify emissions or carbon neutrality.</Text>
              <AppButton label="Read the 2026 factor source" variant="ghost" icon="open-outline" onPress={() => void Linking.openURL(FACTOR_SOURCE_URL)} style={{ alignSelf: 'flex-start' }} />
            </Card>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
              <AppButton label="Calculate estimate" variant="secondary" icon="calculator-outline" onPress={calculate} style={{ flex: 1 }} />
              <AppButton label="Save identity" icon="checkmark" loading={saving} onPress={() => void save()} style={{ flex: 1 }} />
            </View>
          </View>
        </Content>
      </ScrollView>
    </Screen>
  );
}
