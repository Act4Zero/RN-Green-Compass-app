import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { INFOGRAPHIC_ITEMS, KNOWLEDGE_CHALLENGES, KNOWLEDGE_ITEMS, KNOWLEDGE_QUESTS, KNOWLEDGE_TOPICS, knowledgeService, validateChallengeConfig, validateKnowledgeItem, validateKnowledgeTopicVisual, validateQuestGraph, type KnowledgeContentType, type KnowledgeWebinarQuestion } from '@/features/knowledge';
import { useAppTheme } from '@/theme';

type ReviewFilter = 'all' | 'ready' | 'blocked';

export default function KnowledgeEditorialConsole() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [type, setType] = useState<KnowledgeContentType | 'all'>('all');
  const [questions, setQuestions] = useState<KnowledgeWebinarQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timestamps, setTimestamps] = useState<Record<string, string>>({});
  const roles = (user?.app_metadata?.knowledge_roles || []) as string[];
  const authorized = roles.some((role) => ['editor', 'reviewer', 'publisher'].includes(role));
  const allItems = useMemo(() => [...KNOWLEDGE_ITEMS, ...INFOGRAPHIC_ITEMS], []);
  const report = useMemo(() => allItems.map((item) => ({ item, issues: validateKnowledgeItem(item) })), [allItems]);
  const visualIssues = useMemo(() => KNOWLEDGE_TOPICS.flatMap((topic) => validateKnowledgeTopicVisual(topic)), []);
  const filtered = report.filter((entry) => (filter === 'all' || (filter === 'ready' ? entry.issues.length === 0 : entry.issues.length > 0)) && (type === 'all' || entry.item.type === type));
  const types = [...new Set(allItems.map((item) => item.type))];
  const missionIssues = useMemo(() => [...KNOWLEDGE_CHALLENGES.flatMap(validateChallengeConfig), ...KNOWLEDGE_QUESTS.flatMap(validateQuestGraph)], []);
  const loadQuestions = useCallback(() => void knowledgeService.getWebinarModerationQueue().then(setQuestions), []);
  useEffect(loadQuestions, [loadQuestions]);

  if (!authorized) return <Screen><Content><StatePanel icon="lock-closed-outline" title="Editorial access required" message="Knowledge Hub publishing roles are managed through protected account metadata." action={<AppButton label="Back to Hub" onPress={() => router.replace('/knowledge' as any)} />} /></Content></Screen>;

  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content wide>
    <PageHeader eyebrow="Protected editorial workflow" title="Knowledge publication control" description="Review content, sources, translations, media, accessibility and scheduled experiences. The database publication trigger blocks incomplete English/Bulgarian releases." />

    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
      <Metric icon="library-outline" label="Localized records" value={report.length} />
      <Metric icon="checkmark-circle-outline" label="Ready" value={report.filter((entry) => entry.issues.length === 0).length} tone="success" />
      <Metric icon="warning-outline" label="Blocked" value={report.filter((entry) => entry.issues.length > 0).length + visualIssues.length} tone="warning" />
      <Metric icon="language-outline" label="Languages" value={2} />
      <Metric icon="images-outline" label="Topic visuals" value={KNOWLEDGE_TOPICS.length} tone={visualIssues.length ? 'warning' : 'success'} />
      <Metric icon="stats-chart-outline" label="Infographics" value={INFOGRAPHIC_ITEMS.length / 2} tone="success" />
      <Metric icon="compass-outline" label="Missions" value={KNOWLEDGE_CHALLENGES.length + KNOWLEDGE_QUESTS.length} tone={missionIssues.length ? 'warning' : 'success'} />
    </View>

    <Card style={{ marginBottom: 18 }}><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}><Ionicons name="shield-checkmark-outline" size={22} color={theme.colors.primary} /><View style={{ flex: 1, minWidth: 240 }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>Active publication gate</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3 }]}>Requires EN + BG approval, citations, reviewer, review dates, topic mapping, bilingual alt text, media rights, captions and transcript. V2 also validates infographic text alternatives, mission graphs, configured rewards and webinar moderation ownership.</Text></View><Text style={[theme.typography.label, { color: theme.colors.success }]}>ENFORCED IN DATABASE</Text></View></Card>

    <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 10 }]}>Webinar Q&A moderation</Text>
    <View style={{ gap: 10, marginBottom: 24 }}>{questions.length === 0 ? <Card><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>No pending or approved questions.</Text></Card> : questions.map((question) => <Card key={question.id}><View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Badge label={question.status} /><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{new Date(question.createdAt).toLocaleString()}</Text></View><Text style={[theme.typography.body, { color: theme.colors.text, marginTop: 9 }]}>{question.body}</Text>{question.status === 'approved' ? <><TextInput accessibilityLabel="Speaker answer" value={answers[question.id] || ''} onChangeText={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))} placeholder="Verified speaker/editor answer" placeholderTextColor={theme.colors.textMuted} multiline style={[theme.typography.body, { color: theme.colors.text, minHeight: 82, textAlignVertical: 'top', borderWidth: 1, borderColor: theme.colors.borderStrong, borderRadius: theme.radii.md, padding: 12, marginTop: 12 }]} /><TextInput accessibilityLabel="Replay timestamp in seconds" value={timestamps[question.id] || ''} onChangeText={(value) => setTimestamps((current) => ({ ...current, [question.id]: value.replace(/\D/g, '') }))} placeholder="Optional replay timestamp (seconds)" placeholderTextColor={theme.colors.textMuted} keyboardType="number-pad" style={[theme.typography.body, { color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.borderStrong, borderRadius: theme.radii.md, padding: 12, marginTop: 8 }]} /></> : null}<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>{question.status === 'pending' ? <AppButton label="Approve" onPress={() => void knowledgeService.moderateWebinarQuestion(question.id, 'approved').then(loadQuestions)} /> : <AppButton label="Publish answer" disabled={(answers[question.id] || '').trim().length < 2} onPress={() => void knowledgeService.moderateWebinarQuestion(question.id, 'answered', answers[question.id], timestamps[question.id] ? Number(timestamps[question.id]) : undefined).then(loadQuestions)} />}<AppButton label="Reject" variant="ghost" onPress={() => void knowledgeService.moderateWebinarQuestion(question.id, 'rejected').then(loadQuestions)} /></View></Card>)}</View>

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
