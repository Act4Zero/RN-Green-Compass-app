import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { ChoiceChips, titleForTier } from '@/components/offsetting/OffsettingUI';
import { AppButton, AppInput, Card, Content, PageHeader, Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { calculateGreenIdentity, FACTOR_SOURCE_URL, FACTOR_VERSION, offsettingService, type GreenIdentityAnswers, type GreenIdentityResult, type HeatingType, type ShoppingLevel, type TravelMode, type WasteFrequency } from '@/features/offsetting';
import { useAppTheme } from '@/theme';
import { useAppLocale } from '@/context/AppLocaleContext';

const defaults: GreenIdentityAnswers = {
  countryCode: 'BG',
  weeklyDistanceKm: 80,
  primaryTravelMode: 'car',
  flightsPerYear: 1,
  householdEnergyKwhMonth: 250,
  renewableEnergyPercent: 0,
  householdSize: 2,
  diet: 'meat_some_days',
  reuseFrequency: 'sometimes',
  recyclingFrequency: 'sometimes',
  heatingType: 'natural_gas',
  heatingEnergyKwhMonth: 300,
  shoppingLevel: 'average',
  foodWasteFrequency: 'sometimes',
};

export default function GreenIdentityScreen() {
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
  const router = useRouter();
  const { user } = useAuth();
  const [answers, setAnswers] = useState(defaults);
  const [preview, setPreview] = useState<GreenIdentityResult | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    void offsettingService.getIdentity(user.id).then((identity) => { if (identity) setAnswers({ ...defaults, ...identity.answers, countryCode: identity.countryCode || identity.answers.countryCode || defaults.countryCode }); });
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
          <PageHeader eyebrow={t('Green identity · assessment 2026.2', 'Зелена идентичност · оценка 2026.2')} title={t('Build your starting estimate', 'Създай началната си оценка')} description={t('Estimate mobility, home energy, food, purchases, reuse, and waste. Results are directional personal guidance—not an inventory, certification, or offset claim.', 'Оцени мобилността, домашната енергия, храната, покупките, повторната употреба и отпадъците. Резултатите са ориентир, а не инвентаризация, сертификат или твърдение за компенсация.')} />
          <View style={{ gap: theme.spacing.lg }}>
            <Card style={{ gap: theme.spacing.lg }}>
              <Text style={[theme.typography.h2, { color: theme.colors.text }]}>{t('Location', 'Местоположение')}</Text>
              <ChoiceChips label={t('Benchmark country', 'Държава за сравнение')} value={answers.countryCode || 'GLOBAL'} onChange={(countryCode) => setAnswers((current) => ({ ...current, countryCode }))} options={[{ value: 'BG', label: t('Bulgaria', 'България') }, { value: 'GB', label: t('United Kingdom', 'Обединеното кралство') }, { value: 'DE', label: t('Germany', 'Германия') }, { value: 'US', label: t('United States', 'САЩ') }, { value: 'GLOBAL', label: t('Global only', 'Само глобално') }]} />
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('Country selection changes only the reference benchmark. The current activity factors remain individually disclosed.', 'Изборът на държава променя само референтното сравнение. Коефициентите за дейностите остават показани поотделно.')}</Text>
            </Card>

            <Card style={{ gap: theme.spacing.lg }}>
              <Text style={[theme.typography.h2, { color: theme.colors.text }]}>{t('Travel', 'Пътуване')}</Text>
              <ChoiceChips<TravelMode> label={t('Your main travel mode', 'Основен начин на пътуване')} value={answers.primaryTravelMode} onChange={(primaryTravelMode) => setAnswers((current) => ({ ...current, primaryTravelMode }))} options={[{ value: 'car', label: t('Car', 'Автомобил') }, { value: 'bus', label: t('Bus', 'Автобус') }, { value: 'train', label: t('Train', 'Влак') }, { value: 'boat', label: t('Boat', 'Кораб') }, { value: 'plane', label: t('Plane', 'Самолет') }]} />
              <AppInput label={t('Distance travelled in a typical week (km)', 'Изминато разстояние за типична седмица (km)')} keyboardType="decimal-pad" value={`${answers.weeklyDistanceKm}`} onChangeText={(value) => setNumber('weeklyDistanceKm', value)} />
              <AppInput label={t('One-way flights in a typical year', 'Еднопосочни полети за типична година')} keyboardType="number-pad" value={`${answers.flightsPerYear}`} onChangeText={(value) => setNumber('flightsPerYear', value)} />
            </Card>

            <Card style={{ gap: theme.spacing.lg }}>
              <Text style={[theme.typography.h2, { color: theme.colors.text }]}>{t('Home energy', 'Енергия у дома')}</Text>
              <AppInput label={t('Household electricity per month (kWh)', 'Електроенергия за дома на месец (kWh)')} keyboardType="decimal-pad" value={`${answers.householdEnergyKwhMonth}`} onChangeText={(value) => setNumber('householdEnergyKwhMonth', value)} />
              <AppInput label={t('Renewable electricity share (%)', 'Дял на възобновяемата електроенергия (%)')} keyboardType="decimal-pad" value={`${answers.renewableEnergyPercent}`} onChangeText={(value) => setNumber('renewableEnergyPercent', value)} />
              <AppInput label={t('People in your household', 'Хора в домакинството')} keyboardType="number-pad" value={`${answers.householdSize}`} onChangeText={(value) => setNumber('householdSize', value)} />
              <ChoiceChips<HeatingType> label={t('Main heating source', 'Основен източник на отопление')} value={answers.heatingType || 'none'} onChange={(heatingType) => setAnswers((current) => ({ ...current, heatingType }))} options={[{ value: 'none', label: t('None / unknown', 'Няма / неизвестно') }, { value: 'electricity', label: t('Electric', 'Електричество') }, { value: 'natural_gas', label: t('Natural gas', 'Природен газ') }, { value: 'heating_oil', label: t('Heating oil', 'Нафта') }, { value: 'district', label: t('District heat', 'Централно отопление') }]} />
              <AppInput label={t('Heating energy in a typical month (kWh)', 'Енергия за отопление за типичен месец (kWh)')} keyboardType="decimal-pad" value={`${answers.heatingEnergyKwhMonth || 0}`} onChangeText={(value) => setNumber('heatingEnergyKwhMonth', value)} />
            </Card>

            <Card style={{ gap: theme.spacing.lg }}>
              <Text style={[theme.typography.h2, { color: theme.colors.text }]}>{t('Food and circular living', 'Храна и кръгов начин на живот')}</Text>
              <ChoiceChips label={t('Your usual diet', 'Обичаен начин на хранене')} value={answers.diet} onChange={(diet) => setAnswers((current) => ({ ...current, diet }))} options={[{ value: 'meat_most_days', label: t('Meat most days', 'Месо почти всеки ден') }, { value: 'meat_some_days', label: t('Meat some days', 'Месо няколко дни') }, { value: 'vegetarian', label: t('Vegetarian', 'Вегетариански') }, { value: 'vegan', label: t('Vegan', 'Вегански') }]} />
              <ChoiceChips label={t('How often do you repair, borrow, or reuse?', 'Колко често поправяте, вземате назаем или използвате повторно?')} value={answers.reuseFrequency} onChange={(reuseFrequency) => setAnswers((current) => ({ ...current, reuseFrequency }))} options={[{ value: 'rarely', label: t('Rarely', 'Рядко') }, { value: 'sometimes', label: t('Sometimes', 'Понякога') }, { value: 'often', label: t('Often', 'Често') }]} />
              <ChoiceChips label={t('How often do you separate recyclable materials?', 'Колко често събирате разделно рециклируеми материали?')} value={answers.recyclingFrequency} onChange={(recyclingFrequency) => setAnswers((current) => ({ ...current, recyclingFrequency }))} options={[{ value: 'rarely', label: t('Rarely', 'Рядко') }, { value: 'sometimes', label: t('Sometimes', 'Понякога') }, { value: 'often', label: t('Often', 'Често') }]} />
              <ChoiceChips<ShoppingLevel> label={t('How much new non-essential stuff do you buy?', 'Колко нови вещи извън необходимото купувате?')} value={answers.shoppingLevel || 'average'} onChange={(shoppingLevel) => setAnswers((current) => ({ ...current, shoppingLevel }))} options={[{ value: 'low', label: t('Less than average', 'Под средното') }, { value: 'average', label: t('Average', 'Средно') }, { value: 'high', label: t('More than average', 'Над средното') }]} />
              <ChoiceChips<WasteFrequency> label={t('How often is edible food discarded?', 'Колко често се изхвърля годна храна?')} value={answers.foodWasteFrequency || 'sometimes'} onChange={(foodWasteFrequency) => setAnswers((current) => ({ ...current, foodWasteFrequency }))} options={[{ value: 'rarely', label: t('Rarely', 'Рядко') }, { value: 'sometimes', label: t('Sometimes', 'Понякога') }, { value: 'often', label: t('Often', 'Често') }]} />
            </Card>

            {preview ? (
              <Card elevated style={{ gap: theme.spacing.sm, backgroundColor: theme.colors.primarySoft }}>
                <Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{t(titleForTier(preview.identityTier), preview.identityTier === 'impact_leader' ? 'Лидер по въздействие' : preview.identityTier === 'green_builder' ? 'Зелен създател' : 'Еко изследовател')}</Text>
                <Text style={[theme.typography.h1, { color: theme.colors.text }]}>{preview.identityScore}/100</Text>
                <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{preview.annualBaselineKgCo2e.toFixed(0)} {t('kg CO₂e/year estimated tracked baseline', 'kg CO₂e/година оценена проследявана база')}</Text>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('Mobility', 'Мобилност')}: {(preview.categoryFootprintKgCo2e.mobility || 0).toFixed(0)} kg · {t('Energy', 'Енергия')}: {(preview.categoryFootprintKgCo2e.energy || 0).toFixed(0)} kg · {t('Food', 'Храна')}: {(preview.categoryFootprintKgCo2e.food || 0).toFixed(0)} kg · {t('Purchases', 'Покупки')}: {(preview.categoryFootprintKgCo2e.consumption || 0).toFixed(0)} kg · {t('Waste', 'Отпадъци')}: {(preview.categoryFootprintKgCo2e.waste || 0).toFixed(0)} kg</Text>
              </Card>
            ) : null}

            <Card style={{ gap: theme.spacing.xs }}>
              <Text style={[theme.typography.label, { color: theme.colors.warning }]}>{t('Estimate, not an offset claim', 'Оценка, а не твърдение за компенсация')}</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t(`Factor version ${FACTOR_VERSION}. Results omit many sources and should guide choices rather than certify emissions or carbon neutrality.`, `Версия на коефициентите ${FACTOR_VERSION}. Резултатите не обхващат всички източници и служат за ориентир, а не за сертифициране на емисии или въглеродна неутралност.`)}</Text>
              <AppButton label={t('Read the 2026 factor source', 'Прочети източника на коефициентите за 2026 г.')} variant="ghost" icon="open-outline" onPress={() => void Linking.openURL(FACTOR_SOURCE_URL)} style={{ alignSelf: 'flex-start' }} />
            </Card>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
              <AppButton label={t('Calculate estimate', 'Изчисли оценката')} variant="secondary" icon="calculator-outline" onPress={calculate} style={{ flex: 1 }} />
              <AppButton label={t('Save identity', 'Запази идентичността')} icon="checkmark" loading={saving} onPress={() => void save()} style={{ flex: 1 }} />
            </View>
          </View>
        </Content>
      </ScrollView>
    </Screen>
  );
}
