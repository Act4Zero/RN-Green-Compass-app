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
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import profileStyles from '@/styles/Profile.styles';
import useProfileManager from '@/hooks/useProfileManager';

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const isTabletOrLarger = width > 768;
  const [imageLoadError, setImageLoadError] = useState(false);
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const styles = profileStyles;
  
  // Use the profile manager hook
  const {
    profile,
    isLoading,
    error,
    loadProfile,
    getProfileDisplayIdentifier,
    resetProfile,
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
    
    // Reset image error state when component mounts
    setImageLoadError(false);
  }, [user, authLoading, router, profile, isLoading, loadProfile]);



  // Use useFocusEffect to load profile and track screen view only when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Only track screen view once per session
      if (!hasTrackedView) {
        trackProfileView('Profile');
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
    }, [user, authLoading, hasTrackedView, profile, isLoading, trackProfileView, loadProfile])
  );

  const handleEditProfile = () => {
    router.push('/profile/edit' as any);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      resetProfile(); // Clear profile data on sign out
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
  const displayIdentifier = getProfileDisplayIdentifier();

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
