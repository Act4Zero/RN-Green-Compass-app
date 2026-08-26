import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, Skeleton, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { communityEngagementService, type CommunitySubmission } from '@/features/community';
import { useAppTheme } from '@/theme';

export default function CommunityModerationScreen() {
  const { theme } = useAppTheme();
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
    catch (error) { addNotification({ type: 'toast', severity: 'error', message: error instanceof Error ? error.message : 'Unable to load moderation.' }); }
    finally { setLoading(false); }
  }, [addNotification, authorized]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (!authorized) return <Screen><Content><StatePanel icon="lock-closed-outline" title="Reviewer access required" message="Community moderation uses the protected reviewer and publisher roles." action={<AppButton label="Back to community" onPress={() => router.replace('/community')} />} /></Content></Screen>;

  const review = async (submission: CommunitySubmission, status: 'approved' | 'rejected') => {
    setBusyId(submission.id);
    try { await communityEngagementService.reviewSubmission({ submissionId: submission.id, status }); await load(); addNotification({ type: 'toast', severity: 'success', message: status === 'approved' ? 'Contribution approved, featured, and rewarded.' : 'Contribution rejected.' }); }
    catch (error) { addNotification({ type: 'toast', severity: 'error', message: error instanceof Error ? error.message : 'Review failed.' }); }
    finally { setBusyId(null); }
  };

  const moderate = async (reportId: string, discussionId: string, status: 'published' | 'hidden' | 'removed', pinned = false) => {
    setBusyId(reportId);
    try { await communityEngagementService.moderateDiscussion(discussionId, status, pinned); await load(); addNotification({ type: 'toast', severity: 'success', message: pinned ? 'Discussion pinned and report resolved.' : status === 'published' ? 'Discussion kept and report resolved.' : 'Discussion hidden and report resolved.' }); }
    catch (error) { addNotification({ type: 'toast', severity: 'error', message: error instanceof Error ? error.message : 'Moderation failed.' }); }
    finally { setBusyId(null); }
  };

  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content wide>
    <PageHeader eyebrow="Protected moderation" title="Community safety and spotlight queue" description="Review reports and user submissions. Approval publishes a spotlight and awards 10 idempotent green points; moderation actions are restricted by account metadata." action={<AppButton label="Community" icon="arrow-back" variant="ghost" onPress={() => router.replace('/community')} />} />
    {loading ? <><Skeleton height={180} /><Skeleton height={180} style={{ marginTop: 12 }} /></> : <>
      <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginBottom: theme.spacing.md }]}>Reported discussions ({reports.length})</Text>
      {reports.length === 0 ? <StatePanel icon="shield-checkmark-outline" title="No open reports" message="The discussion queue is clear." /> : <View style={{ gap: 10 }}>{reports.map((report) => <Card key={report.id} style={{ gap: 10 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><Text style={[theme.typography.label, { color: theme.colors.danger, textTransform: 'uppercase' }]}>{report.reason}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{new Date(report.created_at).toLocaleString()}</Text></View><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{report.discussions?.title || 'Untitled discussion'}</Text><Text numberOfLines={4} style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{report.discussions?.content}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><AppButton label="Keep & resolve" variant="secondary" loading={busyId === report.id} disabled={busyId !== null && busyId !== report.id} onPress={() => void moderate(report.id, report.discussion_id, 'published')} /><AppButton label="Hide" variant="danger" disabled={busyId !== null} onPress={() => void moderate(report.id, report.discussion_id, 'hidden')} /><AppButton label="Pin as useful" icon="pin-outline" variant="ghost" disabled={busyId !== null} onPress={() => void moderate(report.id, report.discussion_id, 'published', true)} /></View></Card>)}</View>}

      <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginTop: theme.spacing.xl, marginBottom: theme.spacing.md }]}>Submission review ({submissions.length})</Text>
      {submissions.length === 0 ? <StatePanel icon="checkmark-done-outline" title="No pending submissions" message="New stories, tips, links, and project ideas will appear here." /> : <View style={{ gap: 10 }}>{submissions.map((submission) => <Card key={submission.id} style={{ gap: 10 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{submission.type.replace('_', ' ')}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{submission.authorName || 'Community member'}</Text></View><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{submission.title}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{submission.body}</Text>{submission.url ? <Text selectable style={[theme.typography.bodySmall, { color: theme.colors.info }]}>{submission.url}</Text> : null}<View style={{ flexDirection: 'row', gap: 8 }}><AppButton label="Approve & feature" icon="checkmark" loading={busyId === submission.id} onPress={() => void review(submission, 'approved')} style={{ flex: 1 }} /><AppButton label="Reject" variant="danger" disabled={busyId === submission.id} onPress={() => void review(submission, 'rejected')} style={{ flex: 1 }} /></View></Card>)}</View>}
    </>}
  </Content></ScrollView></Screen>;
}
