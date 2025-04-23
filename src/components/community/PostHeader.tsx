import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FeedStyles from '../styles/FeedStyles';

interface PostHeaderProps {
  discussion: any;
  userId: string;
  postOptionsMap: Record<string, boolean>;
  togglePostOptions: (postId: string) => void;
  handleEditPost: (postId: string) => void;
  handleDeletePost: (postId: string) => void;
}

const styles = FeedStyles;

function PostHeader({
  discussion,
  userId,
  postOptionsMap,
  togglePostOptions,
  handleEditPost,
  handleDeletePost
}: PostHeaderProps) {
  return (
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
        {/* Post options menu */}
        {postOptionsMap[discussion.id] && (
          <View style={styles.optionsMenu}>
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={(e) => {
                e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
                handleEditPost(discussion.id);
              }}
            >
              <Ionicons name="pencil-outline" size={16} color="#2E7D32" />
              <Text style={styles.optionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={(e) => {
                e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
                handleDeletePost(discussion.id);
              }}
            >
              <Ionicons name="trash-outline" size={16} color="#D32F2F" />
              <Text style={[styles.optionText, { color: '#D32F2F' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

export default PostHeader;
