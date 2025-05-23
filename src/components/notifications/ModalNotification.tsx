import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '@/context/NotificationContext';
import { ViewStyle, TextStyle } from 'react-native';

interface ModalNotificationProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

export default function ModalNotification({ notification, onDismiss }: ModalNotificationProps) {
  const { id, title, message, severity, action } = notification;
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Animation for showing the modal
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity]);

  // Get appropriate icon based on severity
  const getIcon = () => {
    switch (severity) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={32} color="#2E7D32" />;
      case 'warning':
        return <Ionicons name="warning" size={32} color="#FF9800" />;
      case 'error':
        return <Ionicons name="close-circle" size={32} color="#D32F2F" />;
      case 'info':
      default:
        return <Ionicons name="information-circle" size={32} color="#1976D2" />;
    }
  };

  return (
    <Modal
      transparent
      visible={true}
      animationType="none"
      onRequestClose={() => onDismiss(id)}
    >
      <TouchableWithoutFeedback onPress={() => onDismiss(id)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  opacity,
                  transform: [{ scale }],
                },
              ]}
            >
              <View style={styles.iconContainer}>{getIcon()}</View>
              {title && <Text style={styles.title}>{title}</Text>}
              <Text style={styles.message}>{message}</Text>
              <View style={styles.buttonContainer}>
                {action ? (
                  <>
                    <Pressable
                      style={styles.cancelButton}
                      onPress={() => onDismiss(id)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => {
                        action.onPress();
                        onDismiss(id);
                      }}
                    >
                      <Text style={styles.actionButtonText}>{action.label}</Text>
                    </Pressable>
                  </>
                ) : (
                  <Pressable
                    style={styles.okButton}
                    onPress={() => onDismiss(id)}
                  >
                    <Text style={styles.okButtonText}>OK</Text>
                  </Pressable>
                )}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

interface Styles {
  modalOverlay: ViewStyle;
  modalContainer: ViewStyle;
  iconContainer: ViewStyle;
  title: TextStyle;
  message: TextStyle;
  buttonContainer: ViewStyle;
  okButton: ViewStyle;
  okButtonText: TextStyle;
  cancelButton: ViewStyle;
  cancelButtonText: TextStyle;
  actionButton: ViewStyle;
  actionButtonText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#555555',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  okButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  okButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#555555',
    fontWeight: '600',
    fontSize: 16,
  },
  actionButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
