import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import PostDetailStyles from '@/styles/community/PostDetailStyles';
import CommentItem from '../CommentItem';
import CommentEditForm from '../CommentEditForm';
import { useAppLocale } from '@/context/AppLocaleContext';

const styles = PostDetailStyles;

// Using a more flexible interface that matches the actual data structure
interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user?: {
    id?: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface CommentsSectionProps {
  comments: Comment[];
  isLoading: boolean;
  error?: string | null | undefined;
  currentUserId: string;
  editingCommentId: string | null;
  editCommentContent: string;
  editCommentCharacterInfo: {
    remaining: number;
    isNearLimit: boolean;
    isAtLimit: boolean;
  };
  isSubmitting: boolean;
  onEditComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onEditContentChange: (text: string) => void;
  onSaveEdit: () => Promise<void>;
  onCancelEdit: () => void;
}

function CommentsSection({
  comments,
  isLoading,
  error,
  currentUserId,
  editingCommentId,
  editCommentContent,
  editCommentCharacterInfo,
  isSubmitting,
  onEditComment,
  onDeleteComment,
  onEditContentChange,
  onSaveEdit,
  onCancelEdit
}: CommentsSectionProps) {
  const { t } = useAppLocale();
  return (
    <View style={styles.commentsContainer}>
      <Text style={styles.commentsTitle}>
        {t('Comments', 'Коментари')} ({comments.length})
      </Text>
      
      {isLoading ? (
        <View style={styles.loadingCommentsContainer}>
          <ActivityIndicator size="small" color="#2E7D32" />
          <Text style={styles.loadingCommentsText}>{t('Loading comments...', 'Зареждане на коментарите...')}</Text>
        </View>
      ) : error ? (
        <View style={styles.errorCommentsContainer}>
          <Text style={styles.errorCommentsText}>{t('Error loading comments', 'Грешка при зареждане на коментарите')}: {error}</Text>
        </View>
      ) : comments.length > 0 ? (
        comments.map(comment => (
          <View key={comment.id}>
            {editingCommentId === comment.id ? (
              <CommentEditForm
                content={editCommentContent}
                onContentChange={onEditContentChange}
                onSave={onSaveEdit}
                onCancel={onCancelEdit}
                isSubmitting={isSubmitting}
                characterInfo={editCommentCharacterInfo}
              />
            ) : (
              <CommentItem
                comment={comment}
                currentUserId={currentUserId}
                onEdit={onEditComment}
                onDelete={onDeleteComment}
              />
            )}
          </View>
        ))
      ) : (
        <View style={styles.noCommentsContainer}>
          <Text style={styles.noCommentsText}>{t('No comments yet. Be the first to comment!', 'Все още няма коментари. Напишете първия!')}</Text>
        </View>
      )}
    </View>
  );
}

export default CommentsSection;
