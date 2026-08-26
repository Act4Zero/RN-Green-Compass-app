import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, Skeleton, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { offsettingService, type OffsetContribution } from '@/features/offsetting';
import { useAppTheme } from '@/theme';

export default function OffsetHistoryScreen() {
  const { theme } = useAppTheme(); const router = useRouter(); const { user } = useAuth();
  const [items, setItems] = useState<OffsetContribution[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { if (!user) return; setLoading(true); setError(null); try { setItems(await offsettingService.getOffsetHistory(user.id)); } catch (value) { setError(value instanceof Error ? value.message : 'Unable to load offset history.'); } finally { setLoading(false); } }, [user]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content>
    <PageHeader eyebrow="Provider-confirmed ledger" title="Offset history" description="Pending and failed checkouts stay visible, but only fulfilled or retired contributions are included in your carbon balance." action={<AppButton label="Projects" icon="leaf-outline" onPress={() => router.push('/habits/offsets' as any)} />} />
    {loading ? <View style={{ gap: theme.spacing.sm }}><Skeleton height={120} /><Skeleton height={120} /></View> : error ? <StatePanel icon="cloud-offline-outline" title="History unavailable" message={error} action={<AppButton label="Try again" onPress={() => void load()} />} /> : items.length === 0 ? <StatePanel icon="receipt-outline" title="No provider contributions yet" message="A completed hosted checkout will appear after Cloverly confirms fulfilment or retirement." /> : <View style={{ gap: theme.spacing.md }}>{items.map((item) => <Card key={item.id} style={{ gap: theme.spacing.xs }}><Text style={[theme.typography.label, { color: item.status === 'retired' || item.status === 'fulfilled' ? theme.colors.success : theme.colors.warning, textTransform: 'uppercase' }]}>{item.status}</Text><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{item.projectName}</Text><Text style={[theme.typography.metric, { color: theme.colors.primary }]}>{item.quantityKgCo2e.toFixed(1)} kg CO₂e</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{new Date(item.contributedAt).toLocaleDateString()} · {item.providerReference}</Text>{item.certificateUrl ? <AppButton label="Open certificate" icon="open-outline" variant="ghost" onPress={() => void Linking.openURL(item.certificateUrl!)} style={{ alignSelf: 'flex-start' }} /> : null}</Card>)}</View>}
  </Content></ScrollView></Screen>;
}
