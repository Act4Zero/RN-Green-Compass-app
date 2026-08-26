import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, Skeleton, StatePanel } from '@/components/ui';
import { offsettingService, type OffsetProject } from '@/features/offsetting';
import { useAppTheme } from '@/theme';

export default function OffsetProjectsScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const [projects, setProjects] = useState<OffsetProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { setLoading(true); setError(null); try { setProjects(await offsettingService.getOffsetProjects()); } catch (value) { setError(value instanceof Error ? value.message : 'Unable to load projects.'); } finally { setLoading(false); } }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content>
    <PageHeader eyebrow="Verified climate contributions" title="Offset projects" description="Reduction comes first. If you choose to compensate remaining tracked emissions, checkout is hosted by Cloverly and only fulfilled or retired provider records count in your balance." action={<AppButton label="History" icon="time-outline" variant="secondary" onPress={() => router.push('/habits/offsets/history' as any)} />} />
    <Card style={{ gap: theme.spacing.xs, marginBottom: theme.spacing.lg, backgroundColor: theme.colors.accentSoft }}><Text style={[theme.typography.label, { color: theme.colors.primary }]}>No carbon-neutrality claim</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>The app keeps gross tracked emissions, estimated avoidance, and retired offsets separate. Project availability, certification, price, and retirement evidence remain provider-authoritative.</Text></Card>
    {loading ? <View style={{ gap: theme.spacing.sm }}><Skeleton height={170} /><Skeleton height={170} /></View> : error ? <StatePanel icon="cloud-offline-outline" title="Projects unavailable" message={error} action={<AppButton label="Try again" onPress={() => void load()} />} /> : projects.length === 0 ? <StatePanel icon="leaf-outline" title="No reviewed projects" message="Verified checkout remains disabled until reviewed provider inventory is available." /> : <View style={{ gap: theme.spacing.md }}>{projects.map((project) => <Card key={project.id} elevated style={{ gap: theme.spacing.sm }}>
      <Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{project.technology} · {project.country}</Text><Text style={[theme.typography.h2, { color: theme.colors.text }]}>{project.name}</Text><Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{project.summary}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{project.standard} · approximately {(project.pricePerTonneMinor / 100).toFixed(2)} {project.currency}/tonne before provider confirmation</Text><AppButton label="Review project" icon="arrow-forward" onPress={() => router.push(`/habits/offsets/${project.id}` as any)} style={{ alignSelf: 'flex-start' }} />
    </Card>)}</View>}
  </Content></ScrollView></Screen>;
}
