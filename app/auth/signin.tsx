import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Image,
  ImageStyle,
  ViewStyle,
  TextStyle,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useAppLocale } from '@/context/AppLocaleContext';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Turnstile, { isTurnstileConfigured, TurnstileHandle } from '@/components/Turnstile';
import { isSupabaseConfigured } from '@/lib/supabase';
import analyticsService from '@/services/analyticsService';
import { useAppTheme } from '@/theme';
import { AuthBrand } from '@/components/ui/AuthBrand';
import { goBackOrReplace, sanitizeInternalDestination } from '@/utils/navigation';
import { signInErrorMessage } from '@/utils/authErrors';

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
  forgotPassword: TextStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  footer: ViewStyle;
  footerText: TextStyle;
  footerLink: TextStyle;
  dividerContainer: ViewStyle;
  divider: ViewStyle;
  dividerText: TextStyle;
  googleButtonNative: ViewStyle;
  googleButtonImage: ImageStyle;
  googleButtonText: TextStyle;
  authActions: ViewStyle;
  actionButton: ViewStyle;
  actionText: TextStyle;
}

export default function SignIn() {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const router = useRouter();
  const { next, error: routeError } = useLocalSearchParams<{ next?: string; error?: string }>();
  const destination = sanitizeInternalDestination(next);
  const { signIn, signInWithGoogle } = useAuth();
  const { locale, setLocale, t } = useAppLocale();
  
  // Track screen view when component mounts
  useEffect(() => {
    analyticsService.trackScreenView('SignIn');
  }, []);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState(false);
  const captchaRef = useRef<TurnstileHandle>(null);

  const resetCaptcha = () => {
    setCaptchaToken(null);
    setCaptchaError(false);
    captchaRef.current?.reset();
  };

  useEffect(() => {
    if (routeError) setError(routeError);
  }, [routeError]);

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
    
    setEmailError(undefined);
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError(t('Password is required', 'Паролата е задължителна'));
      return false;
    }
    
    setPasswordError(undefined);
    return true;
  };

  // Add back button handler to prevent accidental navigation during signin process
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (loading) {
        // Prevent back navigation during loading
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [loading]);

  const handleSignIn = async () => {
    if (loading || googleLoading) return;
    setError(undefined);

    if (!isSupabaseConfigured) {
      setError(t('Sign in is temporarily unavailable. Please try again after the app configuration is restored.', 'Входът временно не е достъпен. Опитайте отново след възстановяване на конфигурацията на приложението.'));
      return;
    }

    if (!isTurnstileConfigured) {
      setError(t(
        'Sign in is unavailable because CAPTCHA is not configured for this build.',
        'Входът не е достъпен, защото CAPTCHA не е конфигурирана за тази версия на приложението.',
      ));
      return;
    }

    if (!captchaToken) {
      setError(t('Security verification is still loading. Please try again.', 'Проверката за сигурност още се зарежда. Опитайте отново.'));
      return;
    }
    
    // Sanitize inputs before validation
    const sanitizedEmail = email.trim();
    
    const isEmailValid = validateEmail(sanitizedEmail);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    setLoading(true);
    
    try {
      // First attempt at signin
      const { data, error } = await signIn(sanitizedEmail, password, captchaToken || undefined);
      
      if (error) {
        resetCaptcha();
        setError(signInErrorMessage(error, t));
        return;
      }
      
      if (!data?.session) {
        resetCaptcha();
        setError(t('Sign in did not complete. Please try again.', 'Входът не завърши. Опитайте отново.'));
        return;
      }

      router.replace(destination as any);
    } catch (err) {
      resetCaptcha();
      setError(signInErrorMessage(err instanceof Error ? err : new Error('Unknown sign-in error'), t));
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      if (!isSupabaseConfigured) {
        setError(t('Sign in is temporarily unavailable. Please try again after the app configuration is restored.', 'Входът временно не е достъпен. Опитайте отново след възстановяване на конфигурацията на приложението.'));
        return;
      }
      setGoogleLoading(true);
      setError(undefined);
      
      const { error } = await signInWithGoogle(destination);
      
      if (error) {
        setError(t('Failed to start Google sign in. Please try again.', 'Входът с Google не можа да започне. Опитайте отново.'));
        console.error('Google sign in error:', error);
      }
      
      // Note: For OAuth we don't navigate here - the user will be redirected and handled by the OAuth flow
      // The deep link handler will manage the redirect to the home screen
    } catch (err) {
      setError(t('An unexpected error occurred with Google sign in.', 'Възникна неочаквана грешка при вход с Google.'));
      console.error('Google sign in error:', err);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.keyboardAvoidingContainer, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.content, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radii.xl }, theme.shadows.raised, isTabletOrLarger && { width: '60%', maxWidth: 520 }]}>
          <View style={styles.authActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => goBackOrReplace(router, '/more')}
              accessibilityRole="button"
              accessibilityLabel={t('Back', 'Назад')}
            >
              <Ionicons name="arrow-back" size={19} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.primary }]}>{t('Back', 'Назад')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => void setLocale(locale === 'bg' ? 'en' : 'bg')}
              accessibilityRole="button"
              accessibilityLabel={t('Switch language', 'Смени езика')}
            >
              <Text style={[styles.actionText, { color: theme.colors.primary }]}>{locale === 'bg' ? 'EN' : 'BG'}</Text>
            </TouchableOpacity>
          </View>
        <AuthBrand />

          <View style={styles.header}>
            <Text style={[styles.title, theme.typography.h1, { color: theme.colors.text }]}>{t('Welcome back', 'Радваме се, че си тук 👋')}</Text>
            <Text style={[styles.subtitle, theme.typography.body, { color: theme.colors.textMuted }]}>{t('Continue building a greener everyday.', 'Влез и продължи своята зелена история.')}</Text>
          </View>

          <View style={styles.form}>
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

            <Input
              label={t('Password', 'Парола')}
              value={password}
              onChangeText={setPassword}
              placeholder={t('Enter your password', 'Въведете паролата си')}
              isPassword
              error={passwordError}
              onBlur={() => validatePassword(password)}
              autoComplete="password"
            />

            {/* Changed from asChild pattern to avoid ref forwarding warning */}
            <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
              <Text style={[styles.forgotPassword, { color: theme.colors.primary }]}>{t('Forgot password?', 'Забравена парола?')}</Text>
            </TouchableOpacity>

            <Turnstile
              ref={captchaRef}
              onVerify={(token) => {
                setCaptchaToken(token);
                setCaptchaError(false);
              }}
              onExpire={() => setCaptchaToken(null)}
              onError={() => {
                setCaptchaToken(null);
                setCaptchaError(true);
              }}
            />

            {isTurnstileConfigured && !captchaToken && (
              <View style={{ gap: 8, marginVertical: 12 }}>
                <Text accessibilityLiveRegion="polite" style={{ color: captchaError ? theme.colors.danger : theme.colors.textMuted, textAlign: 'center' }}>
                  {captchaError
                    ? t('The security check could not finish. Check your connection and try again.', 'Проверката за сигурност не завърши. Проверете връзката си и опитайте отново.')
                    : t('Preparing secure sign in…', 'Подготвяме сигурния вход…')}
                </Text>
                {captchaError && (
                  <TouchableOpacity onPress={resetCaptcha} accessibilityRole="button" style={{ minHeight: 44, justifyContent: 'center' }}>
                    <Text style={{ color: theme.colors.primary, textAlign: 'center', fontWeight: '700' }}>{t('Retry verification', 'Повтори проверката')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {(!isSupabaseConfigured || !isTurnstileConfigured) && !error ? (
              <View style={[styles.errorContainer, { backgroundColor: theme.colors.primarySoft }]}>
                <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                  {!isSupabaseConfigured
                    ? t('Sign in is temporarily unavailable. Please try again later.', 'Входът временно не е достъпен. Опитайте отново по-късно.')
                    : t(
                      'Email sign in is temporarily unavailable in this version. You can use Google below.',
                      'Входът с имейл временно не е достъпен в тази версия. Може да използвате Google по-долу.',
                    )}
                </Text>
              </View>
            ) : null}

            {error && (
              <View style={[styles.errorContainer, { backgroundColor: theme.colors.primarySoft }]}>
                <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
              </View>
            )}

            <Button
              title={t('Login', 'Вход')}
              onPress={handleSignIn}
              loading={loading}
              disabled={loading || googleLoading || !isSupabaseConfigured || !isTurnstileConfigured || !captchaToken}
            />

            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>{t('or', 'или')}</Text>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            </View>

            {googleLoading ? (
              <View style={{ marginTop: 16, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#DB4437" />
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.googleButtonNative, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderStrong, borderRadius: theme.radii.md }]}
                onPress={handleGoogleSignIn}
                activeOpacity={0.85}
                disabled={googleLoading || !isSupabaseConfigured}
                accessibilityRole="button"
                accessibilityLabel={t('Sign in with Google', 'Вход с Google')}
              >
                <Image
                  source={require('../../assets/images/google-logo.png')}
                  style={styles.googleButtonImage}
                  resizeMode="contain"
                  accessible
                  accessibilityLabel={t('Google logo', 'Лого на Google')}
                />
                <Text style={[styles.googleButtonText, { color: theme.colors.text }]}>{t('Sign in with Google', 'Вход с Google')}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
              {t('New here?', 'Нямате профил?')}{' '}
              <Text style={[styles.footerLink, { color: theme.colors.primary }]} onPress={() => router.push({ pathname: '/auth/signup', params: { next: destination } })}>{t('Create an account', 'Създайте профил')}</Text>
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
  authActions: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
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
  forgotPassword: {
    color: '#2E7D32',
    textAlign: 'right',
    marginTop: -8,
    marginBottom: 24,
    fontSize: 14,
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#757575',
    fontSize: 14,
  },
  googleButtonNative: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
  googleButtonImage: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
    letterSpacing: 0.2,
  },

});
