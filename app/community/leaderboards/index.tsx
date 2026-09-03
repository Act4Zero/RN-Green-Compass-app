import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, SegmentedControl, Skeleton, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { communityEngagementService, type CommunityGroupSummary, type CommunityLeaderboardEntry, type CommunityLeaderboardMetric, type CommunityLeaderboardScope } from '@/features/community';
import { useAppTheme } from '@/theme';
import { useAppLocale } from '@/context/AppLocaleContext';

const scopeCopy: Record<CommunityLeaderboardScope, { en: string; bg: string; labelEn: string; labelBg: string }> = {
  global: { en: 'All Green Compass members who participate in the global ranking.', bg: 'Всички потребители на Green Compass, които участват в глобалната класация.', labelEn: 'Global', labelBg: 'Глобална' },
  friends: { en: 'Opted-in members across your private friends circles.', bg: 'Включени участници от личните ви приятелски кръгове.', labelEn: 'Friends', labelBg: 'Приятели' },
  local: { en: 'Opted-in members across your local community groups.', bg: 'Включени участници от местните ви групи.', labelEn: 'Local', labelBg: 'Местна' },
  team: { en: 'Opted-in members of the selected project team.', bg: 'Включени участници от избрания проектен екип.', labelEn: 'Team', labelBg: 'Екипна' },
};

export default function CommunityLeaderboardScreen() {
  const { theme } = useAppTheme();
  const { locale, t } = useAppLocale();
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
    } catch { setEntries([]); addNotification({ type: 'toast', severity: 'error', message: t('Unable to load leaderboard.', 'Класацията не можа да се зареди.') }); }
    finally { setLoading(false); }
  }, [addNotification, metric, scope, teamId, t, user]);
  useFocusEffect(useCallback(() => { if (user) void load(); }, [load, user]));

  const toggleGlobalSharing = async () => {
    setPrivacyBusy(true);
    try {
      await communityEngagementService.setGlobalLeaderboardSharing(!globalEnabled);
      setGlobalEnabled(!globalEnabled);
      await load();
      addNotification({ type: 'toast', severity: 'success', message: globalEnabled ? t('Your profile is no longer visible in global rankings.', 'Профилът ви вече не се вижда в глобалните класации.') : t('Your aggregate points and streak can now appear globally.', 'Общите ви точки и серия вече могат да се показват глобално.') });
    } catch {
      addNotification({ type: 'toast', severity: 'error', message: t('Unable to update leaderboard privacy.', 'Настройката за поверителност не можа да се обнови.') });
    } finally { setPrivacyBusy(false); }
  };

  const selectedTeam = groups.find((group) => group.id === teamId);
  const current = entries.find((entry) => entry.isCurrentUser);
  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content>
    <PageHeader eyebrow={t('Healthy competition', 'Позитивно съревнование')} title={t('Sustainability leaderboards', 'Класации за устойчивост')} description={t('Compare green points or consistency across friends, local circles, teams, and the global community.', 'Сравнете зелени точки или постоянство с приятели, местни групи, екипи и глобалната общност.')} action={<AppButton label={t('Back', 'Назад')} icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />
    <Card style={{ gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
      <SegmentedControl value={metric} onChange={setMetric} options={[{ value: 'points', label: t('Green points', 'Зелени точки') }, { value: 'streak', label: t('Habit streak', 'Серия от навици') }]} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{(['global', 'friends', 'local', 'team'] as const).map((value) => { const active = scope === value; return <Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => setScope(value)} style={{ minHeight: 42, minWidth: 96, flexGrow: 1, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radii.md, borderWidth: 1, borderColor: active ? theme.colors.primary : theme.colors.border, backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface }}><Text style={[theme.typography.label, { color: active ? theme.colors.primary : theme.colors.textMuted }]}>{locale === 'bg' ? scopeCopy[value].labelBg : scopeCopy[value].labelEn}</Text></Pressable>; })}</View>
      {scope === 'team' && groups.filter((group) => group.kind === 'team').length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{groups.filter((group) => group.kind === 'team').map((group) => <AppButton key={group.id} label={group.name} variant={teamId === group.id ? 'primary' : 'ghost'} onPress={() => setTeamId(group.id)} />)}</ScrollView> : null}
      <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{locale === 'bg' ? scopeCopy[scope].bg : scopeCopy[scope].en} {t('Private group members appear only after opting into aggregate comparison.', 'Участниците в частни групи се показват само след изрично съгласие за обобщено сравнение.')}</Text>
    </Card>

    {scope === 'global' ? <Card style={{ marginBottom: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, backgroundColor: theme.colors.primarySoft }}><Ionicons name={globalEnabled ? 'eye-outline' : 'eye-off-outline'} size={24} color={theme.colors.primary} /><View style={{ flex: 1 }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{t('Global ranking privacy', 'Поверителност в глобалната класация')}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3 }]}>{globalEnabled ? t('Others can see your display name, aggregate points, and streak in global rankings.', 'Другите виждат показваното ви име, общите точки и серията ви в глобалната класация.') : t('You can view the ranking, but your profile stays hidden from everyone else.', 'Можете да виждате класацията, но профилът ви остава скрит за останалите.')}</Text></View><AppButton label={globalEnabled ? t('Opt out', 'Изключи ме') : t('Opt in', 'Включи ме')} variant={globalEnabled ? 'secondary' : 'primary'} loading={privacyBusy} onPress={() => void toggleGlobalSharing()} /></Card> : null}

    {current ? <Card elevated style={{ marginBottom: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, backgroundColor: theme.colors.accentSoft }}><View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="trophy" size={25} color={theme.colors.accent} /></View><View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: theme.colors.primary }]}>{t('YOUR RANK', 'ТВОЕТО КЛАСИРАНЕ')} · {locale === 'bg' ? scopeCopy[scope].labelBg.toUpperCase() : scopeCopy[scope].labelEn.toUpperCase()}</Text><Text style={[theme.typography.h2, { color: theme.colors.text }]}>#{current.rank} {t('of', 'от')} {total}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{current.value.toLocaleString()} {metric === 'points' ? t('green points', 'зелени точки') : t('days', 'дни')}</Text></View><AppButton label={t('Share', 'Сподели')} icon="share-outline" variant="ghost" onPress={() => void Share.share({ message: t(`I’m #${current.rank} in the Green Compass leaderboard with ${current.value.toLocaleString()} ${metric === 'points' ? 'green points' : 'days'}!`, `Аз съм №${current.rank} в класацията на Green Compass с ${current.value.toLocaleString()} ${metric === 'points' ? 'зелени точки' : 'дни'}!`) })} /></Card> : null}

    {loading ? <View style={{ gap: 9 }}><Skeleton height={74} /><Skeleton height={74} /><Skeleton height={74} /></View> : scope === 'team' && !selectedTeam ? <StatePanel icon="people-outline" title={t('Create or join a team first', 'Първо създайте или се присъединете към екип')} message={t('Team leaderboards are available inside private invite groups.', 'Екипните класации са достъпни в частни групи с покана.')} action={<AppButton label={t('Open groups', 'Отвори групите')} onPress={() => router.push('/community/groups' as any)} />} /> : entries.length === 0 ? <StatePanel icon="trophy-outline" title={t('No opted-in rankings yet', 'Все още няма участници в класацията')} message={t('Members can enable aggregate comparison from their group privacy card.', 'Участниците могат да включат обобщеното сравнение от настройките за поверителност на групата.')} /> : <Card style={{ padding: 0, overflow: 'hidden' }}>{entries.map((entry, index) => <View key={entry.userId} style={{ minHeight: 76, paddingHorizontal: theme.spacing.md, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, backgroundColor: entry.isCurrentUser ? theme.colors.primarySoft : theme.colors.surface, borderBottomWidth: index === entries.length - 1 ? 0 : 1, borderBottomColor: theme.colors.border }}><View style={{ width: 36, alignItems: 'center' }}>{entry.rank <= 3 ? <Ionicons name="medal" size={24} color={entry.rank === 1 ? theme.colors.warning : theme.colors.primary} /> : <Text style={[theme.typography.label, { color: theme.colors.textMuted }]}>#{entry.rank}</Text>}</View><View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}><Text style={[theme.typography.h3, { color: theme.colors.primary }]}>{entry.displayName.charAt(0).toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{entry.displayName}{entry.isCurrentUser ? t(' (you)', ' (вие)') : ''}</Text></View><Text style={[theme.typography.metric, { fontSize: 20, color: theme.colors.primary }]}>{entry.value.toLocaleString()}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{metric === 'points' ? t('pts', 'т.') : t('days', 'дни')}</Text></View>)}</Card>}
  </Content></ScrollView></Screen>;
}
