import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, Share, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { knowledgeService, useKnowledgeLocale, type KnowledgeChallengeAttempt, type KnowledgeMissionStep } from '@/features/knowledge';
import { useAppTheme } from '@/theme';

export default function KnowledgeChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const { locale, t } = useKnowledgeLocale();
  const router = useRouter();
  const challenge = useMemo(() => knowledgeService.getChallenge(id), [id]);
  const [attempt, setAttempt] = useState<KnowledgeChallengeAttempt | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => { if (user && challenge) void knowledgeService.getChallengeAttempts(user.id).then((items) => setAttempt(items.filter((entry) => entry.challengeId === challenge.id).at(-1) || null)); }, [user, challenge]);
  useFocusEffect(load);
  if (!challenge) return <Screen><Content><StatePanel icon="alert-circle-outline" title={t('Challenge unavailable', 'Предизвикателството не е налично')} message={t('Choose another mission from the Hub.', 'Изберете друга мисия от Hub.')} /></Content></Screen>;

  const start = async (restart = false) => {
    if (!user) return router.push('/auth/signin');
    setBusy('start');
    try {
      setError(null);
      const next = await knowledgeService.startChallenge(user.id, challenge.id, restart);
      setAttempt(next);
      const permission = await Notifications.requestPermissionsAsync();
      const reminder = new Date(new Date(next.deadlineAt).getTime() - 86400000);
      if (permission.status === 'granted' && reminder > new Date()) await Notifications.scheduleNotificationAsync({ content: { title: t('Learning challenge reminder', 'Напомняне за учебно предизвикателство'), body: challenge.title[locale], data: { url: `/knowledge/challenge/${challenge.id}` } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminder } });
    } catch (cause) { setError(cause instanceof Error ? cause.message : t('Challenge could not be started.', 'Предизвикателството не можа да започне.')); } finally { setBusy(null); }
  };
  const complete = async (stepId: string) => { if (!user) return router.push('/auth/signin'); setBusy(stepId); setError(null); try { setAttempt(await knowledgeService.completeChallengeStep(user.id, challenge.id, stepId)); } catch (cause) { setError(cause instanceof Error ? cause.message : t('This step could not be verified.', 'Стъпката не можа да бъде потвърдена.')); } finally { setBusy(null); } };
  const percent = attempt ? Math.round((attempt.completedStepIds.length / challenge.steps.filter((step) => step.required).length) * 100) : 0;
  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content>
    <PageHeader eyebrow={t(`${challenge.durationDays}-day learning challenge`, `${challenge.durationDays}-дневно учебно предизвикателство`)} title={challenge.title[locale]} description={challenge.summary[locale]} />
    <Card elevated style={{ backgroundColor: theme.colors.primary, marginBottom: 20 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Ionicons name={attempt?.status === 'completed' ? 'trophy' : attempt?.status === 'expired' ? 'time-outline' : 'flash-outline'} size={28} color="#FFFFFF" /><View style={{ flex: 1 }}><Text style={[theme.typography.h2, { color: '#FFFFFF' }]}>{attempt ? statusLabel(attempt.status, locale) : t('Ready when you are', 'Готово, когато сте готови')}</Text><Text style={[theme.typography.bodySmall, { color: '#D8EAE0', marginTop: 4 }]}>{attempt ? `${percent}% • ${t('Deadline', 'Краен срок')}: ${new Date(attempt.deadlineAt).toLocaleDateString()}` : t('Only one learning challenge can be active at a time.', 'Само едно учебно предизвикателство може да е активно.')}</Text></View></View><View style={{ height: 7, borderRadius: 4, overflow: 'hidden', backgroundColor: '#FFFFFF2B', marginTop: 16 }}><View style={{ height: '100%', width: `${percent}%`, backgroundColor: theme.colors.accent }} /></View>{!attempt ? <AppButton label={t('Start challenge', 'Започни предизвикателството')} loading={busy === 'start'} onPress={() => void start()} style={{ marginTop: 16 }} /> : attempt.status === 'expired' ? <AppButton label={t('Restart challenge', 'Започни отново')} loading={busy === 'start'} onPress={() => void start(true)} style={{ marginTop: 16 }} /> : attempt.status === 'completed' ? <AppButton label={t('Share achievement', 'Сподели постижението')} icon="share-outline" onPress={() => void Share.share({ message: t(`I completed “${challenge.title.en}” in Green Compass.`, `Завърших „${challenge.title.bg}“ в Green Compass.`) })} style={{ marginTop: 16 }} /> : null}</Card>
    {error ? <Text accessibilityRole="alert" style={[theme.typography.bodySmall, { color: theme.colors.danger, marginBottom: 12 }]}>{error}</Text> : null}
    <View style={{ gap: 11 }}>{challenge.steps.map((step, index) => { const done = Boolean(attempt?.completedStepIds.includes(step.id)); const unlocked = step.prerequisiteIds.every((parent) => attempt?.completedStepIds.includes(parent)); return <Card key={step.id} style={{ borderLeftWidth: 4, borderLeftColor: done ? theme.colors.success : unlocked ? theme.colors.primary : theme.colors.borderStrong }}><View style={{ flexDirection: 'row', gap: 13, alignItems: 'flex-start' }}><View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: done ? theme.colors.primarySoft : theme.colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={done ? 'checkmark' : unlocked ? stepIcon(step.kind) : 'lock-closed-outline'} size={19} color={done ? theme.colors.success : unlocked ? theme.colors.primary : theme.colors.textMuted} /></View><View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: theme.colors.textMuted }]}>{t('STEP', 'СТЪПКА')} {index + 1} • {done ? t('COMPLETED', 'ЗАВЪРШЕНА') : unlocked ? t('AVAILABLE', 'ДОСТЪПНА') : t('LOCKED', 'ЗАКЛЮЧЕНА')}</Text><Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 4 }]}>{step.title[locale]}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>{step.itemId || step.action ? <AppButton label={t('Open step', 'Отвори стъпката')} variant="secondary" disabled={!unlocked} onPress={() => openStep(router, step)} /> : null}{!done ? <AppButton label={t('Mark complete', 'Отбележи като завършена')} disabled={!attempt || attempt.status !== 'active' || !unlocked} loading={busy === step.id} onPress={() => void complete(step.id)} /> : null}</View></View></View></Card>; })}</View>
    <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, textAlign: 'center', marginTop: 20 }]}>{t(`${challenge.rewardPoints} Green Points are awarded once after server validation.`, `${challenge.rewardPoints} Green Points се дават еднократно след сървърна проверка.`)}</Text>
  </Content></ScrollView></Screen>;
}

function statusLabel(status: KnowledgeChallengeAttempt['status'], locale: 'en' | 'bg') { return status === 'completed' ? (locale === 'bg' ? 'Предизвикателството е завършено' : 'Challenge completed') : status === 'expired' ? (locale === 'bg' ? 'Срокът е изтекъл' : 'Challenge expired') : (locale === 'bg' ? 'Предизвикателството е активно' : 'Challenge active'); }
function stepIcon(kind: KnowledgeMissionStep['kind']): keyof typeof Ionicons.glyphMap { return kind === 'quiz' ? 'help-circle-outline' : kind === 'simulation' ? 'flask-outline' : kind === 'tour' ? 'navigate-outline' : kind === 'diy' ? 'hammer-outline' : kind === 'action' ? 'leaf-outline' : 'book-outline'; }
function openStep(router: ReturnType<typeof useRouter>, step: KnowledgeMissionStep) { if (step.kind === 'action') return router.push(step.action?.route || '/habits/log'); if (!step.itemId) return; const route = step.kind === 'quiz' ? `/knowledge/quiz/${step.itemId}` : step.kind === 'tour' ? `/knowledge/tour/${step.itemId}` : step.kind === 'simulation' ? `/knowledge/simulation/${step.itemId}` : `/knowledge/content/${step.itemId.startsWith('infographic-') ? step.itemId.replace(/^infographic-/, '') + '-visual-guide' : step.itemId.replace(/^knowledge-/, '').replace(/-(intro|guide)$/, (_match, suffix) => suffix === 'intro' ? '-explained' : '-starter-guide')}`; router.push(route as any); }
