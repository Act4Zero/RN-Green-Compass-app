import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AppButton, AppInput, Card, Content, PageHeader, Screen, Skeleton, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { communityEngagementService, type CommunitySubmission, type CommunitySubmissionType } from '@/features/community';
import { useAppTheme } from '@/theme';
import { useAppLocale } from '@/context/AppLocaleContext';

const TYPES: { value: CommunitySubmissionType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'story', label: 'Story', icon: 'book-outline' },
  { value: 'tip', label: 'Eco-tip', icon: 'leaf-outline' },
  { value: 'article', label: 'Article', icon: 'document-text-outline' },
  { value: 'video', label: 'Video', icon: 'play-circle-outline' },
  { value: 'project_idea', label: 'Project idea', icon: 'bulb-outline' },
];

export default function CommunityContributeScreen() {
  const params = useLocalSearchParams<{ type?: CommunitySubmissionType }>();
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [type, setType] = useState<CommunitySubmissionType>(TYPES.some((item) => item.value === params.type) ? params.type! : 'story');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try { setSubmissions(await communityEngagementService.listMySubmissions(user.id)); }
    catch { setSubmissions([]); }
    finally { setLoading(false); }
  }, [user]);
  useFocusEffect(useCallback(() => { if (user) void load(); }, [load, user]));

  const submit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await communityEngagementService.submitContent(user.id, { type, title, body, url });
      setTitle(''); setBody(''); setUrl(''); await load();
      addNotification({ type: 'toast', severity: 'success', message: t('Submitted for editorial review. Approved features earn 10 green points.', 'Изпратено за редакционен преглед. Одобрените материали носят 10 зелени точки.') });
    } catch { addNotification({ type: 'toast', severity: 'error', message: t('Unable to submit contribution.', 'Материалът не можа да бъде изпратен.') }); }
    finally { setSubmitting(false); }
  };

  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content>
    <PageHeader eyebrow={t('Community ownership', 'Принос към общността')} title={t('Share something worth learning', 'Споделете нещо полезно')} description={t('Submit a story, practical tip, trusted link, video, or project idea. Editors review every contribution before featuring it.', 'Изпратете история, практичен съвет, надеждна връзка, видео или идея за проект. Редактор преглежда всеки материал преди публикуване.')} action={<AppButton label={t('Back', 'Назад')} icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />
    <Card elevated style={{ gap: theme.spacing.md, marginBottom: theme.spacing.xl }}>
      <Text style={[theme.typography.label, { color: theme.colors.text }]}>{t('Contribution type', 'Тип материал')}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{TYPES.map((option) => { const active = option.value === type; const bg = option.value === 'story' ? 'История' : option.value === 'tip' ? 'Еко съвет' : option.value === 'article' ? 'Статия' : option.value === 'video' ? 'Видео' : 'Идея за проект'; return <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ selected: active }} onPress={() => setType(option.value)} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, borderRadius: theme.radii.pill, borderWidth: 1, borderColor: active ? theme.colors.primary : theme.colors.border, backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface }}><Ionicons name={option.icon} size={17} color={active ? theme.colors.primary : theme.colors.textMuted} /><Text style={[theme.typography.label, { color: active ? theme.colors.primary : theme.colors.textMuted }]}>{t(option.label, bg)}</Text></Pressable>; })}</View>
      <AppInput label={t('Title', 'Заглавие')} value={title} onChangeText={setTitle} placeholder={t('A clear, specific title', 'Ясно и конкретно заглавие')} maxLength={120} />
      <AppInput label={type === 'tip' ? t('Explain the tip', 'Обяснете съвета') : type === 'project_idea' ? t('Describe the project and how people can participate', 'Опишете проекта и как може да се участва') : t('Your submission', 'Вашият материал')} value={body} onChangeText={setBody} placeholder={t('Include practical context, what you learned, and any important safety details.', 'Добавете практичен контекст, наученото и важни подробности за безопасност.')} maxLength={5000} multiline style={{ minHeight: 180, textAlignVertical: 'top', paddingTop: 13 }} />
      <AppInput label={['article', 'video'].includes(type) ? t('HTTPS source link (required)', 'HTTPS връзка към източник (задължително)') : t('HTTPS source or organizer link (optional)', 'HTTPS връзка към източник или организатор (незадължително)')} value={url} onChangeText={setUrl} placeholder="https://…" autoCapitalize="none" keyboardType="url" />
      <View style={{ flexDirection: 'row', gap: 9, alignItems: 'flex-start' }}><Ionicons name="shield-checkmark-outline" size={19} color={theme.colors.primary} /><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, flex: 1 }]}>{t('Review checks relevance, respectful language, source quality, safety, and privacy. Personal contact details should not be included.', 'Прегледът проверява уместност, уважителен език, качество на източника, безопасност и поверителност. Не включвайте лични данни за контакт.')}</Text></View>
      <AppButton label={t('Submit for review', 'Изпрати за преглед')} icon="send-outline" loading={submitting} disabled={title.trim().length < 5 || body.trim().length < 20} onPress={() => void submit()} />
    </Card>

    <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginBottom: theme.spacing.md }]}>{t('My submissions', 'Моите материали')}</Text>
    {loading ? <Skeleton height={150} /> : submissions.length === 0 ? <StatePanel icon="document-text-outline" title={t('Nothing submitted yet', 'Все още няма изпратени материали')} message={t('Your review status will appear here after your first contribution.', 'Статусът на прегледа ще се появи тук след първия материал.')} /> : <View style={{ gap: 10 }}>{submissions.map((item) => <Card key={item.id} style={{ gap: 7 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{item.type.replace('_', ' ')}</Text><Text style={[theme.typography.label, { color: item.status === 'approved' ? theme.colors.success : item.status === 'rejected' ? theme.colors.danger : theme.colors.warning, textTransform: 'uppercase' }]}>{t(item.status.replace('_', ' '), item.status === 'approved' ? 'одобрено' : item.status === 'rejected' ? 'отхвърлено' : 'в преглед')}</Text></View><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{item.title}</Text><Text numberOfLines={2} style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{item.body}</Text>{item.reviewerNotes ? <Text style={[theme.typography.bodySmall, { color: theme.colors.text }]}>{t('Reviewer note', 'Бележка от редактора')}: {item.reviewerNotes}</Text> : null}{item.status === 'approved' ? <Text style={[theme.typography.label, { color: theme.colors.success }]}>{t('Featured contribution reward: 10 green points', 'Награда за избран материал: 10 зелени точки')}</Text> : null}</Card>)}</View>}
  </Content></ScrollView></Screen>;
}
