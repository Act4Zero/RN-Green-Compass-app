import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { AppButton, AppInput, Card, Content, PageHeader, Screen, SegmentedControl, Skeleton, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { communityEngagementService, type CommunityGroupKind, type CommunityGroupSummary, normalizeInviteCode } from '@/features/community';
import { useAppTheme } from '@/theme';
import { useAppLocale } from '@/context/AppLocaleContext';

type FormMode = 'join' | 'create';

export default function CommunityGroupsScreen() {
  const { theme } = useAppTheme();
  const { t } = useAppLocale();
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
    catch { addNotification({ type: 'toast', severity: 'error', message: t('Unable to load groups.', 'Групите не можаха да бъдат заредени.') }); }
    finally { setLoading(false); }
  }, [addNotification, t, user]);

  useFocusEffect(useCallback(() => { if (!authLoading && !user) router.replace('/auth/signin'); else if (user) void load(); }, [authLoading, load, router, user]));

  const join = async () => {
    setSubmitting(true);
    try {
      const groupId = await communityEngagementService.joinGroup(inviteCode);
      setInviteCode('');
      addNotification({ type: 'toast', severity: 'success', message: t('You joined the community group.', 'Присъединихте се към групата.') });
      router.push(`/community/groups/${groupId}` as any);
    } catch { addNotification({ type: 'toast', severity: 'error', message: t('Unable to join group.', 'Неуспешно присъединяване към групата.') }); }
    finally { setSubmitting(false); }
  };

  const create = async () => {
    setSubmitting(true);
    try {
      const group = await communityEngagementService.createGroup({ name, description, kind });
      setName(''); setDescription('');
      addNotification({ type: 'toast', severity: 'success', message: t('Your group and seven-day invite are ready.', 'Групата и седемдневната покана са готови.') });
      router.push(`/community/groups/${group.id}` as any);
    } catch { addNotification({ type: 'toast', severity: 'error', message: t('Unable to create group.', 'Групата не можа да бъде създадена.') }); }
    finally { setSubmitting(false); }
  };

  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content wide>
    <PageHeader eyebrow={t('Private collaboration', 'Частно сътрудничество')} title={t('Your circles and teams', 'Вашите кръгове и екипи')} description={t('Create an invite-only space for friends, a project team, or a local community. Every member controls whether aggregate impact is shared.', 'Създайте пространство с покана за приятели, екип или местна общност. Всеки член решава дали да споделя обобщеното си въздействие.')} action={<AppButton label={t('Back', 'Назад')} icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />

    <Card elevated style={{ marginBottom: theme.spacing.xl, gap: theme.spacing.md }}>
      <SegmentedControl value={mode} onChange={setMode} options={[{ value: 'join', label: t('Join with code', 'Вход с код') }, { value: 'create', label: t('Create group', 'Създай група') }]} />
      {mode === 'join' ? <><AppInput label={t('Invite code', 'Код за покана')} autoCapitalize="characters" value={inviteCode} onChangeText={(value) => setInviteCode(normalizeInviteCode(value))} placeholder="AB12CD34EF" maxLength={12} /><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('Invite codes expire after seven days. Joining never enables profile comparison automatically.', 'Кодовете изтичат след седем дни. Присъединяването не включва автоматично сравнение на профили.')}</Text><AppButton label={t('Join group', 'Присъедини се')} icon="enter-outline" loading={submitting} disabled={inviteCode.length < 6} onPress={() => void join()} /></> : <>
        <Text style={[theme.typography.label, { color: theme.colors.text }]}>{t('Group type', 'Тип група')}</Text>
        <SegmentedControl value={kind} onChange={setKind} options={[{ value: 'friends', label: t('Friends', 'Приятели') }, { value: 'team', label: t('Team', 'Екип') }, { value: 'local', label: t('Local', 'Местна') }]} />
        <AppInput label={t('Group name', 'Име на групата')} value={name} onChangeText={setName} placeholder={t('Sofia Repair Circle', 'Софийски кръг за ремонт')} maxLength={60} />
        <AppInput label={t('Short description', 'Кратко описание')} value={description} onChangeText={setDescription} placeholder={t('What will this group work on together?', 'Върху какво ще работи групата заедно?')} maxLength={280} multiline style={{ minHeight: 88, textAlignVertical: 'top', paddingTop: 13 }} />
        <AppButton label={t('Create private group', 'Създай частна група')} icon="people-outline" loading={submitting} disabled={name.trim().length < 3} onPress={() => void create()} />
      </>}
    </Card>

    <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginBottom: theme.spacing.md }]}>{t('My groups', 'Моите групи')}</Text>
    {loading ? <View style={{ gap: 12 }}><Skeleton height={132} /><Skeleton height={132} /></View> : groups.length === 0 ? <StatePanel icon="people-outline" title={t('No groups yet', 'Все още няма групи')} message={t('Use an invite code or create a private group above.', 'Използвайте код за покана или създайте частна група.')} /> : <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>{groups.map((group) => <Pressable key={group.id} accessibilityRole="link" onPress={() => router.push(`/community/groups/${group.id}` as any)} style={({ pressed }) => ({ width: '100%', opacity: pressed ? 0.78 : 1 })}><Card style={{ gap: theme.spacing.sm }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}><View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={group.kind === 'local' ? 'location-outline' : group.kind === 'friends' ? 'heart-outline' : 'people-outline'} size={23} color={theme.colors.primary} /></View><View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{t(group.kind, group.kind === 'friends' ? 'приятели' : group.kind === 'local' ? 'местна' : 'екип')} · {t(group.role, group.role === 'owner' ? 'собственик' : 'член')}</Text><Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 3 }]}>{group.name}</Text></View><Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} /></View><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{group.description || t('A private Green Compass group.', 'Частна група в Green Compass.')}</Text><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={[theme.typography.label, { color: theme.colors.textMuted }]}>{group.memberCount} {t(group.memberCount === 1 ? 'member' : 'members', group.memberCount === 1 ? 'член' : 'членове')} · {group.shareSummary ? t('summary shared', 'обобщението е споделено') : t('summary private', 'обобщението е лично')}</Text>{group.inviteCode ? <AppButton label={t('Share invite', 'Сподели покана')} icon="share-outline" variant="ghost" onPress={(event) => { event.stopPropagation(); void Share.share({ message: t(`Join ${group.name} in Green Compass with invite code ${group.inviteCode}.`, `Присъедини се към ${group.name} в Green Compass с код ${group.inviteCode}.`) }); }} /> : null}</View></Card></Pressable>)}</View>}
  </Content></ScrollView></Screen>;
}
