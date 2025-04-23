import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import supabase from '@/lib/supabase';
import Button from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';

interface Styles {
  container: ViewStyle;
  content: ViewStyle;
  icon: ViewStyle;
  title: TextStyle;
  message: TextStyle;
  buttonContainer: ViewStyle;
  loadingContainer: ViewStyle;
}

export default function ConfirmSignup() {
  const { confirmation_url } = useLocalSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your email...');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        if (!confirmation_url) {
          setStatus('error');
          setMessage('No confirmation URL provided. Please check your email link and try again.');
          return;
        }

        // Extract the token from the confirmation URL
        // The confirmation_url will be in the format: https://yourapp.com/auth/confirm?token=xxx
        const url = new URL(confirmation_url as string);
        const token = url.searchParams.get('token');

        if (!token) {
          setStatus('error');
          setMessage('Invalid confirmation link. Please check your email and try again.');
          return;
        }

        // Use the token to confirm the user's email
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email',
        });

        if (error) {
          console.error('Error confirming email:', error);
          setStatus('error');
          setMessage(`Failed to confirm your email: ${error.message}`);
        } else {
          setStatus('success');
          setMessage('Your email has been successfully confirmed! You can now sign in to your account.');
        }
      } catch (error) {
        console.error('Error in email confirmation process:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again later.');
      }
    };

    confirmEmail();
  }, [confirmation_url]);

  const handleContinue = () => {
    router.push('/auth/signin');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {status === 'loading' ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.message}>{message}</Text>
          </View>
        ) : (
          <>
            <View style={styles.icon}>
              <Ionicons 
                name={status === 'success' ? 'checkmark-circle' : 'alert-circle'} 
                size={100} 
                color={status === 'success' ? '#2E7D32' : '#D32F2F'} 
              />
            </View>

            <Text style={[styles.title, { color: status === 'success' ? '#2E7D32' : '#D32F2F' }]}>
              {status === 'success' ? 'Email Confirmed!' : 'Confirmation Failed'}
            </Text>
            <Text style={styles.message}>{message}</Text>

            <View style={styles.buttonContainer}>
              <Button
                title={status === 'success' ? 'Continue to Sign In' : 'Try Again'}
                onPress={handleContinue}
                variant="primary"
              />
            </View>
          </>
        )}
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
    maxWidth: 500,
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
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
