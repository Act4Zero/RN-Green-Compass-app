import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, Skeleton, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useAppLocale } from '@/context/AppLocaleContext';
import { useNotification } from '@/context/NotificationContext';
import { communityEngagementService, type CommunitySubmission } from '@/features/community';
import { useAppTheme } from '@/theme';

export default function CommunityModerationScreen() {
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const roles = (user?.app_metadata?.knowledge_roles || []) as string[];
  const authorized = roles.some((role) => ['reviewer', 'publisher'].includes(role));
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!authorized) return;
    setLoading(true);
    try { const [queue, moderation] = await Promise.all([communityEngagementService.listReviewQueue(), communityEngagementService.listModerationReports()]); setSubmissions(queue); setReports(moderation); }
    catch { addNotification({ type: 'toast', severity: 'error', message: t('Unable to load moderation.', 'Модерацията не може да бъде заредена.') }); }
    finally { setLoading(false); }
  }, [addNotification, authorized, t]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (!authorized) return <Screen><Content><StatePanel icon="lock-closed-outline" title={t('Reviewer access required', 'Необходим е достъп за проверяващ')} message={t('Community moderation uses the protected reviewer and publisher roles.', 'Модерацията на общността е достъпна само за защитените роли „проверяващ“ и „издател“.')} action={<AppButton label={t('Back to community', 'Назад към общността')} onPress={() => router.replace('/community')} />} /></Content></Screen>;

  const review = async (submission: CommunitySubmission, status: 'approved' | 'rejected') => {
    setBusyId(submission.id);
    try { await communityEngagementService.reviewSubmission({ submissionId: submission.id, status }); await load(); addNotification({ type: 'toast', severity: 'success', message: status === 'approved' ? t('Contribution approved, featured, and rewarded.', 'Приносът е одобрен, отличен и награден.') : t('Contribution rejected.', 'Приносът е отхвърлен.') }); }
    catch { addNotification({ type: 'toast', severity: 'error', message: t('Review failed.', 'Проверката беше неуспешна.') }); }
    finally { setBusyId(null); }
  };

  const moderate = async (reportId: string, discussionId: string, status: 'published' | 'hidden' | 'removed', pinned = false) => {
    setBusyId(reportId);
    try { await communityEngagementService.moderateDiscussion(discussionId, status, pinned); await load(); addNotification({ type: 'toast', severity: 'success', message: pinned ? t('Discussion pinned and report resolved.', 'Дискусията е закрепена, а сигналът — приключен.') : status === 'published' ? t('Discussion kept and report resolved.', 'Дискусията е запазена, а сигналът — приключен.') : t('Discussion hidden and report resolved.', 'Дискусията е скрита, а сигналът — приключен.') }); }
    catch { addNotification({ type: 'toast', severity: 'error', message: t('Moderation failed.', 'Модерацията беше неуспешна.') }); }
    finally { setBusyId(null); }
  };

  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content wide>
    <PageHeader eyebrow={t('Protected moderation', 'Защитена модерация')} title={t('Community safety and spotlight queue', 'Безопасност и предложения от общността')} description={t('Review reports and user submissions. Approval publishes a spotlight and awards 10 idempotent green points; moderation actions are restricted by account metadata.', 'Преглеждайте сигнали и предложения. Одобрението публикува акцент и присъжда еднократно 10 зелени точки; действията са ограничени според ролята на профила.')} action={<AppButton label={t('Community', 'Общност')} icon="arrow-back" variant="ghost" onPress={() => router.replace('/community')} />} />
    {loading ? <><Skeleton height={180} /><Skeleton height={180} style={{ marginTop: 12 }} /></> : <>
      <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginBottom: theme.spacing.md }]}>{t('Reported discussions', 'Сигнали за дискусии')} ({reports.length})</Text>
      {reports.length === 0 ? <StatePanel icon="shield-checkmark-outline" title={t('No open reports', 'Няма отворени сигнали')} message={t('The discussion queue is clear.', 'Опашката за дискусии е празна.')} /> : <View style={{ gap: 10 }}>{reports.map((report) => <Card key={report.id} style={{ gap: 10 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><Text style={[theme.typography.label, { color: theme.colors.danger, textTransform: 'uppercase' }]}>{report.reason}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{new Date(report.created_at).toLocaleString()}</Text></View><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{report.discussions?.title || t('Untitled discussion', 'Дискусия без заглавие')}</Text><Text numberOfLines={4} style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{report.discussions?.content}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><AppButton label={t('Keep & resolve', 'Запази и приключи')} variant="secondary" loading={busyId === report.id} disabled={busyId !== null && busyId !== report.id} onPress={() => void moderate(report.id, report.discussion_id, 'published')} /><AppButton label={t('Hide', 'Скрий')} variant="danger" disabled={busyId !== null} onPress={() => void moderate(report.id, report.discussion_id, 'hidden')} /><AppButton label={t('Pin as useful', 'Закрепи като полезна')} icon="pin-outline" variant="ghost" disabled={busyId !== null} onPress={() => void moderate(report.id, report.discussion_id, 'published', true)} /></View></Card>)}</View>}

      <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginTop: theme.spacing.xl, marginBottom: theme.spacing.md }]}>{t('Submission review', 'Преглед на предложения')} ({submissions.length})</Text>
      {submissions.length === 0 ? <StatePanel icon="checkmark-done-outline" title={t('No pending submissions', 'Няма чакащи предложения')} message={t('New stories, tips, links, and project ideas will appear here.', 'Тук ще се появяват нови истории, съвети, връзки и идеи за проекти.')} /> : <View style={{ gap: 10 }}>{submissions.map((submission) => <Card key={submission.id} style={{ gap: 10 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{submission.type.replace('_', ' ')}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{submission.authorName || t('Community member', 'Член на общността')}</Text></View><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{submission.title}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{submission.body}</Text>{submission.url ? <Text selectable style={[theme.typography.bodySmall, { color: theme.colors.info }]}>{submission.url}</Text> : null}<View style={{ flexDirection: 'row', gap: 8 }}><AppButton label={t('Approve & feature', 'Одобри и отличи')} icon="checkmark" loading={busyId === submission.id} onPress={() => void review(submission, 'approved')} style={{ flex: 1 }} /><AppButton label={t('Reject', 'Отхвърли')} variant="danger" disabled={busyId === submission.id} onPress={() => void review(submission, 'rejected')} style={{ flex: 1 }} /></View></Card>)}</View>}
    </>}
  </Content></ScrollView></Screen>;
}
