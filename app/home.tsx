import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { GoalsHeader, GoalsList } from '@/components/home/GoalsList';
import EditGoalModal from '@/components/modals/EditGoalModal';
import { AppButton, Card, Content, PageHeader, Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { usePoints } from '@/context/PointsContext';
import { EcosystemHero, useEcosystem } from '@/features/ecosystem';
import { knowledgeService, type KnowledgeItemDetail, useKnowledgeLocale } from '@/features/knowledge';
import useGoalsManager from '@/hooks/useGoalsManager';
import useHabitStats from '@/hooks/useHabitStats';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import useProfileManager from '@/hooks/useProfileManager';
import analyticsService from '@/services/analyticsService';
import { useAppTheme } from '@/theme';
import type { EnhancedGoal, TimeFrequency } from '@/types/goal.types';

export default function Home() {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const wide = width >= 768;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useKnowledgeLocale();
  const ecosystemEnabled = useFeatureFlag('living_ecosystem_v1', true);
  const { pointHistory, awardDailyCheckIn } = usePoints();
  const { snapshot, loading: ecosystemLoading } = useEcosystem(user?.id, pointHistory);
  const { profile, isLoading: profileLoading, loadProfile, getProfileDisplayIdentifier } = useProfileManager();
  const { totalCO2Saved, totalActions, overallStreak, refreshStats } = useHabitStats();
  const { goals, updateGoal, deleteGoal, refreshGoals } = useGoalsManager();
  const [dailyDose, setDailyDose] = useState<KnowledgeItemDetail | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<EnhancedGoal | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    const timeout = setTimeout(() => {
      if (!authLoading && !user) void router.replace('/auth/signin');
      if (!authLoading && user) void loadProfile();
    }, 100);
    return () => clearTimeout(timeout);
  }, [authLoading, loadProfile, router, user]));

  useFocusEffect(useCallback(() => {
    let active = true;
    void Promise.allSettled([refreshStats(), refreshGoals()]).then((results) => {
      if (!active) return;
      const failed = results.some((result) => result.status === 'rejected');
      setRefreshError(failed ? t('Some progress data could not be refreshed.', 'Част от данните за напредъка не можаха да се обновят.') : null);
    });
    return () => { active = false; };
  }, [refreshGoals, refreshStats, t]));

  useEffect(() => {
    analyticsService.trackScreenView('Home');
    if (user) analyticsService.setUserProperties({ userEmail: user.email || 'unknown', userCreatedAt: user.created_at || 'unknown' });
  }, [user]);

  useEffect(() => {
    void knowledgeService.getKnowledgeHome({ userId: user?.id })
      .then((result) => setDailyDose(result.dailyDose))
      .catch(() => undefined);
  }, [user?.id]);

  useEffect(() => {
    if (!user || typeof document === 'undefined') return;
    const handleFirstActivity = async (event: Event) => {
      const detail = (event as CustomEvent<{ userId?: string }>).detail;
      if (detail?.userId === user.id) await awardDailyCheckIn();
    };
    document.addEventListener('firstDailyActivity', handleFirstActivity);
    return () => document.removeEventListener('firstDailyActivity', handleFirstActivity);
  }, [awardDailyCheckIn, user]);

  const displayIdentifier = profile ? getProfileDisplayIdentifier() : '';
  const metrics = [
    { label: t('Actions taken', 'Изпълнени действия'), value: `${totalActions || 0}`, icon: 'checkmark-circle-outline' as const },
    { label: t('CO₂ saved', 'Спестен CO₂'), value: `${totalCO2Saved?.toFixed(1) || '0.0'} kg`, icon: 'cloud-outline' as const },
    { label: t('Current streak', 'Текуща серия'), value: `${overallStreak || 0} ${t('days', 'дни')}`, icon: 'flame-outline' as const },
  ];
  const actions = [
    { label: t('Log an action', 'Запиши действие'), detail: t('Give today one sustainable choice.', 'Добави един устойчив избор за днес.'), icon: 'add-circle-outline' as const, route: '/habits/log' as const },
    { label: t('Explore the map', 'Разгледай картата'), detail: t('Find greener places nearby.', 'Открий по-зелени места наблизо.'), icon: 'map-outline' as const, route: '/map' as const },
    { label: t('Join a challenge', 'Включи се в предизвикателство'), detail: t('Grow together with the community.', 'Развивайте се заедно с общността.'), icon: 'people-outline' as const, route: '/community/challenges' as const },
  ];

  const handleUpdateGoal = async (goalId: string, updates: { goalName: string; category: string; targetValue: number; currentValue: number; timeFrequency: TimeFrequency }) => updateGoal(goalId, updates);
  const handleDeleteGoal = async (goalId: string) => deleteGoal(goalId);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Content wide>
          <PageHeader
            eyebrow={t('Your compass', 'Твоят компас')}
            title={t(`Welcome back${displayIdentifier ? `, ${displayIdentifier}` : ''}`, `Добре дошъл отново${displayIdentifier ? `, ${displayIdentifier}` : ''}`)}
            description={t('A living view of the good choices you are building, one meaningful action at a time.', 'Жив образ на добрите избори, които изграждаш — едно смислено действие след друго.')}
            action={wide ? <AppButton label={t('Log action', 'Запиши действие')} icon="add" onPress={() => router.push('/habits/log')} /> : undefined}
          />

          {ecosystemEnabled ? <EcosystemHero snapshot={snapshot} loading={ecosystemLoading} onOpen={() => router.push('/ecosystem' as any)} /> : null}

          <View style={{ flexDirection: wide ? 'row' : 'column', gap: 12, marginBottom: 28 }}>
            {metrics.map((metric) => (
              <Card key={metric.label} style={{ flex: 1, padding: 18 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[theme.typography.metric, { color: theme.colors.text, fontSize: 25 }]}>{metric.value}</Text>
                    <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3 }]}>{metric.label}</Text>
                  </View>
                  <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={metric.icon} size={20} color={theme.colors.primary} /></View>
                </View>
              </Card>
            ))}
          </View>

          <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 14 }]}>{t('One good next step', 'Една добра следваща стъпка')}</Text>
          <View style={{ flexDirection: wide ? 'row' : 'column', gap: 12, marginBottom: 30 }}>
            <Card style={{ flex: 1, padding: 20, backgroundColor: theme.colors.accentSoft }}>
              <View style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="sparkles-outline" size={22} color={theme.colors.accent} /></View>
              <Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase', marginTop: 16 }]}>{t("Today's eco practice", 'Днешната еко практика')}</Text>
              <Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 6, marginBottom: 16 }]}>{t('A small challenge and reflection are ready.', 'Кратко предизвикателство и размисъл те очакват.')}</Text>
              <AppButton label={t('Check in', 'Отбележи')} icon="arrow-forward" onPress={() => router.push('/habits/today' as any)} />
            </Card>
            {dailyDose ? (
              <Card style={{ flex: 1, padding: 20 }}>
                <View style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="bulb-outline" size={22} color={theme.colors.primary} /></View>
                <Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase', marginTop: 16 }]}>{t('Daily knowledge dose', 'Дневна доза знание')}</Text>
                <Text numberOfLines={2} style={[theme.typography.h3, { color: theme.colors.text, marginTop: 6, marginBottom: 16 }]}>{dailyDose.title}</Text>
                <AppButton label={t('Learn why', 'Научи защо')} variant="secondary" icon="arrow-forward" onPress={() => router.push(`/knowledge/content/${dailyDose.slug}` as any)} />
              </Card>
            ) : null}
          </View>

          <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 14 }]}>{t('Choose your next move', 'Избери следващата си стъпка')}</Text>
          <View style={{ flexDirection: wide ? 'row' : 'column', gap: 12, marginBottom: 30 }}>
            {actions.map((action) => (
              <Card key={action.label} style={{ flex: 1, padding: 18 }}>
                <View style={{ width: 43, height: 43, borderRadius: 14, backgroundColor: theme.colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}><Ionicons name={action.icon} size={21} color={theme.colors.primary} /></View>
                <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{action.label}</Text>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 4, marginBottom: 14 }]}>{action.detail}</Text>
                <AppButton label={t('Open', 'Отвори')} variant="ghost" icon="arrow-forward" onPress={() => router.push(action.route as any)} />
              </Card>
            ))}
          </View>

          {refreshError ? <Text accessibilityRole="alert" style={[theme.typography.bodySmall, { color: theme.colors.danger, marginBottom: 12 }]}>{refreshError}</Text> : null}
          <Card style={{ padding: 20, marginBottom: 26 }}><GoalsHeader onAddGoal={() => router.push('habits/goal' as any)} /><GoalsList goals={goals} onEditGoal={(goal) => { setSelectedGoal(goal); setIsEditModalVisible(true); }} /></Card>
        </Content>
      </ScrollView>

      <EditGoalModal visible={isEditModalVisible} goal={selectedGoal} onClose={() => setIsEditModalVisible(false)} onSave={handleUpdateGoal} onDelete={handleDeleteGoal} loading={profileLoading} />
    </Screen>
  );
}
