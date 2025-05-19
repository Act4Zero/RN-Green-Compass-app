import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '@/context/NotificationContext';

interface ToastNotificationProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

export default function ToastNotification({ notification, onDismiss }: ToastNotificationProps) {
  const { id, message, severity, action } = notification;
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Animation for showing the toast
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      // Animation for hiding the toast when it's removed
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    };
  }, [translateY, opacity]);

  // Get appropriate icon based on severity
  const getIcon = () => {
    switch (severity) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />;
      case 'warning':
        return <Ionicons name="warning" size={24} color="#FFFFFF" />;
      case 'error':
        return <Ionicons name="close-circle" size={24} color="#FFFFFF" />;
      case 'info':
      default:
        return <Ionicons name="information-circle" size={24} color="#FFFFFF" />;
    }
  };

  // Get background color based on severity
  const getBackgroundColor = () => {
    switch (severity) {
      case 'success':
        return '#2E7D32'; // Green (matching app theme)
      case 'warning':
        return '#FF9800'; // Orange
      case 'error':
        return '#D32F2F'; // Red
      case 'info':
      default:
        return '#1976D2'; // Blue
    }
  };

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Pressable
        style={[
          styles.container,
          { backgroundColor: getBackgroundColor() },
        ]}
        onPress={() => onDismiss(id)}
      >
        <View style={styles.iconContainer}>{getIcon()}</View>
        <Text style={styles.message}>{message}</Text>
        {action && (
          <Pressable
            style={styles.actionButton}
            onPress={() => {
              action.onPress();
              onDismiss(id);
            }}
          >
            <Text style={styles.actionText}>{action.label}</Text>
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
}

interface ToastStyles {
  wrapper: ViewStyle;
  container: ViewStyle;
  iconContainer: ViewStyle;
  message: TextStyle;
  actionButton: ViewStyle;
  actionText: TextStyle;
}

const styles = StyleSheet.create<ToastStyles>({
  wrapper: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    width: '85%',
    maxWidth: 500,
  },
  iconContainer: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  actionButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
