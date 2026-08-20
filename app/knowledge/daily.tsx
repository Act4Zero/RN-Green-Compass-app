import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { AppButton, Card, Content, PageHeader, Screen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { KNOWLEDGE_TOPICS, knowledgeService, localizedTopic, resolveKnowledgeVisual, useKnowledgeLocale, type DailyPreference } from '@/features/knowledge';
import { useAppTheme } from '@/theme';

export default function DailyDoseScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const { locale, t } = useKnowledgeLocale();
  const router = useRouter();
  const [preference, setPreference] = useState<DailyPreference>({ locale, topicSlugs: [], widgetSize: 'small' });
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    void Promise.all([knowledgeService.getDailyPreference(user?.id), knowledgeService.getBookmarks(user?.id)]).then(([next, bookmarks]) => {
      setPreference({ ...next, locale });
      setSaved(bookmarks.map((entry) => entry.itemId));
    });
  }, [locale, user?.id]);

  const history = useMemo(() => knowledgeService.getDailyHistory(locale, 14, preference.topicSlugs), [locale, preference.topicSlugs]);
  const today = history[0].item;
  const { source, visual } = resolveKnowledgeVisual(today, KNOWLEDGE_TOPICS);

  const persist = async (next: DailyPreference) => {
    setPreference(next);
    await knowledgeService.setDailyPreference(user?.id, next);
  };
  const toggleTopic = (slug: string) => {
    const topicSlugs = preference.topicSlugs.includes(slug) ? preference.topicSlugs.filter((entry) => entry !== slug) : [...preference.topicSlugs, slug];
    void persist({ ...preference, topicSlugs });
  };
  const toggleBookmark = async () => {
    const isSaved = await knowledgeService.toggleKnowledgeBookmark(user?.id, today.id);
    setSaved((current) => isSaved ? [...new Set([...current, today.id])] : current.filter((id) => id !== today.id));
  };

  return <Screen><ScrollView showsVerticalScrollIndicator={false}><Content wide>
    <PageHeader eyebrow={t('A small idea, every day', 'По една малка идея всеки ден')} title={t('Daily Dose of Sustainability', 'Дневна доза устойчивост')} description={t('A deterministic daily rotation that stays available offline and respects your topic preferences.', 'Предвидима дневна ротация, налична офлайн и съобразена с предпочитаните теми.')} />
    <Card elevated style={{ padding: 0, overflow: 'hidden', backgroundColor: theme.mode === 'dark' ? visual.palette.darkSurface : visual.palette.surface }}>
      <Image source={source} accessibilityLabel={visual.alt[locale]} resizeMode="cover" style={{ width: '100%', aspectRatio: 2.1 }} />
      <View style={{ padding: 24 }}><Text style={[theme.typography.label, { color: visual.palette.primary }]}>{today.type.replace('daily_', '').toUpperCase()} • {history[0].date}</Text><Text accessibilityRole="header" style={[theme.typography.h1, { color: theme.colors.text, marginTop: 8 }]}>{today.title}</Text><Text style={[theme.typography.body, { color: theme.colors.textMuted, marginTop: 10 }]}>{today.summary}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 }}><AppButton label={t('Read context', 'Прочети контекста')} icon="book-outline" onPress={() => router.push(`/knowledge/content/${today.slug}` as any)} /><AppButton label={saved.includes(today.id) ? t('Saved', 'Запазено') : t('Bookmark', 'Запази')} icon={saved.includes(today.id) ? 'bookmark' : 'bookmark-outline'} variant="secondary" onPress={() => void toggleBookmark()} /><AppButton label={t('Share', 'Сподели')} icon="share-outline" variant="ghost" onPress={() => void Share.share({ title: today.title, message: `${today.title}\n\n${today.summary}\n\ngreencompass://knowledge/daily` })} /></View></View>
    </Card>

    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18, marginTop: 26 }}>
      <Card style={{ flex: 1, minWidth: 300 }}><Text style={[theme.typography.h2, { color: theme.colors.text }]}>{t('Personalise the rotation', 'Персонализирайте ротацията')}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 6 }]}>{t('No selection means a balanced mix of all ten topics.', 'Без избор получавате балансиран микс от всички десет теми.')}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>{KNOWLEDGE_TOPICS.map((topic) => { const selected = preference.topicSlugs.includes(topic.slug); const label = localizedTopic(topic, locale).name; return <Pressable key={topic.slug} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => toggleTopic(topic.slug)} style={{ borderWidth: 1, borderColor: selected ? topic.visual.palette.primary : theme.colors.border, backgroundColor: selected ? `${topic.visual.palette.primary}22` : theme.colors.surface, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }}><Text style={[theme.typography.label, { color: selected ? topic.visual.palette.primary : theme.colors.text }]}>{label}</Text></Pressable>; })}</View></Card>
      <Card style={{ flex: 1, minWidth: 280 }}><Text style={[theme.typography.h2, { color: theme.colors.text }]}>{t('Home-screen widget', 'Widget за началния екран')}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 6 }]}>{t('Choose the preferred native widget size. The shared daily schedule keeps app and widget in sync.', 'Изберете предпочитан размер. Общият дневен график синхронизира приложението и widget-а.')}</Text><View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}><AppButton label={t('Small', 'Малък')} variant={preference.widgetSize === 'small' ? 'primary' : 'secondary'} onPress={() => void persist({ ...preference, widgetSize: 'small' })} /><AppButton label={t('Medium', 'Среден')} variant={preference.widgetSize === 'medium' ? 'primary' : 'secondary'} onPress={() => void persist({ ...preference, widgetSize: 'medium' })} /></View><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 14 }]}>{t('Add it from your device widget gallery after installing the native app.', 'Добавете го от галерията с widgets след инсталиране на native приложението.')}</Text></Card>
    </View>

    <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text, marginTop: 32, marginBottom: 12 }]}>{t('Recent doses', 'Последни дневни дози')}</Text>
    <View style={{ gap: 8 }}>{history.slice(1).map(({ date, item }) => <Pressable key={`${date}-${item.id}`} accessibilityRole="link" onPress={() => router.push(`/knowledge/content/${item.slug}` as any)}><Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}><View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={item.type === 'daily_quote' ? 'chatbubble-ellipses-outline' : item.type === 'daily_tip' ? 'sparkles-outline' : 'leaf-outline'} size={20} color={theme.colors.primary} /></View><View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: theme.colors.textMuted }]}>{date} • {item.type.replace('daily_', '').toUpperCase()}</Text><Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 2 }]}>{item.title}</Text></View><Ionicons name="chevron-forward" size={18} color={theme.colors.primary} /></Card></Pressable>)}</View>
  </Content></ScrollView></Screen>;
}
