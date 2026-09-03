import NetInfo from '@react-native-community/netinfo';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Platform, ScrollView, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { useKnowledgeLocale } from '@/features/knowledge';
import {
  deleteOfflinePack,
  downloadOfflinePack,
  isPackDownloadable,
  listOfflinePackStates,
  loadOfflineManifest,
} from '@/features/offline-maps';
import { useAppTheme } from '@/theme';
import type { OfflineMapPackState } from '@/types/map';

const CELLULAR_CONFIRM_BYTES = 50 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  return `${Math.round(bytes / 1024 ** 2)} MB`;
}

function confirmCellular(): Promise<boolean> {
  return new Promise((resolve) => Alert.alert(
    'Използване на мобилни данни?',
    'Картата е по-голяма от 50 MB. Препоръчва се Wi-Fi.',
    [{ text: 'Отказ', style: 'cancel', onPress: () => resolve(false) }, { text: 'Изтегли', onPress: () => resolve(true) }],
    { cancelable: true, onDismiss: () => resolve(false) },
  ));
}

export default function OfflineMapsScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { locale, t } = useKnowledgeLocale();
  const [packs, setPacks] = useState<OfflineMapPackState[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const manifest = await loadOfflineManifest();
    setPacks(await listOfflinePackStates(manifest));
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const download = async (state: OfflineMapPackState) => {
    const pack = state.manifest;
    setError(null);
    if (pack.byteSize > CELLULAR_CONFIRM_BYTES) {
      const network = await NetInfo.fetch();
      if (network.type === 'cellular' && !(await confirmCellular())) return;
    }
    setBusy(pack.id);
    setPacks((current) => current.map((item) => item.manifest.id === pack.id ? { ...item, status: 'downloading', progress: 0 } : item));
    try {
      await downloadOfflinePack(pack, (progress) => setPacks((current) => current.map((item) => item.manifest.id === pack.id ? { ...item, progress } : item)));
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t('The map could not be downloaded.', 'Картата не можа да се изтегли.'));
      await load();
    } finally { setBusy(null); }
  };

  const remove = async (id: string) => {
    setBusy(id);
    try { await deleteOfflinePack(id); await load(); } finally { setBusy(null); }
  };

  return <Screen><ScrollView><Content><PageHeader
    eyebrow={t('Living Planet', 'Живата планета')}
    title={t('Offline maps', 'Офлайн карти')}
    description={t('Choose only the regions you need. Installed PMTiles maps activate automatically without internet.', 'Изберете само нужните региони. Инсталираните PMTiles карти се включват автоматично без интернет.')}
    action={<AppButton label={t('Back to map', 'Към картата')} icon="arrow-back" variant="ghost" onPress={() => router.replace('/map')} />}
  />
  {Platform.OS === 'web' ? <StatePanel icon="phone-portrait-outline" title={t('Mobile download', 'Изтегляне за мобилно устройство')} message={t('Offline maps are available in the iOS and Android apps. The web map stays online.', 'Офлайн картите са достъпни в iOS и Android. Web картата остава онлайн.')} /> : null}
  {error ? <Card style={{ marginBottom: 12, borderColor: theme.colors.danger }}><Text accessibilityLiveRegion="assertive" style={[theme.typography.bodySmall, { color: theme.colors.danger }]}>{error}</Text></Card> : null}
  <View style={{ gap: 12 }}>{packs.map((state) => {
    const pack = state.manifest;
    const downloadable = isPackDownloadable(pack) && Platform.OS !== 'web';
    return <Card key={pack.id} elevated={state.status === 'ready'} style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><View style={{ flex: 1 }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{pack.name[locale]}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{formatBytes(pack.byteSize)} · {t('zoom', 'мащаб')} {pack.minZoom}–{pack.maxZoom} · {pack.version}</Text></View><Text style={[theme.typography.label, { color: state.status === 'ready' ? theme.colors.success : theme.colors.textMuted }]}>{state.status === 'ready' ? t('Ready', 'Готова') : state.status === 'update-available' ? t('Update', 'Обновяване') : ''}</Text></View>
      {state.status === 'downloading' ? <View><View style={{ height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: theme.colors.surfaceMuted }}><View style={{ width: `${Math.round(state.progress * 100)}%`, height: '100%', backgroundColor: theme.colors.primary }} /></View><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 5 }]}>{Math.round(state.progress * 100)}%</Text></View> : null}
      {!downloadable && state.status !== 'ready' ? <Text style={[theme.typography.bodySmall, { color: theme.colors.warning }]}>{t('This offline map is being prepared and is not available for download yet.', 'Тази офлайн карта се подготвя и все още не е достъпна за изтегляне.')}</Text> : null}
      <View style={{ flexDirection: 'row', gap: 8 }}>{state.status === 'ready' ? <><AppButton label={t('Update', 'Обнови')} variant="secondary" disabled={!downloadable || Boolean(busy)} onPress={() => void download(state)} /><AppButton label={t('Delete', 'Изтрий')} variant="danger" disabled={Boolean(busy)} loading={busy === pack.id} onPress={() => void remove(pack.id)} /></> : <AppButton label={state.status === 'update-available' ? t('Update', 'Обнови') : t('Download', 'Изтегли')} icon="download-outline" disabled={!downloadable || Boolean(busy)} loading={busy === pack.id} onPress={() => void download(state)} />}</View>
    </Card>;
  })}</View>
  <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 18, textAlign: 'center' }]}>Данни за картата © сътрудници на OpenStreetMap · пакети от Protomaps</Text>
  </Content></ScrollView></Screen>;
}
