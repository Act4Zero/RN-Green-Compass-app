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
  const load = useCallback(async () => { setLoading(true); setError(null); try { setProjects(await offsettingService.getOffsetProjects()); } catch (value) { setError(value instanceof Error ? value.message : 'Проектите не можаха да се заредят.'); } finally { setLoading(false); } }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content>
    <PageHeader eyebrow="Проверени климатични приноси" title="Проекти за компенсация" description="Намаляването е първата стъпка. Ако решиш да компенсираш оставащите проследени емисии, плащането се извършва чрез Cloverly и в баланса се отчитат само потвърдени записи." action={<AppButton label="История" icon="time-outline" variant="secondary" onPress={() => router.push('/habits/offsets/history' as any)} />} />
    <Card style={{ gap: theme.spacing.xs, marginBottom: theme.spacing.lg, backgroundColor: theme.colors.accentSoft }}><Text style={[theme.typography.label, { color: theme.colors.primary }]}>Без твърдение за въглеродна неутралност</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Приложението държи отделно проследените емисии, ориентировъчно избегнатите емисии и потвърдените компенсации. Наличността, сертификацията, цената и доказателствата се определят от доставчика.</Text></Card>
    {loading ? <View style={{ gap: theme.spacing.sm }}><Skeleton height={170} /><Skeleton height={170} /></View> : error ? <StatePanel icon="cloud-offline-outline" title="Проектите не са достъпни" message={error} action={<AppButton label="Опитай отново" onPress={() => void load()} />} /> : projects.length === 0 ? <StatePanel icon="leaf-outline" title="Няма проверени проекти" message="Потвърденото плащане остава изключено, докато няма проверен списък от доставчика." /> : <View style={{ gap: theme.spacing.md }}>{projects.map((project) => <Card key={project.id} elevated style={{ gap: theme.spacing.sm }}>
      <Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{project.technology} · {project.country}</Text><Text style={[theme.typography.h2, { color: theme.colors.text }]}>{project.name}</Text><Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{project.summary}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{project.standard} · приблизително {(project.pricePerTonneMinor / 100).toFixed(2)} {project.currency}/тон преди потвърждение от доставчика</Text><AppButton label="Прегледай проекта" icon="arrow-forward" onPress={() => router.push(`/habits/offsets/${project.id}` as any)} style={{ alignSelf: 'flex-start' }} />
    </Card>)}</View>}
  </Content></ScrollView></Screen>;
}
