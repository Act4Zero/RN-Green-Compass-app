import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Text,
  Animated,
  Pressable,
} from 'react-native';
import FeedStyles from '@/styles/FeedStyles';
import { useRouter } from 'expo-router';

// Import custom hooks
import useCommunityFeedState from '@/hooks/community/useCommunityFeedState';
import { useFocusEffect } from '@react-navigation/native';

// Import components
import PostItem from '@/components/community/PostItem';
import LoadingState from '@/components/community/LoadingState';
import ErrorState from '@/components/community/ErrorState';
import EmptyState from '@/components/community/EmptyState';
import { SectionHero } from '@/components/ui/SectionHero';
import { AppButton } from '@/components/ui';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import NewPostButton from '@/components/community/NewPostButton';
import PostOptionsMenu from '@/components/community/postdetails/PostOptionsMenu';
import { useAppTheme } from '@/theme';
import { communityEngagementService, getCountdownLabel, type CommunityOverview } from '@/features/community';
import type { DiscussionCategory } from '@/types/community/community';
import { useAppLocale } from '@/context/AppLocaleContext';

const FORUM_CATEGORIES: { value: DiscussionCategory | 'all'; label: { en: string; bg: string } }[] = [
  { value: 'all', label: { en: 'All topics', bg: 'Всички теми' } },
  { value: 'sustainable_living', label: { en: 'Living tips', bg: 'Съвети за дома' } },
  { value: 'diy_projects', label: { en: 'DIY', bg: 'Направи си сам' } },
  { value: 'carbon_reduction', label: { en: 'Carbon', bg: 'Въглерод' } },
  { value: 'community_projects', label: { en: 'Projects', bg: 'Проекти' } },
  { value: 'questions', label: { en: 'Questions', bg: 'Въпроси' } },
];

const SUBMISSION_TYPE_LABELS: Record<string, { en: string; bg: string }> = {
  story: { en: 'Story', bg: 'История' },
  tip: { en: 'Eco-tip', bg: 'Еко съвет' },
  article: { en: 'Article', bg: 'Статия' },
  video: { en: 'Video', bg: 'Видео' },
  project_idea: { en: 'Project idea', bg: 'Идея за проект' },
};

// Styles for this component
const styles = FeedStyles;

// Card components for feature navigation
interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onPress: () => void;
  backgroundColor: string;
  buttonText: string;
}

function FeatureCard({ title, description, icon, onPress, backgroundColor, buttonText }: FeatureCardProps) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  return <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${description}`} onPress={onPress} style={({ pressed }) => ({ flexBasis: width < 760 ? '46%' : '30%', flexGrow: 1, padding: 16, borderRadius: 22, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: pressed ? theme.colors.primarySoft : theme.colors.surface, gap: 10 })}>
    <View style={{ width: 44, height: 44, borderRadius: 15, backgroundColor, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
    <Text style={[theme.typography.h3, { color: theme.colors.text, fontSize: 17 }]}>{title}</Text>
    <Text numberOfLines={2} style={[theme.typography.bodySmall, { color: theme.colors.textMuted, fontSize: 12, lineHeight: 18 }]}>{description}</Text>
    <Text style={[theme.typography.label, { color: theme.colors.primary, fontSize: 12, marginTop: 'auto' }]}>{buttonText} →</Text>
  </Pressable>;
}

export default function CommunityFeed() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { theme } = useAppTheme();
  const { locale, t } = useAppLocale();
  
  // Animation values
  const [scrollY] = React.useState(new Animated.Value(0));
  
  // Use router for navigation
  const router = useRouter();
  const [overview, setOverview] = React.useState<CommunityOverview | null>(null);
  const [forumCategory, setForumCategory] = React.useState<DiscussionCategory | 'all'>('all');
  
  // Use our custom hook for all state management and event handlers
  const {
    // Auth state
    user,
    authLoading,
    
    // Discussion data
    discussions,
    isLoadingDiscussions,
    discussionsError,
    refreshDiscussions,
    
    // UI state
    postOptionsMap,
    
    // Event handlers
    handleLike,
    handleComment,
    handleNewPost,
    togglePostOptions,
    handleCloseAllMenus,
    handleEditPost,
    handleDeletePost,
  } = useCommunityFeedState();
  const canModerate = ((user?.app_metadata?.knowledge_roles || []) as string[]).some((role) => ['reviewer', 'publisher'].includes(role));
  
  // Refresh on screen focus
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        refreshDiscussions();
        void communityEngagementService.getOverview(user.id).then(setOverview).catch(() => setOverview(null));
      }
    }, [refreshDiscussions, user?.id])
  );

  // Render loading state
  if (authLoading) {
    return <LoadingState />;
  }
  
  // Main UI render
  return (
    <KeyboardAvoidingView
      style={[styles.keyboardAvoidingContainer, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      {/* Render post options menus for any open post */}
      {Object.entries(postOptionsMap).map(([postId, isOpen]) => (
        <PostOptionsMenu
          key={postId}
          postId={postId}
          isOpen={isOpen}
          onClose={handleCloseAllMenus}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
        />
      ))}
      <Animated.ScrollView 
        contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={[styles.content, { maxWidth: 1120, padding: 0 }, isTabletOrLarger && { alignSelf: 'center', width: '100%' }]}>
          <SectionHero tone="sun" eyebrow={t('Our community', 'Нашата общност')} title={t('Find your people', 'Намери своите хора')} emoji="🙌" description={t('Share a small win, ask a question or join a local mission. Good ideas grow together.', 'Сподели малка победа, задай въпрос или се включи в местна мисия. Добрите идеи растат заедно.')} illustration={require('../../assets/images/design/community-garden.webp')} illustrationLabel={t('Illustration of friends caring for a community garden', 'Илюстрация на приятели, които се грижат за обща градина')}>
            <AppButton label={t('Share something', 'Сподели нещо')} icon="add" onPress={handleNewPost} />
            <AppButton label={t('Find a group', 'Намери група')} icon="people-outline" variant="secondary" onPress={() => router.push('/community/groups' as any)} />
          </SectionHero>
          {/* Feature Cards Container */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
            {/* Sustainability Challenges Card */}
            <FeatureCard
              title={t('Sustainability Challenges', 'Общи мисии')}
              description={t('Join eco-challenges with the community and earn impact points', 'Опитай нещо ново заедно с общността')}
              icon={<MaterialCommunityIcons name="leaf" size={28} color="#164B37" />}
              backgroundColor={theme.colors.accent}
              buttonText={t('Join Challenges', 'Включи се')}
              onPress={() => router.push({ pathname: '/community/challenges' })}
            />
            
            {/* Community Leaderboards Card */}
            <FeatureCard
              title={t('Community Leaderboards', 'Класации')}
              description={t('See top contributors and track your environmental impact', 'Виж общия напредък и активните участници')}
              icon={<Ionicons name="trophy" size={28} color={theme.colors.textInverse} />}
              backgroundColor={theme.colors.primary}
              buttonText={t('View Leaderboards', 'Виж класациите')}
              onPress={() => router.push({ pathname: '/community/leaderboards' })}
            />
            <FeatureCard title={t('Friends, Teams & Local Circles', 'Групи')} description={t('Invite people privately, share aggregate impact, and pursue common goals', 'Намери приятели за следващата си зелена стъпка')} icon={<Ionicons name="people" size={28} color={theme.colors.textInverse} />} backgroundColor={theme.colors.info} buttonText={t('Open Groups', 'Отвори групите')} onPress={() => router.push('/community/groups' as any)} />
            <FeatureCard title={t('Community Projects', 'Проекти')} description={t('Join reviewed local meet-ups and global sustainability initiatives', 'Открий местни събития и полезни инициативи')} icon={<Ionicons name="earth" size={28} color={theme.colors.textInverse} />} backgroundColor={theme.colors.success} buttonText={t('Explore Projects', 'Разгледай проектите')} onPress={() => router.push('/community/projects' as any)} />
            <FeatureCard title={t('Rewards & Achievements', 'Награди')} description={t('Track green points, virtual reward tiers, badges, and streak bonuses', 'Твоите точки, значки и малки победи')} icon={<Ionicons name="ribbon" size={26} color={theme.colors.textInverse} />} backgroundColor={theme.colors.warning} buttonText={t('View Rewards', 'Виж наградите')} onPress={() => router.push('/community/rewards' as any)} />
            <FeatureCard title={t('Share Knowledge', 'Сподели знание')} description={t('Submit stories, eco-tips, articles, videos, and project ideas for review', 'Дай живот на своя идея или полезен съвет')} icon={<Ionicons name="bulb" size={28} color={theme.colors.textInverse} />} backgroundColor={theme.colors.primary} buttonText={t('Contribute', 'Сподели')} onPress={() => router.push('/community/contribute' as any)} />
            {canModerate ? <FeatureCard title={t('Moderation & Spotlights', 'Модерация и акценти')} description={t('Review reported discussions and community submissions', 'Прегледайте докладвани дискусии и предложения')} icon={<Ionicons name="shield-checkmark" size={28} color={theme.colors.textInverse} />} backgroundColor={theme.colors.danger} buttonText={t('Open Review Queue', 'Отвори опашката')} onPress={() => router.push('/admin/community' as any)} /> : null}
          </View>

          {overview?.featuredSubmission ? <View style={{ borderRadius: 18, padding: 20, marginBottom: 18, backgroundColor: theme.colors.accentSoft, borderWidth: 1, borderColor: theme.colors.border }}><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>{t('Community spotlight', 'Акцент от общността')} · {(SUBMISSION_TYPE_LABELS[overview.featuredSubmission.type]?.[locale] || overview.featuredSubmission.type.replace('_', ' '))}</Text><Text style={[theme.typography.h2, { color: theme.colors.text, marginTop: 7 }]}>{overview.featuredSubmission.title}</Text><Text numberOfLines={4} style={[theme.typography.body, { color: theme.colors.textMuted, marginTop: 6 }]}>{overview.featuredSubmission.body}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 8 }]}>{t('Shared by', 'Споделено от')} {overview.featuredSubmission.authorName || t('a community member', 'член на общността')}</Text></View> : null}
          {overview?.featuredProjects?.length ? <View style={{ marginBottom: 24 }}><Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 10 }]}>{t('Upcoming initiatives', 'Предстоящи инициативи')}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{overview.featuredProjects.map((project) => <Pressable key={project.id} onPress={() => router.push('/community/projects' as any)} style={{ minWidth: 0, flexBasis: '100%', flex: 1, padding: 16, borderRadius: 16, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}><Text style={[theme.typography.label, { color: theme.colors.primary }]}>{project.eventName || project.scope.toUpperCase()} · {getCountdownLabel(project.endsAt, new Date(), locale)}</Text><Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 5 }]}>{project.title}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 4 }]}>{project.participantCount} {t('participants', 'участници')}</Text></Pressable>)}</View></View> : null}
          
          {/* Discussion Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('From the community', 'От общността')}</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>{t('Ideas, progress, and useful discoveries from people taking action.', 'Идеи, напредък и полезни открития от хора, които действат.')}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 14 }}>{FORUM_CATEGORIES.map((category) => { const active = forumCategory === category.value; return <Pressable key={category.value} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => setForumCategory(category.value)} style={{ minHeight: 40, justifyContent: 'center', paddingHorizontal: 13, borderRadius: theme.radii.pill, borderWidth: 1, borderColor: active ? theme.colors.primary : theme.colors.border, backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface }}><Text style={[theme.typography.label, { color: active ? theme.colors.primary : theme.colors.textMuted }]}>{category.label[locale]}</Text></Pressable>; })}</ScrollView>

          {/* Content based on loading state */}
          {discussionsError ? (
            <ErrorState error={discussionsError} onRetry={refreshDiscussions} />
          ) : isLoadingDiscussions ? (
            <LoadingState />
          ) : discussions.filter((discussion) => forumCategory === 'all' || discussion.category === forumCategory).length > 0 ? (
            <View style={styles.postsContainer}>
              {discussions.filter((discussion) => forumCategory === 'all' || discussion.category === forumCategory).map(discussion => (
                <PostItem
                  key={discussion.id}
                  discussion={discussion}
                  userId={user?.id || ''}
                  postOptionsMap={postOptionsMap}
                  togglePostOptions={togglePostOptions}
                  handleEditPost={handleEditPost}
                  handleDeletePost={handleDeletePost}
                  handleLike={handleLike}
                  handleComment={handleComment}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyStateWrapper}>
              <EmptyState />
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* New Post Button */}
      <NewPostButton onPress={handleNewPost} />

      {/* Notifications are now handled by the NotificationContainer */}
    </KeyboardAvoidingView>
  );
}
