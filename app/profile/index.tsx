import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { fetchUserProfile, getDisplayIdentifier } from '../services/profile';
import { Profile } from '../types/profiles';
import analyticsService from '../services/analyticsService';
import { Ionicons } from '@expo/vector-icons';
import profileStyles from './styles/Profile.styles';

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [imageLoadError, setImageLoadError] = useState(false);
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const styles = profileStyles;

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
    
    // Reset image error state when component mounts
    setImageLoadError(false);
  }, [user, authLoading, router, profile, isLoading, loadProfile]);



  // Use useFocusEffect to load profile and track screen view only when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Only track screen view once per session
      if (!hasTrackedView) {
        analyticsService.trackScreenView('Profile');
        setHasTrackedView(true);
      }

      // Only load profile on focus if we don't have one yet
      // This prevents infinite loops while ensuring data is available
      if (!authLoading && user && !profile && !isLoading) {
        console.log('Loading profile data on screen focus - profile not loaded yet');
        loadProfile();
      }

      return () => {
        // Cleanup function if needed
      };
    }, [user, authLoading, hasTrackedView, profile, isLoading])
  );

  const handleEditProfile = () => {
    router.push('/profile/edit' as any);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      analyticsService.trackEvent('user_signed_out');
      setProfile(null); // Clear profile data on sign out
      router.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Only show loading indicator if we're actually loading and have a user
  // This prevents potential infinite loading states
  if (isLoading && user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!profile) {
    console.log('Profile is null in render, returning null component');
    return null;
  }

  console.log('Rendering profile screen with data:', JSON.stringify(profile, null, 2));
  const displayIdentifier = getDisplayIdentifier(profile);

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
          onPress={() => router.replace('/home')}
        >
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your personal information</Text>
        </View>
      </View>
      <View style={styles.avatarContainer}>
        {profile.avatar_url && !imageLoadError ? (
          <Image 
            source={{ uri: profile.avatar_url }} 
            style={styles.avatar}
            onError={(e) => {
              console.error('Error loading profile image:', e.nativeEvent.error);
              setImageLoadError(true);
              }}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text>{displayIdentifier.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.displayName}>{displayIdentifier}</Text>
          {profile.is_anonymous && (
            <Text style={styles.anonymousIndicator}>Anonymous Mode</Text>
          )}
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Your Sustainability Interests</Text>
      <View style={styles.interestsContainer}>
        {Array.isArray(profile.interests) && profile.interests.length > 0 ? (
          profile.interests.map((interest) => (
            <View key={interest} style={styles.interestItem}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))
        ) : (
          <Text>No interests selected yet.</Text>
        )}
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}
