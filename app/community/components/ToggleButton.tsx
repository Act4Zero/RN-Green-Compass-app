import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ToggleButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
}

function ToggleButton({ icon, label, onPress }: ToggleButtonProps) {
  return (
    <TouchableOpacity 
      style={styles.toggleButton}
      onPress={onPress}
    >
      <Ionicons name={icon as any} size={20} color="#2E7D32" />
      <Text style={styles.toggleButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

// Styles
const styles = StyleSheet.create({
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginLeft: 8,
    borderRadius: 4,
    backgroundColor: '#F5F5F5',
  },
  toggleButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
});

export default ToggleButton;
