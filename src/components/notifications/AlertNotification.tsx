import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Notification } from '@/context/NotificationContext';

interface AlertNotificationProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

export default function AlertNotification({ notification, onDismiss }: AlertNotificationProps) {
  const { id, title, message, severity, action } = notification;

  useEffect(() => {
    const severityText = severity ? severity.charAt(0).toUpperCase() + severity.slice(1) : 'Info';
    const alertTitle = title || severityText || 'Alert';
    
    if (action) {
      Alert.alert(
        alertTitle,
        message,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => onDismiss(id),
          },
          {
            text: action.label,
            style: severity === 'error' ? 'destructive' : 'default',
            onPress: () => {
              action.onPress();
              onDismiss(id);
            },
          },
        ],
        { cancelable: true, onDismiss: () => onDismiss(id) }
      );
    } else {
      Alert.alert(
        alertTitle,
        message,
        [
          {
            text: 'OK',
            onPress: () => onDismiss(id),
          },
        ],
        { cancelable: true, onDismiss: () => onDismiss(id) }
      );
    }
    // Alert will stay visible until dismissed by the user
  }, [id, title, message, severity, action, onDismiss]);

  // Render nothing as the Alert is shown by React Native
  return null;
}
