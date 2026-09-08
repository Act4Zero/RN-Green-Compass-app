import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import supabase from '@/lib/supabase';
import Button from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/theme';
import { useAppLocale } from '@/context/AppLocaleContext';

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
  const { locale, t } = useAppLocale();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState(t('Confirming your email...', 'Потвърждаваме имейла ви...'));
  const { theme } = useAppTheme();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        if (!confirmation_url) {
          setStatus('error');
          setMessage(t('No confirmation URL provided. Please check your email link and try again.', 'Липсва връзка за потвърждение. Проверете връзката в имейла си и опитайте отново.'));
          return;
        }

        // Extract the token from the confirmation URL
        // The confirmation_url will be in the format: https://yourapp.com/auth/confirm?token=xxx
        const url = new URL(confirmation_url as string);
        const token = url.searchParams.get('token');

        if (!token) {
          setStatus('error');
          setMessage(t('Invalid confirmation link. Please check your email and try again.', 'Невалидна връзка за потвърждение. Проверете имейла си и опитайте отново.'));
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
          setMessage(locale === 'bg' ? 'Имейлът не можа да бъде потвърден. Опитайте отново.' : `Failed to confirm your email: ${error.message}`);
        } else {
          setStatus('success');
          setMessage(t('Your email has been successfully confirmed! You can now sign in to your account.', 'Имейлът ви е потвърден успешно! Вече можете да влезете в профила си.'));
        }
      } catch (error) {
        console.error('Error in email confirmation process:', error);
        setStatus('error');
        setMessage(t('An unexpected error occurred. Please try again later.', 'Възникна неочаквана грешка. Опитайте отново по-късно.'));
      }
    };

    confirmEmail();
  }, [confirmation_url, locale, t]);

  const handleContinue = () => {
    router.push('/auth/signin');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.content, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}>
        {status === 'loading' ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.message, { color: theme.colors.textMuted }]}>{message}</Text>
          </View>
        ) : (
          <>
            <View style={styles.icon}>
              <Ionicons 
                name={status === 'success' ? 'checkmark-circle' : 'alert-circle'} 
                size={100} 
                color={status === 'success' ? theme.colors.success : theme.colors.danger}
              />
            </View>

            <Text style={[styles.title, { color: status === 'success' ? theme.colors.success : theme.colors.danger }]}>
              {status === 'success' ? t('Email Confirmed!', 'Имейлът е потвърден!') : t('Confirmation Failed', 'Неуспешно потвърждение')}
            </Text>
            <Text style={[styles.message, { color: theme.colors.textMuted }]}>{message}</Text>

            <View style={styles.buttonContainer}>
              <Button
                title={status === 'success' ? t('Continue to Sign In', 'Продължи към вход') : t('Try Again', 'Опитай отново')}
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
