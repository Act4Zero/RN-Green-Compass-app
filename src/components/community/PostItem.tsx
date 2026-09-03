import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Linking, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Markdown, { RenderRules } from 'react-native-markdown-display';
import { Ionicons } from '@expo/vector-icons';
import CommunityShareModal from './CommunityShareModal';
import { formatCommunityPostForSharing } from '@/utils/sharing/communityShareUtils';
import { useAuth } from '@/context/AuthContext';
import postItemStyles from './PostItem.styles';
import { sanitizeMarkdownInput } from '@/utils/sanitizeMarkdownInput';
import FeedStyles from '@/styles/FeedStyles';
import { useAppTheme } from '@/theme';
import { useNotification } from '@/context/NotificationContext';
import { communityEngagementService } from '@/features/community';
import { useAppLocale } from '@/context/AppLocaleContext';

// Custom renderer for Markdown images to make them clickable
const renderImage = (node: any, children: React.ReactNode, parent: any, styles: any) => {
  const { src } = node.attributes;
  
  return (
    <View style={{ width: '100%', alignItems: 'center', marginVertical: 8 }}>
      <TouchableOpacity 
        key={node.key} 
        onPress={() => Linking.openURL(src)}
        activeOpacity={0.8}
      >
        <Image 
          source={{ uri: src }} 
          style={[styles.image]} 
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

// Custom rules for Markdown rendering
const rules: RenderRules = {
  image: renderImage,
};

interface PostItemProps {
  discussion: any;
  userId: string;
  postOptionsMap: Record<string, boolean>;
  togglePostOptions: (postId: string) => void;
  handleEditPost: (postId: string) => void;
  handleDeletePost: (postId: string) => void;
  handleLike: (postId: string) => void;
  handleComment: (postId: string) => void;
}

const styles = FeedStyles;

function PostItem({
  discussion,
  userId,
  postOptionsMap,
  togglePostOptions,
  handleEditPost,
  handleDeletePost,
  handleLike,
  handleComment
}: PostItemProps) {
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const { locale, t } = useAppLocale();
  // Get user display name with a fallback
  const userName = user?.email ? user.email.split('@')[0] : undefined;
  
  // Format the current date for the achievement date
  const currentDate = new Date();
  
  // Get author name with fallback
  const authorName = discussion.user?.full_name?.trim() ? 
    discussion.user.full_name : t('Anonymous', 'Анонимен');
  
  // Prepare post data for sharing
  const postTitle = discussion.title || null;
  const postContent = discussion.content || '';
  
  // Create custom-formatted sharing content
  const shareContent = formatCommunityPostForSharing(
    postTitle,
    postContent,
    authorName,
    userName
  );
  
  // Prepare post data for sharing modal
  const postData = {
    title: postTitle,
    content: postContent,
    authorName,
    date: currentDate,
    shareContent: shareContent
  };
  
  // Handle opening the share modal
  const handleSharePress = useCallback((e: any) => {
    e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
    setIsShareModalVisible(true);
  }, []);
  
  // Handle closing the share modal
  const handleCloseShareModal = useCallback(() => {
    setIsShareModalVisible(false);
  }, []);

  const handleReportPress = useCallback((e: any) => {
    e.stopPropagation();
    addNotification({
      type: 'modal',
      title: t('Report discussion', 'Докладвай дискусията'),
      message: t('Send this discussion to the moderation team for review?', 'Да изпратим ли тази дискусия до екипа за модерация?'),
      severity: 'warning',
      autoClose: false,
      action: {
        label: t('Send report', 'Изпрати сигнал'),
        onPress: async () => {
          try {
            await communityEngagementService.reportDiscussion(discussion.id);
            addNotification({ type: 'toast', message: t('Report sent to the moderation team.', 'Сигналът е изпратен до екипа за модерация.'), severity: 'success' });
          } catch {
            addNotification({ type: 'toast', message: t('Unable to send report.', 'Сигналът не можа да се изпрати.'), severity: 'error' });
          }
        },
      },
    });
  }, [addNotification, discussion.id, t]);
  
  // Initialize router
  const router = useRouter();

  return (
    <View key={discussion.id}>
      <TouchableOpacity 
        style={[styles.postItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}
        onPress={() => router.push(`/community/post/${discussion.id}`)}
        activeOpacity={0.7}
      >
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.authorContainer}>
          {discussion.user?.avatar_url ? (
  <Image 
    source={{ uri: discussion.user.avatar_url }} 
    style={styles.authorAvatar} 
  />
) : (
  <View style={styles.defaultAvatar}>
    <Text style={[styles.defaultAvatarText, { color: theme.colors.primary }]}>
      {discussion.user?.full_name
        ? discussion.user.full_name.charAt(0).toUpperCase()
        : '❓'}
    </Text>
  </View>
)}
          <Text style={[styles.postAuthor, { color: theme.colors.text }]}>
  {discussion.user?.full_name?.trim()
    ? discussion.user.full_name
    : t('Anonymous', 'Анонимен')}
</Text>
        </View>
        <View style={styles.postHeaderRight}>
          <Text style={[styles.postTimestamp, { color: theme.colors.textMuted }]}>
            {new Date(discussion.created_at).toLocaleDateString(locale === 'bg' ? 'bg-BG' : 'en-GB')}
          </Text>
          {/* Show options button if the post belongs to the current user */}
          {discussion.user_id === userId && (
            <TouchableOpacity
              style={styles.optionsButton}
              onPress={(e) => {
                e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
                togglePostOptions(discussion.id);
              }}
            >
              <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
          {/* Options menu will appear as an overlay */}
        </View>
      </View>
      
      {/* Post Title */}
      <View style={{ alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: theme.colors.primarySoft, marginBottom: 7 }}><Text style={[theme.typography.label, { color: theme.colors.primary, textTransform: 'capitalize' }]}>{String(discussion.category || 'sustainable_living').replace(/_/g, ' ')}</Text></View>
      {discussion.title && (
        <Text style={[styles.postTitle, { color: theme.colors.text }]}>{discussion.title}</Text>
      )}
      
      {/* Post Content */}
      <Markdown 
        style={{
          body: { ...styles.postContent, color: theme.colors.textMuted },
          bullet: { color: theme.colors.primary },
          strong: { fontWeight: 'bold' },
          heading1: { fontSize: 22, fontWeight: 'bold', marginVertical: 10 },
          heading2: { fontSize: 20, fontWeight: 'bold', marginVertical: 8 },
          heading3: { fontSize: 18, fontWeight: 'bold', marginVertical: 6 },
          code_block: { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text, padding: 10, borderRadius: 4 },
          code_inline: { backgroundColor: theme.colors.surfaceMuted, color: theme.colors.text, padding: 2, borderRadius: 2 },
          link: { color: theme.colors.info, textDecorationLine: 'underline' },
          image: { 
            width: 300, 
            height: 300, 
            marginVertical: 8, 
            borderRadius: 8
          }
        }}
        rules={rules}
        onLinkPress={(url: string) => {
          Linking.openURL(url);
          return false;
        }}
      >
        {sanitizeMarkdownInput(discussion.content, 'post')}
      </Markdown>
      
      <View style={styles.divider} />
      
      {/* Post Footer */}
      <View style={styles.postFooter}>
        <TouchableOpacity 
          style={[styles.reactionButton, discussion.user_has_reacted && styles.reactionButtonActive]}
          onPress={(e) => {
            e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
            handleLike(discussion.id);
          }}
        >
          <Ionicons 
            name={discussion.user_has_reacted ? "heart" : "heart-outline"} 
            size={20} 
            color={discussion.user_has_reacted ? theme.colors.primary : theme.colors.textMuted}
          />
          <Text style={[styles.reactionText, discussion.user_has_reacted && styles.reactionTextActive]}>
            {discussion.reaction_count || 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.commentButton}
          onPress={(e) => {
            e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
            handleComment(discussion.id);
          }}
        >
          <Ionicons name="chatbubble-outline" size={20} color={theme.colors.textMuted} />
          <Text style={styles.commentText}>{discussion.comment_count || 0}</Text>
        </TouchableOpacity>
        
        {/* Share Button */}
        <TouchableOpacity 
          style={postItemStyles.shareButton}
          onPress={handleSharePress}
        >
          <Ionicons name="share-social-outline" size={20} color={theme.colors.textMuted} />
          <Text style={postItemStyles.shareText}>{t('Share', 'Сподели')}</Text>
        </TouchableOpacity>
        {discussion.user_id !== user?.id ? <TouchableOpacity style={postItemStyles.shareButton} onPress={handleReportPress} accessibilityLabel={t('Report discussion', 'Докладвай дискусията')}><Ionicons name="flag-outline" size={19} color={theme.colors.textMuted} /><Text style={postItemStyles.shareText}>{t('Report', 'Докладвай')}</Text></TouchableOpacity> : null}
      </View>
    </TouchableOpacity>
    
    {/* Menu options are now rendered in the parent component */}
    
    {/* Community Share Modal */}
    <CommunityShareModal
      isVisible={isShareModalVisible}
      onClose={handleCloseShareModal}
      postData={postData}
    />
  </View>
  );
}



export default PostItem;
