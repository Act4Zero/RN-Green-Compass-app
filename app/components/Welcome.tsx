import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  useWindowDimensions,
  ViewStyle,
  TextStyle,
  ImageStyle,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import SocialButton from './SocialButton';

interface Styles {
  container: ViewStyle;
  content: ViewStyle;
  logoContainer: ViewStyle;
  logo: ImageStyle;
  title: TextStyle;
  subtitle: TextStyle;
  buttonContainer: ViewStyle;
  dividerContainer: ViewStyle;
  divider: ViewStyle;
  dividerText: TextStyle;
}

const Welcome: React.FC = () => {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    
    try {
      const { data, error } = await signInWithGoogle();
      
      if (error) {
        if (error.message.includes('cancelled')) {
          console.log('Google sign in was cancelled');
          // Don't show error for user cancellation
        } else {
          console.error('Google sign in error:', error.message);
          setError('Failed to sign in with Google. Please try again.');
        }
      } else if (data?.user) {
        console.log('Successfully signed in with Google:', data.user.email);
        router.replace('/home');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Google sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.content, isTabletOrLarger && { width: '60%', maxWidth: 500 }]}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/GCLogo-no-bg.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Green Compass</Text>
        <Text style={styles.subtitle}>
          Your personal guide to sustainable living and reducing your carbon footprint
        </Text>

        <View style={styles.buttonContainer}>
          <Button 
            title="Sign Up" 
            variant="primary" 
            onPress={() => router.push('/signup')} 
          />

          <Button 
            title="Login" 
            variant="outline" 
            onPress={() => router.push('/signin')} 
          />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <SocialButton 
            provider="google" 
            onPress={handleGoogleSignIn} 
            disabled={loading}
          />
          
          {loading && (
            <View style={{ marginTop: 10, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#2E7D32" />
            </View>
          )}
          
          {error && (
            <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>
              {error}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

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
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
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

export default Welcome;
