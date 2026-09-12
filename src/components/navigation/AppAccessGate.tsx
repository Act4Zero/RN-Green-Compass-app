import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Redirect, usePathname } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useAppLocale } from '@/context/AppLocaleContext';
import { useAppTheme } from '@/theme';
import { sanitizeInternalDestination } from '@/utils/navigation';

const AUTH_SCREENS = new Set([
  'auth/signin', 'auth/signup', 'auth/signup-success', 'auth/forgot-password',
  'auth/reset-password', 'auth/callback', 'auth/confirm-signup',
]);

// The root navigator applies this before rendering any screen's content.
export function AppAccessGate({ routeName, children }: { routeName: string; children: React.ReactNode }) {
  const { session, user, loading } = useAuth();
  const pathname = usePathname();
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
  if (AUTH_SCREENS.has(routeName)) return <>{children}</>;
  if (loading && !session) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: theme.colors.background }}>
      <ActivityIndicator color={theme.colors.primary} />
      <Text accessibilityLiveRegion="polite" style={{ color: theme.colors.textMuted }}>{t('Checking sign in…', 'Проверяваме входа…')}</Text>
    </View>
  );
  if (!session || !user) return <Redirect href={{ pathname: '/auth/signin', params: { next: sanitizeInternalDestination(pathname) } }} />;
  return <>{children}</>;
}
