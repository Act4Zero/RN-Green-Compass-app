import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNotification } from '@/context/NotificationContext';

export function NotificationExample() {
  const { addNotification } = useNotification();

  const showSuccessToast = () => {
    addNotification({
      type: 'toast',
      message: 'Action completed successfully!',
      severity: 'success',
      duration: 3000,
    });
  };

  const showErrorToast = () => {
    addNotification({
      type: 'toast',
      message: 'Something went wrong.',
      severity: 'error',
      duration: 5000,
    });
  };

  const showInfoBanner = () => {
    addNotification({
      type: 'banner',
      message: 'New feature available! Try it now.',
      severity: 'info',
      duration: 5000,
      action: {
        label: 'Try it',
        onPress: () => console.log('User clicked Try it'),
      },
    });
  };

  const showWarningBanner = () => {
    addNotification({
      type: 'banner',
      message: 'Your session will expire soon.',
      severity: 'warning',
      duration: 5000,
      action: {
        label: 'Extend',
        onPress: () => console.log('User extended session'),
      },
    });
  };

  const showInfoModal = () => {
    addNotification({
      type: 'modal',
      title: 'Information',
      message: 'Here is some important information about your account.',
      severity: 'info',
      autoClose: false,
    });
  };

  const showConfirmationModal = () => {
    addNotification({
      type: 'modal',
      title: 'Confirm Action',
      message: 'Are you sure you want to proceed with this action?',
      severity: 'warning',
      autoClose: false,
      action: {
        label: 'Proceed',
        onPress: () => console.log('User confirmed action'),
      },
    });
  };

  const showAlert = () => {
    addNotification({
      type: 'alert',
      title: 'Quick Question',
      message: 'Would you like to save your changes?',
      severity: 'info',
      action: {
        label: 'Save',
        onPress: () => console.log('User saved changes'),
      },
    });
  };

  const showMultipleNotifications = () => {
    // These will be queued and shown one after another
    showSuccessToast();
    
    setTimeout(() => {
      showInfoBanner();
    }, 500);
    
    setTimeout(() => {
      showWarningBanner();
    }, 1000);
    
    setTimeout(() => {
      showAlert();
    }, 1500);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Notification Examples</Text>
      <Text style={styles.description}>
        This demonstrates the different types of notifications available in the app.
        Notice how they are queued when multiple notifications are triggered.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Toast Notifications</Text>
        <View style={styles.buttonRow}>
          <Pressable style={[styles.button, styles.successButton]} onPress={showSuccessToast}>
            <Text style={styles.buttonText}>Success Toast</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.errorButton]} onPress={showErrorToast}>
            <Text style={styles.buttonText}>Error Toast</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Banner Notifications</Text>
        <View style={styles.buttonRow}>
          <Pressable style={[styles.button, styles.infoButton]} onPress={showInfoBanner}>
            <Text style={styles.buttonText}>Info Banner</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.warningButton]} onPress={showWarningBanner}>
            <Text style={styles.buttonText}>Warning Banner</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Modal Notifications</Text>
        <View style={styles.buttonRow}>
          <Pressable style={[styles.button, styles.infoButton]} onPress={showInfoModal}>
            <Text style={styles.buttonText}>Info Modal</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.warningButton]} onPress={showConfirmationModal}>
            <Text style={styles.buttonText}>Confirmation Modal</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alert Notifications</Text>
        <View style={styles.buttonRow}>
          <Pressable style={[styles.button, styles.infoButton]} onPress={showAlert}>
            <Text style={styles.buttonText}>Alert Dialog</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Queue Demo</Text>
        <View style={styles.buttonRow}>
          <Pressable 
            style={[styles.button, styles.primaryButton, styles.fullWidthButton]} 
            onPress={showMultipleNotifications}
          >
            <Text style={styles.buttonText}>Show Multiple Notifications</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2E7D32',
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    color: '#555555',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  button: {
    flex: 1,
    minWidth: 150,
    margin: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  fullWidthButton: {
    flex: 1,
    flexBasis: '100%',
  },
  successButton: {
    backgroundColor: '#2E7D32',
  },
  errorButton: {
    backgroundColor: '#D32F2F',
  },
  infoButton: {
    backgroundColor: '#1976D2',
  },
  warningButton: {
    backgroundColor: '#FF9800',
  },
  primaryButton: {
    backgroundColor: '#43A047',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
