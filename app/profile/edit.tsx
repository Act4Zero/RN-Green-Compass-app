import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, ViewStyle, TextStyle, ScrollView, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import ProfileForm from '../components/profile/ProfileForm';
import { fetchUserProfile, updateUserProfile } from '../services/profileService';
import { Profile } from '../types/profiles';
import analyticsService from '../services/analyticsService';

interface Styles {
  keyboardAvoidingContainer: ViewStyle;
  scrollContent: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
}

export default function EditProfileScreen() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [fetchError, setFetchError] = useState<string | undefined>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Track if we've already tracked this screen view
  const [hasTrackedView, setHasTrackedView] = useState(false);

  // Define loadProfile as a regular function to avoid dependency cycles
    const loadProfile = async () => {
      try {
        if (!user) {
          console.log('No user available to load profile');
          return;
        }
  
        // Only set loading to true if we don't already have a profile
        if (!profile) {
          setIsLoading(true);
        }
        
        // Fetch profile data
        console.log('Fetching profile data for user:', user.id);
        const profileData = await fetchUserProfile(user.id);
        
        if (profileData) {
          console.log('Profile data received:', JSON.stringify(profileData, null, 2));
          
          // Ensure all required fields are present with defaults if needed
          // Parse interests if it's a string (this is a backup in case it wasn't parsed in profileService)
          let interests = profileData.interests || [];
          if (typeof interests === 'string') {
            try {
              interests = JSON.parse(interests);
              console.log('Parsed interests in component from string to array:', interests);
            } catch (parseErr) {
              console.error('Error parsing interests JSON string in component:', parseErr);
              interests = [];
            }
          }
          
          const processedProfile = {
            ...profileData,
            display_name: profileData.display_name || '',
            interests: interests,
            avatar_url: profileData.avatar_url || null,
            is_anonymous: typeof profileData.is_anonymous === 'boolean' ? profileData.is_anonymous : false
          };
          
          console.log('Processed profile data:', JSON.stringify(processedProfile, null, 2));
          setProfile(processedProfile);
          console.log('Profile state updated with processed data');
        } else {
          console.warn('No profile data returned from fetchUserProfile');
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

  // Redirect to signin if user is not authenticated
    useEffect(() => {
      // Only check after auth loading is complete
      if (!authLoading && !user) {
        console.log('No authenticated user found in profile, redirecting to signin');
        router.replace('/auth/signin');
      } else if (!authLoading && user) {
        console.log('Authenticated user in profile:', user.id);
        // Initial profile load when component mounts and user is authenticated
        // Only load if we don't already have the profile
        if (!profile && !isLoading) {
          loadProfile();
        }
      }
    }, [user, authLoading, router, profile, isLoading, loadProfile]);

  // Use useFocusEffect to load profile and track screen view only when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Only track screen view once per session
      if (!hasTrackedView) {
        analyticsService.trackScreenView('Edit Profile');
        setHasTrackedView(true);
      }

      // Only load profile on focus if we don't have one yet
      // This prevents infinite loops while ensuring data is available
      if (user && !profile && !isLoading) {
        console.log('Loading profile data on edit screen focus - profile not loaded yet');
        loadProfile();
      }

      return () => {
        // Cleanup function if needed
      };
    }, [hasTrackedView, profile, isLoading, user])
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
        
        // Clear the profile from state to force a fresh fetch
        setProfile(null);
        
        // Explicitly reload the profile after successful update
        loadProfile();
        
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

  // Only show loading indicator if we're actually loading and have a user
  // This prevents the infinite loading state when there's no user yet
  if (isLoading && user) {
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingContainer}
    >
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: 40, alignItems: isTabletOrLarger ? 'center' : 'stretch' }}
      >
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
