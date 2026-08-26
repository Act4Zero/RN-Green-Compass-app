import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import MapPreview from '@/components/map/MapPreview';
import { useAuth } from '@/context/AuthContext';
import { reserveMapSession } from '@/features/sustainability-map';
import { useAppTheme } from '@/theme';
import type { MapSessionReservation } from '@/types/map';
import AuthenticatedMap from '@/components/map/AuthenticatedMap';

export default function MapScreen() {
  const { theme } = useAppTheme();
  const { user, loading: authLoading } = useAuth();
  const [reservation, setReservation] = useState<MapSessionReservation | null>(null);
  const [attempt, setAttempt] = useState(0);

  const verifyBudget = useCallback(async () => {
    setReservation(null);
    const result = await reserveMapSession();
    setReservation(result);
  }, []);

  useEffect(() => {
    if (!user || authLoading) { setReservation(null); return; }
    void verifyBudget();
  }, [attempt, authLoading, user, verifyBudget]);

  if (authLoading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: theme.colors.background }}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Checking your account…</Text></View>;
  if (!user) return <MapPreview />;
  if (!reservation) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: theme.colors.background }}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Protecting this month&apos;s map budget…</Text></View>;
  if (!reservation.allowed) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl, backgroundColor: theme.colors.background }}><View style={{ maxWidth: 520, alignItems: 'center', gap: theme.spacing.md }}><View style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft }}><Ionicons name="shield-outline" size={31} color={theme.colors.primary} /></View><Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, textAlign: 'center' }]}>The globe is safely paused</Text><Text style={[theme.typography.body, { color: theme.colors.textMuted, textAlign: 'center' }]}>{reservation.message || 'Green Compass could not verify the protected map budget, so Mapbox was not started.'}</Text>{reservation.reason === 'unavailable' ? <Pressable accessibilityRole="button" onPress={() => setAttempt((value) => value + 1)} style={{ minHeight: 48, borderRadius: theme.radii.md, paddingHorizontal: theme.spacing.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary }}><Text style={[theme.typography.label, { color: theme.colors.textInverse }]}>Try again</Text></Pressable> : null}</View></View>;
  return <AuthenticatedMap />;
}
