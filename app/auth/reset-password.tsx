import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import supabase from '@/lib/supabase';
import { useAppTheme } from '@/theme';
import { useAppLocale } from '@/context/AppLocaleContext';
import { AppButton, Card, Content, PageHeader, Screen } from '@/components/ui';
import Input from '@/components/Input';

export default function ResetPassword() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const router = useRouter();
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const verification = useRef<{ code?: string; promise: Promise<boolean> }>();

  useEffect(() => {
    let current = true;
    setChecking(true);
    setReady(false);
    if (!verification.current || verification.current.code !== code) {
      verification.current = { code, promise: (async () => {
        // Web initialization consumes PKCE links automatically. Native links
        // need an explicit exchange using the verifier stored on this device.
        if (Platform.OS !== 'web' && code) {
          const result = await supabase.auth.exchangeCodeForSession(code);
          return !result.error && Boolean(result.data.session);
        }
        const result = await supabase.auth.getSession();
        return !result.error && Boolean(result.data.session);
      })() };
    }
    void verification.current.promise.then(valid => { if (current) setReady(valid); })
      .catch(() => { if (current) setReady(false); })
      .finally(() => { if (current) setChecking(false); });
    return () => { current = false; };
  }, [code]);

  const save = async () => {
    if (!ready || saving) return;
    setError('');
    if (password.length < 8) { setError(t('Use at least 8 characters.', 'Използвайте поне 8 знака.')); return; }
    if (password !== confirmation) { setError(t('The passwords do not match.', 'Паролите не съвпадат.')); return; }
    setSaving(true);
    try {
      const result = await supabase.auth.updateUser({ password });
      if (result.error) { setError(t('The password could not be saved. Use a stronger password or request a new link.', 'Паролата не бе запазена. Изберете по-силна парола или поискайте нова връзка.')); return; }
      setPassword(''); setConfirmation(''); setSaved(true);
    } catch {
      setError(t('Check your connection and try again.', 'Проверете връзката си и опитайте отново.'));
    } finally { setSaving(false); }
  };

  return <Screen><ScrollView keyboardShouldPersistTaps="handled"><Content>
    <Card style={{ width: '100%', maxWidth: 520, alignSelf: 'center', gap: 16 }}>
      <PageHeader title={t('A fresh start 🔑', 'Ново начало 🔑')} description={t('Choose a new password for your account.', 'Изберете нова парола за своя профил.')} />
      {checking ? <ActivityIndicator color={theme.colors.primary} /> : saved ? <>
        <Text style={{ color: theme.colors.text }}>{t('Your password is saved.', 'Паролата е запазена.')}</Text>
        <AppButton label={t('Continue', 'Продължи')} onPress={() => router.replace('/home')} />
      </> : ready ? <>
        <Input label={t('New password', 'Нова парола')} value={password} onChangeText={setPassword} isPassword autoComplete="new-password" />
        <Input label={t('Repeat password', 'Повторете паролата')} value={confirmation} onChangeText={setConfirmation} isPassword autoComplete="new-password" />
        {error ? <Text accessibilityRole="alert" style={{ color: theme.colors.danger }}>{error}</Text> : null}
        <AppButton label={t('Save password', 'Запази паролата')} loading={saving} disabled={saving} onPress={() => void save()} />
      </> : <Text accessibilityRole="alert" style={{ color: theme.colors.textMuted }}>{t('This link is expired or unavailable on this device. Request a new link and open it on the device where you requested it.', 'Връзката е изтекла или не е достъпна на това устройство. Поискайте нова и я отворете на устройството, от което сте я заявили.')}</Text>}
      {!checking && !saved ? <AppButton variant="ghost" label={t('Request a new link', 'Поискай нова връзка')} onPress={() => router.replace('/auth/forgot-password')} /> : null}
      <View><AppButton variant="ghost" label={t('Back to sign in', 'Към входа')} onPress={() => router.replace('/auth/signin')} /></View>
    </Card>
  </Content></ScrollView></Screen>;
}
