import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { EnhancedGoal, TimeFrequency } from '../home/types/goal.types';
import { editGoalModalStyles } from '../home/styles/EditGoalModal.styles';

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
  const [editedGoalName, setEditedGoalName] = useState('');
  const [editedGoalCategory, setEditedGoalCategory] = useState('');
  const [editedGoalTarget, setEditedGoalTarget] = useState('');
  const [editedGoalCurrent, setEditedGoalCurrent] = useState('');
  const [editedTimeFrequency, setEditedTimeFrequency] = useState<TimeFrequency>('one-time');
  const [error, setError] = useState<string | null>(null);

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
        Alert.alert('Success', 'Goal deleted successfully');
      } else {
        Alert.alert('Error', result.error || 'Failed to delete goal');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      Alert.alert('Error', errorMessage);
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
        Alert.alert('Success', 'Goal updated successfully');
      } else {
        setError(result.error || 'Failed to update goal. Please try again.');
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
            <Text style={editGoalModalStyles.modalTitle}>Edit Goal</Text>
            <TouchableOpacity style={editGoalModalStyles.modalCloseButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#2E7D32" />
            </TouchableOpacity>
          </View>
          
          <View style={editGoalModalStyles.modalForm}>
            {error && (
              <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
            )}
            
            <Text style={editGoalModalStyles.modalLabel}>Goal Name</Text>
            <Input
              value={editedGoalName}
              onChangeText={(text) => {
                // Limit input length during typing
                if (text.length <= 50) {
                  setEditedGoalName(text);
                }
              }}
              placeholder="Enter goal name (max 50 characters)"
              maxLength={50}
              error={error && error.includes('Goal name') ? error : undefined}
            />
            
            <Text style={editGoalModalStyles.modalLabel}>Category</Text>
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
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            
            <Text style={editGoalModalStyles.modalLabel}>Target Value</Text>
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
            
            <Text style={editGoalModalStyles.modalLabel}>Current Value</Text>
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
            
            <Text style={editGoalModalStyles.modalLabel}>Time Frequency</Text>
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
              <Text style={editGoalModalStyles.deleteButtonText}>Delete Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
