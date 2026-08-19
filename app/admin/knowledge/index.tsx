import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { KNOWLEDGE_ITEMS, validateKnowledgeItem } from '@/features/knowledge';
import { useAppTheme } from '@/theme';

export default function KnowledgeEditorialConsole() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const router = useRouter();
  const roles = (user?.app_metadata?.knowledge_roles || []) as string[];
  const authorized = roles.some((role) => ['editor', 'reviewer', 'publisher'].includes(role));
  const report = useMemo(() => KNOWLEDGE_ITEMS.map((item) => ({ item, issues: validateKnowledgeItem(item) })), []);
  if (!authorized) return <Screen><Content><StatePanel icon="lock-closed-outline" title="Editorial access required" message="Knowledge Hub publishing roles are managed through protected account metadata." action={<AppButton label="Back to Hub" onPress={() => router.replace('/knowledge' as any)} />} /></Content></Screen>;
  return <Screen><ScrollView><Content wide><PageHeader eyebrow="Internal editorial console" title="Knowledge quality review" description="Review publication readiness, citations, accessibility metadata, and update dates before publishing through Supabase." /><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}><Metric label="Catalog items" value={report.length} /><Metric label="Ready" value={report.filter((entry) => entry.issues.length === 0).length} /><Metric label="Needs review" value={report.filter((entry) => entry.issues.length > 0).length} /></View><View style={{ gap: 10 }}>{report.map(({ item, issues }) => <Card key={item.id} style={{ padding: 18 }}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><View style={{ flex: 1 }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{item.title}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3 }]}>Version {item.version} • Review due {item.nextReviewAt}</Text></View><Text style={[theme.typography.label, { color: issues.length ? theme.colors.warning : theme.colors.success }]}>{issues.length ? `${issues.length} issue${issues.length === 1 ? '' : 's'}` : 'Ready'}</Text></View>{issues.map((issue) => <Text key={`${item.id}-${issue.field}`} style={[theme.typography.bodySmall, { color: theme.colors.danger, marginTop: 7 }]}>{issue.field}: {issue.message}</Text>)}</Card>)}</View></Content></ScrollView></Screen>;
  function Metric({ label, value }: { label: string; value: number }) { return <Card style={{ minWidth: 180 }}><Text style={[theme.typography.metric, { color: theme.colors.primary }]}>{value}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{label}</Text></Card>; }
}
