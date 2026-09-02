import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Linking, ScrollView, Share, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, SegmentedControl, Skeleton, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { communityEngagementService, getCountdownLabel, type CommunityProject, type CommunityProjectScope } from '@/features/community';
import { useAppTheme } from '@/theme';
import { useAppLocale } from '@/context/AppLocaleContext';

const PROJECT_COPY_BG: Record<string, Partial<CommunityProject>> = {
  '22af5740-a825-4d5d-a3b4-dff8d1d5d101': { title: 'Международно почистване на крайбрежията', summary: 'Включете се в координирано почистване и допринесете за по-здрави водни екосистеми.', description: 'Изберете безопасна дейност край бряг или река, следвайте указанията на организатора и споделете наученото с общността.', eventName: 'Международно почистване на крайбрежията', seasonalTag: 'есен' },
  '22af5740-a825-4d5d-a3b4-dff8d1d5d102': { title: 'Ден за ремонт и повторна употреба в квартала', summary: 'Върнете един домашен предмет в употреба и обменете знания за ремонт.', description: 'Организирайте или посетете малка ремонтна среща с приятели, семейство или съседи. Пребройте ремонтираните предмети и споделете полезен съвет.', eventName: 'Месец на кръговата икономика', seasonalTag: 'есен', location: 'Изберете място с вашата група' },
  '22af5740-a825-4d5d-a3b4-dff8d1d5d103': { title: 'Общностен ангажимент за опрашителите', summary: 'Създайте храна и убежища за опрашители чрез подходящи местни растения и грижа без пестициди.', description: 'Използвайте насоки за местни растения, документирайте действието си и поканете други хора да изградят свързан коридор за опрашители.', eventName: 'Световен ден на пчелите', seasonalTag: 'пролет' },
};

export default function CommunityProjectsScreen() {
  const { theme } = useAppTheme();
  const { locale, t } = useAppLocale();
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
    catch { addNotification({ type: 'toast', severity: 'error', message: t('Unable to load projects.', 'Проектите не можаха да бъдат заредени.') }); }
    finally { setLoading(false); }
  }, [addNotification, t, user]);
  useFocusEffect(useCallback(() => { if (user) void load(); }, [load, user]));

  const toggle = async (project: CommunityProject) => {
    setBusyId(project.id);
    try { await communityEngagementService.setProjectParticipation(project.id, !project.isParticipant); await load(); addNotification({ type: 'toast', severity: 'success', message: project.isParticipant ? t('You left the project.', 'Напуснахте проекта.') : t('You joined the project. Add it to your calendar using the organizer link.', 'Присъединихте се към проекта. Добавете го в календара чрез връзката на организатора.') }); }
    catch { addNotification({ type: 'toast', severity: 'error', message: t('Unable to update participation.', 'Участието не можа да бъде обновено.') }); }
    finally { setBusyId(null); }
  };

  const visible = projects.filter((project) => project.scope === scope).map((project) => locale === 'bg' ? { ...project, ...(PROJECT_COPY_BG[project.id] || {}) } : project);
  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content wide>
    <PageHeader eyebrow={t('Act together', 'Действайте заедно')} title={t('Community projects and events', 'Общностни проекти и събития')} description={t('Join a local meet-up or a global initiative, follow organizer guidance, and bring what you learn back to the community.', 'Включете се в местна среща или глобална инициатива, следвайте указанията на организатора и споделете наученото с общността.')} action={<AppButton label={t('Community', 'Общност')} icon="arrow-back" variant="ghost" onPress={() => router.back()} />} />
    <SegmentedControl value={scope} onChange={setScope} options={[{ value: 'local', label: t('Local projects', 'Местни проекти') }, { value: 'global', label: t('Global initiatives', 'Глобални инициативи') }]} />
    <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginVertical: theme.spacing.md }]}>{t('Project dates and external organizer links are editorially reviewed. Confirm accessibility, safety, and exact meeting details with the organizer.', 'Датите и външните връзки се преглеждат редакционно. Потвърдете достъпността, безопасността и точните подробности с организатора.')}</Text>
    {loading ? <View style={{ gap: 12 }}><Skeleton height={240} /><Skeleton height={240} /></View> : visible.length === 0 ? <StatePanel icon="calendar-outline" title={t('No active projects in this view', 'Няма активни проекти в този изглед')} message={t('Try the other scope or submit a project idea for editorial review.', 'Опитайте другия обхват или изпратете идея за редакционен преглед.')} action={<AppButton label={t('Submit project idea', 'Изпрати идея за проект')} onPress={() => router.push({ pathname: '/community/contribute' as any, params: { type: 'project_idea' } })} />} /> : <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>{visible.map((project) => <Card key={project.id} elevated={project.featured} style={{ width: '100%', gap: theme.spacing.md, borderTopWidth: 5, borderTopColor: project.scope === 'global' ? theme.colors.info : theme.colors.accent }}><View style={{ flexDirection: 'row', gap: theme.spacing.md, alignItems: 'flex-start' }}><View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: project.scope === 'global' ? theme.colors.primarySoft : theme.colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={project.scope === 'global' ? 'earth-outline' : 'location-outline'} size={23} color={theme.colors.primary} /></View><View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{project.featured ? t('Featured · ', 'Избрано · ') : ''}{project.eventName || project.seasonalTag || t(project.scope, project.scope === 'global' ? 'глобално' : 'местно')}</Text><Text style={[theme.typography.h2, { color: theme.colors.text, marginTop: 4 }]}>{project.title}</Text></View><View style={{ borderRadius: theme.radii.pill, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: theme.colors.surfaceMuted }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>{getCountdownLabel(project.endsAt)}</Text></View></View><Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{project.summary}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{project.description}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}><Text style={[theme.typography.label, { color: theme.colors.text }]}><Ionicons name="people-outline" size={15} /> {project.participantCount}{project.targetParticipants ? ` / ${project.targetParticipants}` : ''} {t('joined', 'участници')}</Text>{project.location ? <Text style={[theme.typography.label, { color: theme.colors.text }]}><Ionicons name="location-outline" size={15} /> {project.location}</Text> : <Text style={[theme.typography.label, { color: theme.colors.text }]}><Ionicons name="videocam-outline" size={15} /> {t('Virtual/global participation', 'Виртуално/глобално участие')}</Text>}</View><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><AppButton label={project.isParticipant ? t('Leave project', 'Напусни проекта') : t('Join project', 'Включи се')} icon={project.isParticipant ? 'checkmark-circle' : 'add-circle-outline'} variant={project.isParticipant ? 'secondary' : 'primary'} loading={busyId === project.id} onPress={() => void toggle(project)} style={{ flex: 1 }} />{project.externalUrl ? <AppButton label={t('Organizer details', 'Подробности от организатора')} icon="open-outline" variant="secondary" onPress={() => void Linking.openURL(project.externalUrl!)} style={{ flex: 1 }} /> : null}<AppButton label={t('Share', 'Сподели')} icon="share-outline" variant="ghost" onPress={() => void Share.share({ message: t(`Join “${project.title}” with the Green Compass community. ${project.externalUrl || ''}`, `Включи се в „${project.title}“ с общността на Green Compass. ${project.externalUrl || ''}`) })} /></View></Card>)}</View>}
    <Card style={{ marginTop: theme.spacing.xl, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: theme.spacing.md }}><View style={{ flex: 1, minWidth: 240 }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{t('Have an initiative in mind?', 'Имате идея за инициатива?')}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 4 }]}>{t('Submit a project idea with an HTTPS source. Editors review safety and details before it appears here.', 'Изпратете идея за проект с HTTPS източник. Редакторите проверяват безопасността и подробностите преди публикуване.')}</Text></View><AppButton label={t('Submit an idea', 'Изпрати идея')} icon="bulb-outline" onPress={() => router.push({ pathname: '/community/contribute' as any, params: { type: 'project_idea' } })} /></Card>
  </Content></ScrollView></Screen>;
}
