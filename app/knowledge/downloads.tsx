import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { KNOWLEDGE_TOOLKITS, knowledgeService, openKnowledgeToolkit, useKnowledgeLocale, type KnowledgeDownload } from '@/features/knowledge';
import { useAppTheme } from '@/theme';

export default function KnowledgeDownloadsScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { locale, t } = useKnowledgeLocale();
  const [downloads, setDownloads] = useState<KnowledgeDownload[]>([]);
  const load = useCallback(() => void knowledgeService.getDownloads(user?.id).then(setDownloads), [user?.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  return <Screen><ScrollView><Content><PageHeader eyebrow={t('Offline and printable library', 'Офлайн и печатна библиотека')} title={t('Downloads & toolkits', 'Изтегляния и пакети')} description={t('Keep reviewed lessons offline and open bilingual printable packs for homes, teachers and communities.', 'Запазвайте проверени уроци офлайн и отваряйте двуезични пакети за домове, учители и общности.')} />
    <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 12 }]}>{t('Printable resource packs', 'Ресурсни пакети за печат')}</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 30 }}>{KNOWLEDGE_TOOLKITS.map((toolkit) => <Card key={toolkit.id} style={{ width: '100%', maxWidth: 480, flexGrow: 1 }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{toolkit.title[locale]}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 5 }]}>{toolkit.audience[locale]} • PDF • {t('English + Bulgarian', 'английски + български')}</Text><AppButton label={t('Open PDF toolkit', 'Отвори PDF пакета')} icon="document-text-outline" variant="secondary" onPress={() => void openKnowledgeToolkit(toolkit.module)} style={{ marginTop: 12 }} /></Card>)}</View>
    <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 12 }]}>{t('Saved lessons', 'Запазени уроци')}</Text>
    {!user ? <StatePanel icon="lock-closed-outline" title={t('Sign in for offline lessons', 'Влезте за офлайн уроци')} message={t('The printable packs above are available to everyone. Sign in to keep personal lesson downloads and progress.', 'Печатните пакети са достъпни за всички. Влезте, за да пазите лични изтегляния и напредък.')} action={<AppButton label={t('Sign in', 'Вход')} onPress={() => router.push('/auth/signin')} />} /> : downloads.length === 0 ? <StatePanel icon="download-outline" title={t('No lessons downloaded', 'Няма изтеглени уроци')} message={t('Open a downloadable guide and choose Download.', 'Отворете ръководство и изберете „Изтегли“.')} action={<AppButton label={t('Browse guides', 'Разгледай ръководствата')} onPress={() => router.push({ pathname: '/knowledge/search' as any, params: { downloadable: 'true' } })} />} /> : <View style={{ gap: 12 }}>{downloads.map((download) => <Card key={download.itemId}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{download.content.title}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 5 }]}>{t('Version', 'Версия')} {download.content.version} • {formatBytes(download.manifest?.estimatedBytes || JSON.stringify(download.content).length * 2)} • {t('Saved', 'Запазено')} {new Date(download.downloadedAt).toLocaleDateString(locale === 'bg' ? 'bg-BG' : 'en-US')}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.success, marginTop: 5 }]}>{t('Ready offline • Integrity checksum stored', 'Готово офлайн • Контролната сума е запазена')}</Text><View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}><AppButton label={t('Read', 'Прочети')} onPress={() => router.push(`/knowledge/content/${download.content.slug}` as any)} /><AppButton label={t('Remove', 'Премахни')} variant="ghost" onPress={() => void knowledgeService.removeDownload(user.id, download.itemId).then(load)} /></View></Card>)}</View>}
  </Content></ScrollView></Screen>;
}

function formatBytes(bytes: number) {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
}
