import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Turnstile from '@/components/Turnstile';
import { ensureValidSession } from '@/lib/supabase';
import analyticsService from '@/services/analyticsService';

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
}

export default function SignIn() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const router = useRouter();
  const { signIn, refreshSession } = useAuth();
  
  // Track screen view when component mounts
  useEffect(() => {
    analyticsService.trackScreenView('SignIn');
  }, []);
  
  // Debug flag - set to true for verbose logging in development
  const DEBUG = __DEV__;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
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
    
    setEmailError(undefined);
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length > 100) {
      setPasswordError('Password is too long');
      return false;
    }
    
    // Check for potentially dangerous characters
    const dangerousCharsRegex = /[<>\\]/;
    if (dangerousCharsRegex.test(password)) {
      setPasswordError('Password contains invalid characters');
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
    setError(undefined);
    
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
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please confirm your email address before signing in.');
        } else {
          setError(error.message);
        }
        return;
      }
      
      // Ensure we have a valid session by explicitly refreshing it
      await ensureValidSession();
      
      // Note: We removed the duplicate refreshSession() call that was here
      // as ensureValidSession() already refreshes the session when needed
      
      // Navigate to home screen
      router.replace('/home');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.content, isTabletOrLarger && { width: '60%', maxWidth: 500 }]}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/GCLogo-no-bg.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue to Green Compass</Text>
          </View>

          <View style={styles.form}>
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

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              isPassword
              error={passwordError}
              onBlur={() => validatePassword(password)}
              autoComplete="password"
            />

            {/* Changed from asChild pattern to avoid ref forwarding warning */}
            <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Invisible Captcha verification */}
            <Turnstile
              onVerify={(token) => {
                setCaptchaToken(token);
                setError(undefined);
              }}
            />

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              title="Login"
              onPress={handleSignIn}
              loading={loading}
              disabled={loading || !captchaToken}
              showSpinnerWhenDisabled={!captchaToken}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              New here?{' '}
              <Text style={styles.footerLink} onPress={() => router.push('/auth/signup')}>Sign Up</Text>
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

});
