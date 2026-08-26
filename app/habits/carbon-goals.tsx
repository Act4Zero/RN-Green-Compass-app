import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ChoiceChips } from '@/components/offsetting/OffsettingUI';
import { AppButton, AppInput, Card, Content, PageHeader, Screen, Skeleton, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { offsettingService, type CarbonActivityCategory, type CarbonGoalProgress, type CarbonGoalType } from '@/features/offsetting';
import { useAppTheme } from '@/theme';

const dateAfter = (days: number) => { const value = new Date(); value.setDate(value.getDate() + days); return value.toISOString().slice(0, 10); };
const units: Record<CarbonGoalType, string> = { actions: 'actions', frequency: 'days', kg_co2e: 'kg CO₂e', absolute_reduction: 'kg CO₂e', percent_reduction: '%' };

export default function CarbonGoalsScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [goals, setGoals] = useState<CarbonGoalProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('Reduce transport emissions');
  const [category, setCategory] = useState<CarbonActivityCategory>('transport');
  const [goalType, setGoalType] = useState<CarbonGoalType>('percent_reduction');
  const [target, setTarget] = useState('10');
  const [baseline, setBaseline] = useState('50');
  const [endsOn, setEndsOn] = useState(dateAfter(30));
  const [stepOne, setStepOne] = useState('Replace one car trip with public transport');
  const [stepTwo, setStepTwo] = useState('Review progress every week');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError(null);
    try { setGoals(await offsettingService.getCarbonGoals(user.id)); }
    catch (value) { setError(value instanceof Error ? value.message : 'Unable to load goals.'); }
    finally { setLoading(false); }
  }, [user]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const create = async () => {
    if (!user) return;
    setBusy(true); setError(null);
    try {
      await offsettingService.createCarbonGoal(user.id, {
        title, category, goalType, targetValue: Number(target), unit: units[goalType], startsOn: new Date().toISOString().slice(0, 10), endsOn,
        baselineValue: goalType === 'percent_reduction' ? Number(baseline) : null,
        baselineSource: goalType === 'percent_reduction' ? 'self_reported' : null,
        steps: [stepOne, stepTwo].filter((step) => step.trim()).map((step) => ({ title: step.trim(), knowledgeSlug: category === 'transport' ? 'green-transportation-starter-guide' : null })),
      });
      setShowForm(false); await load();
    } catch (value) { setError(value instanceof Error ? value.message : 'Unable to create goal.'); }
    finally { setBusy(false); }
  };

  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content>
    <PageHeader eyebrow="Measurable progress" title="Carbon goals" description="Set action, frequency, CO₂e, or reduction goals. Progress comes from your validated carbon activity ledger." action={<AppButton label="Back" icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />
    {error ? <StatePanel icon="alert-circle-outline" title="Goals need attention" message={error} action={<AppButton label="Try again" onPress={() => void load()} />} /> : null}
    <AppButton label={showForm ? 'Close goal form' : 'Create carbon goal'} icon={showForm ? 'close' : 'add'} onPress={() => setShowForm(!showForm)} style={{ alignSelf: 'flex-start', marginBottom: theme.spacing.lg }} />
    {showForm ? <Card style={{ gap: theme.spacing.lg, marginBottom: theme.spacing.xl }}>
      <AppInput label="Goal title" value={title} onChangeText={setTitle} maxLength={120} />
      <ChoiceChips label="Category" value={category} onChange={setCategory} options={[{ value: 'transport', label: 'Transport' }, { value: 'electricity', label: 'Electricity' }, { value: 'heating', label: 'Heating' }, { value: 'food', label: 'Food' }, { value: 'purchases', label: 'Purchases' }, { value: 'waste', label: 'Waste' }]} />
      <ChoiceChips label="Measurement" value={goalType} onChange={setGoalType} options={[{ value: 'actions', label: 'Actions' }, { value: 'frequency', label: 'Active days' }, { value: 'kg_co2e', label: 'CO₂e avoided' }, { value: 'absolute_reduction', label: 'Absolute reduction' }, { value: 'percent_reduction', label: 'Percent reduction' }]} />
      <AppInput label={`Target (${units[goalType]})`} value={target} keyboardType="decimal-pad" onChangeText={setTarget} />
      {goalType === 'percent_reduction' ? <><AppInput label="Frozen baseline for this period (kg CO₂e)" value={baseline} keyboardType="decimal-pad" onChangeText={setBaseline} /><Text style={[theme.typography.bodySmall, { color: theme.colors.warning }]}>This baseline is self-reported. Once the goal is created it does not move.</Text></> : null}
      <AppInput label="End date (YYYY-MM-DD)" value={endsOn} onChangeText={setEndsOn} />
      <AppInput label="Action step 1" value={stepOne} onChangeText={setStepOne} />
      <AppInput label="Action step 2" value={stepTwo} onChangeText={setStepTwo} />
      <AppButton label="Create goal" icon="flag" loading={busy} onPress={() => void create()} />
    </Card> : null}
    <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: theme.spacing.sm }]}>Your goals</Text>
    {loading ? <View style={{ gap: theme.spacing.sm }}><Skeleton height={150} /><Skeleton height={150} /></View> : goals.length === 0 ? <StatePanel icon="flag-outline" title="No carbon goals yet" message="Create a measurable target and log matching activities to see progress." /> : <View style={{ gap: theme.spacing.md }}>{goals.map((goal) => <Card key={goal.id} style={{ gap: theme.spacing.sm, borderTopWidth: 4, borderTopColor: goal.status === 'completed' ? theme.colors.success : theme.colors.primary }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: goal.status === 'completed' ? theme.colors.success : theme.colors.primary, textTransform: 'uppercase' }]}>{goal.status} · {goal.category}</Text><Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 4 }]}>{goal.title}</Text></View><Text style={[theme.typography.metric, { color: theme.colors.primary }]}>{goal.percentComplete.toFixed(0)}%</Text></View>
      <View accessibilityLabel={`${goal.percentComplete.toFixed(0)} percent complete`} style={{ height: 10, borderRadius: 5, backgroundColor: theme.colors.surfaceStrong, overflow: 'hidden' }}><View style={{ height: '100%', width: `${goal.percentComplete}%`, backgroundColor: goal.status === 'completed' ? theme.colors.success : theme.colors.primary }} /></View>
      <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{goal.currentValue.toFixed(1)} / {goal.targetValue} {goal.unit} · ends {goal.endsOn}{goal.baselineSource === 'self_reported' ? ' · self-reported baseline' : ''}</Text>
      {goal.steps.map((step) => <View key={step.id || step.title} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Text style={[theme.typography.bodySmall, { flex: 1, color: step.completedAt ? theme.colors.textMuted : theme.colors.text, textDecorationLine: step.completedAt ? 'line-through' : 'none' }]}>{step.title}</Text><AppButton label={step.completedAt ? 'Undo' : 'Done'} variant="ghost" onPress={async () => { await offsettingService.completeCarbonGoalStep(user!.id, goal.id, step.id!, !step.completedAt); await load(); }} /></View>)}
    </Card>)}</View>}
  </Content></ScrollView></Screen>;
}
