import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { knowledgeService, type KnowledgeItemDetail, type PublicKnowledgeQuiz, type QuizAttemptResult } from '@/features/knowledge';
import analyticsService from '@/services/analyticsService';
import { useAppTheme } from '@/theme';

export default function KnowledgeQuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [item, setItem] = useState<KnowledgeItemDetail | null>(null);
  const [quiz, setQuiz] = useState<PublicKnowledgeQuiz | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { void Promise.all([knowledgeService.getPublishedItems(), knowledgeService.getQuiz(id)]).then(([items, quizData]) => { setItem(items.find((entry) => entry.id === id) || null); setQuiz(quizData); analyticsService.trackScreenView('Knowledge Quiz'); }); }, [id]);

  if (!item || !quiz) return <Screen><Content><StatePanel icon="help-circle-outline" title="Quiz unavailable" message="This assessment may have been archived." action={<AppButton label="Back to Hub" onPress={() => router.replace('/knowledge' as any)} />} /></Content></Screen>;
  if (result) return <Screen><ScrollView><Content><PageHeader eyebrow="Assessment result" title={result.passed ? 'Quiz passed' : 'Keep learning'} description={`You scored ${result.score}% (${result.correctAnswers} of ${result.totalQuestions}). ${result.passed ? 'This meaningful learning milestone has been saved.' : 'Use the explanations below, then retry when you are ready.'}`} /><View style={{ gap: 10 }}>{result.feedback.map((feedback, index) => { const source = item.sources.find((entry) => entry.id === feedback.sourceId); return <Card key={feedback.questionId} style={{ borderLeftWidth: 4, borderLeftColor: feedback.correct ? theme.colors.success : theme.colors.warning }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name={feedback.correct ? 'checkmark-circle' : 'information-circle'} size={20} color={feedback.correct ? theme.colors.success : theme.colors.warning} /><Text style={[theme.typography.label, { color: theme.colors.text }]}>Question {index + 1}: {feedback.correct ? 'Correct' : 'Review this answer'}</Text></View><Text style={[theme.typography.body, { color: theme.colors.textMuted, marginTop: 8 }]}>{feedback.explanation}</Text>{source ? <AppButton label={`Source: ${source.publisher}`} variant="ghost" icon="open-outline" onPress={() => void Linking.openURL(source.url)} style={{ alignSelf: 'flex-start', marginTop: 8 }} /> : null}</Card>; })}</View><View style={{ gap: 10, marginTop: 22 }}><AppButton label={result.passed ? 'Back to Hub' : 'Try again'} onPress={() => result.passed ? router.replace('/knowledge' as any) : (setResult(null), setAnswers({}), setQuestionIndex(0))} /><AppButton label="Read the lesson" variant="secondary" onPress={() => router.push(`/knowledge/content/${item.slug}` as any)} /></View></Content></ScrollView></Screen>;

  const question = quiz.questions[questionIndex];
  const selected = answers[question.id];
  const finalQuestion = questionIndex === quiz.questions.length - 1;
  const submit = async () => {
    if (!user) { addNotification({ type: 'banner', severity: 'info', title: 'Sign in to submit', message: 'Quiz results and learning milestones are tied to your account.', action: { label: 'Sign in', onPress: () => router.push('/auth/signin') } }); return; }
    setSubmitting(true);
    const attempt = await knowledgeService.submitQuizAttempt(user.id, item.id, answers);
    setResult(attempt);
    if (attempt.passed) await knowledgeService.setKnowledgeProgress(user.id, item.id, item.versionId, 100, attempt.attemptId);
    analyticsService.trackEvent('knowledge_quiz_submitted', { content_id: item.id, score: attempt.score, passed: attempt.passed });
    setSubmitting(false);
  };

  return (
    <Screen><ScrollView showsVerticalScrollIndicator={false}><Content>
      <PageHeader eyebrow={`${questionIndex + 1} of ${quiz.questions.length}`} title={item.title} description={item.summary} />
      <View style={{ height: 7, borderRadius: 4, backgroundColor: theme.colors.surfaceStrong, overflow: 'hidden', marginBottom: 22 }}><View style={{ height: '100%', width: `${((questionIndex + 1) / quiz.questions.length) * 100}%`, backgroundColor: theme.colors.primary }} /></View>
      <Card elevated style={{ padding: 24 }}>
        <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text }]}>{question.prompt}</Text>
        <View style={{ gap: 10, marginTop: 22 }}>{question.options.map((option) => { const active = selected === option.id; return <Pressable key={option.id} accessibilityRole="radio" accessibilityState={{ selected: active }} onPress={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))} style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: active ? theme.colors.primary : theme.colors.border, borderRadius: theme.radii.md, padding: 14, backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface }}><Ionicons name={active ? 'radio-button-on' : 'radio-button-off'} size={21} color={active ? theme.colors.primary : theme.colors.textMuted} /><Text style={[theme.typography.body, { color: theme.colors.text, flex: 1 }]}>{option.text}</Text></Pressable>; })}</View>
      </Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 18 }}>
        <AppButton label="Previous" variant="ghost" disabled={questionIndex === 0} onPress={() => setQuestionIndex((index) => index - 1)} />
        <AppButton label={finalQuestion ? 'Submit quiz' : 'Next'} icon="arrow-forward" disabled={!selected} loading={submitting} onPress={() => finalQuestion ? void submit() : setQuestionIndex((index) => index + 1)} />
      </View>
      <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 22, textAlign: 'center' }]}>Passing score: {quiz.passingScore}% • Every result includes a source-backed explanation.</Text>
    </Content></ScrollView></Screen>
  );
}
