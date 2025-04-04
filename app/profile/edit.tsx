import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, ViewStyle, TextStyle } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import ProfileForm from '../components/profile/ProfileForm';
import { fetchUserProfile, updateUserProfile } from '../services/profileService';
import { Profile } from '../types/profiles';
import analyticsService from '../services/analyticsService';

interface Styles {
  container: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
}

export default function EditProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [fetchError, setFetchError] = useState<string | undefined>();
  const { user } = useAuth();
  const router = useRouter();

  // Track if we've already tracked this screen view
  const [hasTrackedView, setHasTrackedView] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!user) {
      router.replace('/auth/signin');
    }
  }, [user, router]);

  // Load profile function with useCallback for memoization
  const loadProfile = useCallback(async () => {
    try {
      if (!user) return;

      // Only set loading to true if we don't already have a profile
      if (!profile) {
        setIsLoading(true);
      }
      
      const profileData = await fetchUserProfile(user.id);
      
      if (profileData) {
        setProfile(profileData);
      } else {
        setFetchError('Profile not found. Please create a profile first.');
        router.replace('/profile/create' as any);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setFetchError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  }, [user, router, profile]);

  // Use useFocusEffect to load profile and track screen view only when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Only track screen view once per session
      if (!hasTrackedView) {
        analyticsService.trackScreenView('Edit Profile');
        setHasTrackedView(true);
      }

      // Load profile data when screen comes into focus
      loadProfile();

      return () => {
        // Cleanup function if needed
      };
    }, [loadProfile, hasTrackedView])
  );

  const handleSubmit = async (values: {
    display_name: string;
    is_anonymous: boolean;
    interests: string[];
    avatar?: any;
  }) => {
    if (!user) {
      setError('You must be logged in to update your profile');
      return;
    }

    setIsSaving(true);
    setError(undefined);

    try {
      const result = await updateUserProfile(user.id, values);
      
      if (result.success) {
        // Track profile update in analytics
        analyticsService.trackEvent('profile_updated', {
          is_anonymous: values.is_anonymous,
          interest_count: values.interests.length,
          has_new_avatar: !!values.avatar
        });
        
        // Show success message
        Alert.alert('Success', 'Your profile has been updated!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (fetchError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{fetchError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {profile && (
        <ProfileForm
          initialValues={{
            display_name: profile.display_name || '',
            is_anonymous: profile.is_anonymous,
            interests: profile.interests || [],
            avatar_url: profile.avatar_url
          }}
          onSubmit={handleSubmit}
          isLoading={isSaving}
          error={error}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
  },
});
