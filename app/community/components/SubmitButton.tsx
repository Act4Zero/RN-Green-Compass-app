import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SubmitButtonProps {
  isEditMode: boolean;
  isSubmitting: boolean;
  isDisabled: boolean;
  onSubmit: () => void;
}

function SubmitButton({ 
  isEditMode, 
  isSubmitting, 
  isDisabled, 
  onSubmit 
}: SubmitButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.submitButton,
        isDisabled && styles.submitButtonDisabled
      ]}
      onPress={onSubmit}
      disabled={isDisabled}
    >
      {isSubmitting ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          <Ionicons name="send" size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>{isEditMode ? 'Update' : 'Post'}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// Styles
const styles = StyleSheet.create({
  submitButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 24,
    minWidth: 120,
  },
  submitButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default SubmitButton;
