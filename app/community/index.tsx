import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  TouchableOpacity,
  Text,
  Image,
  Animated,
} from 'react-native';
import FeedStyles from '@/styles/FeedStyles';
import { useRouter, Link } from 'expo-router';

// Import custom hooks
import useCommunityFeedState from '@/hooks/community/useCommunityFeedState';
import { useFocusEffect } from '@react-navigation/native';

// Import components
import PostItem from '@/components/community/PostItem';
import { Toast } from '@/components/community/Toast';
import LoadingState from '@/components/community/LoadingState';
import ErrorState from '@/components/community/ErrorState';
import EmptyState from '@/components/community/EmptyState';
import FeedHeader from '@/components/community/FeedHeader';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import NewPostButton from '@/components/community/NewPostButton';
import PostOptionsMenu from '@/components/community/postdetails/PostOptionsMenu';

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
  return (
    <View style={[styles.featureCard, { backgroundColor }]}>
      <View style={styles.featureCardContent}>
        <View style={styles.featureCardIcon}>
          {icon}
        </View>
        <View style={styles.featureCardTextContainer}>
          <Text style={styles.featureCardTitle}>{title}</Text>
          <Text style={styles.featureCardDescription}>{description}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.featureCardButton} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.featureCardButtonText}>{buttonText}</Text>
        <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

export default function CommunityFeed() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  
  // Animation values
  const [scrollY] = React.useState(new Animated.Value(0));
  
  // Use router for navigation
  const router = useRouter();
  
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
    showToast,
    toastMessage,
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
  
  // Refresh on screen focus
  useFocusEffect(
    React.useCallback(() => {
      refreshDiscussions();
    }, [])
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
      style={styles.keyboardAvoidingContainer}
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={[styles.content, isTabletOrLarger && { alignSelf: 'center', width: '70%', maxWidth: 900 }]}>
          {/* Header */}
          <FeedHeader />
          
          {/* Feature Cards Container */}
          <View style={styles.featureCardsContainer}>
            {/* Sustainability Challenges Card */}
            <FeatureCard
              title="Sustainability Challenges"
              description="Join eco-challenges with the community and earn impact points"
              icon={<MaterialCommunityIcons name="leaf" size={32} color="#FFFFFF" />}
              backgroundColor="#43A047"
              buttonText="Join Challenges"
              onPress={() => router.push({ pathname: '/community/challenges' })}
            />
            
            {/* Community Leaderboards Card */}
            <FeatureCard
              title="Community Leaderboards"
              description="See top contributors and track your environmental impact"
              icon={<Ionicons name="trophy" size={28} color="#FFFFFF" />}
              backgroundColor="#2E7D32"
              buttonText="View Leaderboards"
              onPress={() => router.push({ pathname: '/community/leaderboards' })}
            />
          </View>
          
          {/* Discussion Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Community Discussions</Text>
            <Text style={styles.sectionSubtitle}>Join the conversation on environmental topics</Text>
          </View>

          {/* Content based on loading state */}
          {isLoadingDiscussions ? (
            <LoadingState />
          ) : discussions.length > 0 ? (
            <View style={styles.postsContainer}>
              {discussions.map(discussion => (
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

      {/* Toast Notifications */}
      <Toast message={toastMessage} visible={showToast} />
    </KeyboardAvoidingView>
  );
}
