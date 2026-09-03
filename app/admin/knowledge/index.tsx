import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useAppLocale } from '@/context/AppLocaleContext';
import { INFOGRAPHIC_ITEMS, KNOWLEDGE_CHALLENGES, KNOWLEDGE_ITEMS, KNOWLEDGE_QUESTS, KNOWLEDGE_TOPICS, knowledgeService, validateChallengeConfig, validateKnowledgeItem, validateKnowledgeTopicVisual, validateQuestGraph, type KnowledgeContentType, type KnowledgeWebinarQuestion } from '@/features/knowledge';
import { useAppTheme } from '@/theme';

type ReviewFilter = 'all' | 'ready' | 'blocked';

export default function KnowledgeEditorialConsole() {
  const { theme } = useAppTheme();
  const { locale, t } = useAppLocale();
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

  if (!authorized) return <Screen><Content><StatePanel icon="lock-closed-outline" title={t('Editorial access required', 'Необходим е редакторски достъп')} message={t('Knowledge Hub publishing roles are managed through protected account metadata.', 'Ролите за публикуване в Центъра за знания се управляват чрез защитените данни на профила.')} action={<AppButton label={t('Back to Hub', 'Назад към Центъра за знания')} onPress={() => router.replace('/knowledge' as any)} />} /></Content></Screen>;

  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content wide>
    <PageHeader eyebrow={t('Protected editorial workflow', 'Защитен редакторски процес')} title={t('Knowledge publication control', 'Контрол на публикациите за знания')} description={t('Review content, sources, translations, media, accessibility and scheduled experiences. The database publication trigger blocks incomplete English/Bulgarian releases.', 'Преглеждайте съдържанието, източниците, преводите, медиите, достъпността и планираните преживявания. Базата данни блокира непълни публикации на английски или български.')} />

    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
      <Metric icon="library-outline" label={t('Localized records', 'Локализирани записи')} value={report.length} />
      <Metric icon="checkmark-circle-outline" label={t('Ready', 'Готови')} value={report.filter((entry) => entry.issues.length === 0).length} tone="success" />
      <Metric icon="warning-outline" label={t('Blocked', 'Блокирани')} value={report.filter((entry) => entry.issues.length > 0).length + visualIssues.length} tone="warning" />
      <Metric icon="language-outline" label={t('Languages', 'Езици')} value={2} />
      <Metric icon="images-outline" label={t('Topic visuals', 'Визии по теми')} value={KNOWLEDGE_TOPICS.length} tone={visualIssues.length ? 'warning' : 'success'} />
      <Metric icon="stats-chart-outline" label={t('Infographics', 'Инфографики')} value={INFOGRAPHIC_ITEMS.length / 2} tone="success" />
      <Metric icon="compass-outline" label={t('Missions', 'Мисии')} value={KNOWLEDGE_CHALLENGES.length + KNOWLEDGE_QUESTS.length} tone={missionIssues.length ? 'warning' : 'success'} />
    </View>

    <Card style={{ marginBottom: 18 }}><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}><Ionicons name="shield-checkmark-outline" size={22} color={theme.colors.primary} /><View style={{ flex: 1, minWidth: 240 }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{t('Active publication gate', 'Активна защита при публикуване')}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3 }]}>{t('Requires EN + BG approval, citations, reviewer, review dates, topic mapping, bilingual alt text, media rights, captions and transcript. V2 also validates infographic text alternatives, mission graphs, configured rewards and webinar moderation ownership.', 'Изисква одобрение на английски и български, цитати, проверяващ, дати за преглед, теми, двуезичен алтернативен текст, права за медиите, субтитри и транскрипция. V2 проверява и текстовите алтернативи на инфографиките, графите на мисиите, наградите и отговорността за модериране на уебинари.')}</Text></View><Text style={[theme.typography.label, { color: theme.colors.success }]}>{t('ENFORCED IN DATABASE', 'НАЛОЖЕНО В БАЗАТА ДАННИ')}</Text></View></Card>

    <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 10 }]}>{t('Webinar Q&A moderation', 'Модерация на въпроси и отговори от уебинари')}</Text>
    <View style={{ gap: 10, marginBottom: 24 }}>{questions.length === 0 ? <Card><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('No pending or approved questions.', 'Няма чакащи или одобрени въпроси.')}</Text></Card> : questions.map((question) => <Card key={question.id}><View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Badge label={localizeStatus(question.status)} /><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{new Date(question.createdAt).toLocaleString()}</Text></View><Text style={[theme.typography.body, { color: theme.colors.text, marginTop: 9 }]}>{question.body}</Text>{question.status === 'approved' ? <><TextInput accessibilityLabel={t('Speaker answer', 'Отговор на лектор')} value={answers[question.id] || ''} onChangeText={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))} placeholder={t('Verified speaker/editor answer', 'Проверен отговор от лектор или редактор')} placeholderTextColor={theme.colors.textMuted} multiline style={[theme.typography.body, { color: theme.colors.text, minHeight: 82, textAlignVertical: 'top', borderWidth: 1, borderColor: theme.colors.borderStrong, borderRadius: theme.radii.md, padding: 12, marginTop: 12 }]} /><TextInput accessibilityLabel={t('Replay timestamp in seconds', 'Момент от записа в секунди')} value={timestamps[question.id] || ''} onChangeText={(value) => setTimestamps((current) => ({ ...current, [question.id]: value.replace(/\D/g, '') }))} placeholder={t('Optional replay timestamp (seconds)', 'Незадължителен момент от записа (секунди)')} placeholderTextColor={theme.colors.textMuted} keyboardType="number-pad" style={[theme.typography.body, { color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.borderStrong, borderRadius: theme.radii.md, padding: 12, marginTop: 8 }]} /></> : null}<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>{question.status === 'pending' ? <AppButton label={t('Approve', 'Одобри')} onPress={() => void knowledgeService.moderateWebinarQuestion(question.id, 'approved').then(loadQuestions)} /> : <AppButton label={t('Publish answer', 'Публикувай отговора')} disabled={(answers[question.id] || '').trim().length < 2} onPress={() => void knowledgeService.moderateWebinarQuestion(question.id, 'answered', answers[question.id], timestamps[question.id] ? Number(timestamps[question.id]) : undefined).then(loadQuestions)} />}<AppButton label={t('Reject', 'Отхвърли')} variant="ghost" onPress={() => void knowledgeService.moderateWebinarQuestion(question.id, 'rejected').then(loadQuestions)} /></View></Card>)}</View>

    <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 10 }]}>{t('Review queue', 'Опашка за преглед')}</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>{(['all', 'ready', 'blocked'] as const).map((value) => <AppButton key={value} label={value === 'all' ? t('All states', 'Всички състояния') : value === 'ready' ? t('Ready', 'Готови') : t('Blocked', 'Блокирани')} variant={filter === value ? 'primary' : 'secondary'} onPress={() => setFilter(value)} />)}</View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 14 }}><AppButton label={t('All formats', 'Всички формати')} variant={type === 'all' ? 'primary' : 'ghost'} onPress={() => setType('all')} />{types.map((value) => <AppButton key={value} label={localizeType(value)} variant={type === value ? 'primary' : 'ghost'} onPress={() => setType(value)} />)}</ScrollView>

    <View style={{ gap: 10 }}>{filtered.map(({ item, issues }) => <Card key={`${item.locale}-${item.id}`} style={{ padding: 18 }}><View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}><View style={{ flex: 1 }}><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}><Badge label={item.locale.toUpperCase()} /><Badge label={localizeType(item.type)} /><Badge label={`v${item.version}`} /></View><Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 9 }]}>{item.title}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3 }]}>{t(`Reviewed ${item.reviewedAt} • Next review ${item.nextReviewAt} • ${item.sources.length} source${item.sources.length === 1 ? '' : 's'}`, `Прегледано на ${item.reviewedAt} • Следващ преглед ${item.nextReviewAt} • ${item.sources.length} ${item.sources.length === 1 ? 'източник' : 'източника'}`)}</Text></View><Text accessibilityLabel={issues.length ? t(`${issues.length} publication issues`, `${issues.length} проблема при публикуване`) : t('Ready to publish', 'Готово за публикуване')} style={[theme.typography.label, { color: issues.length ? theme.colors.warning : theme.colors.success }]}>{issues.length ? t(`${issues.length} BLOCKER${issues.length === 1 ? '' : 'S'}`, `${issues.length} ${issues.length === 1 ? 'БЛОКИРАЩ ПРОБЛЕМ' : 'БЛОКИРАЩИ ПРОБЛЕМА'}`) : t('READY', 'ГОТОВО')}</Text></View>{issues.map((issue) => <View key={`${item.id}-${issue.field}`} style={{ flexDirection: 'row', gap: 7, marginTop: 8 }}><Ionicons name="alert-circle-outline" size={16} color={theme.colors.danger} /><Text style={[theme.typography.bodySmall, { color: theme.colors.danger, flex: 1 }]}>{issue.field}: {issue.message}</Text></View>)}</Card>)}</View>
    {filtered.length === 0 ? <StatePanel icon="checkmark-done-outline" title={t('No records in this queue', 'Няма записи в тази опашка')} message={t('Adjust the state or format filter.', 'Променете филтъра за състояние или формат.')} /> : null}
  </Content></ScrollView></Screen>;

  function Metric({ icon, label, value, tone }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: number; tone?: 'success' | 'warning' }) {
    const color = tone === 'success' ? theme.colors.success : tone === 'warning' ? theme.colors.warning : theme.colors.primary;
    return <Card style={{ minWidth: 168, flexGrow: 1 }}><Ionicons name={icon} size={20} color={color} /><Text style={[theme.typography.metric, { color, marginTop: 8 }]}>{value}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{label}</Text></Card>;
  }

  function Badge({ label }: { label: string }) {
    return <View style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: theme.colors.primarySoft }}><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{label}</Text></View>;
  }

  function localizeStatus(status: string) {
    if (locale !== 'bg') return status;
    return ({ pending: 'чака', approved: 'одобрен', answered: 'с отговор', rejected: 'отхвърлен' } as Record<string, string>)[status] || status;
  }

  function localizeType(value: string) {
    if (locale !== 'bg') return value.replace('_', ' ');
    return ({ article: 'статия', guide: 'ръководство', video: 'видео', quiz: 'тест', webinar: 'уебинар', infographic: 'инфографика', tour: 'обиколка', simulation: 'симулация' } as Record<string, string>)[value] || value.replace('_', ' ');
  }
}
