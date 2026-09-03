import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, Share, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { knowledgeService, useKnowledgeLocale, type KnowledgeMissionStep, type KnowledgeQuestProgress } from '@/features/knowledge';
import { useAppTheme } from '@/theme';

export default function KnowledgeQuestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const { locale, t } = useKnowledgeLocale();
  const router = useRouter();
  const quest = useMemo(() => knowledgeService.getQuest(id), [id]);
  const [progress, setProgress] = useState<KnowledgeQuestProgress | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useFocusEffect(useCallback(() => { if (quest) void knowledgeService.getQuestProgress(user?.id, quest.id).then(setProgress); }, [user, quest]));
  if (!quest) return <Screen><Content><StatePanel icon="compass-outline" title={t('Quest unavailable', 'Мисията не е налична')} message={t('Choose another journey from the Hub.', 'Изберете друго пътешествие от Центъра за знания.')} /></Content></Screen>;
  const completed = progress?.completedNodeIds || [];
  const available = knowledgeService.getAvailableQuestNodeIds(quest, completed);
  const coreNodes = quest.nodes.filter((node) => node.required && !node.branch);
  const coreDone = coreNodes.filter((node) => completed.includes(node.id)).length + (quest.nodes.some((node) => node.branch && completed.includes(node.id)) ? 1 : 0);
  const percent = Math.min(100, Math.round((coreDone / (coreNodes.length + 1)) * 100));
  const finish = async (nodeId: string) => { if (!user) return router.push('/auth/signin'); setBusy(nodeId); setError(null); try { setProgress(await knowledgeService.completeQuestNode(user.id, quest.id, nodeId)); } catch { setError(t('This node could not be verified.', 'Тази точка не можа да бъде потвърдена.')); } finally { setBusy(null); } };
  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content>
    <PageHeader eyebrow={t('Branching Knowledge Quest', 'Разклонено приключение за знания')} title={quest.title[locale]} description={quest.summary[locale]} />
    <Card elevated style={{ backgroundColor: theme.colors.primary, marginBottom: 22 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}><Ionicons name={progress?.completedAt ? 'trophy' : 'compass'} size={30} color="#FFFFFF" /><View style={{ flex: 1 }}><Text style={[theme.typography.h2, { color: '#FFFFFF' }]}>{progress?.completedAt ? t('Quest complete', 'Мисията е завършена') : t('Choose your route', 'Изберете своя маршрут')}</Text><Text style={[theme.typography.bodySmall, { color: '#D8EAE0', marginTop: 4 }]}>{percent}% • {completed.length}/{quest.nodes.length} {t('nodes explored', 'разгледани точки')}</Text></View></View><View style={{ height: 8, borderRadius: 4, backgroundColor: '#FFFFFF2B', overflow: 'hidden', marginTop: 16 }}><View style={{ height: '100%', width: `${percent}%`, backgroundColor: theme.colors.accent }} /></View>{progress?.completedAt ? <AppButton label={t('Share quest', 'Сподели мисията')} icon="share-outline" onPress={() => void Share.share({ message: t(`I completed “${quest.title.en}” in Green Compass.`, `Завърших „${quest.title.bg}“ в Green Compass.`) })} style={{ marginTop: 16 }} /> : null}</Card>
    {error ? <Text accessibilityRole="alert" style={[theme.typography.bodySmall, { color: theme.colors.danger, marginBottom: 12 }]}>{error}</Text> : null}
    <View style={{ gap: 12 }}>{quest.nodes.map((node, index) => { const done = completed.includes(node.id); const unlocked = available.includes(node.id); const locked = !done && !unlocked; return <Card key={node.id} style={{ marginLeft: node.branch ? 24 : 0, borderLeftWidth: 4, borderLeftColor: done ? theme.colors.success : unlocked ? theme.colors.primary : theme.colors.borderStrong, opacity: locked ? 0.68 : 1 }}><View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 13 }}><View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? theme.colors.primarySoft : theme.colors.surfaceMuted }}><Ionicons name={done ? 'checkmark' : locked ? 'lock-closed-outline' : node.bonus ? 'sparkles-outline' : 'navigate-outline'} size={20} color={done ? theme.colors.success : locked ? theme.colors.textMuted : theme.colors.primary} /></View><View style={{ flex: 1 }}><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}><Text style={[theme.typography.label, { color: theme.colors.textMuted }]}>{node.bonus ? t('BONUS', 'БОНУС') : node.branch ? t(`BRANCH ${node.branch}`, `КЛОН ${node.branch}`) : `${t('NODE', 'ТОЧКА')} ${index + 1}`}</Text><Text style={[theme.typography.label, { color: done ? theme.colors.success : unlocked ? theme.colors.primary : theme.colors.textMuted }]}>{done ? t('COMPLETED', 'ЗАВЪРШЕНА') : unlocked ? t('AVAILABLE', 'ДОСТЪПНА') : t('LOCKED', 'ЗАКЛЮЧЕНА')}</Text></View><Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 4 }]}>{node.title[locale]}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>{node.itemId || node.action ? <AppButton label={t('Open', 'Отвори')} variant="secondary" disabled={locked} onPress={() => openStep(router, node)} /> : null}{!done ? <AppButton label={node.bonus ? t('Claim bonus', 'Вземи бонуса') : t('Complete node', 'Завърши точката')} disabled={!unlocked} loading={busy === node.id} onPress={() => void finish(node.id)} /> : null}</View></View></View></Card>; })}</View>
    {!user ? <StatePanel icon="lock-closed-outline" title={t('Preview mode', 'Режим за преглед')} message={t('Sign in when you are ready to save quest progress and earn rewards.', 'Влезте, когато сте готови да пазите прогрес и да печелите награди.')} action={<AppButton label={t('Sign in', 'Вход')} onPress={() => router.push('/auth/signin')} />} /> : null}
  </Content></ScrollView></Screen>;
}

function openStep(router: ReturnType<typeof useRouter>, step: KnowledgeMissionStep) { if (step.kind === 'action') return router.push(step.action?.route || '/habits/log'); if (!step.itemId) return; const route = step.kind === 'quiz' ? `/knowledge/quiz/${step.itemId}` : step.kind === 'tour' ? `/knowledge/tour/${step.itemId}` : step.kind === 'simulation' ? `/knowledge/simulation/${step.itemId}` : `/knowledge/content/${step.itemId.startsWith('infographic-') ? step.itemId.replace(/^infographic-/, '') + '-visual-guide' : step.itemId.replace(/^knowledge-/, '').replace(/-(intro|guide)$/, (_match, suffix) => suffix === 'intro' ? '-explained' : '-starter-guide')}`; router.push(route as any); }
