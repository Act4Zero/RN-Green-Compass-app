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
  const save = async () => { if (!user) return; setBusy(true); setMessage(null); try { await offsettingService.setLeaderboardOptIn(user.id, choice === 'opted-in'); setMessage(choice === 'opted-in' ? 'Aggregate points and streak are now eligible for leaderboards.' : 'Your profile is excluded from leaderboards.'); } catch (value) { setMessage(value instanceof Error ? value.message : 'Unable to save privacy settings.'); } finally { setBusy(false); } };
  return <Screen><ScrollView><Content><PageHeader eyebrow="Privacy controls" title="Leaderboard participation" description="Carbon activities, goals, offsets, reflections, and journal text always remain private. You may separately opt in to ranking only your aggregate green points and streak." action={<AppButton label="Back" icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />
    <View style={{ gap: theme.spacing.lg }}>{message ? <StatePanel icon="shield-checkmark-outline" title="Privacy setting" message={message} /> : null}<Card style={{ gap: theme.spacing.lg }}><ChoiceChips label="Points and streak leaderboards" value={choice} onChange={setChoice} options={[{ value: 'private', label: 'Keep me private' }, { value: 'opted-in', label: 'Opt in' }]} /><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Purchases and compensated quantities never earn points and are never ranked. You can opt out again at any time.</Text><AppButton label="Save privacy choice" icon="shield-outline" loading={busy} onPress={() => void save()} /></Card></View>
  </Content></ScrollView></Screen>;
}
