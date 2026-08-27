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
  Linking,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Turnstile from '@/components/Turnstile';
import { Ionicons } from '@expo/vector-icons';
import supabase, { ensureValidSession } from '@/lib/supabase';
import analyticsService from '@/services/analyticsService';
import { useAppTheme } from '@/theme';
import { sanitizeInternalDestination } from '@/utils/navigation';

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
  checkboxContainer: ViewStyle;
  checkbox: ViewStyle;
  checkboxChecked: ViewStyle;
  checkboxText: TextStyle;
  checkboxLink: TextStyle;
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
}

export default function SignUp() {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const destination = sanitizeInternalDestination(next);
  const { signUp, refreshSession, signInWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  // Handler for Google sign up
  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true);
      await signInWithGoogle(destination);
    } catch (error) {
      // Optionally show error feedback
      console.error('Google sign up error:', error);
    } finally {
      setGoogleLoading(false);
    }
  };
  
  // Track screen view when component mounts
  useEffect(() => {
    analyticsService.trackScreenView('SignUp');
  }, []);
  
  // Debug flag - set to true for verbose logging in development
  const DEBUG = __DEV__;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullNameError, setFullNameError] = useState<string | undefined>(undefined);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [termsError, setTermsError] = useState<string | undefined>(undefined);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const validateFullName = (name: string) => {
    // Trim the name to remove any leading/trailing whitespace
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setFullNameError('Name is required');
      return false;
    } else if (trimmedName.length < 2) {
      setFullNameError('Name is too short');
      return false;
    } else if (trimmedName.length > 100) {
      setFullNameError('Name is too long');
      return false;
    }
    
    // Check for potentially dangerous characters or script tags
    const dangerousCharsRegex = /[<>\\]/;
    if (dangerousCharsRegex.test(trimmedName)) {
      setFullNameError('Name contains invalid characters');
      return false;
    }
    
    // Only allow letters, spaces, hyphens, and apostrophes in names
    const nameRegex = /^[\p{L}\s\-']+$/u;
    if (!nameRegex.test(trimmedName)) {
      setFullNameError('Name contains invalid characters');
      return false;
    }
    
    setFullNameError(undefined);
    return true;
  };

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
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
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
    
    // Enforce password strength
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (!(hasUpperCase && hasLowerCase && (hasNumbers || hasSpecialChars))) {
      setPasswordError('Password must include uppercase, lowercase, and numbers or special characters');
      return false;
    }
    
    setPasswordError(undefined);
    return true;
  };

  const validateTerms = () => {
    if (!termsAccepted) {
      setTermsError('You must accept the Terms and Privacy Policy');
      return false;
    }
    setTermsError(undefined);
    return true;
  };

  // Add back button handler to prevent accidental navigation during signup process
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

  const handleSignUp = async () => {
    setError(null);
    
    // Sanitize inputs before validation
    const sanitizedFullName = fullName.trim();
    const sanitizedEmail = email.trim();
    
    const isFullNameValid = validateFullName(sanitizedFullName);
    const isEmailValid = validateEmail(sanitizedEmail);
    const isPasswordValid = validatePassword(password);
    const areTermsAccepted = validateTerms();
    
    if (!isEmailValid || !isPasswordValid || !areTermsAccepted || !isFullNameValid) {
      return;
    }
    
    setLoading(true);
    
    try {
      // First attempt at signup
      const { data, error } = await signUp(sanitizedEmail, password, captchaToken || undefined);
      
      if (error) {
        if (error.message.includes('already registered')) {
          setError('This email is already registered. Please use a different email or try signing in.');
        } else if (error.message.includes('password')) {
          setError('Password is too weak. Please use a stronger password with at least 8 characters.');
        } else {
          setError(error.message);
        }
        return;
      }
      
      // For new users, explicitly check if we have a session
      if (!data?.session) {
        // Try to sign in immediately after signup to establish a session
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password
        });
        
        if (signInError) {
          setError('An unexpected error occurred. Please try again.');
          console.error('Auto sign-in after signup failed:', signInError);
          return;
        } else if (signInData.session) {
          // Explicitly set the session to ensure it's properly stored
          await supabase.auth.setSession({
            access_token: signInData.session.access_token,
            refresh_token: signInData.session.refresh_token
          });
        }
      }
      
      // Ensure we have a valid session by explicitly refreshing it
      await ensureValidSession();
      
      // Double-check session state with a manual refresh
      const { error: refreshError } = await refreshSession();
      if (refreshError) {
        setError('An unexpected error occurred. Please try again.');
        console.error('Session refresh after signup failed:', refreshError);
        return;
      }
      
      // Final verification of session existence
      const { data: finalSessionCheck } = await supabase.auth.getSession();
      if (!finalSessionCheck.session) {
        setError('An unexpected error occurred. Please try again.');
        console.warn('Still no session after all attempts - user may need to sign in manually');
        return;
      }
      
      // If fullName is provided, we would update the user profile here
      // This would typically be done in a separate function that calls the Supabase profiles table
      if (fullName) {
        // Future implementation: Update user profile with fullName
      }
      
      // Confirmed projects return a session immediately; email-confirmation projects
      // continue through the success screen while preserving the requested map route.
      router.replace((finalSessionCheck.session
        ? destination
        : { pathname: '/auth/signup-success', params: { next: destination } }) as any);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTerms = () => {
    setTermsAccepted(!termsAccepted);
    if (termsError) validateTerms();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.keyboardAvoidingContainer, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.content, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: theme.radii.xl }, theme.shadows.raised, isTabletOrLarger && { width: '60%', maxWidth: 540 }]}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/GCLogo-rich-premium-original-shape.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
          
          <View style={styles.header}>
            <Text style={[styles.title, theme.typography.h1, { color: theme.colors.text }]}>Create your account</Text>
            <Text style={[styles.subtitle, theme.typography.body, { color: theme.colors.textMuted }]}>Start with one action and build momentum that lasts.</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              error={fullNameError}
              onBlur={() => validateFullName(fullName)}
              autoComplete="name"
            />

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
              placeholder="Create a password"
              isPassword
              showPasswordStrength
              error={passwordError}
              onBlur={() => validatePassword(password)}
              autoComplete="password"
            />

            <TouchableOpacity 
              style={styles.checkboxContainer} 
              onPress={toggleTerms}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, { borderColor: theme.colors.primary }, termsAccepted && styles.checkboxChecked, termsAccepted && { backgroundColor: theme.colors.primary }]}>
                {termsAccepted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
              <Text style={[styles.checkboxText, { color: theme.colors.textMuted }]}>
                I agree to the{' '}
                <Text 
                  style={[styles.checkboxLink, { color: theme.colors.primary }]}
                  onPress={() => Linking.openURL('https://www.greencompass.app/tos')}
                >
                  Terms of Service
                </Text> and{' '}
                <Text 
                  style={[styles.checkboxLink, { color: theme.colors.primary }]}
                  onPress={() => Linking.openURL('https://www.greencompass.app/privacy')}
                >
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>
            {termsError && <Text style={[styles.errorText, { color: theme.colors.danger }]}>{termsError}</Text>}

            {/* Invisible Captcha verification */}
            <Turnstile
              onVerify={(token) => {
                setCaptchaToken(token);
                setError(null);
              }}
            />

            {error && (
              <View style={[styles.errorContainer, { backgroundColor: theme.colors.primarySoft }]}>
                <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
              </View>
            )}

            <Button
              title="Sign Up"
              onPress={handleSignUp}
              loading={loading}
              disabled={loading || !captchaToken}
              showSpinnerWhenDisabled={!captchaToken}
            />

            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>or</Text>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            </View>

            {/* Sign up with Google button */}
            {googleLoading ? (
              <View style={{ marginTop: 16, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#DB4437" />
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.googleButtonNative, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderStrong, borderRadius: theme.radii.md }]}
                onPress={handleGoogleSignUp}
                activeOpacity={0.85}
                disabled={googleLoading}
                accessibilityRole="button"
                accessibilityLabel="Sign up with Google"
              >
                <Image
                  source={require('../../assets/images/google-logo.png')}
                  style={styles.googleButtonImage}
                  resizeMode="contain"
                  accessible
                  accessibilityLabel="Google logo"
                />
                <Text style={[styles.googleButtonText, { color: theme.colors.text }]}>Sign up with Google</Text>
              </TouchableOpacity>
            )}

          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
              Already have an account?{' '}
              <Text style={[styles.footerLink, { color: theme.colors.primary }]} onPress={() => router.push({ pathname: '/auth/signin', params: { next: destination } })}>Sign in</Text>
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2E7D32',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2E7D32',
  },
  checkboxText: {
    fontSize: 14,
    color: '#555555',
    flex: 1,
  },
  checkboxLink: {
    color: '#2E7D32',
    fontWeight: '500',
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
    marginTop: 4,
    marginBottom: 16,
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
    fontWeight: '500',
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
