import React from 'react';
import { View, Text, TouchableOpacity, Linking, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Markdown, { RenderRules } from 'react-native-markdown-display';
import { Ionicons } from '@expo/vector-icons';
import { sanitizeMarkdownInput } from '@/utils/sanitizeMarkdownInput';
import FeedStyles from '@/styles/FeedStyles';

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
  const router = useRouter();

  return (
    <View key={discussion.id}>
      <TouchableOpacity 
        style={styles.postItem}
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
              <Text style={styles.defaultAvatarText}>
                {(discussion.user?.full_name || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.postAuthor}>
            {discussion.user?.full_name || discussion.user_id.substring(0, 8)}
          </Text>
        </View>
        <View style={styles.postHeaderRight}>
          <Text style={styles.postTimestamp}>
            {new Date(discussion.created_at).toLocaleDateString()}
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
              <Ionicons name="ellipsis-vertical" size={20} color="#757575" />
            </TouchableOpacity>
          )}
          {/* Options menu will appear as an overlay */}
        </View>
      </View>
      
      {/* Post Title */}
      {discussion.title && (
        <Text style={styles.postTitle}>{discussion.title}</Text>
      )}
      
      {/* Post Content */}
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
            color={discussion.user_has_reacted ? "#2E7D32" : "#757575"} 
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
          <Ionicons name="chatbubble-outline" size={20} color="#757575" />
          <Text style={styles.commentText}>{discussion.comment_count || 0}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
    
    {/* Menu options are now rendered in the parent component */}
  </View>
  );
}



export default PostItem;
