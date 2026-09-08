import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { ChoiceChips } from '@/components/offsetting/OffsettingUI';
import { AppButton, AppInput, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { getSustainabilityReminder, saveSustainabilityReminder } from '@/features/offsetting';
import { useAppTheme } from '@/theme';

const days = [{ value: 2, label: 'Пн' }, { value: 3, label: 'Вт' }, { value: 4, label: 'Ср' }, { value: 5, label: 'Чт' }, { value: 6, label: 'Пт' }, { value: 7, label: 'Сб' }, { value: 1, label: 'Нд' }];

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
      if (!Number.isInteger(h) || h < 0 || h > 23 || !Number.isInteger(m) || m < 0 || m > 59) throw new Error('Въведи валиден час в 24-часов формат.');
      if (enabled === 'yes' && weekdays.length === 0) throw new Error('Избери поне един ден за напомняне.');
      await saveSustainabilityReminder(user.id, { enabled: enabled === 'yes', hour: h, minute: m, weekdays }); setSaved(true);
    } catch { setError('Напомнянето не можа да се запази.'); }
    finally { setBusy(false); }
  };

  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content>
    <PageHeader eyebrow="Леки напомняния" title="Напомняния за устойчивост" description={Platform.OS === 'web' ? 'Уеб версията показва дневно напомняне в приложението. Фоновите известия не са включени в тази версия.' : 'Избери кога устройството да ти напомня. Разрешение се иска само при запазване на включено напомняне.'} action={<AppButton label="Назад" icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />
    <View style={{ gap: theme.spacing.lg }}>
      {error ? <StatePanel icon="notifications-off-outline" title="Напомнянето не е насрочено" message={error} /> : null}
      {saved ? <StatePanel icon="checkmark-circle-outline" title="Настройките са запазени" message={Platform.OS === 'web' ? 'Настройката за напомняне в приложението е готова.' : 'Устройството ще използва избрания график.'} /> : null}
      <Card style={{ gap: theme.spacing.lg }}>
        <ChoiceChips label="Дневно напомняне за действие" value={enabled} onChange={setEnabled} options={[{ value: 'yes', label: 'Включено' }, { value: 'no', label: 'Изключено' }]} />
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}><AppInput label="Час (0–23)" value={hour} onChangeText={setHour} keyboardType="number-pad" style={{ flex: 1 }} /><AppInput label="Минути" value={minute} onChangeText={setMinute} keyboardType="number-pad" style={{ flex: 1 }} /></View>
        <View style={{ gap: theme.spacing.sm }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>Дни</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{days.map((day) => { const selected = weekdays.includes(day.value); return <Pressable key={day.value} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => toggleDay(day.value)} style={{ minHeight: 44, minWidth: 54, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radii.pill, borderWidth: 1, borderColor: selected ? theme.colors.primary : theme.colors.border, backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface }}><Text style={[theme.typography.label, { color: selected ? theme.colors.primary : theme.colors.text }]}>{day.label}</Text></Pressable>; })}</View></View>
        <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Графикът следва часовата зона на устройството и се обновява при промяна. Отказът на известия не блокира раздел „Навици“.</Text>
        <AppButton label="Запази напомнянето" icon="notifications-outline" loading={busy} onPress={() => void save()} />
      </Card>
    </View>
  </Content></ScrollView></Screen>;
}
