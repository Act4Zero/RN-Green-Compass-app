import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { AppButton, Card, Content, Screen, StatePanel } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { KnowledgeBlockRenderer } from '@/features/knowledge/components/KnowledgeBlockRenderer';
import { KnowledgeCard } from '@/features/knowledge/components/KnowledgeCard';
import { SpeakControls } from '@/features/knowledge/components/SpeakControls';
import { KNOWLEDGE_TOPICS, knowledgeService, localizedTopic, resolveKnowledgeVisual, useKnowledgeLocale, type KnowledgeBlock, type KnowledgeItemDetail, type KnowledgeItemSummary } from '@/features/knowledge';
import analyticsService from '@/services/analyticsService';
import { shareContent } from '@/utils/sharing/shareUtils';
import { useAppTheme } from '@/theme';

export default function KnowledgeContentScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const { locale, t } = useKnowledgeLocale();
  const [item, setItem] = useState<KnowledgeItemDetail | null>(null);
  const [related, setRelated] = useState<KnowledgeItemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [easyRead, setEasyRead] = useState(false);
  const desktop = width >= theme.breakpoints.desktop;

  const load = useCallback(async () => {
    setLoading(true);
    const result = await knowledgeService.getPublishedKnowledgeItem(slug, locale, user?.id);
    setItem(result);
    if (result) {
      const [search, bookmarks, downloads, progressEntries] = await Promise.all([
        knowledgeService.searchKnowledge('', { topic: result.topicSlugs[0] }, locale, 0, 5),
        knowledgeService.getBookmarks(user?.id),
        knowledgeService.getDownloads(user?.id),
        knowledgeService.getProgress(user?.id),
      ]);
      setRelated(search.items.filter((entry) => entry.id !== result.id).slice(0, 3));
      setBookmarked(bookmarks.some((entry) => entry.itemId === result.id));
      setDownloaded(downloads.some((entry) => entry.itemId === result.id && entry.checksum === result.checksum));
      setProgress(progressEntries.find((entry) => entry.itemId === result.id)?.percent || 0);
      analyticsService.trackScreenView(`Knowledge: ${result.title}`);
      analyticsService.trackEvent('knowledge_content_started', { content_id: result.id, content_type: result.type, topic: result.topicSlugs[0] });
      if (user) await knowledgeService.setKnowledgeProgress(user.id, result.id, result.versionId, Math.max(10, progressEntries.find((entry) => entry.itemId === result.id)?.percent || 0));
    }
    setLoading(false);
  }, [slug, user, locale]);

  useEffect(() => { void load(); }, [load]);
  const meta = useMemo(() => item ? `${labelForType(item.type, locale)} • ${item.estimatedMinutes} ${t('min', 'мин')} • ${labelForDifficulty(item.difficulty, locale)}` : '', [item, locale, t]);

  const requireUser = (action: () => void) => {
    if (!user) {
      addNotification({ type: 'banner', severity: 'info', title: t('Save your learning', 'Запази наученото'), message: t('Sign in to bookmark, download, and keep your progress.', 'Влезте, за да добавяте отметки, да изтегляте и да пазите напредъка си.'), action: { label: t('Sign in', 'Вход'), onPress: () => router.push('/auth/signin') } });
      return;
    }
    action();
  };

  if (loading) return <Screen><Content><StatePanel icon="book-outline" title={t('Opening this lesson', 'Отваряме урока')} message={t('Loading the latest reviewed version…', 'Зареждаме последната проверена версия…')} /></Content></Screen>;
  if (!item) return <Screen><Content><StatePanel icon="alert-circle-outline" title={t('Content unavailable', 'Съдържанието не е достъпно')} message={t('This item may have been archived or the link may be incorrect.', 'Материалът може да е архивиран или връзката да е неправилна.')} action={<AppButton label={t('Browse the Hub', 'Разгледай центъра за знания')} onPress={() => router.replace('/knowledge' as any)} />} /></Content></Screen>;

  const resolved = resolveKnowledgeVisual(item, KNOWLEDGE_TOPICS);
  const speechText = [item.title, item.summary, ...item.body.map(blockText)].filter(Boolean).join('. ');

  const toggleBookmark = () => requireUser(() => void knowledgeService.toggleKnowledgeBookmark(user!.id, item.id).then((saved) => { setBookmarked(saved); addNotification({ type: 'toast', severity: 'success', message: saved ? t('Saved to your Hub bookmarks.', 'Добавено в отметките.') : t('Removed from bookmarks.', 'Премахнато от отметките.') }); analyticsService.trackEvent('knowledge_bookmark_toggled', { content_id: item.id, saved }); }));
  const toggleDownload = () => requireUser(() => void (downloaded ? knowledgeService.removeDownload(user!.id, item.id).then(() => setDownloaded(false)) : knowledgeService.downloadItem(user!.id, item).then(() => setDownloaded(true))).then(() => addNotification({ type: 'toast', severity: 'success', message: downloaded ? t('Offline copy removed.', 'Офлайн копието е премахнато.') : t('Available offline.', 'Вече е достъпно офлайн.') })).catch((error) => addNotification({ type: 'toast', severity: 'error', message: error.message })));
  const markComplete = () => requireUser(() => void knowledgeService.setKnowledgeProgress(user!.id, item.id, item.versionId, 100).then(() => { setProgress(100); addNotification({ type: 'modal', severity: 'success', title: t('Lesson complete', 'Урокът е завършен'), message: t('Your learning progress has been saved.', 'Учебният ви напредък е запазен.') }); analyticsService.trackEvent('knowledge_content_completed', { content_id: item.id, topic: item.topicSlugs[0] }); }));
  const share = () => void shareContent({ title: `${item.title} | Green Compass`, message: item.summary, url: `https://app.greencompass.app/api/knowledge-share?slug=${item.slug}`, siteName: 'Green Compass', type: 'article' });

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} onScroll={({ nativeEvent }) => { const range = nativeEvent.contentSize.height - nativeEvent.layoutMeasurement.height; if (range > 0) setProgress((current) => Math.max(current, Math.round((nativeEvent.contentOffset.y / range) * 90))); }} scrollEventThrottle={240}>
        <Content wide style={{ paddingBottom: 80 }}>
          <AppButton label={t('Back', 'Назад')} icon="arrow-back" variant="ghost" onPress={() => router.canGoBack() ? router.back() : router.replace('/knowledge' as any)} style={{ alignSelf: 'flex-start', marginBottom: 18 }} />
          <View style={{ borderRadius: theme.radii.xl, overflow: 'hidden', marginBottom: 28, backgroundColor: theme.mode === 'dark' ? resolved.visual.palette.darkSurface : resolved.visual.palette.surface }}><Image source={resolved.source} accessibilityLabel={resolved.visual.alt[locale]} resizeMode="cover" style={{ width: '100%', height: desktop ? 440 : 250 }} /></View>
          <View style={{ flexDirection: desktop ? 'row' : 'column', alignItems: 'flex-start', gap: 32 }}>
            <View style={{ flex: 1, width: '100%', maxWidth: 760, alignSelf: desktop ? undefined : 'center' }}>
              <Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase', letterSpacing: 1.1 }]}>{meta}</Text>
              <Text accessibilityRole="header" style={[theme.typography.display, { color: theme.colors.text, marginTop: 10 }]}>{item.title}</Text>
              <Text style={[theme.typography.body, { color: theme.colors.textMuted, fontSize: 18, lineHeight: 28, marginTop: 14 }]}>{item.summary}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 9, marginTop: 18 }}><SpeakControls text={speechText} /><AppButton label={easyRead ? t('Standard view', 'Стандартен изглед') : t('Easy read', 'Лесно четене')} icon="text-outline" variant={easyRead ? 'primary' : 'secondary'} onPress={() => setEasyRead((value) => !value)} /></View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 20 }}>
                {item.topicSlugs.map((topic) => { const definition = KNOWLEDGE_TOPICS.find((entry) => entry.slug === topic); return <Pressable key={topic} onPress={() => router.push(`/knowledge/topic/${topic}` as any)} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: theme.radii.pill, backgroundColor: theme.colors.primarySoft }}><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'capitalize' }]}>{definition ? localizedTopic(definition, locale).name : topic.replace(/-/g, ' ')}</Text></Pressable>; })}
              </View>
              <Card style={{ padding: 18, marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><Ionicons name="shield-checkmark-outline" size={24} color={theme.colors.success} /><View style={{ flex: 1 }}><Text style={[theme.typography.label, { color: theme.colors.text }]}>{t('Reviewed knowledge', 'Проверено съдържание')}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('Written by', 'Автор')} {item.author} • {t('Published', 'Публикувано')} {formatDate(item.publishedAt, locale)}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('Reviewed by', 'Проверено от')} {item.reviewer} {t('on', 'на')} {formatDate(item.reviewedAt, locale)} • {t('Next review', 'Следваща проверка')} {formatDate(item.nextReviewAt, locale)}</Text></View></View>
              </Card>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 28 }}>
                <AppButton label={bookmarked ? t('Saved', 'Запазено') : t('Bookmark', 'Добави отметка')} icon={bookmarked ? 'bookmark' : 'bookmark-outline'} variant="secondary" onPress={toggleBookmark} />
                {item.downloadable ? <AppButton label={downloaded ? t('Downloaded', 'Изтеглено') : t('Download', 'Изтегли')} icon={downloaded ? 'checkmark-circle' : 'download-outline'} variant="secondary" onPress={toggleDownload} /> : null}
                <AppButton label={t('Share', 'Сподели')} icon="share-outline" variant="ghost" onPress={share} />
              </View>
              <View accessibilityLabel={t(`Reading progress ${progress}%`, `Напредък в четенето ${progress}%`)} style={{ height: 5, borderRadius: 3, backgroundColor: theme.colors.surfaceStrong, marginBottom: 28, overflow: 'hidden' }}><View style={{ height: '100%', width: `${progress}%`, backgroundColor: theme.colors.primary }} /></View>
              <KnowledgeBlockRenderer blocks={item.body} sources={item.sources} sourceContentId={item.id} easyRead={easyRead} />

              <View style={{ marginTop: 38 }}>
                <Text accessibilityRole="header" style={[theme.typography.h2, { color: theme.colors.text }]}>{t('Sources and further reading', 'Източници и допълнително четене')}</Text>
                <View style={{ gap: 10, marginTop: 14 }}>{item.sources.map((source, index) => <Pressable key={source.id} accessibilityRole="link" onPress={() => void Linking.openURL(source.url)} style={{ padding: 16, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radii.md, backgroundColor: theme.colors.surface }}><Text style={[theme.typography.label, { color: theme.colors.primary }]}>{index + 1}. {source.publisher}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.text, marginTop: 3 }]}>{source.title}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 3 }]}>{t('Accessed', 'Посетено')} {formatDate(source.accessedOn, locale)} • {t('Open original source', 'Отвори оригиналния източник')} ↗</Text></Pressable>)}</View>
              </View>
              <Card elevated style={{ marginTop: 28, alignItems: 'flex-start', backgroundColor: theme.colors.accentSoft }}><Text style={[theme.typography.h3, { color: theme.colors.text }]}>{t('Finished this lesson?', 'Завършихте ли урока?')}</Text><Text style={[theme.typography.body, { color: theme.colors.textMuted, marginVertical: 8 }]}>{t('Mark it complete to keep your learning path up to date.', 'Отбележете го като завършен, за да актуализирате учебния си път.')}</Text><AppButton label={progress === 100 ? t('Completed', 'Завършено') : t('Mark complete', 'Отбележи като завършено')} icon="checkmark-circle-outline" disabled={progress === 100} onPress={markComplete} /></Card>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 22 }}><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted }]}>{t('Was this helpful?', 'Беше ли полезно?')}</Text><FeedbackButton label={t('Yes', 'Да')} icon="thumbs-up-outline" onPress={() => void knowledgeService.submitFeedback(user?.id, item.id, 'helpful').then(() => addNotification({ type: 'toast', severity: 'success', message: t('Thanks for your feedback.', 'Благодарим за обратната връзка.') }))} /><FeedbackButton label={t('Needs updating', 'Нуждае се от обновяване')} icon="flag-outline" onPress={() => void knowledgeService.submitFeedback(user?.id, item.id, 'outdated').then(() => addNotification({ type: 'toast', severity: 'info', message: t('Thanks. Our editors will review this item.', 'Благодарим. Редакторите ни ще прегледат материала.') }))} /></View>
            </View>
            {desktop ? <View style={{ width: 300, position: 'sticky' as any, top: 24 }}><Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 12 }]}>{t('Related learning', 'Свързани материали')}</Text><View style={{ gap: 12 }}>{related.map((entry) => <KnowledgeCard key={entry.id} item={entry} compact />)}</View></View> : null}
          </View>
          {!desktop && related.length ? <View style={{ marginTop: 36 }}><Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 14 }]}>{t('Related learning', 'Свързани материали')}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>{related.map((entry) => <KnowledgeCard key={entry.id} item={entry} compact />)}</ScrollView></View> : null}
        </Content>
      </ScrollView>
    </Screen>
  );
}

function FeedbackButton({ label, icon, onPress }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) { const { theme } = useAppTheme(); return <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, padding: 8 }}><Ionicons name={icon} size={16} color={theme.colors.primary} /><Text style={[theme.typography.label, { color: theme.colors.primary }]}>{label}</Text></Pressable>; }
function labelForType(type: string, locale: 'en' | 'bg') { const labels: Record<string, string> = { article: 'Статия', guide: 'Ръководство', infographic: 'Инфографика', video: 'Видео', quiz: 'Тест', resource: 'Ресурс', diy: 'Направи си сам', tour: 'Обиколка', simulation: 'Лаборатория', webinar: 'На живо' }; return locale === 'bg' ? labels[type] || type : type.charAt(0).toUpperCase() + type.slice(1); }
function labelForDifficulty(value: string, locale: 'en' | 'bg') { if (locale !== 'bg') return value; return { beginner: 'Начално ниво', intermediate: 'Средно ниво', advanced: 'Напреднало ниво' }[value] || value; }
function formatDate(date: string, locale: 'en' | 'bg') { return new Intl.DateTimeFormat(locale === 'bg' ? 'bg-BG' : 'en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date)); }
function blockText(block: KnowledgeBlock) {
  if (block.type === 'heading' || block.type === 'paragraph') return block.text;
  if (block.type === 'list' || block.type === 'checklist') return block.items.join('. ');
  if (block.type === 'callout') return `${block.title}. ${block.text}`;
  if (block.type === 'stat') return `${block.value}. ${block.label}`;
  if (block.type === 'quote') return `${block.text}. ${block.attribution}`;
  if (block.type === 'video') return `${block.title}. ${block.transcript}`;
  if (block.type === 'download') return `${block.title}. ${block.description}`;
  if (block.type === 'action') return `${block.title}. ${block.text}`;
  return '';
}
