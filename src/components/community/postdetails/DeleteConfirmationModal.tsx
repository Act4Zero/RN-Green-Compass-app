import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import PostDetailStyles from '@/styles/community/PostDetailStyles';
import { useAppLocale } from '@/context/AppLocaleContext';

const styles = PostDetailStyles;

interface DeleteConfirmationModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export function DeleteConfirmationModal({
  visible,
  onCancel,
  onConfirm,
  title,
  message
}: DeleteConfirmationModalProps) {
  const { t } = useAppLocale();
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title || t('Delete Comment', 'Изтриване на коментар')}</Text>
          <Text style={styles.modalMessage}>{message || t('Are you sure you want to delete this comment? This action cannot be undone.', 'Сигурни ли сте, че искате да изтриете този коментар? Действието е необратимо.')}</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={onCancel}
            >
              <Text style={styles.modalCancelButtonText}>{t('Cancel', 'Отказ')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalDeleteButton}
              onPress={onConfirm}
            >
              <Text style={styles.modalDeleteButtonText}>{t('Delete', 'Изтрий')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default DeleteConfirmationModal;
