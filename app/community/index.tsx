import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  TouchableOpacity,
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
import FeedHeader from '@/components/community/FeedHeader';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import NewPostButton from '@/components/community/NewPostButton';
import PostOptionsMenu from '@/components/community/postdetails/PostOptionsMenu';
import { useAppTheme } from '@/theme';
import { communityEngagementService, getCountdownLabel, type CommunityOverview } from '@/features/community';
import type { DiscussionCategory } from '@/types/community/community';

const FORUM_CATEGORIES: { value: DiscussionCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All topics' },
  { value: 'sustainable_living', label: 'Living tips' },
  { value: 'diy_projects', label: 'DIY' },
  { value: 'carbon_reduction', label: 'Carbon' },
  { value: 'community_projects', label: 'Projects' },
  { value: 'questions', label: 'Questions' },
];

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
  return (
    <View style={[styles.featureCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }] }>
      <View style={styles.featureCardContent}>
        <View style={[styles.featureCardIcon, { backgroundColor }]}>
          {icon}
        </View>
        <View style={styles.featureCardTextContainer}>
          <Text style={[styles.featureCardTitle, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.featureCardDescription, { color: theme.colors.textMuted }]}>{description}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={[styles.featureCardButton, { backgroundColor: theme.colors.primary }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={[styles.featureCardButtonText, { color: theme.colors.textInverse }]}>{buttonText}</Text>
        <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

export default function CommunityFeed() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const { theme } = useAppTheme();
  
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
      refreshDiscussions();
      if (user?.id) void communityEngagementService.getOverview(user.id).then(setOverview).catch(() => setOverview(null));
    }, [refreshDiscussions, user?.id])
  );

  // Render loading state
  if (authLoading) {
    return <LoadingState />;
  }
  
  // Render error state
  if (discussionsError) {
    return <ErrorState error={discussionsError} onRetry={refreshDiscussions} />;
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
        <View style={[styles.content, { maxWidth: 1120 }, isTabletOrLarger && { alignSelf: 'center', width: '100%' }]}>
          {/* Header */}
          <FeedHeader />

          <View style={{ marginBottom: 22, padding: isTabletOrLarger ? 28 : 22, borderRadius: 22, backgroundColor: theme.colors.primary, overflow: 'hidden' }}>
            <View style={{ position: 'absolute', width: 220, height: 220, borderRadius: 110, right: -55, top: -90, backgroundColor: theme.colors.accent, opacity: 0.16 }} />
            <Text style={[theme.typography.label, { color: theme.colors.accent, textTransform: 'uppercase', letterSpacing: 1.1 }]}>Collaborate · learn · act</Text>
            <Text style={[theme.typography.h1, { color: '#FFFFFF', marginTop: 7, maxWidth: 680 }]}>Make sustainability a team effort</Text>
            <Text style={[theme.typography.body, { color: '#DDECE3', marginTop: 8, maxWidth: 720 }]}>Compare opt-in impact summaries, complete shared goals, exchange practical knowledge, and join local or global projects.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 18 }}><TouchableOpacity style={{ minHeight: 46, paddingHorizontal: 16, borderRadius: 12, backgroundColor: theme.colors.accent, justifyContent: 'center' }} onPress={() => router.push('/community/groups' as any)}><Text style={[theme.typography.label, { color: theme.colors.textInverse }]}>Open my groups</Text></TouchableOpacity><TouchableOpacity style={{ minHeight: 46, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,.38)', justifyContent: 'center' }} onPress={() => router.push('/habits/today' as any)}><Text style={[theme.typography.label, { color: '#FFFFFF' }]}>Today’s challenge & poll</Text></TouchableOpacity></View>
          </View>
          
          {/* Feature Cards Container */}
          <View style={styles.featureCardsContainer}>
            {/* Sustainability Challenges Card */}
            <FeatureCard
              title="Sustainability Challenges"
              description="Join eco-challenges with the community and earn impact points"
              icon={<MaterialCommunityIcons name="leaf" size={32} color="#FFFFFF" />}
              backgroundColor={theme.colors.accent}
              buttonText="Join Challenges"
              onPress={() => router.push({ pathname: '/community/challenges' })}
            />
            
            {/* Community Leaderboards Card */}
            <FeatureCard
              title="Community Leaderboards"
              description="See top contributors and track your environmental impact"
              icon={<Ionicons name="trophy" size={28} color="#FFFFFF" />}
              backgroundColor={theme.colors.primary}
              buttonText="View Leaderboards"
              onPress={() => router.push({ pathname: '/community/leaderboards' })}
            />
            <FeatureCard title="Friends, Teams & Local Circles" description="Invite people privately, share aggregate impact, and pursue common goals" icon={<Ionicons name="people" size={28} color="#FFFFFF" />} backgroundColor={theme.colors.info} buttonText="Open Groups" onPress={() => router.push('/community/groups' as any)} />
            <FeatureCard title="Community Projects" description="Join reviewed local meet-ups and global sustainability initiatives" icon={<Ionicons name="earth" size={28} color="#FFFFFF" />} backgroundColor={theme.colors.success} buttonText="Explore Projects" onPress={() => router.push('/community/projects' as any)} />
            <FeatureCard title="Rewards & Achievements" description="Track green points, virtual reward tiers, badges, and streak bonuses" icon={<Ionicons name="ribbon" size={28} color="#FFFFFF" />} backgroundColor={theme.colors.warning} buttonText="View Rewards" onPress={() => router.push('/community/rewards' as any)} />
            <FeatureCard title="Share Knowledge" description="Submit stories, eco-tips, articles, videos, and project ideas for review" icon={<Ionicons name="bulb" size={28} color="#FFFFFF" />} backgroundColor={theme.colors.primary} buttonText="Contribute" onPress={() => router.push('/community/contribute' as any)} />
            {canModerate ? <FeatureCard title="Moderation & Spotlights" description="Review reported discussions and community submissions" icon={<Ionicons name="shield-checkmark" size={28} color="#FFFFFF" />} backgroundColor={theme.colors.danger} buttonText="Open Review Queue" onPress={() => router.push('/admin/community' as any)} /> : null}
          </View>

          {overview?.featuredSubmission ? <View style={{ borderRadius: 18, padding: 20, marginBottom: 18, backgroundColor: theme.colors.accentSoft, borderWidth: 1, borderColor: theme.colors.border }}><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'uppercase' }]}>Community spotlight · {overview.featuredSubmission.type.replace('_', ' ')}</Text><Text style={[theme.typography.h2, { color: theme.colors.text, marginTop: 7 }]}>{overview.featuredSubmission.title}</Text><Text numberOfLines={4} style={[theme.typography.body, { color: theme.colors.textMuted, marginTop: 6 }]}>{overview.featuredSubmission.body}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 8 }]}>Shared by {overview.featuredSubmission.authorName || 'a community member'}</Text></View> : null}
          {overview?.featuredProjects?.length ? <View style={{ marginBottom: 24 }}><Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 10 }]}>Upcoming initiatives</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{overview.featuredProjects.map((project) => <Pressable key={project.id} onPress={() => router.push('/community/projects' as any)} style={{ minWidth: 260, flex: 1, padding: 16, borderRadius: 16, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}><Text style={[theme.typography.label, { color: theme.colors.primary }]}>{project.eventName || project.scope.toUpperCase()} · {getCountdownLabel(project.endsAt)}</Text><Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 5 }]}>{project.title}</Text><Text style={[theme.typography.bodySmall, { color: theme.colors.textMuted, marginTop: 4 }]}>{project.participantCount} participants</Text></Pressable>)}</View></View> : null}
          
          {/* Discussion Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>From the community</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>Ideas, progress, and useful discoveries from people taking action.</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 14 }}>{FORUM_CATEGORIES.map((category) => { const active = forumCategory === category.value; return <Pressable key={category.value} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => setForumCategory(category.value)} style={{ minHeight: 40, justifyContent: 'center', paddingHorizontal: 13, borderRadius: theme.radii.pill, borderWidth: 1, borderColor: active ? theme.colors.primary : theme.colors.border, backgroundColor: active ? theme.colors.primarySoft : theme.colors.surface }}><Text style={[theme.typography.label, { color: active ? theme.colors.primary : theme.colors.textMuted }]}>{category.label}</Text></Pressable>; })}</ScrollView>

          {/* Content based on loading state */}
          {isLoadingDiscussions ? (
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
