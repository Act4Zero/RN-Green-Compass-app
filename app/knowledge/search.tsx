import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { AppButton, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { KnowledgeCard } from '@/features/knowledge/components/KnowledgeCard';
import { KNOWLEDGE_TOPICS, knowledgeService, type KnowledgeContentType, type KnowledgeDifficulty, type KnowledgeItemSummary, type KnowledgeSearchFilters } from '@/features/knowledge';
import analyticsService from '@/services/analyticsService';
import { useAppTheme } from '@/theme';

const TYPES: { label: string; value?: KnowledgeContentType }[] = [{ label: 'All' }, { label: 'Articles', value: 'article' }, { label: 'Guides', value: 'guide' }, { label: 'Quizzes', value: 'quiz' }, { label: 'Resources', value: 'resource' }];
const DIFFICULTIES: { label: string; value?: KnowledgeDifficulty }[] = [{ label: 'Any level' }, { label: 'Beginner', value: 'beginner' }, { label: 'Intermediate', value: 'intermediate' }, { label: 'Advanced', value: 'advanced' }];
const DURATIONS = [{ label: 'Any length', value: undefined }, { label: 'Under 5 min', value: 5 }, { label: 'Under 10 min', value: 10 }, { label: 'Under 20 min', value: 20 }];
const SORTS: { label: string; value: NonNullable<KnowledgeSearchFilters['sort']> }[] = [{ label: 'Relevant', value: 'relevance' }, { label: 'Newest', value: 'newest' }, { label: 'Recently reviewed', value: 'reviewed' }, { label: 'Shortest', value: 'shortest' }];

export default function KnowledgeSearchScreen() {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const params = useLocalSearchParams<{ topic?: string; q?: string; downloadable?: string }>();
  const [query, setQuery] = useState(params.q || '');
  const [topic, setTopic] = useState(params.topic || '');
  const [type, setType] = useState<KnowledgeContentType | undefined>();
  const [difficulty, setDifficulty] = useState<KnowledgeDifficulty | undefined>();
  const [maxMinutes, setMaxMinutes] = useState<number | undefined>();
  const [sort, setSort] = useState<NonNullable<KnowledgeSearchFilters['sort']>>('relevance');
  const [downloadable, setDownloadable] = useState(params.downloadable === 'true');
  const [items, setItems] = useState<KnowledgeItemSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const columns = width >= theme.breakpoints.desktop ? 3 : width >= theme.breakpoints.tablet ? 2 : 1;
  const filters = useMemo<KnowledgeSearchFilters>(() => ({ topic: topic || undefined, type, difficulty, maxMinutes, downloadable: downloadable || undefined, sort }), [topic, type, difficulty, maxMinutes, downloadable, sort]);

  const search = useCallback(async (cursor = 0, append = false) => {
    setLoading(true);
    const result = await knowledgeService.searchKnowledge(query, filters, 'en', cursor);
    setItems((current) => append ? [...current, ...result.items] : result.items);
    setNextCursor(result.nextCursor);
    setLoading(false);
    if (!append) analyticsService.trackEvent('knowledge_search', { has_query: Boolean(query.trim()), topic: topic || 'all', result_count: result.total });
  }, [query, filters, topic]);

  useEffect(() => { const timer = setTimeout(() => void search(), 180); return () => clearTimeout(timer); }, [search]);

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Content wide>
          <PageHeader eyebrow="Knowledge library" title="Search and discover" description="Find reviewed sustainability knowledge by topic, format, or the time you have." />
          <View style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.surface, borderRadius: theme.radii.md, paddingHorizontal: 15, gap: 10 }}>
            <Ionicons name="search" size={20} color={theme.colors.textMuted} />
            <TextInput accessibilityLabel="Search Knowledge Hub" value={query} onChangeText={setQuery} placeholder="Try “energy at home” or “food waste”" placeholderTextColor={theme.colors.textMuted} style={[theme.typography.body, { flex: 1, color: theme.colors.text, minHeight: 50 }]} />
            {query ? <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')}><Ionicons name="close-circle" size={20} color={theme.colors.textMuted} /></Pressable> : null}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 14 }}>
            {TYPES.map((option) => <FilterChip key={option.label} label={option.label} active={type === option.value} onPress={() => setType(option.value)} />)}
            <FilterChip label="Downloadable" active={downloadable} onPress={() => setDownloadable((value) => !value)} icon="download-outline" />
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 22 }}>
            <FilterChip label="All topics" active={!topic} onPress={() => setTopic('')} />
            {KNOWLEDGE_TOPICS.map((entry) => <FilterChip key={entry.id} label={entry.name} active={topic === entry.slug} onPress={() => setTopic(entry.slug)} />)}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 12 }}>
            {DIFFICULTIES.map((option) => <FilterChip key={option.label} label={option.label} active={difficulty === option.value} onPress={() => setDifficulty(option.value)} />)}
            {DURATIONS.map((option) => <FilterChip key={option.label} label={option.label} active={maxMinutes === option.value} onPress={() => setMaxMinutes(option.value)} />)}
            <FilterChip label="English" active onPress={() => undefined} icon="language-outline" />
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 22 }}>
            {SORTS.map((option) => <FilterChip key={option.value} label={`Sort: ${option.label}`} active={sort === option.value} onPress={() => setSort(option.value)} />)}
          </ScrollView>

          <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 14 }]}>{loading ? 'Searching…' : `${items.length}${nextCursor ? '+' : ''} result${items.length === 1 ? '' : 's'}`}</Text>
          {!loading && items.length === 0 ? <StatePanel icon="search-outline" title="No results yet" message="Try a broader phrase, choose a suggested topic, or tell the community what you want to learn next." action={<View style={{ gap: 9 }}><AppButton label="Explore Climate Action" onPress={() => { setQuery(''); setTopic('climate-action'); }} /><AppButton label="Clear filters" variant="secondary" onPress={() => { setQuery(''); setTopic(''); setType(undefined); setDifficulty(undefined); setMaxMinutes(undefined); setDownloadable(false); setSort('relevance'); }} /><AppButton label="Suggest a missing topic" variant="ghost" onPress={() => router.push({ pathname: '/community/post/new-post' as any, params: { source: 'knowledge-search' } })} /></View>} /> : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {items.map((item) => <View key={item.id} style={{ width: columns === 1 ? '100%' : columns === 2 ? '48.8%' : '32.4%' }}><KnowledgeCard item={item} /></View>)}
          </View>
          {nextCursor !== null ? <AppButton label="Load more" variant="secondary" onPress={() => void search(nextCursor, true)} style={{ marginTop: 20, alignSelf: 'center' }} /> : null}
          <AppButton label="Back to Hub" variant="ghost" onPress={() => router.back()} style={{ marginTop: 22, alignSelf: 'center' }} />
        </Content>
      </ScrollView>
    </Screen>
  );
}

function FilterChip({ label, active, onPress, icon }: { label: string; active: boolean; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  const { theme } = useAppTheme();
  return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={{ minHeight: 40, paddingHorizontal: 15, borderRadius: theme.radii.pill, borderWidth: 1, borderColor: active ? theme.colors.primary : theme.colors.border, backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' }}>{icon ? <Ionicons name={icon} size={16} color={active ? theme.colors.primary : theme.colors.textMuted} /> : null}<Text style={[theme.typography.label, { color: active ? theme.colors.primary : theme.colors.textMuted }]}>{label}</Text></Pressable>;
}
