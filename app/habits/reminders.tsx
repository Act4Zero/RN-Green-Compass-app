import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { ChoiceChips } from '@/components/offsetting/OffsettingUI';
import { AppButton, AppInput, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { getSustainabilityReminder, saveSustainabilityReminder } from '@/features/offsetting';
import { useAppTheme } from '@/theme';

const days = [{ value: 2, label: 'Mon' }, { value: 3, label: 'Tue' }, { value: 4, label: 'Wed' }, { value: 5, label: 'Thu' }, { value: 6, label: 'Fri' }, { value: 7, label: 'Sat' }, { value: 1, label: 'Sun' }];

export default function SustainabilityRemindersScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [enabled, setEnabled] = useState('yes');
  const [hour, setHour] = useState('9');
  const [minute, setMinute] = useState('0');
  const [weekdays, setWeekdays] = useState([2, 3, 4, 5, 6]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useFocusEffect(useCallback(() => {
    if (!user) return;
    void getSustainabilityReminder(user.id).then((value) => { if (!value) return; setEnabled(value.enabled ? 'yes' : 'no'); setHour(String(value.hour)); setMinute(String(value.minute)); setWeekdays(value.weekdays); });
  }, [user]));
  const toggleDay = (day: number) => setWeekdays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day]);
  const save = async () => {
    if (!user) return;
    setBusy(true); setError(null); setSaved(false);
    try {
      const h = Number(hour); const m = Number(minute);
      if (!Number.isInteger(h) || h < 0 || h > 23 || !Number.isInteger(m) || m < 0 || m > 59) throw new Error('Enter a valid 24-hour time.');
      if (enabled === 'yes' && weekdays.length === 0) throw new Error('Choose at least one reminder day.');
      await saveSustainabilityReminder(user.id, { enabled: enabled === 'yes', hour: h, minute: m, weekdays }); setSaved(true);
    } catch (value) { setError(value instanceof Error ? value.message : 'Unable to save reminder.'); }
    finally { setBusy(false); }
  };

  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content>
    <PageHeader eyebrow="Gentle nudges" title="Sustainability reminders" description={Platform.OS === 'web' ? 'Web uses an in-app daily nudge. Background push is intentionally unavailable in this release.' : 'Choose when this device should remind you. Permission is requested only when you save an enabled reminder.'} action={<AppButton label="Back" icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />
    <View style={{ gap: theme.spacing.lg }}>
      {error ? <StatePanel icon="notifications-off-outline" title="Reminder not scheduled" message={error} /> : null}
      {saved ? <StatePanel icon="checkmark-circle-outline" title="Reminder settings saved" message={Platform.OS === 'web' ? 'Your in-app nudge preference is ready.' : 'This device will use the selected local schedule.'} /> : null}
      <Card style={{ gap: theme.spacing.lg }}>
        <ChoiceChips label="Daily action reminder" value={enabled} onChange={setEnabled} options={[{ value: 'yes', label: 'Enabled' }, { value: 'no', label: 'Disabled' }]} />
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}><AppInput label="Hour (0–23)" value={hour} onChangeText={setHour} keyboardType="number-pad" style={{ flex: 1 }} /><AppInput label="Minute" value={minute} onChangeText={setMinute} keyboardType="number-pad" style={{ flex: 1 }} /></View>
        <View style={{ gap: theme.spacing.sm }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>Days</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{days.map((day) => { const selected = weekdays.includes(day.value); return <Pressable key={day.value} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => toggleDay(day.value)} style={{ minHeight: 44, minWidth: 54, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radii.pill, borderWidth: 1, borderColor: selected ? theme.colors.primary : theme.colors.border, backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface }}><Text style={[theme.typography.label, { color: selected ? theme.colors.primary : theme.colors.text }]}>{day.label}</Text></Pressable>; })}</View></View>
        <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>The schedule follows this device's timezone and is rebuilt when you change these settings. Denying notification permission never blocks Habits.</Text>
        <AppButton label="Save reminder" icon="notifications-outline" loading={busy} onPress={() => void save()} />
      </Card>
    </View>
  </Content></ScrollView></Screen>;
}
