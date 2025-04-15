import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PostDetailStyles from '../styles/PostDetailStyles';

const styles = PostDetailStyles;

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    user?: {
      id?: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  };
  currentUserId: string;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
}

function CommentItem({
  comment,
  currentUserId,
  onEdit,
  onDelete
}: CommentItemProps) {
  const isAuthor = comment.user_id === currentUserId;
  const authorName = comment.user?.full_name || comment.user_id.substring(0, 8);
  const formattedDate = new Date(comment.created_at).toLocaleDateString();
  
  return (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <View style={styles.commentAuthorContainer}>
          {comment.user?.avatar_url ? (
            <Image 
              source={{ uri: comment.user.avatar_url }} 
              style={styles.commentAuthorAvatar} 
            />
          ) : (
            <View style={styles.commentDefaultAvatar}>
              <Text style={styles.commentDefaultAvatarText}>
                {(authorName || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.commentAuthor}>
            {authorName}
          </Text>
        </View>
        <View style={styles.commentHeaderRight}>
          <Text style={styles.commentTimestamp}>
            {formattedDate}
          </Text>
          {/* Show options for user's own comments */}
          {isAuthor && (
            <View style={styles.commentOptions}>
              <TouchableOpacity 
                style={styles.commentOptionButton}
                onPress={() => onEdit(comment.id, comment.content)}
              >
                <Ionicons name="pencil-outline" size={16} color="#2E7D32" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.commentOptionButton}
                onPress={() => onDelete(comment.id)}
              >
                <Ionicons name="trash-outline" size={16} color="#D32F2F" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.commentContent}>{comment.content}</Text>
    </View>
  );
}

export default CommentItem;
