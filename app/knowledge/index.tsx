import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { AppButton, Card, Content, Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { KnowledgeError, KnowledgeLoading } from '@/features/knowledge/components/KnowledgeState';
import {
  KNOWLEDGE_TOPICS,
  knowledgeService,
  localizedTopic,
  resolveKnowledgeVisual,
  useKnowledgeLocale,
  type KnowledgeHomeData,
  type KnowledgeItemSummary,
  type KnowledgeLearningPath,
  type KnowledgeTopic,
} from '@/features/knowledge';
import analyticsService from '@/services/analyticsService';
import { fetchUserProfile } from '@/services/profile';
import { useAppTheme } from '@/theme';

type HubView = 'overview' | 'library' | 'topics' | 'practice' | 'paths' | 'live';

const HUB_VIEWS: { id: HubView; icon: keyof typeof Ionicons.glyphMap; en: string; bg: string }[] = [
  { id: 'overview', icon: 'home-outline', en: 'Overview', bg: 'Начало' },
  { id: 'library', icon: 'library-outline', en: 'Library', bg: 'Библиотека' },
  { id: 'topics', icon: 'grid-outline', en: 'Topics', bg: 'Теми' },
  { id: 'practice', icon: 'flask-outline', en: 'Practice', bg: 'Практика' },
  { id: 'paths', icon: 'trail-sign-outline', en: 'Paths', bg: 'Пътеки' },
  { id: 'live', icon: 'videocam-outline', en: 'Live', bg: 'На живо' },
];

const TYPE_ICONS: Partial<Record<KnowledgeItemSummary['type'], keyof typeof Ionicons.glyphMap>> = {
  article: 'document-text-outline',
  guide: 'list-outline',
  video: 'play-circle-outline',
  quiz: 'help-circle-outline',
  resource: 'bookmark-outline',
  diy: 'hammer-outline',
  tour: 'navigate-circle-outline',
  simulation: 'options-outline',
  webinar: 'videocam-outline',
};

export default function KnowledgeHubScreen() {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { user } = useAuth();
  const { locale, setLocale } = useKnowledgeLocale();
  const [data, setData] = useState<KnowledgeHomeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<HubView>('overview');
  const compact = width < theme.breakpoints.tablet;
  const columns = compact ? 1 : width < theme.breakpoints.desktop ? 2 : 3;

  const load = useCallback(async () => {
    setError(null);
    try {
      const profile = user ? await fetchUserProfile(user.id) : null;
      const result = await knowledgeService.getKnowledgeHome({ locale, userId: user?.id, interests: profile?.interests || [] });
      setData(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'The Hub could not load.');
    }
  }, [user, locale]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));
  useEffect(() => analyticsService.trackScreenView('Knowledge Hub'), []);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Content wide style={{ maxWidth: 1180 }}>
          <HubHeader compact={compact} locale={locale} onLocale={() => void setLocale(locale === 'en' ? 'bg' : 'en')} onSearch={() => router.push('/knowledge/search' as any)} />
          <HubNavigation compact={compact} value={activeView} onChange={setActiveView} />

          {!data && !error ? <KnowledgeLoading /> : null}
          {error ? <KnowledgeError retry={() => void load()} /> : null}
          {data && activeView === 'overview' ? <Overview data={data} compact={compact} columns={columns} onViewChange={setActiveView} /> : null}
          {data && activeView === 'library' ? <Library data={data} columns={columns} /> : null}
          {data && activeView === 'topics' ? <Topics topics={data.topics} columns={columns} /> : null}
          {data && activeView === 'practice' ? <Practice items={data.interactive} columns={columns} /> : null}
          {data && activeView === 'paths' ? <Paths paths={data.paths} columns={columns} /> : null}
          {data && activeView === 'live' ? <Live items={data.live} /> : null}
        </Content>
      </ScrollView>
    </Screen>
  );
}

function HubHeader({ compact, locale, onLocale, onSearch }: { compact: boolean; locale: 'en' | 'bg'; onLocale: () => void; onSearch: () => void }) {
  const { theme } = useAppTheme();
  const { t } = useKnowledgeLocale();
  return (
    <View style={{ flexDirection: compact ? 'column' : 'row', justifyContent: 'space-between', alignItems: compact ? 'stretch' : 'flex-end', gap: 16, marginBottom: 20 }}>
      <View style={{ flex: 1 }}>
        <Text style={[theme.typography.label, { color: theme.colors.primary, letterSpacing: 1.1 }]}>{t('LEARN • PRACTICE • ACT', 'УЧИ • ПРАКТИКУВАЙ • ДЕЙСТВАЙ')}</Text>
        <Text accessibilityRole="header" style={[theme.typography.h1, { color: theme.colors.text, marginTop: 4 }]}>Knowledge Hub</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted, marginTop: 6, maxWidth: 650 }]}>{t('A clear, reviewed learning library for practical sustainability.', 'Подредена и проверена библиотека за практична устойчивост.')}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <AppButton label={locale.toUpperCase()} icon="language-outline" variant="secondary" onPress={onLocale} style={{ flex: compact ? 1 : undefined }} />
        <AppButton label={t('Search', 'Търсене')} accessibilityLabel={t('Search Knowledge Hub', 'Търсене в Knowledge Hub')} icon="search" onPress={onSearch} style={{ flex: compact ? 1 : undefined }} />
      </View>
    </View>
  );
}

function HubNavigation({ compact, value, onChange }: { compact: boolean; value: HubView; onChange: (value: HubView) => void }) {
  const { theme } = useAppTheme();
  const { locale } = useKnowledgeLocale();
  const tabs = HUB_VIEWS.map((view) => {
        const active = value === view.id;
        return <Pressable key={view.id} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => onChange(view.id)} style={{ minHeight: 44, width: compact ? '31.7%' : undefined, minWidth: compact ? undefined : 108, paddingHorizontal: compact ? 8 : 15, borderRadius: theme.radii.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: compact ? 5 : 7, backgroundColor: active ? theme.colors.surface : 'transparent', borderWidth: active ? 1 : 0, borderColor: theme.colors.border }}><Ionicons name={view.icon} size={17} color={active ? theme.colors.primary : theme.colors.textMuted} /><Text numberOfLines={1} style={[theme.typography.label, { color: active ? theme.colors.primary : theme.colors.textMuted, fontSize: compact ? 12 : undefined }]}>{locale === 'bg' ? view.bg : view.en}</Text></Pressable>;
      });
  if (compact) return <View accessibilityRole="tablist" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 5, backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radii.lg, marginBottom: 26 }}>{tabs}</View>;
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, padding: 5, paddingRight: 10 }} style={{ backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radii.lg, marginBottom: 26 }}>{tabs}</ScrollView>;
}

function Overview({ data, compact, columns, onViewChange }: { data: KnowledgeHomeData; compact: boolean; columns: number; onViewChange: (view: HubView) => void }) {
  const router = useRouter();
  const { t } = useKnowledgeLocale();
  const recommendations = data.continueLearning.length ? data.continueLearning : data.recommendations.length ? data.recommendations : data.editorPicks;
  return (
    <>
      <DailyHero item={data.dailyDose} compact={compact} onPress={() => router.push('/knowledge/daily' as any)} />
      <SectionHeader title={t('Find your way', 'Изберете посока')} description={t('Start with the kind of learning you need today.', 'Започнете с подходящия за днес начин на учене.')} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 34 }}>
        <BrowseTile columns={columns} icon="library-outline" title={t('Browse library', 'Библиотека')} text={t('Articles, videos and guides', 'Статии, видеа и ръководства')} onPress={() => onViewChange('library')} />
        <BrowseTile columns={columns} icon="grid-outline" title={t('Explore topics', 'Разгледайте темите')} text={t('Ten sustainability areas', 'Десет области на устойчивост')} onPress={() => onViewChange('topics')} />
        <BrowseTile columns={columns} icon="flask-outline" title={t('Learn by doing', 'Учете с практика')} text={t('Quizzes, tours and labs', 'Тестове, турове и лаборатории')} onPress={() => onViewChange('practice')} />
        <BrowseTile columns={columns} icon="trail-sign-outline" title={t('Follow a path', 'Следвайте пътека')} text={t('Structured modules and certificates', 'Модули и сертификати')} onPress={() => onViewChange('paths')} />
        <BrowseTile columns={columns} icon="videocam-outline" title={t('Join live', 'Включете се на живо')} text={t('Sessions, reminders and replays', 'Сесии, напомняния и записи')} onPress={() => onViewChange('live')} />
        <BrowseTile columns={columns} icon="download-outline" title={t('Use offline', 'Използвайте офлайн')} text={t('Downloads and printable toolkits', 'Изтегляния и пакети за печат')} onPress={() => router.push('/knowledge/downloads' as any)} />
      </View>

      <SectionHeader title={data.continueLearning.length ? t('Continue learning', 'Продължете обучението') : t('Recommended starting points', 'Препоръчани начални точки')} description={t('A short, focused selection—not the whole catalog.', 'Кратък и фокусиран избор, а не целият каталог.')} action={t('Open library', 'Отвори библиотеката')} onAction={() => onViewChange('library')} />
      <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 34 }}>{recommendations.slice(0, 4).map((item, index) => <ContentRow key={item.id} item={item} progress={'progress' in item && typeof item.progress === 'number' ? item.progress : undefined} last={index === Math.min(recommendations.length, 4) - 1} />)}</Card>

      <SectionHeader title={t('Turn learning into action', 'Превърнете ученето в действие')} description={t('Continue in the Green Compass tools you already use.', 'Продължете в инструментите на Green Compass, които вече използвате.')} />
      <View style={{ flexDirection: compact ? 'column' : 'row', gap: 10, marginBottom: 12 }}>
        <ActionRow icon="leaf-outline" title={t('Build a habit', 'Изгради навик')} text={t('Repeat one measurable choice.', 'Повтаряйте един измерим избор.')} onPress={() => router.push('/habits/log')} />
        <ActionRow icon="map-outline" title={t('Explore the map', 'Разгледай картата')} text={t('Find local places and initiatives.', 'Открийте местни места и инициативи.')} onPress={() => router.push('/map')} />
        <ActionRow icon="people-outline" title={t('Share with community', 'Сподели с общността')} text={t('Turn a lesson into a conversation.', 'Превърнете урока в разговор.')} onPress={() => router.push('/community/post/new-post')} />
      </View>
    </>
  );
}

function Library({ data, columns }: { data: KnowledgeHomeData; columns: number }) {
  const router = useRouter();
  const { t } = useKnowledgeLocale();
  const items = useMemo(() => [...data.editorPicks, ...data.newest].filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index), [data]);
  return (
    <>
      <SectionHeader title={t('Knowledge library', 'Библиотека със знания')} description={t('Reviewed articles, practical guides, videos and trusted external resources.', 'Проверени статии, практически ръководства, видеа и надеждни външни ресурси.')} action={t('Search and filter', 'Търсене и филтри')} onAction={() => router.push('/knowledge/search' as any)} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 26 }}>
        <FormatShortcut columns={columns} icon="document-text-outline" label={t('Articles', 'Статии')} onPress={() => router.push({ pathname: '/knowledge/search' as any, params: { type: 'article' } })} />
        <FormatShortcut columns={columns} icon="play-circle-outline" label={t('Videos', 'Видеа')} onPress={() => router.push({ pathname: '/knowledge/search' as any, params: { type: 'video' } })} />
        <FormatShortcut columns={columns} icon="hammer-outline" label={t('DIY projects', 'Направи си сам')} onPress={() => router.push({ pathname: '/knowledge/search' as any, params: { type: 'diy' } })} />
        <FormatShortcut columns={columns} icon="bookmark-outline" label={t('Resources', 'Ресурси')} onPress={() => router.push({ pathname: '/knowledge/search' as any, params: { type: 'resource' } })} />
      </View>
      <SectionHeader title={t('Editor-reviewed collection', 'Редакторски проверена колекция')} description={t('Text-first rows make the catalog faster to scan.', 'Редовете с водещ текст правят каталога по-лесен за преглед.')} />
      <Card style={{ padding: 0, overflow: 'hidden' }}>{items.slice(0, 12).map((item, index) => <ContentRow key={item.id} item={item} last={index === Math.min(items.length, 12) - 1} />)}</Card>
    </>
  );
}

function Topics({ topics, columns }: { topics: KnowledgeTopic[]; columns: number }) {
  const { t } = useKnowledgeLocale();
  return (
    <>
      <SectionHeader title={t('Explore by topic', 'Разгледайте по тема')} description={t('Choose a subject first; illustrations support the lesson after you open it.', 'Първо изберете тема; илюстрациите подпомагат урока след отварянето му.')} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{topics.map((topic) => <TopicRow key={topic.id} topic={topic} columns={columns} />)}</View>
    </>
  );
}

function Practice({ items, columns }: { items: KnowledgeItemSummary[]; columns: number }) {
  const { theme } = useAppTheme();
  const { t } = useKnowledgeLocale();
  const groups = [
    { type: 'quiz', icon: 'help-circle-outline' as const, title: t('Quizzes', 'Тестове') },
    { type: 'tour', icon: 'navigate-circle-outline' as const, title: t('Virtual tours', 'Виртуални обиколки') },
    { type: 'simulation', icon: 'options-outline' as const, title: t('Impact labs', 'Лаборатории за въздействие') },
  ];
  return (
    <>
      <SectionHeader title={t('Practice and experiment', 'Практикувайте и експериментирайте')} description={t('Choose one learning mode, finish it, then return for the next step.', 'Изберете един формат, завършете го и после продължете към следващия.')} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{groups.map((group) => {
        const groupItems = items.filter((item) => item.type === group.type).slice(0, 3);
        return <Card key={group.type} style={{ width: columnWidth(columns), minHeight: 250, padding: 0, overflow: 'hidden' }}><View style={{ padding: 18, flexDirection: 'row', alignItems: 'center', gap: 10 }}><ModeIcon icon={group.icon} /><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{group.title}</Text></View>{groupItems.map((item, index) => <ContentRow key={item.id} item={item} condensed last={index === groupItems.length - 1} />)}</Card>;
      })}</View>
    </>
  );
}

function Paths({ paths, columns }: { paths: KnowledgeLearningPath[]; columns: number }) {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { t } = useKnowledgeLocale();
  return (
    <>
      <SectionHeader title={t('Learning paths', 'Учебни пътеки')} description={t('Structured sequences with a clear beginning, progress and completion point.', 'Структурирани поредици с ясно начало, прогрес и завършване.')} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{paths.map((path) => <Pressable key={path.id} accessibilityRole="link" onPress={() => router.push(`/knowledge/path/${path.slug}` as any)} style={{ width: columnWidth(columns) }}><Card style={{ minHeight: 230, height: '100%', borderTopWidth: 4, borderTopColor: theme.colors.primary }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={[theme.typography.label, { color: theme.colors.primary }]}>{path.moduleItemIds.length} {t('MODULES', 'МОДУЛА')}</Text><Ionicons name="ribbon-outline" size={22} color={theme.colors.primary} /></View><Text style={[theme.typography.h2, { color: theme.colors.text, marginTop: 22 }]}>{path.title}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 8, flex: 1 }]}>{path.summary}</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 20 }}><Text style={[theme.typography.label, { color: theme.colors.primary }]}>{t('View path', 'Отвори пътеката')}</Text><Ionicons name="arrow-forward" size={17} color={theme.colors.primary} /></View></Card></Pressable>)}</View>
    </>
  );
}

function Live({ items }: { items: KnowledgeItemSummary[] }) {
  const { t } = useKnowledgeLocale();
  return (
    <>
      <SectionHeader title={t('Live studio', 'Студио на живо')} description={t('Upcoming sessions, registration, reminders and accessible replays in one place.', 'Предстоящи сесии, регистрация, напомняния и достъпни записи на едно място.')} />
      <Card style={{ padding: 0, overflow: 'hidden' }}>{items.map((item, index) => <ContentRow key={item.id} item={item} last={index === items.length - 1} />)}</Card>
    </>
  );
}

function DailyHero({ item, compact, onPress }: { item: KnowledgeHomeData['dailyDose']; compact: boolean; onPress: () => void }) {
  const { theme } = useAppTheme();
  const { t } = useKnowledgeLocale();
  const { source, visual, topic } = resolveKnowledgeVisual(item, KNOWLEDGE_TOPICS);
  return (
    <Card elevated style={{ backgroundColor: theme.mode === 'dark' ? visual.palette.darkSurface : visual.palette.surface, padding: 0, marginBottom: 34, overflow: 'hidden' }}>
      <View style={{ flexDirection: compact ? 'column' : 'row', minHeight: compact ? undefined : 390 }}>
        <View style={{ flex: 1.35, padding: compact ? 24 : 38, justifyContent: 'center' }}>
          <Text style={[theme.typography.label, { color: visual.palette.primary, letterSpacing: 1 }]}>{t('TODAY’S FOCUS', 'ФОКУСЪТ ДНЕС')}</Text>
          <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 8 }]}>{topic.name} • {item.estimatedMinutes} min</Text>
          <Text style={[theme.typography.display, { color: theme.colors.text, marginTop: 16, fontSize: compact ? 32 : 43, lineHeight: compact ? 38 : 49 }]}>{item.title}</Text>
          <Text style={[theme.typography.body, { color: theme.colors.textMuted, marginTop: 12, maxWidth: 530 }]}>{item.summary}</Text>
          <AppButton label={t('Open today’s lesson', 'Отвори днешния урок')} icon="arrow-forward" onPress={onPress} style={{ marginTop: 22, alignSelf: 'flex-start' }} />
        </View>
        <View style={{ width: compact ? '100%' : 350, height: compact ? 300 : 390, backgroundColor: `${visual.palette.secondary}24`, alignItems: 'center', justifyContent: 'center' }}><Image source={source} accessibilityLabel={visual.alt[item.locale]} resizeMode="contain" style={{ width: '100%', height: '100%' }} /></View>
      </View>
    </Card>
  );
}

function SectionHeader({ title, description, action, onAction }: { title: string; description?: string; action?: string; onAction?: () => void }) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const compact = width < theme.breakpoints.tablet;
  return <View style={{ flexDirection: compact ? 'column' : 'row', justifyContent: 'space-between', alignItems: compact ? 'flex-start' : 'flex-end', gap: compact ? 6 : 14, marginBottom: 14 }}><View style={{ flex: compact ? undefined : 1 }}><Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text }]}>{title}</Text>{description ? <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 5, maxWidth: 700 }]}>{description}</Text> : null}</View>{action && onAction ? <Pressable accessibilityRole="button" onPress={onAction} style={{ minHeight: 40, paddingHorizontal: compact ? 0 : 12, alignItems: 'center', justifyContent: 'center' }}><Text style={[theme.typography.label, { color: theme.colors.primary }]}>{action}</Text></Pressable> : null}</View>;
}

function BrowseTile({ columns, icon, title, text, onPress }: { columns: number; icon: keyof typeof Ionicons.glyphMap; title: string; text: string; onPress: () => void }) {
  const { theme } = useAppTheme();
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ width: columnWidth(columns), opacity: pressed ? 0.78 : 1 })}><Card style={{ minHeight: 126, height: '100%', flexDirection: 'row', alignItems: 'center', gap: 14 }}><ModeIcon icon={icon} /><View style={{ flex: 1 }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{title}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 4 }]}>{text}</Text></View><Ionicons name="chevron-forward" size={19} color={theme.colors.textMuted} /></Card></Pressable>;
}

function FormatShortcut({ columns, icon, label, onPress }: { columns: number; icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  const { theme } = useAppTheme();
  return <Pressable accessibilityRole="link" onPress={onPress} style={({ pressed }) => ({ width: columns === 1 ? '48.5%' : columnWidth(columns), opacity: pressed ? 0.78 : 1 })}><Card style={{ minHeight: 94, alignItems: 'center', justifyContent: 'center', gap: 8 }}><Ionicons name={icon} size={24} color={theme.colors.primary} /><Text style={[theme.typography.label, { color: theme.colors.text, textAlign: 'center' }]}>{label}</Text></Card></Pressable>;
}

function ContentRow({ item, progress, condensed = false, last = false }: { item: KnowledgeItemSummary; progress?: number; condensed?: boolean; last?: boolean }) {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { locale } = useKnowledgeLocale();
  const topic = KNOWLEDGE_TOPICS.find((entry) => entry.slug === item.topicSlugs[0]);
  const href = item.type === 'quiz' ? `/knowledge/quiz/${item.id}` : item.type === 'tour' ? `/knowledge/tour/${item.id}` : item.type === 'simulation' ? `/knowledge/simulation/${item.id}` : item.type === 'webinar' ? `/knowledge/webinar/${item.id}` : `/knowledge/content/${item.slug}`;
  const typeLabel = formatType(item.type, locale);
  return <Pressable accessibilityRole="link" accessibilityLabel={`${item.title}, ${typeLabel}`} onPress={() => router.push(href as any)} style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}><View style={{ minHeight: condensed ? 76 : 92, paddingHorizontal: condensed ? 14 : 18, paddingVertical: condensed ? 12 : 15, flexDirection: 'row', alignItems: 'center', gap: condensed ? 10 : 14, borderBottomWidth: last ? 0 : 1, borderBottomColor: theme.colors.border }}><View style={{ width: condensed ? 38 : 44, height: condensed ? 38 : 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: topic?.visual.palette.surface || theme.colors.primarySoft }}><Ionicons name={TYPE_ICONS[item.type] || 'leaf-outline'} size={condensed ? 19 : 21} color={topic?.visual.palette.primary || theme.colors.primary} /></View><View style={{ flex: 1 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}><Text style={[theme.typography.label, { color: topic?.visual.palette.primary || theme.colors.primary, textTransform: 'uppercase' }]}>{typeLabel}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{item.estimatedMinutes} min</Text></View><Text numberOfLines={condensed ? 2 : 1} style={[condensed ? theme.typography.body : theme.typography.h3, { color: theme.colors.text, marginTop: 3 }]}>{item.title}</Text>{!condensed ? <Text numberOfLines={1} style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3 }]}>{item.summary}</Text> : null}{typeof progress === 'number' ? <View style={{ height: 4, borderRadius: 2, backgroundColor: theme.colors.surfaceStrong, marginTop: 8, overflow: 'hidden' }}><View style={{ width: `${Math.max(0, Math.min(100, progress))}%`, height: '100%', backgroundColor: theme.colors.primary }} /></View> : null}</View><View style={{ alignItems: 'flex-end', gap: 4 }}><Ionicons name="chevron-forward" size={19} color={theme.colors.textMuted} />{typeof progress === 'number' ? <Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{progress}%</Text> : null}</View></View></Pressable>;
}

function TopicRow({ topic, columns }: { topic: KnowledgeTopic; columns: number }) {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { locale } = useKnowledgeLocale();
  const copy = localizedTopic(topic, locale);
  return <Pressable accessibilityRole="link" accessibilityLabel={`${locale === 'bg' ? 'Разгледай' : 'Explore'} ${copy.name}`} onPress={() => router.push(`/knowledge/topic/${topic.slug}` as any)} style={({ pressed }) => ({ width: columnWidth(columns), opacity: pressed ? 0.78 : 1 })}><Card style={{ minHeight: 142, height: '100%', borderLeftWidth: 4, borderLeftColor: topic.visual.palette.primary }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}><ModeIcon icon={topic.icon as keyof typeof Ionicons.glyphMap} color={topic.visual.palette.primary} background={topic.visual.palette.surface} /><Text style={[theme.typography.h3, { color: theme.colors.text, flex: 1 }]}>{copy.name}</Text><Ionicons name="chevron-forward" size={19} color={theme.colors.textMuted} /></View><Text numberOfLines={2} style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 12 }]}>{copy.description}</Text></Card></Pressable>;
}

function ActionRow({ icon, title, text, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string; onPress: () => void }) {
  const { theme } = useAppTheme();
  return <Pressable accessibilityRole="link" onPress={onPress} style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.78 : 1 })}><Card style={{ minHeight: 116, height: '100%', flexDirection: 'row', alignItems: 'center', gap: 13 }}><ModeIcon icon={icon} /><View style={{ flex: 1 }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{title}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 4 }]}>{text}</Text></View></Card></Pressable>;
}

function ModeIcon({ icon, color, background }: { icon: keyof typeof Ionicons.glyphMap; color?: string; background?: string }) {
  const { theme } = useAppTheme();
  return <View style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: background || theme.colors.primarySoft }}><Ionicons name={icon} size={22} color={color || theme.colors.primary} /></View>;
}

function formatType(type: KnowledgeItemSummary['type'], locale: 'en' | 'bg') {
  const labels: Record<KnowledgeItemSummary['type'], [string, string]> = {
    article: ['Article', 'Статия'], guide: ['Guide', 'Ръководство'], video: ['Video', 'Видео'], quiz: ['Quiz', 'Тест'], resource: ['Resource', 'Ресурс'], diy: ['DIY', 'Направи си сам'], tour: ['Tour', 'Обиколка'], simulation: ['Lab', 'Лаборатория'], webinar: ['Live', 'На живо'], daily_fact: ['Fact', 'Факт'], daily_quote: ['Quote', 'Цитат'], daily_tip: ['Tip', 'Съвет'],
  };
  return labels[type][locale === 'bg' ? 1 : 0];
}

function columnWidth(columns: number): '100%' | '49%' | '32%' {
  return columns === 1 ? '100%' : columns === 2 ? '49%' : '32%';
}
