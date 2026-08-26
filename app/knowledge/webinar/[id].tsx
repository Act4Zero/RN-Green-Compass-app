import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Linking, ScrollView, Share, Text, TextInput, View } from 'react-native';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';
import { AppButton, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { knowledgeService, useKnowledgeLocale, type KnowledgeWebinar, type KnowledgeWebinarQuestion } from '@/features/knowledge';
import { useAppTheme } from '@/theme';

export default function KnowledgeWebinarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const { t } = useKnowledgeLocale();
  const router = useRouter();
  const [webinar, setWebinar] = useState<KnowledgeWebinar | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [questions, setQuestions] = useState<KnowledgeWebinarQuestion[]>([]);
  const [questionBody, setQuestionBody] = useState('');
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [questionBusy, setQuestionBusy] = useState(false);
  const [registered, setRegistered] = useState(false);
  const loadQuestions = useCallback(async (webinarId: string) => setQuestions(await knowledgeService.getWebinarQuestions(webinarId, user?.id)), [user?.id]);
  useEffect(() => { void knowledgeService.getWebinarDetails(id).then((record) => { setWebinar(record); setLoaded(true); if (record) void loadQuestions(record.id); }); }, [id, loadQuestions]);
  if (!loaded) return <Screen><Content><StatePanel icon="hourglass-outline" title={t('Loading live session', 'Зареждаме сесията')} message={t('Schedule and moderated questions are being synchronized.', 'Графикът и модерираните въпроси се синхронизират.')} /></Content></Screen>;
  if (!webinar) return <Screen><Content><StatePanel title={t('Session unavailable', 'Сесията не е налична')} message={t('Return to the live learning calendar.', 'Върнете се към календара за обучение на живо.')} /></Content></Screen>;
  const calendarText = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${webinar.startsAt.replace(/[-:]/g, '').replace('.000', '')}\nSUMMARY:Green Compass - ${webinar.speaker}\nURL:${webinar.joinUrl}\nEND:VEVENT\nEND:VCALENDAR`;
  const register = async () => {
    await knowledgeService.registerForWebinar(user?.id, webinar.id, true);
    const permission = await Notifications.requestPermissionsAsync();
    const reminderAt = new Date(new Date(webinar.startsAt).getTime() - 60 * 60 * 1000);
    if (permission.status === 'granted' && reminderAt > new Date()) await Notifications.scheduleNotificationAsync({ content: { title: 'Green Compass live studio', body: `${webinar.speaker} starts in one hour.`, data: { url: `/knowledge/webinar/${webinar.id}` } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderAt } });
    setRegistered(true);
  };
  const addCalendar = async () => {
    const permission = await Calendar.requestCalendarPermissionsAsync();
    if (permission.status !== 'granted') return void Share.share({ message: calendarText });
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const writable = calendars.find((entry) => entry.allowsModifications);
    if (!writable) return void Share.share({ message: calendarText });
    await Calendar.createEventAsync(writable.id, { title: `Green Compass: ${webinar.speaker}`, startDate: new Date(webinar.startsAt), endDate: new Date(new Date(webinar.startsAt).getTime() + webinar.durationMinutes * 60000), timeZone: webinar.timezone, url: webinar.joinUrl, notes: webinar.speakerRole });
  };
  const submitQuestion = async () => {
    if (!user) return router.push('/auth/signin');
    setQuestionBusy(true); setQuestionError(null);
    try { await knowledgeService.submitWebinarQuestion(user.id, webinar.id, questionBody); setQuestionBody(''); await loadQuestions(webinar.id); }
    catch (error) { setQuestionError(error instanceof Error ? error.message : t('Question could not be submitted.', 'Въпросът не можа да бъде изпратен.')); }
    finally { setQuestionBusy(false); }
  };
  const vote = async (question: KnowledgeWebinarQuestion) => { if (!user) return router.push('/auth/signin'); const next = await knowledgeService.toggleWebinarQuestionVote(user.id, question); setQuestions((current) => current.map((entry) => entry.id === next.id ? next : entry).sort((a, b) => b.upvotes - a.upvotes)); };
  return <Screen><ScrollView><Content>
    <PageHeader eyebrow={t('Guest lecture & live Q&A', 'Гост-лекция и въпроси на живо')} title={webinar.speaker} description={`${webinar.speakerRole} • ${new Date(webinar.startsAt).toLocaleString()} • ${webinar.durationMinutes} min`} />
    <Card elevated style={{ maxWidth: 760, width: '100%', alignSelf: 'center', padding: 28 }}><Text style={[theme.typography.h2, { color: theme.colors.text }]}>{t('Join the learning room', 'Присъединете се към обучението')}</Text><Text style={[theme.typography.body, { color: theme.colors.textMuted, marginTop: 10 }]}>{t('Registration is saved to your account and on this device. The approved external stream opens only when you choose Join.', 'Регистрацията се запазва в профила и на устройството. Одобреният външен поток се отваря само когато изберете „Присъедини се“.')}</Text><View style={{ gap: 10, marginTop: 22 }}><AppButton label={registered ? t('Registered', 'Регистрирани сте') : t('Register with reminder', 'Регистрация с напомняне')} icon="notifications-outline" disabled={registered} onPress={() => void register()} /><AppButton label={t('Add to calendar', 'Добави в календара')} variant="secondary" icon="calendar-outline" onPress={() => void addCalendar()} /><AppButton label={t('Join approved stream', 'Отвори одобрения поток')} variant="secondary" icon="videocam-outline" onPress={() => void Linking.openURL(webinar.joinUrl)} /></View><View style={{ marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: theme.colors.border }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{t('Accessible replay', 'Достъпен запис')}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 6 }]}>{webinar.transcript}</Text>{webinar.replayUrl ? <AppButton label={t('Open replay library', 'Отвори библиотеката със записи')} variant="ghost" onPress={() => void Linking.openURL(webinar.replayUrl!)} style={{ marginTop: 10 }} /> : null}</View></Card>
    <Card style={{ maxWidth: 760, width: '100%', alignSelf: 'center', marginTop: 16, padding: 24 }}><Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text }]}>{t('Moderated Q&A', 'Модерирани въпроси и отговори')}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 6 }]}>{t('Questions are visible to you immediately and become public after editorial approval. Q&A does not award points.', 'Въпросите се виждат веднага от вас и стават публични след редакторско одобрение. Q&A не дава точки.')}</Text><TextInput accessibilityLabel={t('Question for the speaker', 'Въпрос към лектора')} multiline maxLength={500} value={questionBody} onChangeText={setQuestionBody} placeholder={t('Ask a focused, respectful question…', 'Задайте ясен и уважителен въпрос…')} placeholderTextColor={theme.colors.textMuted} style={[theme.typography.body, { minHeight: 104, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.surface, borderRadius: theme.radii.md, padding: 14, textAlignVertical: 'top', marginTop: 16 }]} /><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, textAlign: 'right', marginTop: 4 }]}>{questionBody.length}/500</Text>{questionError ? <Text accessibilityLiveRegion="assertive" style={[theme.typography.bodySmall, { color: theme.colors.danger, marginTop: 6 }]}>{questionError}</Text> : null}<AppButton label={user ? t('Submit for moderation', 'Изпрати за модерация') : t('Sign in to ask', 'Влезте, за да попитате')} icon="send-outline" disabled={Boolean(user) && questionBody.trim().length < 10} loading={questionBusy} onPress={() => void submitQuestion()} style={{ alignSelf: 'flex-start', marginTop: 10 }} />
      <View style={{ gap: 10, marginTop: 22 }}>{questions.length === 0 ? <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('No approved questions yet. Start the conversation.', 'Все още няма одобрени въпроси. Започнете разговора.')}</Text> : questions.map((question) => <View key={question.id} style={{ paddingTop: 14, borderTopWidth: 1, borderTopColor: theme.colors.border }}><View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}><View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: question.status === 'pending' ? theme.colors.warning : theme.colors.primary }]}>{question.status === 'pending' ? t('PENDING MODERATION', 'ОЧАКВА МОДЕРАЦИЯ') : question.status === 'answered' ? t('ANSWERED', 'ОТГОВОРЕН') : t('APPROVED', 'ОДОБРЕН')}</Text><Text style={[theme.typography.body, { color: theme.colors.text, marginTop: 4 }]}>{question.body}</Text>{question.answer ? <View style={{ backgroundColor: theme.colors.primarySoft, padding: 12, borderRadius: theme.radii.md, marginTop: 9 }}><Text style={[theme.typography.label, { color: theme.colors.primary }]}>{t('SPEAKER ANSWER', 'ОТГОВОР ОТ ЛЕКТОРА')}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.text, marginTop: 4 }]}>{question.answer}</Text>{typeof question.replayTimestampSeconds === 'number' ? <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 4 }]}>Replay {Math.floor(question.replayTimestampSeconds / 60)}:{String(question.replayTimestampSeconds % 60).padStart(2, '0')}</Text> : null}</View> : null}</View>{question.status !== 'pending' ? <AppButton label={`${question.upvotes}`} accessibilityLabel={t(`${question.upvotes} supports`, `${question.upvotes} подкрепи`)} icon={question.viewerHasUpvoted ? 'thumbs-up' : 'thumbs-up-outline'} variant="ghost" onPress={() => void vote(question)} /> : null}</View></View>)}</View>
    </Card>
    <AppButton label={t('Back to Hub', 'Назад към Hub')} variant="ghost" onPress={() => router.back()} style={{ marginTop: 20, alignSelf: 'center' }} />
  </Content></ScrollView></Screen>;
}
