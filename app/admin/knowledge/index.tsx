import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { KNOWLEDGE_ITEMS, KNOWLEDGE_TOPICS, validateKnowledgeItem, validateKnowledgeTopicVisual, type KnowledgeContentType } from '@/features/knowledge';
import { useAppTheme } from '@/theme';

type ReviewFilter = 'all' | 'ready' | 'blocked';

export default function KnowledgeEditorialConsole() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [type, setType] = useState<KnowledgeContentType | 'all'>('all');
  const roles = (user?.app_metadata?.knowledge_roles || []) as string[];
  const authorized = roles.some((role) => ['editor', 'reviewer', 'publisher'].includes(role));
  const report = useMemo(() => KNOWLEDGE_ITEMS.map((item) => ({ item, issues: validateKnowledgeItem(item) })), []);
  const visualIssues = useMemo(() => KNOWLEDGE_TOPICS.flatMap((topic) => validateKnowledgeTopicVisual(topic)), []);
  const filtered = report.filter((entry) => (filter === 'all' || (filter === 'ready' ? entry.issues.length === 0 : entry.issues.length > 0)) && (type === 'all' || entry.item.type === type));
  const types = [...new Set(KNOWLEDGE_ITEMS.map((item) => item.type))];

  if (!authorized) return <Screen><Content><StatePanel icon="lock-closed-outline" title="Editorial access required" message="Knowledge Hub publishing roles are managed through protected account metadata." action={<AppButton label="Back to Hub" onPress={() => router.replace('/knowledge' as any)} />} /></Content></Screen>;

  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content wide>
    <PageHeader eyebrow="Protected editorial workflow" title="Knowledge publication control" description="Review content, sources, translations, media, accessibility and scheduled experiences. The database publication trigger blocks incomplete English/Bulgarian releases." />

    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
      <Metric icon="library-outline" label="Localized records" value={report.length} />
      <Metric icon="checkmark-circle-outline" label="Ready" value={report.filter((entry) => entry.issues.length === 0).length} tone="success" />
      <Metric icon="warning-outline" label="Blocked" value={report.filter((entry) => entry.issues.length > 0).length + visualIssues.length} tone="warning" />
      <Metric icon="language-outline" label="Languages" value={2} />
      <Metric icon="images-outline" label="Topic visuals" value={KNOWLEDGE_TOPICS.length} tone={visualIssues.length ? 'warning' : 'success'} />
    </View>

    <Card style={{ marginBottom: 18 }}><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}><Ionicons name="shield-checkmark-outline" size={22} color={theme.colors.primary} /><View style={{ flex: 1, minWidth: 240 }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>Active publication gate</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3 }]}>Requires EN + BG approval, citations, reviewer, review dates, topic mapping, bilingual alt text, media rights, captions and transcript. Status changes are written to the audit trail.</Text></View><Text style={[theme.typography.label, { color: theme.colors.success }]}>ENFORCED IN DATABASE</Text></View></Card>

    <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 10 }]}>Review queue</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>{(['all', 'ready', 'blocked'] as const).map((value) => <AppButton key={value} label={value === 'all' ? 'All states' : value === 'ready' ? 'Ready' : 'Blocked'} variant={filter === value ? 'primary' : 'secondary'} onPress={() => setFilter(value)} />)}</View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 14 }}><AppButton label="All formats" variant={type === 'all' ? 'primary' : 'ghost'} onPress={() => setType('all')} />{types.map((value) => <AppButton key={value} label={value.replace('_', ' ')} variant={type === value ? 'primary' : 'ghost'} onPress={() => setType(value)} />)}</ScrollView>

    <View style={{ gap: 10 }}>{filtered.map(({ item, issues }) => <Card key={`${item.locale}-${item.id}`} style={{ padding: 18 }}><View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}><View style={{ flex: 1 }}><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}><Badge label={item.locale.toUpperCase()} /><Badge label={item.type.replace('_', ' ')} /><Badge label={`v${item.version}`} /></View><Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 9 }]}>{item.title}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3 }]}>Reviewed {item.reviewedAt} • Next review {item.nextReviewAt} • {item.sources.length} source{item.sources.length === 1 ? '' : 's'}</Text></View><Text accessibilityLabel={issues.length ? `${issues.length} publication issues` : 'Ready to publish'} style={[theme.typography.label, { color: issues.length ? theme.colors.warning : theme.colors.success }]}>{issues.length ? `${issues.length} BLOCKER${issues.length === 1 ? '' : 'S'}` : 'READY'}</Text></View>{issues.map((issue) => <View key={`${item.id}-${issue.field}`} style={{ flexDirection: 'row', gap: 7, marginTop: 8 }}><Ionicons name="alert-circle-outline" size={16} color={theme.colors.danger} /><Text style={[theme.typography.bodySmall, { color: theme.colors.danger, flex: 1 }]}>{issue.field}: {issue.message}</Text></View>)}</Card>)}</View>
    {filtered.length === 0 ? <StatePanel icon="checkmark-done-outline" title="No records in this queue" message="Adjust the state or format filter." /> : null}
  </Content></ScrollView></Screen>;

  function Metric({ icon, label, value, tone }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: number; tone?: 'success' | 'warning' }) {
    const color = tone === 'success' ? theme.colors.success : tone === 'warning' ? theme.colors.warning : theme.colors.primary;
    return <Card style={{ minWidth: 168, flexGrow: 1 }}><Ionicons name={icon} size={20} color={color} /><Text style={[theme.typography.metric, { color, marginTop: 8 }]}>{value}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{label}</Text></Card>;
  }

  function Badge({ label }: { label: string }) {
    return <View style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: theme.colors.primarySoft }}><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{label}</Text></View>;
  }
}
