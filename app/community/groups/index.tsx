import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { AppButton, AppInput, Card, Content, PageHeader, Screen, SegmentedControl, Skeleton, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { communityEngagementService, type CommunityGroupKind, type CommunityGroupSummary, normalizeInviteCode } from '@/features/community';
import { useAppTheme } from '@/theme';

type FormMode = 'join' | 'create';

export default function CommunityGroupsScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { addNotification } = useNotification();
  const [groups, setGroups] = useState<CommunityGroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<FormMode>('join');
  const [inviteCode, setInviteCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [kind, setKind] = useState<CommunityGroupKind>('team');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try { setGroups(await communityEngagementService.listGroups()); }
    catch (error) { addNotification({ type: 'toast', severity: 'error', message: error instanceof Error ? error.message : 'Unable to load groups.' }); }
    finally { setLoading(false); }
  }, [addNotification, user]);

  useFocusEffect(useCallback(() => { if (!authLoading && !user) router.replace('/auth/signin'); else if (user) void load(); }, [authLoading, load, router, user]));

  const join = async () => {
    setSubmitting(true);
    try {
      const groupId = await communityEngagementService.joinGroup(inviteCode);
      setInviteCode('');
      addNotification({ type: 'toast', severity: 'success', message: 'You joined the community group.' });
      router.push(`/community/groups/${groupId}` as any);
    } catch (error) { addNotification({ type: 'toast', severity: 'error', message: error instanceof Error ? error.message : 'Unable to join group.' }); }
    finally { setSubmitting(false); }
  };

  const create = async () => {
    setSubmitting(true);
    try {
      const group = await communityEngagementService.createGroup({ name, description, kind });
      setName(''); setDescription('');
      addNotification({ type: 'toast', severity: 'success', message: 'Your group and seven-day invite are ready.' });
      router.push(`/community/groups/${group.id}` as any);
    } catch (error) { addNotification({ type: 'toast', severity: 'error', message: error instanceof Error ? error.message : 'Unable to create group.' }); }
    finally { setSubmitting(false); }
  };

  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content wide>
    <PageHeader eyebrow="Private collaboration" title="Your circles and teams" description="Create an invite-only space for friends, a project team, or a local community. Every member controls whether aggregate impact is shared." action={<AppButton label="Back" icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />

    <Card elevated style={{ marginBottom: theme.spacing.xl, gap: theme.spacing.md }}>
      <SegmentedControl value={mode} onChange={setMode} options={[{ value: 'join', label: 'Join with code' }, { value: 'create', label: 'Create group' }]} />
      {mode === 'join' ? <><AppInput label="Invite code" autoCapitalize="characters" value={inviteCode} onChangeText={(value) => setInviteCode(normalizeInviteCode(value))} placeholder="AB12CD34EF" maxLength={12} /><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>Invite codes expire after seven days. Joining never enables profile comparison automatically.</Text><AppButton label="Join group" icon="enter-outline" loading={submitting} disabled={inviteCode.length < 6} onPress={() => void join()} /></> : <>
        <Text style={[theme.typography.label, { color: theme.colors.text }]}>Group type</Text>
        <SegmentedControl value={kind} onChange={setKind} options={[{ value: 'friends', label: 'Friends' }, { value: 'team', label: 'Team' }, { value: 'local', label: 'Local' }]} />
        <AppInput label="Group name" value={name} onChangeText={setName} placeholder="Sofia Repair Circle" maxLength={60} />
        <AppInput label="Short description" value={description} onChangeText={setDescription} placeholder="What will this group work on together?" maxLength={280} multiline style={{ minHeight: 88, textAlignVertical: 'top', paddingTop: 13 }} />
        <AppButton label="Create private group" icon="people-outline" loading={submitting} disabled={name.trim().length < 3} onPress={() => void create()} />
      </>}
    </Card>

    <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginBottom: theme.spacing.md }]}>My groups</Text>
    {loading ? <View style={{ gap: 12 }}><Skeleton height={132} /><Skeleton height={132} /></View> : groups.length === 0 ? <StatePanel icon="people-outline" title="No groups yet" message="Use an invite code or create a private group above." /> : <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>{groups.map((group) => <Pressable key={group.id} accessibilityRole="link" onPress={() => router.push(`/community/groups/${group.id}` as any)} style={({ pressed }) => ({ width: '100%', opacity: pressed ? 0.78 : 1 })}><Card style={{ gap: theme.spacing.sm }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}><View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={group.kind === 'local' ? 'location-outline' : group.kind === 'friends' ? 'heart-outline' : 'people-outline'} size={23} color={theme.colors.primary} /></View><View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{group.kind} · {group.role}</Text><Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 3 }]}>{group.name}</Text></View><Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} /></View><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{group.description || 'A private Green Compass group.'}</Text><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={[theme.typography.label, { color: theme.colors.textMuted }]}>{group.memberCount} member{group.memberCount === 1 ? '' : 's'} · {group.shareSummary ? 'summary shared' : 'summary private'}</Text>{group.inviteCode ? <AppButton label="Share invite" icon="share-outline" variant="ghost" onPress={(event) => { event.stopPropagation(); void Share.share({ message: `Join ${group.name} in Green Compass with invite code ${group.inviteCode}. The code expires ${group.inviteExpiresAt ? new Date(group.inviteExpiresAt).toLocaleDateString() : 'soon'}.` }); }} /> : null}</View></Card></Pressable>)}</View>}
  </Content></ScrollView></Screen>;
}
