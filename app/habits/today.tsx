import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import { ChoiceChips } from '@/components/offsetting/OffsettingUI';
import { AppButton, Card, Content, PageHeader, Screen, Skeleton, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { addImpactMetrics, createPrivacySafeShareSummary, offsettingService, type OffsettingDashboard } from '@/features/offsetting';
import type { KnowledgeItemSummary } from '@/features/knowledge';
import { fetchUserProfile } from '@/services/profile';
import { useAppTheme } from '@/theme';

const dateKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export default function TodayScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [dashboard, setDashboard] = useState<OffsettingDashboard | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeItemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [savingReflection, setSavingReflection] = useState(false);
  const [checkInActivity, setCheckInActivity] = useState('none');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const profile = await fetchUserProfile(user.id);
      const interests = profile?.interests || [];
      const data = await offsettingService.getDashboard(user.id, dateKey(), interests);
      setDashboard(data);
      setKnowledge(await offsettingService.getPersonalizedKnowledge(interests, Object.keys(data.impact.byCategory || {}), user.id, data.learningStage));
    } catch (loadError) {
      setDashboard(null);
      setError(loadError instanceof Error ? loadError.message : 'Unable to load today’s practice.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { if (user) void load(); }, [user, load]));

  const updateReflection = (updates: Partial<NonNullable<OffsettingDashboard['reflection']>>) => {
    if (!dashboard) return;
    setDashboard({ ...dashboard, reflection: { reflectionDate: dateKey(), didSustainableAction: null, actionNote: '', gratitudeNote: '', journalNote: '', ...(dashboard.reflection || {}), ...updates } });
  };

  const completeChallenge = async () => {
    if (!user || !dashboard?.dailyChallenge) return;
    setCompleting(true);
    try {
      const assignment = await offsettingService.completeDailyChallenge(user.id, dashboard.dailyChallenge);
      setDashboard({ ...dashboard, dailyChallenge: assignment });
      addNotification({ type: 'toast', severity: 'success', message: 'Challenge completed — 5 green points earned.' });
    } catch {
      addNotification({ type: 'toast', severity: 'error', message: 'The challenge could not be completed. Please try again.' });
    } finally {
      setCompleting(false);
    }
  };

  const saveReflection = async () => {
    if (!user || !dashboard?.reflection) return;
    setSavingReflection(true);
    try {
      const reflection = await offsettingService.saveReflection(user.id, dashboard.reflection);
      if (reflection.didSustainableAction && checkInActivity !== 'none') {
        await offsettingService.saveCarbonActivity(user.id, {
          factorCode: checkInActivity,
          comparisonFactorCode: checkInActivity === 'plant-meal' ? 'beef-meal' : 'new-clothing-item',
          quantity: 1,
          occurredOn: dateKey(),
          notes: 'Daily check-in preset',
          sourceEventId: `daily-check-in:${dateKey()}:${checkInActivity}`,
        });
      }
      setDashboard({ ...dashboard, reflection });
      addNotification({ type: 'toast', severity: 'success', message: 'Your private reflection was saved.' });
    } catch {
      addNotification({ type: 'toast', severity: 'error', message: 'Your reflection could not be saved. Please try again.' });
    } finally {
      setSavingReflection(false);
    }
  };

  const shareText = () => {
    if (!dashboard) return '';
    const metrics = addImpactMetrics(dashboard.impact.metrics, dashboard.dailyChallenge?.completedAt ? dashboard.dailyChallenge.challenge.impact : undefined);
    return createPrivacySafeShareSummary({ challengeTitle: dashboard.dailyChallenge?.completedAt ? dashboard.dailyChallenge.challenge.title : undefined, metrics, streak: dashboard.impact.challengeStreak });
  };

  if (loading) return <Screen><Content><Skeleton height={220} /><Skeleton height={280} style={{ marginTop: 16 }} /></Content></Screen>;
  if (!dashboard) return <Screen><Content><StatePanel title="Today is unavailable" message={error || 'Refresh the page when you are connected.'} action={<AppButton label="Try again" onPress={() => void load()} />} /></Content></Screen>;

  const assignment = dashboard.dailyChallenge;
  const reflection = dashboard.reflection || { reflectionDate: dateKey(), didSustainableAction: null, actionNote: '', gratitudeNote: '', journalNote: '' };
  const quiz = knowledge.find((item) => item.type === 'quiz') || knowledge[0];

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Content>
          <PageHeader eyebrow="Daily practice" title="One thoughtful step today" description="Complete a small challenge, check in with yourself, and learn why your action matters." />

          {assignment ? (
            <Card elevated style={{ marginBottom: theme.spacing.lg, backgroundColor: assignment.completedAt ? theme.colors.primarySoft : theme.colors.accentSoft, gap: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
                <View style={{ width: 50, height: 50, borderRadius: 17, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={assignment.completedAt ? 'checkmark' : 'sparkles'} size={24} color={theme.colors.accent} /></View>
                <View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{assignment.challenge.difficulty} challenge · 5 points</Text><Text style={[theme.typography.h2, { color: theme.colors.text, marginTop: 4 }]}>{assignment.challenge.title}</Text></View>
              </View>
              <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{assignment.challenge.description}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                <AppButton label={assignment.completedAt ? 'Completed today' : 'Mark complete'} icon={assignment.completedAt ? 'checkmark-circle' : 'checkmark'} disabled={Boolean(assignment.completedAt)} loading={completing} onPress={() => void completeChallenge()} style={{ flex: 1 }} />
                <AppButton label="Learn why" variant="secondary" onPress={() => router.push(`/knowledge/content/${assignment.challenge.knowledgeSlug}` as any)} style={{ flex: 1 }} />
              </View>
            </Card>
          ) : null}

          <Card style={{ marginBottom: theme.spacing.lg, gap: theme.spacing.md }}>
            <Text style={[theme.typography.h2, { color: theme.colors.text }]}>Daily check-in</Text>
            <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Did you do something sustainable today?</Text>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              {[{ value: true, label: 'Yes, I did' }, { value: false, label: 'Not yet' }].map((choice) => (
                <Pressable key={choice.label} accessibilityRole="radio" accessibilityState={{ selected: reflection.didSustainableAction === choice.value }} onPress={() => updateReflection({ didSustainableAction: choice.value })} style={{ flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radii.md, borderWidth: 1, borderColor: reflection.didSustainableAction === choice.value ? theme.colors.primary : theme.colors.border, backgroundColor: reflection.didSustainableAction === choice.value ? theme.colors.primarySoft : theme.colors.surface }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>{choice.label}</Text></Pressable>
              ))}
            </View>
            <ReflectionInput label="What action or intention stands out?" value={reflection.actionNote} onChangeText={(actionNote) => updateReflection({ actionNote })} />
            {reflection.didSustainableAction ? <ChoiceChips label="Optionally add one measured preset (saved once; private text is never copied)" value={checkInActivity} onChange={setCheckInActivity} options={[{ value: 'none', label: 'Reflection only' }, { value: 'plant-meal', label: 'Plant-forward meal' }, { value: 'reused-clothing-item', label: 'Chose reused clothing' }]} /> : null}
            <ReflectionInput label="What in nature are you grateful for today?" value={reflection.gratitudeNote} onChangeText={(gratitudeNote) => updateReflection({ gratitudeNote })} />
            <ReflectionInput label="A note to your future self (optional)" value={reflection.journalNote} onChangeText={(journalNote) => updateReflection({ journalNote })} />
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Private by default. Journal and gratitude text are never added to a share automatically.</Text>
            <AppButton label="Save private reflection" icon="lock-closed-outline" loading={savingReflection} onPress={() => void saveReflection()} />
          </Card>

          {dashboard.poll ? (
            <Card style={{ marginBottom: theme.spacing.lg, gap: theme.spacing.md }}>
              <Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>Daily poll</Text>
              <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{dashboard.poll.question}</Text>
              <View style={{ gap: theme.spacing.xs }}>
                {dashboard.poll.options.map((option) => {
                  const selected = dashboard.poll?.selectedOptionId === option.id;
                  return <Pressable key={option.id} accessibilityRole="radio" accessibilityState={{ selected }} onPress={async () => { if (!user || !dashboard.poll) return; const poll = await offsettingService.respondToPoll(user.id, dashboard.poll, option.id); setDashboard({ ...dashboard, poll }); }} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: theme.radii.md, borderWidth: 1, borderColor: selected ? theme.colors.primary : theme.colors.border, backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface, paddingHorizontal: theme.spacing.md }}><Text style={[theme.typography.body, { color: theme.colors.text }]}>{option.label}</Text>{option.count !== undefined ? <Text style={[theme.typography.label, { color: theme.colors.textMuted }]}>{option.count}</Text> : null}</Pressable>;
                })}
              </View>
            </Card>
          ) : null}

          {quiz ? (
            <Card style={{ marginBottom: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
              <View style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="help-circle-outline" size={23} color={theme.colors.primary} /></View>
              <View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: theme.colors.primary }]}>INTERACTIVE LEARNING</Text><Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 3 }]}>{quiz.title}</Text></View>
              <AppButton label={quiz.type === 'quiz' ? 'Take quiz' : 'Open'} variant="secondary" onPress={() => router.push((quiz.type === 'quiz' ? `/knowledge/quiz/${quiz.id}` : `/knowledge/content/${quiz.slug}`) as any)} />
            </Card>
          ) : null}

          <Card style={{ gap: theme.spacing.sm }}>
            <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Share progress, not private notes</Text>
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Review the generated aggregate summary before sending it anywhere.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
              <AppButton label="Native share" icon="share-outline" variant="secondary" onPress={() => void Share.share({ message: shareText() })} style={{ flex: 1 }} />
              <AppButton label="Share in community" icon="people-outline" onPress={() => router.push({ pathname: '/community/post/new-post', params: { prefillTitle: 'My sustainability progress', prefillContent: shareText() } })} style={{ flex: 1 }} />
            </View>
          </Card>
        </Content>
      </ScrollView>
    </Screen>
  );
}

function ReflectionInput({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  const { theme } = useAppTheme();
  return <View style={{ gap: theme.spacing.xs }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>{label}</Text><TextInput accessibilityLabel={label} multiline value={value} onChangeText={onChangeText} maxLength={1000} placeholder="Write a short reflection…" placeholderTextColor={theme.colors.textMuted} style={[theme.typography.body, { minHeight: 88, textAlignVertical: 'top', color: theme.colors.text, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderStrong, borderRadius: theme.radii.md, padding: theme.spacing.md }]} /></View>;
}
