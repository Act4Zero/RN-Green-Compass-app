import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';
import Button from './components/Button';
import Input from './components/Input';
import SocialButton from './components/SocialButton';
import { Ionicons } from '@expo/vector-icons';

interface Styles {
  container: ViewStyle;
  content: ViewStyle;
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
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);

  const validateFullName = (name: string) => {
    if (name && name.length < 2) {
      setFullNameError('Name is too short');
      return false;
    }
    setFullNameError(null);
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
    setEmailError(null);
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
    setPasswordError(null);
    return true;
  };

  const validateTerms = () => {
    if (!termsAccepted) {
      setTermsError('You must accept the Terms and Privacy Policy');
      return false;
    }
    setTermsError(null);
    return true;
  };

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
      const { error } = await signUp(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        // Show success message and navigate to success screen
        router.push('/signup-success');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    // Will be implemented with Supabase social auth
    console.log('Google sign up pressed');
  };

  const handleAppleSignUp = () => {
    // Will be implemented with Supabase social auth
    console.log('Apple sign up pressed');
  };

  const toggleTerms = () => {
    setTermsAccepted(!termsAccepted);
    if (termsError) validateTerms();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.content, isTabletOrLarger && { width: '60%', maxWidth: 500 }]}>
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
                <Text style={styles.checkboxLink}>Terms of Service</Text> and{' '}
                <Text style={styles.checkboxLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {termsError && <Text style={styles.errorText}>{termsError}</Text>}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              title="Sign Up"
              onPress={handleSignUp}
              loading={loading}
              disabled={loading}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <SocialButton provider="google" onPress={handleGoogleSignUp} />
            <SocialButton provider="apple" onPress={handleAppleSignUp} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Link href="/signin" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Login</Text>
                </TouchableOpacity>
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    padding: 24,
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
