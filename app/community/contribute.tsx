import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AppButton, AppInput, Card, Content, PageHeader, Screen, Skeleton, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { communityEngagementService, type CommunitySubmission, type CommunitySubmissionType } from '@/features/community';
import { useAppTheme } from '@/theme';

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
      addNotification({ type: 'toast', severity: 'success', message: 'Submitted for editorial review. Approved features earn 10 green points.' });
    } catch (error) { addNotification({ type: 'toast', severity: 'error', message: error instanceof Error ? error.message : 'Unable to submit contribution.' }); }
    finally { setSubmitting(false); }
  };

  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content>
    <PageHeader eyebrow="Community ownership" title="Share something worth learning" description="Submit a story, practical tip, trusted link, video, or project idea. Editors review every contribution before featuring it." action={<AppButton label="Back" icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />
    <Card elevated style={{ gap: theme.spacing.md, marginBottom: theme.spacing.xl }}>
      <Text style={[theme.typography.label, { color: theme.colors.text }]}>Contribution type</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{TYPES.map((option) => { const active = option.value === type; return <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ selected: active }} onPress={() => setType(option.value)} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, borderRadius: theme.radii.pill, borderWidth: 1, borderColor: active ? theme.colors.primary : theme.colors.border, backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface }}><Ionicons name={option.icon} size={17} color={active ? theme.colors.primary : theme.colors.textMuted} /><Text style={[theme.typography.label, { color: active ? theme.colors.primary : theme.colors.textMuted }]}>{option.label}</Text></Pressable>; })}</View>
      <AppInput label="Title" value={title} onChangeText={setTitle} placeholder="A clear, specific title" maxLength={120} />
      <AppInput label={type === 'tip' ? 'Explain the tip' : type === 'project_idea' ? 'Describe the project and how people can participate' : 'Your submission'} value={body} onChangeText={setBody} placeholder="Include practical context, what you learned, and any important safety details." maxLength={5000} multiline style={{ minHeight: 180, textAlignVertical: 'top', paddingTop: 13 }} />
      <AppInput label={['article', 'video'].includes(type) ? 'HTTPS source link (required)' : 'HTTPS source or organizer link (optional)'} value={url} onChangeText={setUrl} placeholder="https://…" autoCapitalize="none" keyboardType="url" />
      <View style={{ flexDirection: 'row', gap: 9, alignItems: 'flex-start' }}><Ionicons name="shield-checkmark-outline" size={19} color={theme.colors.primary} /><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, flex: 1 }]}>Review checks relevance, respectful language, source quality, safety, and privacy. Personal contact details should not be included.</Text></View>
      <AppButton label="Submit for review" icon="send-outline" loading={submitting} disabled={title.trim().length < 5 || body.trim().length < 20} onPress={() => void submit()} />
    </Card>

    <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginBottom: theme.spacing.md }]}>My submissions</Text>
    {loading ? <Skeleton height={150} /> : submissions.length === 0 ? <StatePanel icon="document-text-outline" title="Nothing submitted yet" message="Your review status will appear here after your first contribution." /> : <View style={{ gap: 10 }}>{submissions.map((item) => <Card key={item.id} style={{ gap: 7 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{item.type.replace('_', ' ')}</Text><Text style={[theme.typography.label, { color: item.status === 'approved' ? theme.colors.success : item.status === 'rejected' ? theme.colors.danger : theme.colors.warning, textTransform: 'uppercase' }]}>{item.status.replace('_', ' ')}</Text></View><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{item.title}</Text><Text numberOfLines={2} style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{item.body}</Text>{item.reviewerNotes ? <Text style={[theme.typography.bodySmall, { color: theme.colors.text }]}>Reviewer note: {item.reviewerNotes}</Text> : null}{item.status === 'approved' ? <Text style={[theme.typography.label, { color: theme.colors.success }]}>Featured contribution reward: 10 green points</Text> : null}</Card>)}</View>}
  </Content></ScrollView></Screen>;
}
