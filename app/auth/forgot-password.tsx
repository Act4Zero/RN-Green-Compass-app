import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Image,
  ImageStyle,
  ViewStyle,
  TextStyle,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import supabase from '@/lib/supabase';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Turnstile from '@/components/Turnstile';
import { useAppTheme } from '@/theme';

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

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [isSuccess, setIsSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    // Trim the email to remove any leading/trailing whitespace
    const trimmedEmail = email.trim();
    
    // Strict email regex that only allows standard email format
    const emailRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]{0,61}[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
    
    if (!trimmedEmail) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address');
      return false;
    } else if (trimmedEmail.length > 255) {
      setEmailError('Email is too long');
      return false;
    }
    
    // Check for potentially dangerous characters
    const dangerousCharsRegex = /[<>\\]/;
    if (dangerousCharsRegex.test(trimmedEmail)) {
      setEmailError('Email contains invalid characters');
      return false;
    }
    
    setEmailError(undefined);
    return true;
  };

  const handleResetPassword = async () => {
    setError(undefined);
    
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
        redirectTo: 'greencompass://reset-password',
        captchaToken: captchaToken || undefined,
      });
      
      if (error) {
        setError(error.message);
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
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
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/GCLogo-rich-premium-original-shape.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Reset your password</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
              We’ll email you a secure link to get back into Green Compass.
            </Text>
          </View>

          <View style={styles.form}>
            {!isSuccess ? (
              <>
                <Input
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={emailError}
                  onBlur={() => validateEmail(email)}
                  autoComplete="email"
                />

                {/* Invisible Captcha verification */}
                <Turnstile
                  onVerify={(token) => {
                    setCaptchaToken(token);
                    setError(undefined);
                  }}
                />

                {error && (
                  <View style={[styles.errorContainer, { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.danger, borderWidth: 1 }]}>
                    <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
                  </View>
                )}

                <Button
                  title="Send Reset Link"
                  onPress={handleResetPassword}
                  loading={loading}
                  disabled={loading || !captchaToken}
                  showSpinnerWhenDisabled={!captchaToken}
                />
              </>
            ) : (
              <View style={[styles.successContainer, { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.success, borderWidth: 1 }]}>
                <Text style={[styles.successText, { color: theme.colors.text }]}>
                  Password reset link sent! Please check your email inbox.
                </Text>
                <Button
                  title="Back to Login"
                  onPress={() => router.push('/auth/signin')}
                  variant="secondary"
                  style={{ marginTop: 24 }}
                />
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
              Remember your password?{' '}
              <Text style={[styles.footerLink, { color: theme.colors.primary }]} onPress={() => router.push('/auth/signin')}>Sign in</Text>
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
