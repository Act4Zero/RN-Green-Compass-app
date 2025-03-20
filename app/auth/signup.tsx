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
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Turnstile from '../components/Turnstile';
import { Ionicons } from '@expo/vector-icons';
import supabase, { ensureValidSession } from '../lib/supabase';

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
}

export default function SignUp() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const router = useRouter();
  const { signUp, refreshSession } = useAuth();
  
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
    if (name && name.length < 2) {
      setFullNameError('Name is too short');
      return false;
    }
    setFullNameError(undefined);
    return true;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
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
    
    const isFullNameValid = validateFullName(fullName);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const areTermsAccepted = validateTerms();
    
    if (!isEmailValid || !isPasswordValid || !areTermsAccepted || !isFullNameValid) {
      return;
    }
    
    setLoading(true);
    
    try {
      // First attempt at signup
      const { data, error } = await signUp(email, password, captchaToken || undefined);
      
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
      
      if (DEBUG) console.log('Successfully signed up:', data?.user?.email);
      
      // For new users, explicitly check if we have a session
      if (!data?.session) {
        if (DEBUG) console.log('No session returned after signup - attempting to create one');
        
        // Try to sign in immediately after signup to establish a session
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) {
          if (DEBUG) console.warn('Auto sign-in after signup failed:', signInError.message);
        } else if (signInData.session) {
          if (DEBUG) console.log('Auto sign-in after signup successful');
          
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
        if (DEBUG) console.warn('Session refresh after signup failed:', refreshError.message);
        // Continue anyway as this is just an extra precaution
      }
      
      // Final verification of session existence
      const { data: finalSessionCheck } = await supabase.auth.getSession();
      if (!finalSessionCheck.session) {
        if (DEBUG) console.warn('Still no session after all attempts - user may need to sign in manually');
      } else {
        if (DEBUG) console.log('Final session check successful - user is authenticated');
      }
      
      // If fullName is provided, we would update the user profile here
      // This would typically be done in a separate function that calls the Supabase profiles table
      if (fullName) {
        if (DEBUG) console.log('Would update profile with name:', fullName);
        // Future implementation: Update user profile with fullName
      }
      
      // Show success message and navigate to success screen
      router.push('/auth/signup-success');
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
      style={styles.keyboardAvoidingContainer}
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Green Compass and start your sustainability journey</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name (optional)"
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
              <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                {termsAccepted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkboxText}>
                I agree to the{' '}
                <Text 
                  style={styles.checkboxLink} 
                  onPress={() => Linking.openURL('https://www.greencompass.app/tos')}
                >
                  Terms of Service
                </Text> and{' '}
                <Text 
                  style={styles.checkboxLink} 
                  onPress={() => Linking.openURL('https://www.greencompass.app/privacy')}
                >
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>
            {termsError && <Text style={styles.errorText}>{termsError}</Text>}

            {/* Invisible Captcha verification */}
            <Turnstile
              onVerify={(token) => {
                setCaptchaToken(token);
                setError(null);
              }}
            />

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
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
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text style={styles.footerLink} onPress={() => router.push('/auth/signin')}>Login</Text>
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
