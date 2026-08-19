import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { KnowledgeCard } from '@/features/knowledge/components/KnowledgeCard';
import { KnowledgeError, KnowledgeLoading } from '@/features/knowledge/components/KnowledgeState';
import { KnowledgeSection } from '@/features/knowledge/components/KnowledgeSection';
import { TopicCard } from '@/features/knowledge/components/TopicCard';
import { knowledgeService, type KnowledgeHomeData } from '@/features/knowledge';
import analyticsService from '@/services/analyticsService';
import { fetchUserProfile } from '@/services/profile';
import { useAppTheme } from '@/theme';

export default function KnowledgeHubScreen() {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<KnowledgeHomeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const compact = width < theme.breakpoints.tablet;

  const load = useCallback(async () => {
    setError(null);
    try {
      const profile = user ? await fetchUserProfile(user.id) : null;
      const result = await knowledgeService.getKnowledgeHome({ userId: user?.id, interests: profile?.interests || [] });
      setData(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'The Hub could not load.');
    }
  }, [user]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));
  useEffect(() => analyticsService.trackScreenView('Knowledge Hub'), []);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Content wide>
          <PageHeader eyebrow="Learn • act • grow" title="Knowledge Hub" description="Trusted sustainability knowledge, shaped around what you care about and connected to actions you can take." action={!compact ? <AppButton label="Search the Hub" icon="search" onPress={() => router.push('/knowledge/search' as any)} /> : undefined} />
          {compact ? <AppButton label="Search the Hub" icon="search" variant="secondary" onPress={() => router.push('/knowledge/search' as any)} style={{ marginBottom: 18 }} /> : null}

          {!data && !error ? <KnowledgeLoading /> : null}
          {error ? <KnowledgeError retry={() => void load()} /> : null}
          {data ? (
            <>
              <Card elevated style={{ backgroundColor: theme.colors.primary, borderColor: theme.colors.primary, padding: compact ? 22 : 30, marginBottom: 30, overflow: 'hidden' }}>
                <View style={{ position: 'absolute', width: 240, height: 240, borderRadius: 120, right: -60, top: -100, backgroundColor: theme.colors.accent, opacity: 0.2 }} />
                <View style={{ flexDirection: compact ? 'column' : 'row', alignItems: compact ? 'flex-start' : 'center', gap: 22 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[theme.typography.label, { color: theme.colors.accent, textTransform: 'uppercase', letterSpacing: 1.1 }]}>Today’s sustainability dose</Text>
                    <Text style={[theme.typography.h1, { color: '#FFFFFF', marginTop: 9, maxWidth: 740 }]}>{data.dailyDose.title}</Text>
                    <Text style={[theme.typography.body, { color: '#D8EAE0', marginTop: 9 }]}>{data.dailyDose.summary}</Text>
                  </View>
                  <AppButton label="Read the context" variant="secondary" icon="arrow-forward" onPress={() => router.push(`/knowledge/content/${data.dailyDose.slug}` as any)} />
                </View>
              </Card>

              {data.continueLearning.length > 0 ? <KnowledgeSection title="Continue learning" description="Pick up where you left off." horizontal>{data.continueLearning.map((item) => <KnowledgeCard key={item.id} item={item} progress={item.progress} compact />)}</KnowledgeSection> : null}
              <KnowledgeSection title={user ? 'For you' : 'Start exploring'} description={user ? 'Recommendations based on your interests and activity—with a reason for every suggestion.' : 'Editor-reviewed starting points for everyday sustainability.'} horizontal>
                {(user ? data.recommendations : data.editorPicks).map((item) => <KnowledgeCard key={item.id} item={item} reason={'reason' in item && typeof item.reason === 'string' ? item.reason : "Editor's pick"} compact />)}
              </KnowledgeSection>

              <KnowledgeSection title="Explore by topic" description="Follow a question, build a skill, or discover something new." horizontal>
                {data.topics.map((topic) => <TopicCard key={topic.id} topic={topic} />)}
              </KnowledgeSection>

              <KnowledgeSection title="Turn knowledge into action" description="Learning designed to connect with your habits, goals, map, and community." horizontal>
                {data.actionItems.map((item) => <KnowledgeCard key={item.id} item={item} compact />)}
              </KnowledgeSection>

              <KnowledgeSection title="Check what you know" description="Short quizzes with explanations and visible sources." horizontal>
                {data.interactive.map((item) => <KnowledgeCard key={item.id} item={item} compact />)}
              </KnowledgeSection>

              <KnowledgeSection title="New and recently reviewed" horizontal>
                {data.newest.map((item) => <KnowledgeCard key={item.id} item={item} compact />)}
              </KnowledgeSection>

              <Pressable accessibilityRole="link" onPress={() => router.push('/knowledge/downloads' as any)} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
                <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                  <View style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="download-outline" size={22} color={theme.colors.primary} /></View>
                  <View style={{ flex: 1 }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>Your offline library</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3 }]}>Keep selected guides available when your connection is not.</Text></View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
                </Card>
              </Pressable>
            </>
          ) : null}
        </Content>
      </ScrollView>
    </Screen>
  );
}
