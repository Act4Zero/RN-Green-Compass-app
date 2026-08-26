import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen, StatePanel } from '@/components/ui';
import { KNOWLEDGE_TOPICS, knowledgeService, localizedTopic, useKnowledgeLocale, type KnowledgeContentType, type KnowledgeDifficulty, type KnowledgeItemSummary, type KnowledgeSearchFilters } from '@/features/knowledge';
import analyticsService from '@/services/analyticsService';
import { useAppTheme } from '@/theme';

const TYPES: { label: string; value?: KnowledgeContentType }[] = [{ label: 'All' }, { label: 'Articles', value: 'article' }, { label: 'Guides', value: 'guide' }, { label: 'Infographics', value: 'infographic' }, { label: 'Videos', value: 'video' }, { label: 'DIY', value: 'diy' }, { label: 'Tours', value: 'tour' }, { label: 'Labs', value: 'simulation' }, { label: 'Quizzes', value: 'quiz' }, { label: 'Live', value: 'webinar' }, { label: 'Resources', value: 'resource' }];
const DIFFICULTIES: { label: string; value?: KnowledgeDifficulty }[] = [{ label: 'Any level' }, { label: 'Beginner', value: 'beginner' }, { label: 'Intermediate', value: 'intermediate' }, { label: 'Advanced', value: 'advanced' }];
const DURATIONS = [{ label: 'Any length', value: undefined }, { label: 'Under 5 min', value: 5 }, { label: 'Under 10 min', value: 10 }, { label: 'Under 20 min', value: 20 }];
const SORTS: { label: string; value: NonNullable<KnowledgeSearchFilters['sort']> }[] = [{ label: 'Relevant', value: 'relevance' }, { label: 'Newest', value: 'newest' }, { label: 'Recently reviewed', value: 'reviewed' }, { label: 'Shortest', value: 'shortest' }];

export default function KnowledgeSearchScreen() {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { locale, t } = useKnowledgeLocale();
  const params = useLocalSearchParams<{ topic?: string; q?: string; downloadable?: string; type?: KnowledgeContentType }>();
  const [query, setQuery] = useState(params.q || '');
  const [topic, setTopic] = useState(params.topic || '');
  const [type, setType] = useState<KnowledgeContentType | undefined>(params.type);
  const [difficulty, setDifficulty] = useState<KnowledgeDifficulty | undefined>();
  const [maxMinutes, setMaxMinutes] = useState<number | undefined>();
  const [sort, setSort] = useState<NonNullable<KnowledgeSearchFilters['sort']>>('relevance');
  const [downloadable, setDownloadable] = useState(params.downloadable === 'true');
  const [items, setItems] = useState<KnowledgeItemSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(width >= theme.breakpoints.tablet);
  const filters = useMemo<KnowledgeSearchFilters>(() => ({ topic: topic || undefined, type, difficulty, maxMinutes, downloadable: downloadable || undefined, sort }), [topic, type, difficulty, maxMinutes, downloadable, sort]);

  const search = useCallback(async (cursor = 0, append = false) => {
    setLoading(true);
    const result = await knowledgeService.searchKnowledge(query, filters, locale, cursor);
    setItems((current) => append ? [...current, ...result.items] : result.items);
    setNextCursor(result.nextCursor);
    setLoading(false);
    if (!append) analyticsService.trackEvent('knowledge_search', { has_query: Boolean(query.trim()), topic: topic || 'all', result_count: result.total });
  }, [query, filters, topic, locale]);

  useEffect(() => { const timer = setTimeout(() => void search(), 180); return () => clearTimeout(timer); }, [search]);

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Content wide>
          <PageHeader eyebrow={t('Knowledge library', 'Библиотека със знания')} title={t('Search and discover', 'Търсете и откривайте')} description={t('Find reviewed sustainability knowledge by topic, format, or the time you have.', 'Намерете проверени знания по тема, формат или налично време.')} />
          <View style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.surface, borderRadius: theme.radii.md, paddingHorizontal: 15, gap: 10 }}>
            <Ionicons name="search" size={20} color={theme.colors.textMuted} />
            <TextInput accessibilityLabel={t('Search Knowledge Hub', 'Търсене в Knowledge Hub')} value={query} onChangeText={setQuery} placeholder={t('Try “energy at home” or “food waste”', 'Опитайте „енергия у дома“ или „хранителни отпадъци“')} placeholderTextColor={theme.colors.textMuted} style={[theme.typography.body, { flex: 1, color: theme.colors.text, minHeight: 50 }]} />
            {query ? <Pressable accessibilityLabel="Clear search" onPress={() => setQuery('')}><Ionicons name="close-circle" size={20} color={theme.colors.textMuted} /></Pressable> : null}
          </View>

          {width < theme.breakpoints.tablet ? <AppButton label={showFilters ? t('Hide filters', 'Скрий филтрите') : t('Filters', 'Филтри')} icon="options-outline" variant="secondary" onPress={() => setShowFilters((value) => !value)} style={{ marginTop: 12, alignSelf: 'flex-start' }} /> : null}
          {showFilters ? <><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 14 }}>
            {TYPES.map((option) => <FilterChip key={option.label} label={option.label} active={type === option.value} onPress={() => setType(option.value)} />)}
            <FilterChip label="Downloadable" active={downloadable} onPress={() => setDownloadable((value) => !value)} icon="download-outline" />
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 22 }}>
            <FilterChip label="All topics" active={!topic} onPress={() => setTopic('')} />
            {KNOWLEDGE_TOPICS.map((entry) => <FilterChip key={entry.id} label={localizedTopic(entry, locale).name} active={topic === entry.slug} onPress={() => setTopic(entry.slug)} />)}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 12 }}>
            {DIFFICULTIES.map((option) => <FilterChip key={option.label} label={option.label} active={difficulty === option.value} onPress={() => setDifficulty(option.value)} />)}
            {DURATIONS.map((option) => <FilterChip key={option.label} label={option.label} active={maxMinutes === option.value} onPress={() => setMaxMinutes(option.value)} />)}
            <FilterChip label={locale === 'bg' ? 'Български' : 'English'} active onPress={() => undefined} icon="language-outline" />
          </ScrollView></> : null}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 22 }}>
            {SORTS.map((option) => <FilterChip key={option.value} label={`Sort: ${option.label}`} active={sort === option.value} onPress={() => setSort(option.value)} />)}
          </ScrollView>

          <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 14 }]}>{loading ? 'Searching…' : `${items.length}${nextCursor ? '+' : ''} result${items.length === 1 ? '' : 's'}`}</Text>
          {!loading && items.length === 0 ? <StatePanel icon="search-outline" title="No results yet" message="Try a broader phrase, choose a suggested topic, or tell the community what you want to learn next." action={<View style={{ gap: 9 }}><AppButton label="Explore Climate Action" onPress={() => { setQuery(''); setTopic('climate-action'); }} /><AppButton label="Clear filters" variant="secondary" onPress={() => { setQuery(''); setTopic(''); setType(undefined); setDifficulty(undefined); setMaxMinutes(undefined); setDownloadable(false); setSort('relevance'); }} /><AppButton label="Suggest a missing topic" variant="ghost" onPress={() => router.push({ pathname: '/community/post/new-post' as any, params: { source: 'knowledge-search' } })} /></View>} /> : null}
          {items.length ? <Card style={{ padding: 0, overflow: 'hidden' }}>{items.map((item, index) => <SearchResultRow key={item.id} item={item} last={index === items.length - 1} />)}</Card> : null}
          {nextCursor !== null ? <AppButton label="Load more" variant="secondary" onPress={() => void search(nextCursor, true)} style={{ marginTop: 20, alignSelf: 'center' }} /> : null}
          <AppButton label="Back to Hub" variant="ghost" onPress={() => router.back()} style={{ marginTop: 22, alignSelf: 'center' }} />
        </Content>
      </ScrollView>
    </Screen>
  );
}

function SearchResultRow({ item, last }: { item: KnowledgeItemSummary; last: boolean }) {
  const { theme } = useAppTheme();
  const { locale } = useKnowledgeLocale();
  const router = useRouter();
  const topic = KNOWLEDGE_TOPICS.find((entry) => entry.slug === item.topicSlugs[0]);
  const href = item.type === 'quiz' ? `/knowledge/quiz/${item.id}` : item.type === 'tour' ? `/knowledge/tour/${item.id}` : item.type === 'simulation' ? `/knowledge/simulation/${item.id}` : item.type === 'webinar' ? `/knowledge/webinar/${item.id}` : `/knowledge/content/${item.slug}`;
  const labels: Partial<Record<KnowledgeContentType, [string, string]>> = { article: ['Article', 'Статия'], guide: ['Guide', 'Ръководство'], infographic: ['Infographic', 'Инфографика'], video: ['Video', 'Видео'], quiz: ['Quiz', 'Тест'], resource: ['Resource', 'Ресурс'], diy: ['DIY', 'Направи си сам'], tour: ['Tour', 'Обиколка'], simulation: ['Lab', 'Лаборатория'], webinar: ['Live', 'На живо'] };
  const icons: Partial<Record<KnowledgeContentType, keyof typeof Ionicons.glyphMap>> = { article: 'document-text-outline', guide: 'list-outline', infographic: 'stats-chart-outline', video: 'play-circle-outline', quiz: 'help-circle-outline', resource: 'bookmark-outline', diy: 'hammer-outline', tour: 'navigate-circle-outline', simulation: 'options-outline', webinar: 'videocam-outline' };
  const typeLabel = labels[item.type]?.[locale === 'bg' ? 1 : 0] || item.type.replace('_', ' ');
  return <Pressable accessibilityRole="link" accessibilityLabel={`${item.title}, ${typeLabel}`} onPress={() => router.push(href as any)} style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}><View style={{ minHeight: 104, paddingHorizontal: 18, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 14, borderBottomWidth: last ? 0 : 1, borderBottomColor: theme.colors.border }}><View style={{ width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: topic?.visual.palette.surface || theme.colors.primarySoft }}><Ionicons name={icons[item.type] || 'leaf-outline'} size={22} color={topic?.visual.palette.primary || theme.colors.primary} /></View><View style={{ flex: 1 }}><View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7 }}><Text style={[theme.typography.label, { color: topic?.visual.palette.primary || theme.colors.primary, textTransform: 'uppercase' }]}>{typeLabel}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{item.estimatedMinutes} min</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>• {topic ? localizedTopic(topic, locale).name : ''}</Text></View><Text numberOfLines={2} style={[theme.typography.h3, { color: theme.colors.text, marginTop: 4 }]}>{item.title}</Text><Text numberOfLines={2} style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3 }]}>{item.summary}</Text></View><Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} /></View></Pressable>;
}

function FilterChip({ label, active, onPress, icon }: { label: string; active: boolean; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  const { theme } = useAppTheme();
  return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={{ minHeight: 40, paddingHorizontal: 15, borderRadius: theme.radii.pill, borderWidth: 1, borderColor: active ? theme.colors.primary : theme.colors.border, backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' }}>{icon ? <Ionicons name={icon} size={16} color={active ? theme.colors.primary : theme.colors.textMuted} /> : null}<Text style={[theme.typography.label, { color: active ? theme.colors.primary : theme.colors.textMuted }]}>{label}</Text></Pressable>;
}
