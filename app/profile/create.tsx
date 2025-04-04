import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, ViewStyle, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import ProfileForm from '../components/profile/ProfileForm';
import { createUserProfile, checkProfileExists } from '../services/profileService';
import analyticsService from '../services/analyticsService';
import { useWindowDimensions } from 'react-native';

interface Styles {
  keyboardAvoidingContainer: ViewStyle;
  scrollContent: ViewStyle;
}

export default function CreateProfileScreen() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { user } = useAuth();
  const router = useRouter();

  // Track if we've already tracked this screen view
  const [hasTrackedView, setHasTrackedView] = useState(false);

  // Check if profile already exists, redirect if it does
  const checkProfile = useCallback(async () => {
    if (!user) return;
    
    const exists = await checkProfileExists(user.id);
    if (exists) {
      // Profile already exists, redirect to home
      router.replace('/home');
    }
  }, [user, router]);

  // Use useFocusEffect to check profile and track screen view only when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Only track screen view once per session
      if (!hasTrackedView) {
        analyticsService.trackScreenView('Create Profile');
        setHasTrackedView(true);
      }

      // Check if profile exists when screen comes into focus
      checkProfile();

      return () => {
        // Cleanup function if needed
      };
    }, [checkProfile, hasTrackedView])
  );

  const handleSubmit = async (values: {
    display_name: string;
    is_anonymous: boolean;
    interests: string[];
    avatar?: any;
  }) => {
    if (!user) {
      setError('You must be logged in to create a profile');
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const result = await createUserProfile(user.id, values);
      
      if (result.success) {
        // Track profile creation in analytics
        analyticsService.trackEvent('profile_created', {
          is_anonymous: values.is_anonymous,
          interest_count: values.interests.length,
          has_avatar: !!values.avatar
        });
        
        // Show success message and navigate to home
        Alert.alert('Success', 'Your profile has been created!', [
          { text: 'Continue', onPress: () => router.replace('/home') }
        ]);
      } else {
        setError(result.error || 'Failed to create profile');
      }
    } catch (err) {
      console.error('Error creating profile:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingContainer}
    >
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: 40, alignItems: isTabletOrLarger ? 'center' : 'stretch' }}
      >
      <ProfileForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        initialValues={{
          display_name: user?.email?.split('@')[0] || '',
          is_anonymous: false,
          interests: [],
          avatar_url: null
        }}
      />
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
    padding: 16,
  },
});
