import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useAppTheme } from '@/theme';
import { useKnowledgeLocale } from '../locale';

export function SpeakControls({ text }: { text: string }) {
  const { theme } = useAppTheme();
  const { locale, t } = useKnowledgeLocale();
  const [state, setState] = useState<'idle' | 'speaking' | 'paused'>('idle');
  const [rate, setRate] = useState(0.9);
  useEffect(() => () => { void Speech.stop(); }, []);
  const start = () => {
    void Speech.stop().then(() => Speech.speak(text, { language: locale === 'bg' ? 'bg-BG' : 'en-US', rate, onStart: () => setState('speaking'), onDone: () => setState('idle'), onStopped: () => setState('idle'), onError: () => setState('idle') }));
  };
  const toggle = () => {
    if (state === 'idle') start();
    else if (state === 'speaking') void Speech.pause().then(() => setState('paused'));
    else void Speech.resume().then(() => setState('speaking'));
  };
  return <View accessibilityLabel={t('Text to speech controls', 'Контроли за прочитане на глас')} style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
    <Pressable accessibilityRole="button" accessibilityLabel={state === 'speaking' ? t('Pause reading', 'Пауза') : state === 'paused' ? t('Resume reading', 'Продължи') : t('Read aloud', 'Прочети на глас')} onPress={toggle} style={{ minHeight: 44, paddingHorizontal: 13, borderWidth: 1, borderColor: theme.colors.borderStrong, borderRadius: theme.radii.md, backgroundColor: theme.colors.primarySoft, flexDirection: 'row', alignItems: 'center', gap: 7 }}><Ionicons name={state === 'speaking' ? 'pause' : 'volume-high-outline'} size={18} color={theme.colors.primary} /><Text style={[theme.typography.label, { color: theme.colors.primary }]}>{state === 'speaking' ? t('Pause', 'Пауза') : state === 'paused' ? t('Resume', 'Продължи') : t('Read aloud', 'Прочети')}</Text></Pressable>
    {state !== 'idle' ? <Pressable accessibilityRole="button" accessibilityLabel={t('Stop reading', 'Спри прочитането')} onPress={() => void Speech.stop().then(() => setState('idle'))} style={{ minHeight: 44, paddingHorizontal: 12, justifyContent: 'center' }}><Text style={[theme.typography.label, { color: theme.colors.textMuted }]}>{t('Stop', 'Спри')}</Text></Pressable> : null}
    <Pressable accessibilityRole="button" accessibilityLabel={t('Change reading speed', 'Промени скоростта')} onPress={() => setRate((value) => value >= 1.1 ? 0.75 : Math.round((value + 0.15) * 100) / 100)} style={{ minHeight: 44, paddingHorizontal: 12, justifyContent: 'center' }}><Text style={[theme.typography.label, { color: theme.colors.textMuted }]}>{rate.toFixed(2)}×</Text></Pressable>
  </View>;
}
