import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  useWindowDimensions,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import { Ionicons } from '@expo/vector-icons';

interface Styles {
  container: ViewStyle;
  content: ViewStyle;
  successIcon: ViewStyle;
  title: TextStyle;
  message: TextStyle;
  buttonContainer: ViewStyle;
}

export default function SignupSuccess() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const router = useRouter();

  const handleContinue = () => {
    console.log('User not authenticated, redirecting to signin');
    router.push('/auth/signin');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.content, isTabletOrLarger && { width: '60%', maxWidth: 500 }]}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={100} color="#2E7D32" />
        </View>

        <Text style={styles.title}>Account Created!</Text>
        <Text style={styles.message}>
          Your Green Compass account has been successfully created. You're now ready to start your
          sustainability journey!
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Continue to Home"
            onPress={handleContinue}
            variant="primary"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successIcon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
  },
});
