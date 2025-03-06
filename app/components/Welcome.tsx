import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  useWindowDimensions,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { Link } from 'expo-router';
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

  const handleGoogleSignIn = () => {
    // Will be implemented with Supabase social auth
    console.log('Google sign in pressed');
  };

  const handleAppleSignIn = () => {
    // Will be implemented with Supabase social auth
    console.log('Apple sign in pressed');
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
          <Link href="/signup" asChild>
            <Button title="Sign Up" variant="primary" onPress={() => {}} />
          </Link>

          <Link href="/signin" asChild>
            <Button title="Login" variant="outline" onPress={() => {}} />
          </Link>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <SocialButton provider="google" onPress={handleGoogleSignIn} />
          <SocialButton provider="apple" onPress={handleAppleSignIn} />
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
