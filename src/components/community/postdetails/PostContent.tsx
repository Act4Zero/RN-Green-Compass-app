import React from 'react';
import { View, Text, Image, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown, { RenderRules } from 'react-native-markdown-display';
import { sanitizeMarkdownInput } from '@/utils/sanitizeMarkdownInput';
import PostDetailStyles from '@/styles/community/PostDetailStyles';
import { useAppLocale } from '@/context/AppLocaleContext';

const styles = PostDetailStyles;

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

interface PostContentProps {
  userId: string;
  discussionId: string | null | undefined;
  title?: string | null;
  content: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  timestamp: string;
  reactionCount: number;
  userHasReacted: boolean;
  isAuthor: boolean;
  onLike: () => void;
  onToggleOptions: () => void;
}

function PostContent({
  userId,
  discussionId,
  title,
  content,
  authorName,
  authorAvatarUrl,
  timestamp,
  reactionCount,
  userHasReacted,
  isAuthor,
  onLike,
  onToggleOptions
}: PostContentProps) {
  const { t } = useAppLocale();
  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.authorContainer}>
          {authorAvatarUrl ? (
            <Image 
              source={{ uri: authorAvatarUrl }} 
              style={styles.authorAvatar} 
            />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.defaultAvatarText}>
                {(authorName || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.postAuthor}>{authorName}</Text>
        </View>
        <View style={styles.postHeaderRight}>
          <Text style={styles.postTimestamp}>{timestamp}</Text>
          {isAuthor && (
            <TouchableOpacity
              style={styles.optionsButton}
              onPress={onToggleOptions}
            >
              <Ionicons name="ellipsis-vertical" size={20} color="#757575" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {title && <Text style={styles.postTitle}>{title}</Text>}
      
      <Markdown 
        style={{
          body: styles.postContent,
          bullet: { color: '#2E7D32' },
          strong: { fontWeight: 'bold' },
          heading1: { fontSize: 22, fontWeight: 'bold', marginVertical: 10 },
          heading2: { fontSize: 20, fontWeight: 'bold', marginVertical: 8 },
          heading3: { fontSize: 18, fontWeight: 'bold', marginVertical: 6 },
          code_block: { backgroundColor: '#f0f0f0', padding: 10, borderRadius: 4 },
          code_inline: { backgroundColor: '#f0f0f0', padding: 2, borderRadius: 2 },
          link: { color: '#1976D2', textDecorationLine: 'underline' },
          image: { width: 300, height: 300, marginVertical: 8, borderRadius: 8 }
        }}
        rules={rules}
        onLinkPress={(url: string) => {
          Linking.openURL(url);
          return false;
        }}
      >
        {sanitizeMarkdownInput(content, 'post')}
      </Markdown>
      
      <View style={styles.postFooter}>
        <TouchableOpacity 
          style={[styles.likeButton, userHasReacted && styles.likeButtonActive]}
          onPress={onLike}
        >
          <Ionicons 
            name={userHasReacted ? "heart" : "heart-outline"} 
            size={20} 
            color={userHasReacted ? "#2E7D32" : "#757575"} 
          />
          <Text style={[styles.likeText, userHasReacted && styles.likeTextActive]}>
            {reactionCount || 0} {t('likes', 'харесвания')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default PostContent;
