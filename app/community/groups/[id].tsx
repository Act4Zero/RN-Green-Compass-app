import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, Share, Text, View } from 'react-native';
import { AppButton, AppInput, Card, Content, PageHeader, Screen, SegmentedControl, Skeleton, StatePanel } from '@/components/ui';
import { useNotification } from '@/context/NotificationContext';
import { communityEngagementService, getCountdownLabel, type CommunityGoalMetric, type CommunityGroupDashboard } from '@/features/community';
import { useAppTheme } from '@/theme';
import { useAppLocale } from '@/context/AppLocaleContext';

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const metricLabel = (metric: CommunityGoalMetric) => metric === 'co2e_kg' ? 'kg CO₂e' : metric;

export default function CommunityGroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
  const router = useRouter();
  const { addNotification } = useNotification();
  const [dashboard, setDashboard] = useState<CommunityGroupDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [metric, setMetric] = useState<CommunityGoalMetric>('actions');
  const [target, setTarget] = useState('100');
  const [contributions, setContributions] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try { setDashboard(await communityEngagementService.getGroupDashboard(id)); }
    catch (error) { setDashboard(null); addNotification({ type: 'toast', severity: 'error', message: error instanceof Error ? error.message : 'Unable to load group.' }); }
    finally { setLoading(false); }
  }, [addNotification, id]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const dates = useMemo(() => { const start = new Date(); const end = new Date(); end.setDate(end.getDate() + 30); return { startsOn: dateKey(start), endsOn: dateKey(end) }; }, []);

  const setSharing = async () => {
    if (!dashboard) return;
    setBusy(true);
    try { await communityEngagementService.setSummarySharing(dashboard.group.id, !dashboard.group.shareSummary); await load(); addNotification({ type: 'toast', severity: 'success', message: dashboard.group.shareSummary ? 'Your comparison summary is private.' : 'Your aggregate summary is now shared with this group.' }); }
    catch (error) { addNotification({ type: 'toast', severity: 'error', message: error instanceof Error ? error.message : 'Unable to update sharing.' }); }
    finally { setBusy(false); }
  };

  const createGoal = async () => {
    if (!dashboard) return;
    setBusy(true);
    try { await communityEngagementService.createGoal({ groupId: dashboard.group.id, title: goalTitle, description: goalDescription, metric, targetValue: Number(target), ...dates }); setGoalTitle(''); setGoalDescription(''); setShowGoalForm(false); await load(); addNotification({ type: 'toast', severity: 'success', message: 'Shared 30-day goal created.' }); }
    catch (error) { addNotification({ type: 'toast', severity: 'error', message: error instanceof Error ? error.message : 'Unable to create goal.' }); }
    finally { setBusy(false); }
  };

  const contribute = async (goalId: string) => {
    const value = Number(contributions[goalId]);
    setBusy(true);
    try { await communityEngagementService.addGoalContribution(goalId, value); setContributions((current) => ({ ...current, [goalId]: '' })); const nextDashboard = await communityEngagementService.getGroupDashboard(id!); setDashboard(nextDashboard); const completedGoal = nextDashboard.goals.find((goal) => goal.id === goalId && goal.status === 'completed'); addNotification({ type: completedGoal ? 'modal' : 'toast', title: completedGoal ? 'Shared goal completed!' : undefined, severity: 'success', message: completedGoal ? 'Your group reached the milestone together. Share the achievement and celebrate everyone’s contribution.' : 'Your contribution is now part of the shared progress.', action: completedGoal ? { label: 'Share milestone', onPress: () => void Share.share({ message: `${nextDashboard.group.name} completed “${completedGoal.title}” in Green Compass — ${completedGoal.currentValue.toLocaleString()} ${metricLabel(completedGoal.metric)} together!` }) } : undefined }); }
    catch (error) { addNotification({ type: 'toast', severity: 'error', message: error instanceof Error ? error.message : 'Unable to add contribution.' }); }
    finally { setBusy(false); }
  };

  if (loading) return <Screen><Content><Skeleton height={160} /><Skeleton height={260} style={{ marginTop: 16 }} /></Content></Screen>;
  if (!dashboard) return <Screen><Content><StatePanel icon="people-outline" title={t('Group unavailable', 'Групата не е достъпна')} message={t('The invite may have expired or you may no longer be a member.', 'Поканата може да е изтекла или вече да не сте член.')} action={<AppButton label={t('Back to groups', 'Към групите')} onPress={() => router.replace('/community/groups' as any)} />} /></Content></Screen>;
  const { group, members, goals } = dashboard;

  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content wide>
    <PageHeader eyebrow={t(`${group.kind} group · ${group.memberCount} members`, `${group.kind === 'friends' ? 'приятелска' : group.kind === 'local' ? 'местна' : 'екипна'} група · ${group.memberCount} членове`)} title={group.name} description={group.description || t('A private space for shared sustainability action.', 'Частно пространство за общи устойчиви действия.')} action={<AppButton label={t('Groups', 'Групи')} icon="arrow-back" variant="ghost" onPress={() => router.replace('/community/groups' as any)} />} />

    <Card elevated style={{ marginBottom: theme.spacing.lg, gap: theme.spacing.md, backgroundColor: theme.colors.primarySoft }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}><Ionicons name={group.shareSummary ? 'eye-outline' : 'eye-off-outline'} size={24} color={theme.colors.primary} /><View style={{ flex: 1 }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{t('Your comparison privacy', 'Поверителност на сравнението')}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3 }]}>{group.shareSummary ? t('Members can see only your aggregate points, streak, actions, and CO₂e avoided.', 'Членовете виждат само общите ви точки, серия, действия и избегнат CO₂e.') : t('Your metrics are visible only to you. Individual habits are always private.', 'Показателите са видими само за вас. Отделните навици винаги остават лични.')}</Text></View></View>
      <AppButton label={group.shareSummary ? t('Make my summary private', 'Направи обобщението лично') : t('Share my aggregate summary', 'Сподели обобщението')} variant={group.shareSummary ? 'secondary' : 'primary'} loading={busy} onPress={() => void setSharing()} />
    </Card>

    {group.role === 'owner' && group.inviteCode ? <Card style={{ marginBottom: theme.spacing.xl, gap: theme.spacing.sm }}><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{t('Seven-day invite', 'Седемдневна покана')}</Text><Text selectable style={[theme.typography.metric, { color: theme.colors.text }]}>{group.inviteCode}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('Expires', 'Изтича')} {group.inviteExpiresAt ? new Date(group.inviteExpiresAt).toLocaleString() : t('soon', 'скоро')}.</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><AppButton label={t('Share invite', 'Сподели покана')} icon="share-outline" onPress={() => void Share.share({ message: t(`Join ${group.name} in Green Compass with code ${group.inviteCode}.`, `Присъедини се към ${group.name} в Green Compass с код ${group.inviteCode}.`) })} style={{ flex: 1 }} /><AppButton label={t('Rotate code', 'Смени кода')} icon="refresh-outline" variant="secondary" onPress={async () => { setBusy(true); try { await communityEngagementService.rotateInvite(group.id); await load(); } finally { setBusy(false); } }} style={{ flex: 1 }} /></View></Card> : null}

    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: theme.spacing.md }}><View><Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text }]}>{t('Shared goals', 'Споделени цели')}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('Everyone can create a measurable 30-day target.', 'Всеки може да създаде измерима 30-дневна цел.')}</Text></View><AppButton label={showGoalForm ? t('Close', 'Затвори') : t('New goal', 'Нова цел')} icon={showGoalForm ? 'close' : 'add'} variant="secondary" onPress={() => setShowGoalForm(!showGoalForm)} /></View>
    {showGoalForm ? <Card style={{ marginBottom: theme.spacing.lg, gap: theme.spacing.md }}><AppInput label={t('Goal title', 'Заглавие на целта')} value={goalTitle} onChangeText={setGoalTitle} placeholder={t('Collect 500 kg of plastic together', 'Съберете заедно 500 kg пластмаса')} maxLength={100} /><AppInput label={t('Description', 'Описание')} value={goalDescription} onChangeText={setGoalDescription} placeholder={t('How will the group contribute?', 'Как ще допринесе групата?')} maxLength={500} /><SegmentedControl value={metric} onChange={setMetric} options={[{ value: 'actions', label: t('Actions', 'Действия') }, { value: 'points', label: t('Points', 'Точки') }, { value: 'co2e_kg', label: 'kg CO₂e' }]} /><AppInput label={`${t('Target', 'Цел')} (${metricLabel(metric)})`} keyboardType="decimal-pad" value={target} onChangeText={setTarget} /><AppButton label={t('Create 30-day goal', 'Създай 30-дневна цел')} loading={busy} disabled={goalTitle.trim().length < 5 || Number(target) <= 0} onPress={() => void createGoal()} /></Card> : null}
    {goals.length === 0 ? <StatePanel icon="flag-outline" title={t('No shared goals yet', 'Все още няма споделени цели')} message={t('Create the first measurable goal for this group.', 'Създайте първата измерима цел за групата.')} /> : <View style={{ gap: theme.spacing.md }}>{goals.map((goal) => { const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)); return <Card key={goal.id} style={{ gap: theme.spacing.md, borderTopWidth: 4, borderTopColor: goal.status === 'completed' ? theme.colors.success : theme.colors.accent }}><View style={{ flexDirection: 'row', gap: 12, justifyContent: 'space-between' }}><View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: goal.status === 'completed' ? theme.colors.success : theme.colors.primary, textTransform: 'uppercase' }]}>{t(goal.status, goal.status === 'completed' ? 'завършена' : 'активна')} · {getCountdownLabel(`${goal.endsOn}T23:59:59`)}</Text><Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 4 }]}>{goal.title}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 4 }]}>{goal.description}</Text></View><Text style={[theme.typography.metric, { color: theme.colors.primary }]}>{percent}%</Text></View><View style={{ height: 10, borderRadius: 5, backgroundColor: theme.colors.surfaceStrong, overflow: 'hidden' }}><View style={{ height: '100%', width: `${percent}%`, backgroundColor: goal.status === 'completed' ? theme.colors.success : theme.colors.primary }} /></View><Text style={[theme.typography.label, { color: theme.colors.text }]}>{goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()} {metricLabel(goal.metric)} · {t('You contributed', 'Вашият принос е')} {goal.myContribution.toLocaleString()}</Text>{goal.contributors.length ? <View style={{ gap: 5 }}>{goal.contributors.slice(0, 5).map((entry) => <View key={entry.userId} style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={[theme.typography.bodySmall, { color: entry.isCurrentUser ? theme.colors.primary : theme.colors.textMuted }]}>{entry.isCurrentUser ? t('You', 'Вие') : entry.displayName}</Text><Text style={[theme.typography.label, { color: theme.colors.text }]}>{entry.value.toLocaleString()} {metricLabel(goal.metric)}</Text></View>)}</View> : null}{goal.status === 'active' ? <View style={{ flexDirection: 'row', gap: 8 }}><AppInput label={t('Add my contribution', 'Добави моя принос')} keyboardType="decimal-pad" value={contributions[goal.id] || ''} onChangeText={(value) => setContributions((current) => ({ ...current, [goal.id]: value }))} style={{ minWidth: 150 }} /><AppButton label={t('Add', 'Добави')} loading={busy} disabled={Number(contributions[goal.id]) <= 0} onPress={() => void contribute(goal.id)} style={{ alignSelf: 'flex-end' }} /></View> : <AppButton label={t('Share milestone', 'Сподели постижението')} icon="share-outline" variant="secondary" onPress={() => void Share.share({ message: `${group.name} completed “${goal.title}” in Green Compass — ${goal.currentValue.toLocaleString()} ${metricLabel(goal.metric)} together!` })} />}</Card>; })}</View>}

    <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginTop: theme.spacing.xl, marginBottom: theme.spacing.md }]}>{t('Member comparison', 'Сравнение на членовете')}</Text>
    <Card style={{ padding: 0, overflow: 'hidden' }}>{members.map((member, index) => <View key={member.userId} style={{ minHeight: 88, padding: theme.spacing.md, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, borderBottomWidth: index === members.length - 1 ? 0 : 1, borderBottomColor: theme.colors.border }}><View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Text style={[theme.typography.h3, { color: theme.colors.primary }]}>{member.displayName.charAt(0).toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{member.isCurrentUser ? `${member.displayName} (${t('you', 'вие')})` : member.displayName}</Text>{member.sharingEnabled || member.isCurrentUser ? <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3 }]}>{member.totalPoints || 0} {t('points', 'точки')} · {member.loginStreak || 0} {t('day streak', 'дневна серия')} · {member.completedActions || 0} {t('actions', 'действия')} · {(member.co2eKgAvoided || 0).toFixed(1)} kg CO₂e</Text> : <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3 }]}>{t('Aggregate comparison is private.', 'Обобщеното сравнение е лично.')}</Text>}</View><Ionicons name={member.sharingEnabled ? 'eye-outline' : 'lock-closed-outline'} size={18} color={theme.colors.textMuted} /></View>)}</Card>
  </Content></ScrollView></Screen>;
}
