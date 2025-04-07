import React, { useState, useEffect, useCallback } from 'react';
import { View, Alert, ActivityIndicator, Text, ScrollView, KeyboardAvoidingView, Platform, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import ProfileForm from './components/ProfileForm';
import { Ionicons } from '@expo/vector-icons';
import profileEditStyles from '../profile/styles/ProfileEdit.styles';
import useProfileManager from '../hooks/useProfileManager';

export default function EditProfileScreen() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const [fetchError, setFetchError] = useState<string | undefined>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const styles = profileEditStyles;

  // Track if we've already tracked this screen view
  const [hasTrackedView, setHasTrackedView] = useState(false);
  
  // Use the profile manager hook
  const {
    profile,
    isLoading,
    isSaving,
    error,
    loadProfile,
    updateProfile,
    trackProfileView
  } = useProfileManager();



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
        trackProfileView('Edit Profile');
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
    }, [hasTrackedView, profile, isLoading, user, trackProfileView, loadProfile])
  );

  const handleSubmit = async (values: {
    display_name: string;
    is_anonymous: boolean;
    interests: string[];
    avatar?: any;
  }) => {
    const result = await updateProfile(values);
    
    if (result.success) {
      // Show success message and navigate back to profile screen
      Alert.alert('Success', 'Your profile has been updated!', [
        { text: 'OK', onPress: () => {
          // Small timeout to ensure the alert is dismissed before navigation
          setTimeout(() => {
            router.replace('/profile');
          }, 100);
        }}
      ]);
    } else {
      // Error is already set in the hook
      console.error('Error updating profile:', result.error);
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
      <View style={styles.pageContainer}>
      <View style={styles.pageHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.replace('/profile')}
            >
              <Ionicons name="arrow-back" size={24} color="#2E7D32" />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>Edit Profile</Text>
              <Text style={styles.subtitle}>Update your personal information</Text>
            </View>
          </View>
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
    </ScrollView>
    </KeyboardAvoidingView>
  );
}
