import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FeedStyles from '@/styles/FeedStyles';

interface PostFooterProps {
  discussion: any;
  handleLike: (postId: string) => void;
  handleComment: (postId: string) => void;
}

const styles = FeedStyles;

function PostFooter({
  discussion,
  handleLike,
  handleComment
}: PostFooterProps) {
  return (
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
  );
}

export default PostFooter;
