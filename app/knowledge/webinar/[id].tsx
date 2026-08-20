import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Linking, ScrollView, Share, Text, View } from 'react-native';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';
import { AppButton, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { knowledgeService, useKnowledgeLocale } from '@/features/knowledge';
import { useAppTheme } from '@/theme';

export default function KnowledgeWebinarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { theme } = useAppTheme();
  const { t } = useKnowledgeLocale();
  const router = useRouter();
  const webinar = useMemo(() => knowledgeService.getWebinar(id), [id]);
  const [registered, setRegistered] = useState(false);
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
  return <Screen><ScrollView><Content>
    <PageHeader eyebrow={t('Guest lecture & live Q&A', 'Гост-лекция и въпроси на живо')} title={webinar.speaker} description={`${webinar.speakerRole} • ${new Date(webinar.startsAt).toLocaleString()} • ${webinar.durationMinutes} min`} />
    <Card elevated style={{ maxWidth: 760, width: '100%', alignSelf: 'center', padding: 28 }}><Text style={[theme.typography.h2, { color: theme.colors.text }]}>{t('Join the learning room', 'Присъединете се към обучението')}</Text><Text style={[theme.typography.body, { color: theme.colors.textMuted, marginTop: 10 }]}>{t('Registration is saved to your account and on this device. The approved external stream opens only when you choose Join.', 'Регистрацията се запазва в профила и на устройството. Одобреният външен поток се отваря само когато изберете „Присъедини се“.')}</Text><View style={{ gap: 10, marginTop: 22 }}><AppButton label={registered ? t('Registered', 'Регистрирани сте') : t('Register with reminder', 'Регистрация с напомняне')} icon="notifications-outline" disabled={registered} onPress={() => void register()} /><AppButton label={t('Add to calendar', 'Добави в календара')} variant="secondary" icon="calendar-outline" onPress={() => void addCalendar()} /><AppButton label={t('Join approved stream', 'Отвори одобрения поток')} variant="secondary" icon="videocam-outline" onPress={() => void Linking.openURL(webinar.joinUrl)} /></View><View style={{ marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: theme.colors.border }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{t('Accessible replay', 'Достъпен запис')}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 6 }]}>{webinar.transcript}</Text>{webinar.replayUrl ? <AppButton label={t('Open replay library', 'Отвори библиотеката със записи')} variant="ghost" onPress={() => void Linking.openURL(webinar.replayUrl!)} style={{ marginTop: 10 }} /> : null}</View></Card>
    <AppButton label={t('Back to Hub', 'Назад към Hub')} variant="ghost" onPress={() => router.back()} style={{ marginTop: 20, alignSelf: 'center' }} />
  </Content></ScrollView></Screen>;
}
