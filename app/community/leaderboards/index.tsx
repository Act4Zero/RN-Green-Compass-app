import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, SegmentedControl, Skeleton, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { communityEngagementService, type CommunityGroupSummary, type CommunityLeaderboardEntry, type CommunityLeaderboardMetric, type CommunityLeaderboardScope } from '@/features/community';
import { useAppTheme } from '@/theme';

const scopeCopy: Record<CommunityLeaderboardScope, string> = {
  global: 'All Green Compass members who participate in the global ranking.',
  friends: 'Opted-in members across your private friends circles.',
  local: 'Opted-in members across your local community groups.',
  team: 'Opted-in members of the selected project team.',
};

export default function CommunityLeaderboardScreen() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [scope, setScope] = useState<CommunityLeaderboardScope>('global');
  const [metric, setMetric] = useState<CommunityLeaderboardMetric>('points');
  const [groups, setGroups] = useState<CommunityGroupSummary[]>([]);
  const [teamId, setTeamId] = useState<string | undefined>();
  const [entries, setEntries] = useState<CommunityLeaderboardEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [globalEnabled, setGlobalEnabled] = useState(false);
  const [privacyBusy, setPrivacyBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [availableGroups, preferences] = await Promise.all([
        communityEngagementService.listGroups(),
        communityEngagementService.getLeaderboardPreferences(),
      ]);
      setGroups(availableGroups);
      setGlobalEnabled(preferences.globalEnabled);
      const teams = availableGroups.filter((group) => group.kind === 'team');
      const selectedTeam = teamId || teams[0]?.id;
      if (!teamId && selectedTeam) setTeamId(selectedTeam);
      if (scope === 'team' && !selectedTeam) { setEntries([]); setTotal(0); return; }
      const result = await communityEngagementService.getLeaderboard({ scope, metric, groupId: scope === 'team' ? selectedTeam : undefined });
      setEntries(result.entries); setTotal(result.totalEntries);
    } catch (error) { setEntries([]); addNotification({ type: 'toast', severity: 'error', message: error instanceof Error ? error.message : 'Unable to load leaderboard.' }); }
    finally { setLoading(false); }
  }, [addNotification, metric, scope, teamId, user]);
  useFocusEffect(useCallback(() => { if (user) void load(); }, [load, user]));

  const toggleGlobalSharing = async () => {
    setPrivacyBusy(true);
    try {
      await communityEngagementService.setGlobalLeaderboardSharing(!globalEnabled);
      setGlobalEnabled(!globalEnabled);
      await load();
      addNotification({ type: 'toast', severity: 'success', message: globalEnabled ? 'Your profile is no longer visible in global rankings.' : 'Your aggregate points and streak can now appear globally.' });
    } catch (error) {
      addNotification({ type: 'toast', severity: 'error', message: error instanceof Error ? error.message : 'Unable to update leaderboard privacy.' });
    } finally { setPrivacyBusy(false); }
  };

  const selectedTeam = groups.find((group) => group.id === teamId);
  const current = entries.find((entry) => entry.isCurrentUser);
  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content>
    <PageHeader eyebrow="Healthy competition" title="Sustainability leaderboards" description="Compare green points or consistency across friends, local circles, teams, and the global community." action={<AppButton label="Back" icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />
    <Card style={{ gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
      <SegmentedControl value={metric} onChange={setMetric} options={[{ value: 'points', label: 'Green points' }, { value: 'streak', label: 'Habit streak' }]} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{(['global', 'friends', 'local', 'team'] as const).map((value) => { const active = scope === value; return <Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => setScope(value)} style={{ minHeight: 42, minWidth: 96, flexGrow: 1, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radii.md, borderWidth: 1, borderColor: active ? theme.colors.primary : theme.colors.border, backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface }}><Text style={[theme.typography.label, { color: active ? theme.colors.primary : theme.colors.textMuted, textTransform: 'capitalize' }]}>{value}</Text></Pressable>; })}</View>
      {scope === 'team' && groups.filter((group) => group.kind === 'team').length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{groups.filter((group) => group.kind === 'team').map((group) => <AppButton key={group.id} label={group.name} variant={teamId === group.id ? 'primary' : 'ghost'} onPress={() => setTeamId(group.id)} />)}</ScrollView> : null}
      <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{scopeCopy[scope]} Private group members appear only after opting into aggregate comparison.</Text>
    </Card>

    {scope === 'global' ? <Card style={{ marginBottom: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, backgroundColor: theme.colors.primarySoft }}><Ionicons name={globalEnabled ? 'eye-outline' : 'eye-off-outline'} size={24} color={theme.colors.primary} /><View style={{ flex: 1 }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>Global ranking privacy</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3 }]}>{globalEnabled ? 'Others can see your display name, aggregate points, and streak in global rankings.' : 'You can view the ranking, but your profile stays hidden from everyone else.'}</Text></View><AppButton label={globalEnabled ? 'Opt out' : 'Opt in'} variant={globalEnabled ? 'secondary' : 'primary'} loading={privacyBusy} onPress={() => void toggleGlobalSharing()} /></Card> : null}

    {current ? <Card elevated style={{ marginBottom: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, backgroundColor: theme.colors.accentSoft }}><View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="trophy" size={25} color={theme.colors.accent} /></View><View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: theme.colors.primary }]}>YOUR {scope.toUpperCase()} RANK</Text><Text style={[theme.typography.h2, { color: theme.colors.text }]}>#{current.rank} of {total}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{current.value.toLocaleString()} {metric === 'points' ? 'green points' : 'days'}</Text></View><AppButton label="Share" icon="share-outline" variant="ghost" onPress={() => void Share.share({ message: `I’m #${current.rank} in the Green Compass ${scope} ${metric} leaderboard with ${current.value.toLocaleString()} ${metric === 'points' ? 'green points' : 'days'}!` })} /></Card> : null}

    {loading ? <View style={{ gap: 9 }}><Skeleton height={74} /><Skeleton height={74} /><Skeleton height={74} /></View> : scope === 'team' && !selectedTeam ? <StatePanel icon="people-outline" title="Create or join a team first" message="Team leaderboards are available inside private invite groups." action={<AppButton label="Open groups" onPress={() => router.push('/community/groups' as any)} />} /> : entries.length === 0 ? <StatePanel icon="trophy-outline" title="No opted-in rankings yet" message="Members can enable aggregate comparison from their group privacy card." /> : <Card style={{ padding: 0, overflow: 'hidden' }}>{entries.map((entry, index) => <View key={entry.userId} style={{ minHeight: 76, paddingHorizontal: theme.spacing.md, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, backgroundColor: entry.isCurrentUser ? theme.colors.primarySoft : theme.colors.surface, borderBottomWidth: index === entries.length - 1 ? 0 : 1, borderBottomColor: theme.colors.border }}><View style={{ width: 36, alignItems: 'center' }}>{entry.rank <= 3 ? <Ionicons name="medal" size={24} color={entry.rank === 1 ? theme.colors.warning : theme.colors.primary} /> : <Text style={[theme.typography.label, { color: theme.colors.textMuted }]}>#{entry.rank}</Text>}</View><View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}><Text style={[theme.typography.h3, { color: theme.colors.primary }]}>{entry.displayName.charAt(0).toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{entry.displayName}{entry.isCurrentUser ? ' (you)' : ''}</Text></View><Text style={[theme.typography.metric, { fontSize: 20, color: theme.colors.primary }]}>{entry.value.toLocaleString()}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{metric === 'points' ? 'pts' : 'days'}</Text></View>)}</Card>}
  </Content></ScrollView></Screen>;
}
