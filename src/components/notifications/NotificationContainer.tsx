import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNotification } from '@/context/NotificationContext';
import ToastNotification from './ToastNotification';
import ModalNotification from './ModalNotification';
import BannerNotification from './BannerNotification';
import AlertNotification from './AlertNotification';
import { ViewStyle } from 'react-native';

export function NotificationContainer() {
  const { state, removeNotification } = useNotification();
  const { notifications } = state;

  // Get the first notification from the queue
  const currentNotification = notifications.length > 0 ? notifications[0] : null;

  // Handle auto-dismiss
  useEffect(() => {
    if (currentNotification && currentNotification.autoClose) {
      const timer = setTimeout(() => {
        removeNotification(currentNotification.id);
      }, currentNotification.duration);

      return () => clearTimeout(timer);
    }
  }, [currentNotification, removeNotification]);

  if (!currentNotification) return null;

  // Render the appropriate notification component based on type
  switch (currentNotification.type) {
    case 'toast':
      return <ToastNotification notification={currentNotification} onDismiss={removeNotification} />;
    case 'modal':
      return <ModalNotification notification={currentNotification} onDismiss={removeNotification} />;
    case 'banner':
      return <BannerNotification notification={currentNotification} onDismiss={removeNotification} />;
    case 'alert':
      return <AlertNotification notification={currentNotification} onDismiss={removeNotification} />;
    default:
      return <ToastNotification notification={currentNotification} onDismiss={removeNotification} />;
  }
}

interface Styles {
  container: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
    zIndex: 1000,
  },
});
