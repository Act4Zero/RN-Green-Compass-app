import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ChoiceChips } from '@/components/offsetting/OffsettingUI';
import { AppButton, AppInput, Card, Content, PageHeader, Screen, Skeleton, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { offsettingService, type CarbonActivityCategory, type CarbonGoalProgress, type CarbonGoalType } from '@/features/offsetting';
import { useAppTheme } from '@/theme';

const dateAfter = (days: number) => { const value = new Date(); value.setDate(value.getDate() + days); return value.toISOString().slice(0, 10); };
const units: Record<CarbonGoalType, string> = { actions: 'действия', frequency: 'дни', kg_co2e: 'kg CO₂e', absolute_reduction: 'kg CO₂e', percent_reduction: '%' };

export default function CarbonGoalsScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [goals, setGoals] = useState<CarbonGoalProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('Намаляване на емисиите от транспорт');
  const [category, setCategory] = useState<CarbonActivityCategory>('transport');
  const [goalType, setGoalType] = useState<CarbonGoalType>('percent_reduction');
  const [target, setTarget] = useState('10');
  const [baseline, setBaseline] = useState('50');
  const [endsOn, setEndsOn] = useState(dateAfter(30));
  const [stepOne, setStepOne] = useState('Замени едно пътуване с кола с обществен транспорт');
  const [stepTwo, setStepTwo] = useState('Преглеждай напредъка всяка седмица');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError(null);
    try { setGoals(await offsettingService.getCarbonGoals(user.id)); }
    catch (value) { setError(value instanceof Error ? value.message : 'Целите не можаха да се заредят.'); }
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
    } catch (value) { setError(value instanceof Error ? value.message : 'Целта не можа да се създаде.'); }
    finally { setBusy(false); }
  };

  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content>
    <PageHeader eyebrow="Измерим напредък" title="Въглеродни цели" description="Задай цел за действия, честота, CO₂e или намаляване. Напредъкът идва от проверения дневник на въглеродните дейности." action={<AppButton label="Назад" icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />
    {error ? <StatePanel icon="alert-circle-outline" title="Целите изискват внимание" message={error} action={<AppButton label="Опитай отново" onPress={() => void load()} />} /> : null}
    <AppButton label={showForm ? 'Затвори формата' : 'Създай въглеродна цел'} icon={showForm ? 'close' : 'add'} onPress={() => setShowForm(!showForm)} style={{ alignSelf: 'flex-start', marginBottom: theme.spacing.lg }} />
    {showForm ? <Card style={{ gap: theme.spacing.lg, marginBottom: theme.spacing.xl }}>
      <AppInput label="Име на целта" value={title} onChangeText={setTitle} maxLength={120} />
      <ChoiceChips label="Категория" value={category} onChange={setCategory} options={[{ value: 'transport', label: 'Транспорт' }, { value: 'electricity', label: 'Електричество' }, { value: 'heating', label: 'Отопление' }, { value: 'food', label: 'Храна' }, { value: 'purchases', label: 'Покупки' }, { value: 'waste', label: 'Отпадъци' }]} />
      <ChoiceChips label="Измерване" value={goalType} onChange={setGoalType} options={[{ value: 'actions', label: 'Действия' }, { value: 'frequency', label: 'Активни дни' }, { value: 'kg_co2e', label: 'Избегнат CO₂e' }, { value: 'absolute_reduction', label: 'Абсолютно намаляване' }, { value: 'percent_reduction', label: 'Процентно намаляване' }]} />
      <AppInput label={`Цел (${units[goalType]})`} value={target} keyboardType="decimal-pad" onChangeText={setTarget} />
      {goalType === 'percent_reduction' ? <><AppInput label="Фиксирана базова стойност за периода (kg CO₂e)" value={baseline} keyboardType="decimal-pad" onChangeText={setBaseline} /><Text style={[theme.typography.bodySmall, { color: theme.colors.warning }]}>Базовата стойност е въведена от теб и не се променя след създаването на целта.</Text></> : null}
      <AppInput label="Крайна дата (ГГГГ-ММ-ДД)" value={endsOn} onChangeText={setEndsOn} />
      <AppInput label="Стъпка 1" value={stepOne} onChangeText={setStepOne} />
      <AppInput label="Стъпка 2" value={stepTwo} onChangeText={setStepTwo} />
      <AppButton label="Създай цел" icon="flag" loading={busy} onPress={() => void create()} />
    </Card> : null}
    <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: theme.spacing.sm }]}>Твоите цели</Text>
    {loading ? <View style={{ gap: theme.spacing.sm }}><Skeleton height={150} /><Skeleton height={150} /></View> : goals.length === 0 ? <StatePanel icon="flag-outline" title="Все още няма въглеродни цели" message="Създай измерима цел и записвай свързани дейности, за да следиш напредъка." /> : <View style={{ gap: theme.spacing.md }}>{goals.map((goal) => <Card key={goal.id} style={{ gap: theme.spacing.sm, borderTopWidth: 4, borderTopColor: goal.status === 'completed' ? theme.colors.success : theme.colors.primary }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: goal.status === 'completed' ? theme.colors.success : theme.colors.primary, textTransform: 'uppercase' }]}>{goal.status} · {goal.category}</Text><Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 4 }]}>{goal.title}</Text></View><Text style={[theme.typography.metric, { color: theme.colors.primary }]}>{goal.percentComplete.toFixed(0)}%</Text></View>
      <View accessibilityLabel={`${goal.percentComplete.toFixed(0)} percent complete`} style={{ height: 10, borderRadius: 5, backgroundColor: theme.colors.surfaceStrong, overflow: 'hidden' }}><View style={{ height: '100%', width: `${goal.percentComplete}%`, backgroundColor: goal.status === 'completed' ? theme.colors.success : theme.colors.primary }} /></View>
      <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{goal.currentValue.toFixed(1)} / {goal.targetValue} {goal.unit} · до {goal.endsOn}{goal.baselineSource === 'self_reported' ? ' · въведена базова стойност' : ''}</Text>
      {goal.steps.map((step) => <View key={step.id || step.title} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Text style={[theme.typography.bodySmall, { flex: 1, color: step.completedAt ? theme.colors.textMuted : theme.colors.text, textDecorationLine: step.completedAt ? 'line-through' : 'none' }]}>{step.title}</Text><AppButton label={step.completedAt ? 'Отмени' : 'Готово'} variant="ghost" onPress={async () => { await offsettingService.completeCarbonGoalStep(user!.id, goal.id, step.id!, !step.completedAt); await load(); }} /></View>)}
    </Card>)}</View>}
  </Content></ScrollView></Screen>;
}
