import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import PostDetailStyles from '@/styles/community/PostDetailStyles';
import { useAppLocale } from '@/context/AppLocaleContext';

const styles = PostDetailStyles;

interface PostEditFormProps {
  title: string;
  content: string;
  onTitleChange: (text: string) => void;
  onContentChange: (text: string) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  characterInfo: {
    remaining: number;
    isNearLimit: boolean;
    isAtLimit: boolean;
  };
}

function PostEditForm({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSave,
  onCancel,
  isSubmitting,
  characterInfo
}: PostEditFormProps) {
  const { t } = useAppLocale();
  const isDisabled = !content.trim() || characterInfo.isAtLimit || isSubmitting;

  return (
    <View style={styles.editPostContainer}>
      <TextInput
        style={styles.editPostTitleInput}
        placeholder={t('Title (optional)', 'Заглавие (незадължително)')}
        placeholderTextColor="#757575"
        value={title}
        onChangeText={onTitleChange}
        maxLength={100}
      />
      <TextInput
        style={[
          styles.editPostContentInput, 
          characterInfo.isAtLimit ? styles.inputAtLimit : undefined
        ]}
        placeholder={t("What's on your mind?", 'Какво искате да споделите?')}
        placeholderTextColor="#757575"
        value={content}
        onChangeText={onContentChange}
        multiline
        maxLength={1000}
      />
      <View style={styles.editPostFooter}>
        <Text style={[
          styles.characterCount, 
          characterInfo.isNearLimit ? styles.characterCountNearLimit : undefined,
          characterInfo.isAtLimit ? styles.characterCountAtLimit : undefined
        ]}>
          {characterInfo.remaining} {t('characters left', 'оставащи знака')}
        </Text>
        <View style={styles.editPostButtons}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>{t('Cancel', 'Отказ')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.saveButton, 
              isDisabled ? styles.saveButtonDisabled : undefined
            ]}
            onPress={onSave}
            disabled={isDisabled}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>{t('Save', 'Запази')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default PostEditForm;
