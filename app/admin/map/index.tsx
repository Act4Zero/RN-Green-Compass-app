import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, Skeleton, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { sustainabilityMapAdminService } from '@/features/sustainability-map';
import { useAppTheme } from '@/theme';

type Queue = { submissions: any[]; reviews: any[]; media: any[] };

export default function MapAdminScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const roles = (user?.app_metadata?.knowledge_roles || []) as string[];
  const reviewer = roles.some((role) => ['reviewer', 'publisher'].includes(role));
  const [queue, setQueue] = useState<Queue>({ submissions: [], reviews: [], media: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    if (!reviewer) return;
    setLoading(true);
    try { setQueue(await sustainabilityMapAdminService.listModerationQueue()); }
    catch (error) { addNotification({ type: 'toast', severity: 'error', message: error instanceof Error ? error.message : 'Unable to load map administration.' }); }
    finally { setLoading(false); }
  }, [addNotification, reviewer]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (!reviewer) return <Screen><Content><StatePanel icon="lock-closed-outline" title="Reviewer access required" message="Imports and moderation are protected by reviewer and publisher roles." action={<AppButton label="Back" onPress={() => router.back()} />} /></Content></Screen>;

  const moderate = async (kind: 'submission' | 'review' | 'media', id: string, status: 'approved' | 'rejected') => {
    setBusy(id);
    try {
      await sustainabilityMapAdminService.moderate(kind, id, status);
      await load();
      addNotification({ type: 'toast', severity: 'success', message: status === 'approved' ? 'Approved and rewarded.' : 'Rejected.' });
    } catch (error) { addNotification({ type: 'toast', severity: 'error', message: error instanceof Error ? error.message : 'Moderation failed.' }); }
    finally { setBusy(''); }
  };

  const importEV = async () => {
    setBusy('import');
    try {
      const result = await sustainabilityMapAdminService.importBundledEVLocations();
      await load();
      addNotification({ type: 'toast', severity: 'success', message: `Imported ${result.locations} places and ${result.connectors} connectors.` });
    } catch (error) { addNotification({ type: 'toast', severity: 'error', message: error instanceof Error ? error.message : 'Import failed.' }); }
    finally { setBusy(''); }
  };

  const renderQueue = (kind: 'submission' | 'review' | 'media', items: any[]) => <View style={{ gap: 10 }}>
    {items.length === 0 ? <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Queue clear.</Text> : items.map((item) => <Card key={item.id} style={{ gap: 8 }}>
      <Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{kind}</Text>
      <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{item.proposed_data?.name || item.sustainability_locations?.name || item.storage_path || 'Map contribution'}</Text>
      {item.body ? <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{item.body}</Text> : null}
      {item.proposed_data ? <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{JSON.stringify(item.proposed_data)}</Text> : null}
      <View style={{ flexDirection: 'row', gap: 8 }}><AppButton label="Approve" icon="checkmark" loading={busy === item.id} onPress={() => void moderate(kind, item.id, 'approved')} style={{ flex: 1 }} /><AppButton label="Reject" variant="danger" disabled={Boolean(busy)} onPress={() => void moderate(kind, item.id, 'rejected')} style={{ flex: 1 }} /></View>
    </Card>)}
  </View>;

  return <Screen><ScrollView><Content wide><PageHeader
    eyebrow="Protected operations"
    title="Sustainability Map administration"
    description="Import the licensed catalogue and moderate every public claim. Living Planet uses no paid map budget."
    action={<AppButton label="Back to map" icon="arrow-back" variant="ghost" onPress={() => router.replace('/map')} />}
  />
  {loading ? <><Skeleton height={220} /><Skeleton height={260} style={{ marginTop: 12 }} /></> : <View style={{ gap: theme.spacing.xl }}>
    <Card elevated style={{ gap: theme.spacing.md }}><Text style={[theme.typography.h2, { color: theme.colors.text }]}>Living Planet runtime</Text><Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>MapLibre + OpenFreeMap is active. PMTiles packages are managed through the public offline manifest; there is no paid-map budget switch.</Text><AppButton label="Open offline maps" icon="cloud-download-outline" variant="secondary" onPress={() => router.push('/map/offline' as any)} /></Card>
    <Card style={{ gap: theme.spacing.md }}><Text style={[theme.typography.h2, { color: theme.colors.text }]}>Licensed EV bootstrap</Text><Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Idempotently imports 57 physical Open Charge Map places and their connector records.</Text><AppButton label="Import bundled EV catalogue" icon="cloud-upload-outline" loading={busy === 'import'} onPress={() => void importEV()} /></Card>
    <View><Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 12 }]}>Location submissions ({queue.submissions.length})</Text>{renderQueue('submission', queue.submissions)}</View>
    <View><Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 12 }]}>Reviews ({queue.reviews.length})</Text>{renderQueue('review', queue.reviews)}</View>
    <View><Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 12 }]}>Media ({queue.media.length})</Text>{renderQueue('media', queue.media)}</View>
  </View>}
  </Content></ScrollView></Screen>;
}
