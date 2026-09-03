import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ChoiceChips } from '@/components/offsetting/OffsettingUI';
import { AppButton, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { offsettingService } from '@/features/offsetting';
import { useAppTheme } from '@/theme';

export default function HabitsPrivacyScreen() {
  const { theme } = useAppTheme(); const router = useRouter(); const { user } = useAuth();
  const [choice, setChoice] = useState('private'); const [busy, setBusy] = useState(false); const [message, setMessage] = useState<string | null>(null);
  useFocusEffect(useCallback(() => { if (user) void offsettingService.getLeaderboardOptIn(user.id).then((enabled) => setChoice(enabled ? 'opted-in' : 'private')); }, [user]));
  const save = async () => { if (!user) return; setBusy(true); setMessage(null); try { await offsettingService.setLeaderboardOptIn(user.id, choice === 'opted-in'); setMessage(choice === 'opted-in' ? 'Общият брой точки и поредните дни вече могат да участват в класациите.' : 'Профилът ти е изключен от класациите.'); } catch { setMessage('Настройките за поверителност не можаха да се запазят.'); } finally { setBusy(false); } };
  return <Screen><ScrollView><Content><PageHeader eyebrow="Контрол на поверителността" title="Участие в класациите" description="Действията, целите, компенсациите, размислите и личните записки винаги остават поверителни. По избор можеш да включиш в класациите само общите зелени точки и поредните дни." action={<AppButton label="Назад" icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />
    <View style={{ gap: theme.spacing.lg }}>{message ? <StatePanel icon="shield-checkmark-outline" title="Настройка за поверителност" message={message} /> : null}<Card style={{ gap: theme.spacing.lg }}><ChoiceChips label="Класации за точки и поредни дни" value={choice} onChange={setChoice} options={[{ value: 'private', label: 'Запази ме скрит' }, { value: 'opted-in', label: 'Включи ме' }]} /><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Покупките и компенсираните количества не носят точки и не участват в класациите. Можеш да се откажеш по всяко време.</Text><AppButton label="Запази избора" icon="shield-outline" loading={busy} onPress={() => void save()} /></Card></View>
  </Content></ScrollView></Screen>;
}
