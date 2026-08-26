import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Linking, ScrollView, Share, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, SegmentedControl, Skeleton, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { communityEngagementService, getCountdownLabel, type CommunityProject, type CommunityProjectScope } from '@/features/community';
import { useAppTheme } from '@/theme';

export default function CommunityProjectsScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [scope, setScope] = useState<CommunityProjectScope>('local');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try { setProjects(await communityEngagementService.listProjects(user.id)); }
    catch (error) { addNotification({ type: 'toast', severity: 'error', message: error instanceof Error ? error.message : 'Unable to load projects.' }); }
    finally { setLoading(false); }
  }, [addNotification, user]);
  useFocusEffect(useCallback(() => { if (user) void load(); }, [load, user]));

  const toggle = async (project: CommunityProject) => {
    setBusyId(project.id);
    try { await communityEngagementService.setProjectParticipation(project.id, !project.isParticipant); await load(); addNotification({ type: 'toast', severity: 'success', message: project.isParticipant ? 'You left the project.' : 'You joined the project. Add it to your calendar using the organizer link.' }); }
    catch (error) { addNotification({ type: 'toast', severity: 'error', message: error instanceof Error ? error.message : 'Unable to update participation.' }); }
    finally { setBusyId(null); }
  };

  const visible = projects.filter((project) => project.scope === scope);
  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content wide>
    <PageHeader eyebrow="Act together" title="Community projects and events" description="Join a local meet-up or a global initiative, follow organizer guidance, and bring what you learn back to the community." action={<AppButton label="Community" icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />
    <SegmentedControl value={scope} onChange={setScope} options={[{ value: 'local', label: 'Local projects' }, { value: 'global', label: 'Global initiatives' }]} />
    <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginVertical: theme.spacing.md }]}>Project dates and external organizer links are editorially reviewed. Confirm accessibility, safety, and exact meeting details with the organizer.</Text>
    {loading ? <View style={{ gap: 12 }}><Skeleton height={240} /><Skeleton height={240} /></View> : visible.length === 0 ? <StatePanel icon="calendar-outline" title="No active projects in this view" message="Try the other scope or submit a project idea for editorial review." action={<AppButton label="Submit project idea" onPress={() => router.push({ pathname: '/community/contribute' as any, params: { type: 'project_idea' } })} />} /> : <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>{visible.map((project) => <Card key={project.id} elevated={project.featured} style={{ width: '100%', gap: theme.spacing.md, borderTopWidth: 5, borderTopColor: project.scope === 'global' ? theme.colors.info : theme.colors.accent }}><View style={{ flexDirection: 'row', gap: theme.spacing.md, alignItems: 'flex-start' }}><View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: project.scope === 'global' ? theme.colors.primarySoft : theme.colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={project.scope === 'global' ? 'earth-outline' : 'location-outline'} size={23} color={theme.colors.primary} /></View><View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{project.featured ? 'Featured · ' : ''}{project.eventName || project.seasonalTag || project.scope}</Text><Text style={[theme.typography.h2, { color: theme.colors.text, marginTop: 4 }]}>{project.title}</Text></View><View style={{ borderRadius: theme.radii.pill, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: theme.colors.surfaceMuted }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>{getCountdownLabel(project.endsAt)}</Text></View></View><Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{project.summary}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{project.description}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}><Text style={[theme.typography.label, { color: theme.colors.text }]}><Ionicons name="people-outline" size={15} /> {project.participantCount}{project.targetParticipants ? ` / ${project.targetParticipants}` : ''} joined</Text>{project.location ? <Text style={[theme.typography.label, { color: theme.colors.text }]}><Ionicons name="location-outline" size={15} /> {project.location}</Text> : <Text style={[theme.typography.label, { color: theme.colors.text }]}><Ionicons name="videocam-outline" size={15} /> Virtual/global participation</Text>}</View><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><AppButton label={project.isParticipant ? 'Leave project' : 'Join project'} icon={project.isParticipant ? 'checkmark-circle' : 'add-circle-outline'} variant={project.isParticipant ? 'secondary' : 'primary'} loading={busyId === project.id} onPress={() => void toggle(project)} style={{ flex: 1 }} />{project.externalUrl ? <AppButton label="Organizer details" icon="open-outline" variant="secondary" onPress={() => void Linking.openURL(project.externalUrl!)} style={{ flex: 1 }} /> : null}<AppButton label="Share" icon="share-outline" variant="ghost" onPress={() => void Share.share({ message: `Join “${project.title}” with the Green Compass community. ${project.externalUrl || ''}` })} /></View></Card>)}</View>}
    <Card style={{ marginTop: theme.spacing.xl, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: theme.spacing.md }}><View style={{ flex: 1, minWidth: 240 }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>Have an initiative in mind?</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 4 }]}>Submit a project idea with an HTTPS source. Editors review safety and details before it appears here.</Text></View><AppButton label="Submit an idea" icon="bulb-outline" onPress={() => router.push({ pathname: '/community/contribute' as any, params: { type: 'project_idea' } })} /></Card>
  </Content></ScrollView></Screen>;
}
