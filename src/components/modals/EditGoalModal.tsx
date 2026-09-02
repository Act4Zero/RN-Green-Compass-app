import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '../../context/NotificationContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { EnhancedGoal, TimeFrequency } from '../../types/goal.types';
import { editGoalModalStyles } from '../home/styles/EditGoalModal.styles';
import { useAppLocale } from '@/context/AppLocaleContext';

interface EditGoalModalProps {
  visible: boolean;
  goal: EnhancedGoal | null;
  onClose: () => void;
  onSave: (
    goalId: string,
    updates: {
      goalName: string;
      category: string;
      targetValue: number;
      currentValue: number;
      timeFrequency: TimeFrequency;
    }
  ) => Promise<{ success: boolean; error: string | null }>;
  onDelete: (goalId: string) => Promise<{ success: boolean; error: string | null }>;
  loading: boolean;
}

export default function EditGoalModal({ 
  visible, 
  goal, 
  onClose, 
  onSave, 
  onDelete,
  loading 
}: EditGoalModalProps) {
  const { t } = useAppLocale();
  const [editedGoalName, setEditedGoalName] = useState('');
  const [editedGoalCategory, setEditedGoalCategory] = useState('');
  const [editedGoalTarget, setEditedGoalTarget] = useState('');
  const [editedGoalCurrent, setEditedGoalCurrent] = useState('');
  const [editedTimeFrequency, setEditedTimeFrequency] = useState<TimeFrequency>('one-time');
  const [error, setError] = useState<string | null>(null);
  const notification = useNotification();

  // Reset form when goal changes
  useEffect(() => {
    if (goal) {
      setEditedGoalName(goal.title);
      setEditedGoalCategory(goal.category);
      setEditedGoalTarget(goal.target.toString());
      setEditedGoalCurrent(goal.progress.toString());
      setEditedTimeFrequency(goal.timeFrequency);
    }
    setError(null);
  }, [goal]);

  // Handle goal deletion
  const handleDeleteGoal = async () => {
    if (!goal) {
      console.log('No goal selected for deletion');
      return;
    }
    
    // Close the modal first
    onClose();
    
    try {
      const result = await onDelete(goal.id);
      
      if (result.success) {
        notification?.addNotification({
          type: 'toast',
          message: t('Goal deleted successfully', 'Целта е изтрита успешно'),
          severity: 'success',
        });
      } else {
        notification?.addNotification({
          type: 'toast',
          message: result.error || t('Failed to delete goal', 'Целта не можа да бъде изтрита'),
          severity: 'error',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      notification?.addNotification({
        type: 'toast',
        message: errorMessage,
        severity: 'error',
      });
      console.error('Error deleting goal:', err);
    }
  };

  // Save updated goal
  const handleSaveGoal = async () => {
    if (!goal) return;
    
    setError(null);
    
    try {
      const result = await onSave(goal.id, {
        goalName: editedGoalName,
        category: editedGoalCategory,
        targetValue: parseFloat(editedGoalTarget),
        currentValue: parseFloat(editedGoalCurrent),
        timeFrequency: editedTimeFrequency
      });
      
      if (result.success) {
        // Close modal after successful update
        onClose();
        notification?.addNotification({
          type: 'toast',
          message: t('Goal updated successfully', 'Целта е обновена успешно'),
          severity: 'success',
        });
      } else {
        setError(result.error || t('Failed to update goal. Please try again.', 'Целта не можа да бъде обновена. Опитайте отново.'));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error updating goal:', err);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={editGoalModalStyles.modalContainer}>
        <View style={editGoalModalStyles.modalContent}>
          <View style={editGoalModalStyles.modalHeader}>
            <Text style={editGoalModalStyles.modalTitle}>{t('Edit Goal', 'Редактиране на цел')}</Text>
            <TouchableOpacity style={editGoalModalStyles.modalCloseButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#2E7D32" />
            </TouchableOpacity>
          </View>
          
          <View style={editGoalModalStyles.modalForm}>
            {error && (
              <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
            )}
            
            <Text style={editGoalModalStyles.modalLabel}>{t('Goal Name', 'Име на целта')}</Text>
            <Input
              value={editedGoalName}
              onChangeText={(text) => {
                // Limit input length during typing
                if (text.length <= 50) {
                  setEditedGoalName(text);
                }
              }}
              placeholder={t('Enter goal name (max 50 characters)', 'Въведете име на целта (до 50 знака)')}
              maxLength={50}
              error={error && error.includes('Goal name') ? error : undefined}
            />
            
            <Text style={editGoalModalStyles.modalLabel}>{t('Category', 'Категория')}</Text>
            <View style={{ marginBottom: 16 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', flexWrap: 'nowrap' }}>
                  {['Mobility', 'Food', 'Household Activities', 'Heating'].map((category) => (
                    <TouchableOpacity 
                      key={category}
                      style={[
                        editGoalModalStyles.timeChip, 
                        { 
                          backgroundColor: editedGoalCategory === category ? '#2E7D32' : '#E8F5E9' 
                        }
                      ]}
                      onPress={() => setEditedGoalCategory(category)}
                    >
                      <Text 
                        style={[
                          editGoalModalStyles.timeChipText, 
                          { color: editedGoalCategory === category ? 'white' : '#2E7D32' }
                        ]}
                      >
                        {t(category, category === 'Mobility' ? 'Мобилност' : category === 'Food' ? 'Храна' : category === 'Heating' ? 'Отопление' : 'Домакински дейности')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            
            <Text style={editGoalModalStyles.modalLabel}>{t('Target Value', 'Целева стойност')}</Text>
            <Input
              value={editedGoalTarget}
              onChangeText={(text) => {
                // Only allow numeric input with decimal point
                if (/^\d*\.?\d*$/.test(text)) {
                  setEditedGoalTarget(text);
                }
              }}
              placeholder="Enter target value (positive number)"
              keyboardType="numeric"
              error={error && error.includes('Target value') ? error : undefined}
            />
            
            <Text style={editGoalModalStyles.modalLabel}>{t('Current Value', 'Текуща стойност')}</Text>
            <Input
              value={editedGoalCurrent}
              onChangeText={(text) => {
                // Only allow numeric input with decimal point
                if (/^\d*\.?\d*$/.test(text)) {
                  setEditedGoalCurrent(text);
                }
              }}
              placeholder="Enter current value (non-negative number)"
              keyboardType="numeric"
              error={error && error.includes('Current value') ? error : undefined}
            />
            
            <Text style={editGoalModalStyles.modalLabel}>{t('Time Frequency', 'Честота')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
              {(['daily', 'weekly', 'monthly', 'one-time'] as TimeFrequency[]).map((frequency) => (
                <TouchableOpacity 
                  key={frequency}
                  style={[
                    editGoalModalStyles.timeChip, 
                    { 
                      backgroundColor: editedTimeFrequency === frequency ? '#2E7D32' : '#E8F5E9' 
                    }
                  ]}
                  onPress={() => setEditedTimeFrequency(frequency)}
                >
                  <Text 
                    style={[
                      editGoalModalStyles.timeChipText, 
                      { color: editedTimeFrequency === frequency ? 'white' : '#2E7D32' }
                    ]}
                  >
                    {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={editGoalModalStyles.modalButtonContainer}>
              <Button
                title="Cancel"
                onPress={onClose}
                variant="outline"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title={loading ? "Saving..." : "Save Changes"}
                onPress={handleSaveGoal}
                disabled={loading}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
            
            {/* Delete button - separate from other buttons */}
            <TouchableOpacity 
              style={editGoalModalStyles.deleteButton}
              onPress={handleDeleteGoal}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color="#D32F2F" />
              <Text style={editGoalModalStyles.deleteButtonText}>{t('Delete Goal', 'Изтрий целта')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
