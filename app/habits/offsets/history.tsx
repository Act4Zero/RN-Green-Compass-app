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
  const load = useCallback(async () => { if (!user) return; setLoading(true); setError(null); try { setItems(await offsettingService.getOffsetHistory(user.id)); } catch (value) { setError(value instanceof Error ? value.message : 'Историята не можа да се зареди.'); } finally { setLoading(false); } }, [user]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content>
    <PageHeader eyebrow="Дневник, потвърден от доставчика" title="История на компенсациите" description="Чакащите и неуспешните плащания остават видими, но във въглеродния баланс се включват само изпълнени или оттеглени приноси." action={<AppButton label="Проекти" icon="leaf-outline" onPress={() => router.push('/habits/offsets' as any)} />} />
    {loading ? <View style={{ gap: theme.spacing.sm }}><Skeleton height={120} /><Skeleton height={120} /></View> : error ? <StatePanel icon="cloud-offline-outline" title="Историята не е достъпна" message={error} action={<AppButton label="Опитай отново" onPress={() => void load()} />} /> : items.length === 0 ? <StatePanel icon="receipt-outline" title="Все още няма приноси" message="Завършено плащане ще се появи, след като Cloverly потвърди изпълнението или оттеглянето." /> : <View style={{ gap: theme.spacing.md }}>{items.map((item) => <Card key={item.id} style={{ gap: theme.spacing.xs }}><Text style={[theme.typography.label, { color: item.status === 'retired' || item.status === 'fulfilled' ? theme.colors.success : theme.colors.warning, textTransform: 'uppercase' }]}>{item.status === 'retired' ? 'ОТТЕГЛЕН' : item.status === 'fulfilled' ? 'ИЗПЪЛНЕН' : item.status}</Text><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{item.projectName}</Text><Text style={[theme.typography.metric, { color: theme.colors.primary }]}>{item.quantityKgCo2e.toFixed(1)} kg CO₂e</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{new Date(item.contributedAt).toLocaleDateString('bg-BG')} · {item.providerReference}</Text>{item.certificateUrl ? <AppButton label="Отвори сертификата" icon="open-outline" variant="ghost" onPress={() => void Linking.openURL(item.certificateUrl!)} style={{ alignSelf: 'flex-start' }} /> : null}</Card>)}</View>}
  </Content></ScrollView></Screen>;
}
