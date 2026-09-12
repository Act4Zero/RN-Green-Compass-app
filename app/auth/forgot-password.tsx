import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  ImageStyle,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import supabase from '@/lib/supabase';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Turnstile, { isTurnstileConfigured, TurnstileHandle } from '@/components/Turnstile';
import { useAppTheme } from '@/theme';
import { AuthBrand } from '@/components/ui/AuthBrand';
import { useAppLocale } from '@/context/AppLocaleContext';

interface Styles {
  keyboardAvoidingContainer: ViewStyle;
  scrollContent: ViewStyle;
  content: ViewStyle;
  logoContainer: ViewStyle;
  logo: ImageStyle;
  header: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  form: ViewStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  successContainer: ViewStyle;
  successText: TextStyle;
  footer: ViewStyle;
  footerText: TextStyle;
  footerLink: TextStyle;
}

export default function ForgotPassword() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const router = useRouter();
  const { theme } = useAppTheme();
  const { locale, t } = useAppLocale();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [isSuccess, setIsSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<TurnstileHandle>(null);

  const resetCaptcha = () => {
    setCaptchaToken(null);
    captchaRef.current?.reset();
  };

  const validateEmail = (email: string) => {
    // Trim the email to remove any leading/trailing whitespace
    const trimmedEmail = email.trim();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!trimmedEmail) {
      setEmailError(t('Email is required', 'Имейлът е задължителен'));
      return false;
    } else if (!emailRegex.test(trimmedEmail)) {
      setEmailError(t('Please enter a valid email address', 'Въведете валиден имейл адрес'));
      return false;
    } else if (trimmedEmail.length > 255) {
      setEmailError(t('Email is too long', 'Имейлът е твърде дълъг'));
      return false;
    }
    
    // Check for potentially dangerous characters
    const dangerousCharsRegex = /[<>\\]/;
    if (dangerousCharsRegex.test(trimmedEmail)) {
      setEmailError(t('Email contains invalid characters', 'Имейлът съдържа невалидни знаци'));
      return false;
    }
    
    setEmailError(undefined);
    return true;
  };

  const handleResetPassword = async () => {
    setError(undefined);

    if (!isTurnstileConfigured) {
      setError(t('Password reset is unavailable because CAPTCHA is not configured for this build.', 'Възстановяването на парола не е достъпно, защото CAPTCHA не е конфигурирана за тази версия.'));
      return;
    }

    if (!captchaToken) {
      setError(t('Security verification is still loading. Please try again.', 'Проверката за сигурност още се зарежда. Опитайте отново.'));
      return;
    }
    
    // Sanitize input before validation
    const sanitizedEmail = email.trim();
    
    const isEmailValid = validateEmail(sanitizedEmail);
    
    if (!isEmailValid) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Include captcha token in the options object
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: Platform.OS === 'web' ? `${window.location.origin}/auth/reset-password` : 'greencompass://auth/reset-password',
        captchaToken: captchaToken || undefined,
      });
      
      if (error) {
        resetCaptcha();
        setError(error.message.toLowerCase().includes('captcha')
          ? t('Security verification failed. Please try again.', 'Проверката за сигурност е неуспешна. Опитайте отново.')
          : locale === 'bg' ? 'Заявката не бе успешна. Опитайте отново.' : error.message);
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      resetCaptcha();
      setError(t('An unexpected error occurred. Please try again.', 'Възникна неочаквана грешка. Опитайте отново.'));
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.keyboardAvoidingContainer, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.content, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radii.xl }, isTabletOrLarger && { width: '100%', maxWidth: 520 }]}>
        <AuthBrand />
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{t('Reset your password', 'Възстановяване на парола')}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              {t('We’ll email you a secure link to get back into Green Compass.', 'Ще ви изпратим защитена връзка за достъп до Green Compass.')}
            </Text>
          </View>

          <View style={styles.form}>
            {!isSuccess ? (
              <>
                <Input
                  label={t('Email', 'Имейл')}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('Enter your email', 'Въведете имейла си')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={emailError}
                  onBlur={() => validateEmail(email)}
                  autoComplete="email"
                />

                {/* Invisible Captcha verification */}
                <Turnstile
                  ref={captchaRef}
                  onVerify={(token) => {
                    setCaptchaToken(token);
                    setError(undefined);
                  }}
                  onExpire={() => setCaptchaToken(null)}
                  onError={() => {
                    setCaptchaToken(null);
                    setError(t('Security verification could not load. Check your connection and try again.', 'Проверката за сигурност не можа да се зареди. Проверете връзката си и опитайте отново.'));
                  }}
                />

                {!isTurnstileConfigured && !error ? (
                  <View style={[styles.errorContainer, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.danger, borderWidth: 1 }]}>
                    <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                      {t('Password reset is unavailable because CAPTCHA is not configured for this build.', 'Възстановяването на парола не е достъпно, защото CAPTCHA не е конфигурирана за тази версия.')}
                    </Text>
                  </View>
                ) : null}

                {error && (
                  <View style={[styles.errorContainer, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.danger, borderWidth: 1 }]}>
                    <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
                  </View>
                )}

                <Button
                  title={t('Send Reset Link', 'Изпрати връзка за възстановяване')}
                  onPress={handleResetPassword}
                  loading={loading}
                  disabled={loading || !isTurnstileConfigured || !captchaToken}
                />
              </>
            ) : (
              <View style={[styles.successContainer, { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.success, borderWidth: 1 }]}>
                <Text style={[styles.successText, { color: theme.colors.text }]}>
                  {t('Password reset link sent! Please check your email inbox.', 'Връзката за възстановяване е изпратена. Проверете входящата си поща.')}
                </Text>
                <Button
                  title={t('Back to Login', 'Обратно към вход')}
                  onPress={() => router.push('/auth/signin')}
                  variant="secondary"
                  style={{ marginTop: 24 }}
                />
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
              {t('Remember your password? ', 'Спомнихте си паролата? ')}
              <Text style={[styles.footerLink, { color: theme.colors.primary }]} onPress={() => router.push('/auth/signin')}>{t('Sign in', 'Вход')}</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create<Styles>({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 500,
    padding: 24,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    alignItems: 'stretch',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  successText: {
    color: '#2E7D32',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#555555',
  },
  footerLink: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },

});
