import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FeedStyles from '@/styles/FeedStyles';

interface ToastProps {
  message: string;
  visible: boolean;
}

const styles = FeedStyles;

export function Toast({ message, visible }: ToastProps) {
  if (!visible) return null;
  
  return (
    <View style={styles.toastWrapper}>
      <View style={styles.toastContainer}>
        <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </View>
  );
}
