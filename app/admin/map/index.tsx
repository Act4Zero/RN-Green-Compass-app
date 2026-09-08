import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, Skeleton, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useAppLocale } from '@/context/AppLocaleContext';
import { useNotification } from '@/context/NotificationContext';
import { sustainabilityMapAdminService } from '@/features/sustainability-map';
import { useAppTheme } from '@/theme';

type Queue = { submissions: any[]; reviews: any[]; media: any[] };

export default function MapAdminScreen() {
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
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
    catch { addNotification({ type: 'toast', severity: 'error', message: t('Unable to load map administration.', 'Администрацията на картата не може да бъде заредена.') }); }
    finally { setLoading(false); }
  }, [addNotification, reviewer, t]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (!reviewer) return <Screen><Content><StatePanel icon="lock-closed-outline" title={t('Reviewer access required', 'Необходим е достъп за проверяващ')} message={t('Imports and moderation are protected by reviewer and publisher roles.', 'Импортирането и модерацията са защитени чрез ролите „проверяващ“ и „издател“.')} action={<AppButton label={t('Back', 'Назад')} onPress={() => router.back()} />} /></Content></Screen>;

  const moderate = async (kind: 'submission' | 'review' | 'media', id: string, status: 'approved' | 'rejected') => {
    setBusy(id);
    try {
      await sustainabilityMapAdminService.moderate(kind, id, status);
      await load();
      addNotification({ type: 'toast', severity: 'success', message: status === 'approved' ? t('Approved and rewarded.', 'Одобрено и наградено.') : t('Rejected.', 'Отхвърлено.') });
    } catch { addNotification({ type: 'toast', severity: 'error', message: t('Moderation failed.', 'Модерацията беше неуспешна.') }); }
    finally { setBusy(''); }
  };

  const importEV = async () => {
    setBusy('import');
    try {
      const result = await sustainabilityMapAdminService.importBundledEVLocations();
      await load();
      addNotification({ type: 'toast', severity: 'success', message: t(`Imported ${result.locations} places and ${result.connectors} connectors.`, `Импортирани са ${result.locations} места и ${result.connectors} конектора.`) });
    } catch { addNotification({ type: 'toast', severity: 'error', message: t('Import failed.', 'Импортирането беше неуспешно.') }); }
    finally { setBusy(''); }
  };

  const renderQueue = (kind: 'submission' | 'review' | 'media', items: any[]) => <View style={{ gap: 10 }}>
    {items.length === 0 ? <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('Queue clear.', 'Опашката е празна.')}</Text> : items.map((item) => <Card key={item.id} style={{ gap: 8 }}>
      <Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{kind === 'submission' ? t('Submission', 'Предложение') : kind === 'review' ? t('Review', 'Отзив') : t('Media', 'Медия')}</Text>
      <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{item.proposed_data?.name || item.sustainability_locations?.name || item.storage_path || t('Map contribution', 'Принос към картата')}</Text>
      {item.body ? <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{item.body}</Text> : null}
      {item.proposed_data ? <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{JSON.stringify(item.proposed_data)}</Text> : null}
      <View style={{ flexDirection: 'row', gap: 8 }}><AppButton label={t('Approve', 'Одобри')} icon="checkmark" loading={busy === item.id} onPress={() => void moderate(kind, item.id, 'approved')} style={{ flex: 1 }} /><AppButton label={t('Reject', 'Отхвърли')} variant="danger" disabled={Boolean(busy)} onPress={() => void moderate(kind, item.id, 'rejected')} style={{ flex: 1 }} /></View>
    </Card>)}
  </View>;

  return <Screen><ScrollView><Content wide><PageHeader
    eyebrow={t('Protected operations', 'Защитени операции')}
    title={t('Sustainability Map administration', 'Администрация на картата за устойчивост')}
    description={t('Import the licensed catalogue and moderate every public claim. Living Planet uses no paid map budget.', 'Импортирайте лицензирания каталог и модерирайте всяко публично твърдение. Living Planet не използва платен бюджет за карти.')}
    action={<AppButton label={t('Back to map', 'Назад към картата')} icon="arrow-back" variant="ghost" onPress={() => router.replace('/map')} />}
  />
  {loading ? <><Skeleton height={220} /><Skeleton height={260} style={{ marginTop: 12 }} /></> : <View style={{ gap: theme.spacing.xl }}>
    <Card elevated style={{ gap: theme.spacing.md }}><Text style={[theme.typography.h2, { color: theme.colors.text }]}>Living Planet</Text><Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{t('MapLibre + OpenFreeMap is active. PMTiles packages are managed through the public offline manifest; there is no paid-map budget switch.', 'MapLibre + OpenFreeMap е активно. Пакетите PMTiles се управляват чрез публичния офлайн манифест; няма превключвател за платен бюджет за карти.')}</Text><AppButton label={t('Open offline maps', 'Отвори офлайн картите')} icon="cloud-download-outline" variant="secondary" onPress={() => router.push('/map/offline' as any)} /></Card>
    <Card style={{ gap: theme.spacing.md }}><Text style={[theme.typography.h2, { color: theme.colors.text }]}>{t('Licensed EV bootstrap', 'Начално зареждане на лицензирани зарядни станции')}</Text><Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{t('Idempotently imports 57 physical Open Charge Map places and their connector records.', 'Импортира еднократно 57 физически места от Open Charge Map и данните за техните конектори.')}</Text><AppButton label={t('Import bundled EV catalogue', 'Импортирай каталога със зарядни станции')} icon="cloud-upload-outline" loading={busy === 'import'} onPress={() => void importEV()} /></Card>
    <View><Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 12 }]}>{t('Location submissions', 'Предложения за места')} ({queue.submissions.length})</Text>{renderQueue('submission', queue.submissions)}</View>
    <View><Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 12 }]}>{t('Reviews', 'Отзиви')} ({queue.reviews.length})</Text>{renderQueue('review', queue.reviews)}</View>
    <View><Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 12 }]}>{t('Media', 'Медия')} ({queue.media.length})</Text>{renderQueue('media', queue.media)}</View>
  </View>}
  </Content></ScrollView></Screen>;
}
