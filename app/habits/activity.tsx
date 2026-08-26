import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { ChoiceChips } from '@/components/offsetting/OffsettingUI';
import { AppButton, AppInput, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { offsettingService, type CarbonActivityEntry } from '@/features/offsetting';
import { useAppTheme } from '@/theme';

const localDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export default function CarbonActivityScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const factors = offsettingService.getActivityFactors();
  const [factorCode, setFactorCode] = useState('car-km');
  const [comparisonCode, setComparisonCode] = useState('none');
  const [quantity, setQuantity] = useState('10');
  const [occurredOn, setOccurredOn] = useState(localDate());
  const [notes, setNotes] = useState('');
  const [preview, setPreview] = useState<CarbonActivityEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => { if (!authLoading && !user) router.replace('/auth/signin'); }, [authLoading, user, router]));
  const selected = factors.find((factor) => factor.code === factorCode)!;
  const comparable = useMemo(() => factors.filter((factor) => factor.unit === selected.unit && factor.code !== selected.code), [factors, selected]);

  const input = () => ({ factorCode, quantity: Number(quantity.replace(',', '.')), occurredOn, comparisonFactorCode: comparisonCode === 'none' ? null : comparisonCode, notes });
  const calculate = () => {
    setError(null);
    try { setPreview(offsettingService.previewCarbonActivity(input())); } catch (value) { setPreview(null); setError(value instanceof Error ? value.message : 'Unable to calculate this activity.'); }
  };
  const save = async () => {
    if (!user) return;
    setSaving(true); setError(null);
    try { await offsettingService.saveCarbonActivity(user.id, input()); router.replace('/habits/impact' as any); }
    catch (value) { setError(value instanceof Error ? value.message : 'Unable to save this activity.'); }
    finally { setSaving(false); }
  };

  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content>
    <PageHeader eyebrow="Carbon activity ledger" title="Log measured activity" description="Choose a reviewed template, enter its quantity, and see the factor snapshot before saving. Avoided impact appears only when you explicitly select a comparable alternative." action={<AppButton label="Back" icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />
    <View style={{ gap: theme.spacing.lg }}>
      {error ? <StatePanel icon="alert-circle-outline" title="Check this activity" message={error} /> : null}
      <Card style={{ gap: theme.spacing.lg }}>
        <ChoiceChips label="Activity" value={factorCode} onChange={(value) => { setFactorCode(value); setComparisonCode('none'); setPreview(null); }} options={factors.map((factor) => ({ value: factor.code, label: factor.label }))} />
        <AppInput label={`Quantity (${selected.unit})`} value={quantity} keyboardType="decimal-pad" onChangeText={(value) => { setQuantity(value); setPreview(null); }} accessibilityHint="Enter a number greater than zero" />
        <AppInput label="Date (YYYY-MM-DD)" value={occurredOn} onChangeText={setOccurredOn} />
        {comparable.length ? <ChoiceChips label="Compare with (optional)" value={comparisonCode} onChange={(value) => { setComparisonCode(value); setPreview(null); }} options={[{ value: 'none', label: 'No comparison' }, ...comparable.map((factor) => ({ value: factor.code, label: factor.label }))]} /> : <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>No like-for-like comparison uses the same unit for this template.</Text>}
        <AppInput label="Private note (optional)" value={notes} onChangeText={setNotes} multiline maxLength={500} />
      </Card>
      {preview ? <Card elevated style={{ gap: theme.spacing.sm, backgroundColor: theme.colors.primarySoft }}>
        <Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>Estimated result</Text>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>{preview.grossKgCo2e.toFixed(2)} kg CO₂e</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Tracked emissions from {preview.quantity} {preview.unit}.</Text>
        {preview.comparisonKgCo2e !== null ? <Text style={[theme.typography.h3, { color: theme.colors.success }]}>{preview.avoidedKgCo2e.toFixed(2)} kg CO₂e avoided versus the selected alternative</Text> : null}
      </Card> : null}
      <Card style={{ gap: theme.spacing.xs }}>
        <Text style={[theme.typography.label, { color: theme.colors.warning }]}>Directional estimate · {selected.version}</Text>
        <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{selected.methodology}</Text>
        <AppButton label={`Open ${selected.sourceLabel}`} icon="open-outline" variant="ghost" onPress={() => void Linking.openURL(selected.sourceUrl)} style={{ alignSelf: 'flex-start' }} />
      </Card>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
        <AppButton label="Preview impact" variant="secondary" icon="calculator-outline" onPress={calculate} style={{ flex: 1 }} />
        <AppButton label="Save activity" icon="checkmark" loading={saving} onPress={() => void save()} style={{ flex: 1 }} />
      </View>
    </View>
  </Content></ScrollView></Screen>;
}
