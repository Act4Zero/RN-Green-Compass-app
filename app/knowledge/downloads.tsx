import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { knowledgeService, type KnowledgeDownload } from '@/features/knowledge';
import { useAppTheme } from '@/theme';

export default function KnowledgeDownloadsScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [downloads, setDownloads] = useState<KnowledgeDownload[]>([]);
  const load = useCallback(() => void knowledgeService.getDownloads(user?.id).then(setDownloads), [user?.id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  if (!user) return <Screen><Content><StatePanel icon="lock-closed-outline" title="Sign in for offline learning" message="Downloads belong to your Green Compass account on this device." action={<AppButton label="Sign in" onPress={() => router.push('/auth/signin')} />} /></Content></Screen>;
  return <Screen><ScrollView><Content><PageHeader eyebrow="Offline library" title="Downloads" description="Reviewed articles and guides saved on this device with a versioned integrity manifest." />{downloads.length === 0 ? <StatePanel icon="download-outline" title="Nothing downloaded yet" message="Open a downloadable guide and choose Download to keep it available offline." action={<AppButton label="Browse guides" onPress={() => router.push({ pathname: '/knowledge/search' as any, params: { downloadable: 'true' } })} />} /> : <View style={{ gap: 12 }}>{downloads.map((download) => <Card key={download.itemId}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{download.content.title}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 5 }]}>Version {download.content.version} • {formatBytes(download.manifest?.estimatedBytes || JSON.stringify(download.content).length * 2)} • Saved {new Date(download.downloadedAt).toLocaleDateString()}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.success, marginTop: 5 }]}>Ready offline • Integrity checksum stored</Text><View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}><AppButton label="Read" onPress={() => router.push(`/knowledge/content/${download.content.slug}` as any)} /><AppButton label="Remove" variant="ghost" onPress={() => void knowledgeService.removeDownload(user.id, download.itemId).then(load)} /></View></Card>)}</View>}</Content></ScrollView></Screen>;
}

function formatBytes(bytes: number) {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
}
