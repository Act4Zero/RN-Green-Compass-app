import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import supabase from '@/lib/supabase';
import analyticsService from '@/services/analyticsService';

// This component handles OAuth redirects
export default function AuthCallback() {
  const { refreshSession } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Track the OAuth callback event
        analyticsService.trackEvent('oauth_callback_received');
        
        // The URL contains auth credentials after successful sign-in
        // Let Supabase handle the callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error.message);
          // Redirect to sign in page with error message
          router.replace({
            pathname: '/auth/signin',
            params: { error: 'Authentication failed. Please try again.' }
          });
          return;
        }
        
        if (data?.session) {
          // Track login event in Google Analytics
          analyticsService.trackLogin('google');
          if (data.session.user.id) {
            analyticsService.setUserId(data.session.user.id);
          }
          
          // Ensure session is properly refreshed
          await refreshSession();
          
          // Redirect to home page
          router.replace('/home');
        } else {
          // No session found, redirect to sign in
          router.replace('/auth/signin');
        }
      } catch (error) {
        console.error('Error in OAuth callback:', error);
        router.replace('/auth/signin');
      }
    };

    handleOAuthCallback();
  }, [router, refreshSession]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  text: {
    fontSize: 16,
    color: '#2E7D32',
    marginBottom: 16,
  },
});
