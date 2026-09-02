import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { AppButton, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { KNOWLEDGE_TOPICS, knowledgeService, resolveKnowledgeVisual, useKnowledgeLocale, type KnowledgeItemDetail, type PublicKnowledgeQuiz, type QuizAttemptResult } from '@/features/knowledge';
import analyticsService from '@/services/analyticsService';
import { useAppTheme } from '@/theme';

export default function KnowledgeQuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const { locale, t } = useKnowledgeLocale();
  const reduceMotion = useReducedMotion();
  const [item, setItem] = useState<KnowledgeItemDetail | null>(null);
  const [quiz, setQuiz] = useState<PublicKnowledgeQuiz | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => { void Promise.all([knowledgeService.getPublishedItems(locale), knowledgeService.getQuiz(id, locale)]).then(([items, quizData]) => { setItem(items.find((entry) => entry.id === id) || null); setQuiz(quizData); analyticsService.trackScreenView('Knowledge Quiz'); }); }, [id, locale]);

  if (!item || !quiz) return <Screen><Content><StatePanel icon="help-circle-outline" title={t('Quiz unavailable', 'Тестът не е наличен')} message={t('This assessment may have been archived.', 'Този тест може да е архивиран.')} action={<AppButton label={t('Back to Hub', 'Назад към Hub')} onPress={() => router.replace('/knowledge' as any)} />} /></Content></Screen>;
  const resolvedVisual = resolveKnowledgeVisual(item, KNOWLEDGE_TOPICS);
  if (!started) return <Screen><ScrollView><Content><Card elevated style={{ padding: 0, overflow: 'hidden', backgroundColor: theme.mode === 'dark' ? resolvedVisual.visual.palette.darkSurface : resolvedVisual.visual.palette.surface }}><Image source={resolvedVisual.source} accessibilityLabel={resolvedVisual.visual.alt[locale]} resizeMode="cover" style={{ width: '100%', height: 240 }} /><View style={{ padding: 28 }}><Text style={[theme.typography.label, { color: resolvedVisual.visual.palette.primary }]}>{t('KNOWLEDGE CHALLENGE', 'ПРОВЕРКА НА ЗНАНИЯТА')}</Text><Text accessibilityRole="header" style={[theme.typography.h1, { color: theme.colors.text, marginTop: 8 }]}>{item.title}</Text><Text style={[theme.typography.body, { color: theme.colors.textMuted, marginTop: 10 }]}>{item.summary}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}><Meta icon="help-circle-outline" text={`${quiz.questions.length} ${t('questions', 'въпроса')}`} /><Meta icon="trophy-outline" text={`${quiz.passingScore}% ${t('to pass', 'за успех')}`} /><Meta icon="time-outline" text={`${item.estimatedMinutes} ${t('min', 'мин')}`} /></View><AppButton label={t('Start challenge', 'Започни теста')} icon="arrow-forward" onPress={() => setStarted(true)} style={{ alignSelf: 'flex-start', marginTop: 22 }} /></View></Card></Content></ScrollView></Screen>;
  if (result) return <Screen><ScrollView><Content><PageHeader eyebrow={t('Assessment result', 'Резултат от теста')} title={result.passed ? t('Quiz passed', 'Успешно преминат тест') : t('Keep learning', 'Продължете да учите')} description={t(`You scored ${result.score}% (${result.correctAnswers} of ${result.totalQuestions}). ${result.passed ? 'This learning milestone has been saved.' : 'Use the explanations below, then retry when you are ready.'}`, `Резултатът ви е ${result.score}% (${result.correctAnswers} от ${result.totalQuestions}). ${result.passed ? 'Този учебен етап е запазен.' : 'Прегледайте обясненията и опитайте отново.'}`)} /><View style={{ gap: 10 }}>{result.feedback.map((feedback, index) => { const source = item.sources.find((entry) => entry.id === feedback.sourceId); return <Animated.View key={feedback.questionId} entering={reduceMotion ? undefined : FadeInDown.delay(index * 70).duration(200)}><Card style={{ borderLeftWidth: 4, borderLeftColor: feedback.correct ? theme.colors.success : theme.colors.warning }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name={feedback.correct ? 'checkmark-circle' : 'information-circle'} size={20} color={feedback.correct ? theme.colors.success : theme.colors.warning} /><Text style={[theme.typography.label, { color: theme.colors.text }]}>{t('Question', 'Въпрос')} {index + 1}: {feedback.correct ? t('Correct', 'Правилен отговор') : t('Review this answer', 'Прегледайте отговора')}</Text></View><Text style={[theme.typography.body, { color: theme.colors.textMuted, marginTop: 8 }]}>{feedback.explanation}</Text>{source ? <AppButton label={`${t('Source', 'Източник')}: ${source.publisher}`} variant="ghost" icon="open-outline" onPress={() => void Linking.openURL(source.url)} style={{ alignSelf: 'flex-start', marginTop: 8 }} /> : null}</Card></Animated.View>; })}</View><View style={{ gap: 10, marginTop: 22 }}><AppButton label={result.passed ? t('Back to Hub', 'Назад към Hub') : t('Try again', 'Опитайте отново')} onPress={() => result.passed ? router.replace('/knowledge' as any) : (setResult(null), setAnswers({}), setQuestionIndex(0))} /><AppButton label={t('Read the lesson', 'Прочети урока')} variant="secondary" onPress={() => router.push(`/knowledge/content/${item.slug}` as any)} /></View></Content></ScrollView></Screen>;

  const question = quiz.questions[questionIndex];
  const selected = answers[question.id];
  const finalQuestion = questionIndex === quiz.questions.length - 1;
  const submit = async () => {
    if (!user) { addNotification({ type: 'banner', severity: 'info', title: t('Sign in to submit', 'Влезте, за да изпратите отговорите'), message: t('Quiz results and learning milestones are tied to your account.', 'Резултатите от тестовете и учебният напредък се пазят в профила ви.'), action: { label: t('Sign in', 'Вход'), onPress: () => router.push('/auth/signin') } }); return; }
    setSubmitting(true);
    const attempt = await knowledgeService.submitQuizAttempt(user.id, item.id, answers, undefined, locale);
    setResult(attempt);
    if (attempt.passed) await knowledgeService.setKnowledgeProgress(user.id, item.id, item.versionId, 100, attempt.attemptId);
    analyticsService.trackEvent('knowledge_quiz_submitted', { content_id: item.id, score: attempt.score, passed: attempt.passed });
    setSubmitting(false);
  };

  return (
    <Screen><ScrollView showsVerticalScrollIndicator={false}><Content>
      <PageHeader eyebrow={t(`${questionIndex + 1} of ${quiz.questions.length}`, `${questionIndex + 1} от ${quiz.questions.length}`)} title={item.title} description={item.summary} />
      <View style={{ height: 7, borderRadius: 4, backgroundColor: theme.colors.surfaceStrong, overflow: 'hidden', marginBottom: 22 }}><View style={{ height: '100%', width: `${((questionIndex + 1) / quiz.questions.length) * 100}%`, backgroundColor: theme.colors.primary }} /></View>
      <Card elevated style={{ padding: 24 }}>
        <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text }]}>{question.prompt}</Text>
        <View style={{ gap: 10, marginTop: 22 }}>{question.options.map((option) => { const active = selected === option.id; return <Pressable key={option.id} accessibilityRole="radio" accessibilityState={{ selected: active }} onPress={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))} style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: active ? theme.colors.primary : theme.colors.border, borderRadius: theme.radii.md, padding: 14, backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface }}><Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={21} color={active ? theme.colors.primary : theme.colors.textMuted} /><Text style={[theme.typography.body, { color: theme.colors.text, flex: 1 }]}>{option.text}</Text></Pressable>; })}</View>
      </Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 18 }}>
        <AppButton label={t('Previous', 'Назад')} variant="ghost" disabled={questionIndex === 0} onPress={() => setQuestionIndex((index) => index - 1)} />
        <AppButton label={finalQuestion ? t('Submit quiz', 'Предай теста') : t('Next', 'Напред')} icon="arrow-forward" disabled={!selected} loading={submitting} onPress={() => finalQuestion ? void submit() : setQuestionIndex((index) => index + 1)} />
      </View>
      <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 22, textAlign: 'center' }]}>{t(`Passing score: ${quiz.passingScore}% • Every result includes a source-backed explanation.`, `Необходим резултат: ${quiz.passingScore}% • Всеки резултат включва обяснение, подкрепено с източник.`)}</Text>
    </Content></ScrollView></Screen>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  const { theme } = useAppTheme();
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, backgroundColor: theme.colors.surface, paddingHorizontal: 10, paddingVertical: 7 }}><Ionicons name={icon} size={16} color={theme.colors.primary} /><Text style={[theme.typography.label, { color: theme.colors.text }]}>{text}</Text></View>;
}
