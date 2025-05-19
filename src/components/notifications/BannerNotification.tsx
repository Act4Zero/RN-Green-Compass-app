import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '@/context/NotificationContext';
import { ViewStyle, TextStyle } from 'react-native';

interface BannerNotificationProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

export default function BannerNotification({ notification, onDismiss }: BannerNotificationProps) {
  const { id, message, severity, action } = notification;
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Animation for showing the banner
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
      // Animation for hiding the banner when it's removed
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
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
        return <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />;
      case 'warning':
        return <Ionicons name="warning" size={24} color="#FF9800" />;
      case 'error':
        return <Ionicons name="close-circle" size={24} color="#D32F2F" />;
      case 'info':
      default:
        return <Ionicons name="information-circle" size={24} color="#1976D2" />;
    }
  };

  // Get banner background color based on severity
  const getBackgroundColor = () => {
    switch (severity) {
      case 'success':
        return '#E8F5E9'; // Light Green
      case 'warning':
        return '#FFF3E0'; // Light Orange
      case 'error':
        return '#FFEBEE'; // Light Red
      case 'info':
      default:
        return '#E3F2FD'; // Light Blue
    }
  };

  // Get text color based on severity
  const getTextColor = () => {
    switch (severity) {
      case 'success':
        return '#2E7D32'; // Dark Green
      case 'warning':
        return '#F57C00'; // Dark Orange
      case 'error':
        return '#C62828'; // Dark Red
      case 'info':
      default:
        return '#1565C0'; // Dark Blue
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
      <View
        style={[
          styles.container,
          { backgroundColor: getBackgroundColor() },
        ]}
      >
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>{getIcon()}</View>
          <Text style={[styles.message, { color: getTextColor() }]}>{message}</Text>
        </View>
        <View style={styles.actionContainer}>
          {action && (
            <Pressable
              style={[styles.actionButton, { borderColor: getTextColor() }]}
              onPress={() => {
                action.onPress();
                onDismiss(id);
              }}
            >
              <Text style={[styles.actionText, { color: getTextColor() }]}>{action.label}</Text>
            </Pressable>
          )}
          <Pressable
            style={styles.closeButton}
            onPress={() => onDismiss(id)}
          >
            <Ionicons name="close" size={20} color={getTextColor()} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

interface Styles {
  wrapper: ViewStyle;
  container: ViewStyle;
  contentContainer: ViewStyle;
  iconContainer: ViewStyle;
  message: TextStyle;
  actionContainer: ViewStyle;
  actionButton: ViewStyle;
  actionText: TextStyle;
  closeButton: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
});
