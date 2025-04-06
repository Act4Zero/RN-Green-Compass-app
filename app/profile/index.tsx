import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
  ViewStyle,
  TextStyle,
  ImageStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { fetchUserProfile, getDisplayIdentifier } from '../services/profileService';
import { Profile } from '../types/profiles';
import analyticsService from '../services/analyticsService';

interface Styles {
  keyboardAvoidingContainer: ViewStyle;
  scrollContent: ViewStyle;
  header: ViewStyle;
  avatarContainer: ViewStyle;
  avatar: ImageStyle;
  avatarPlaceholder: ViewStyle;
  nameContainer: ViewStyle;
  displayName: TextStyle;
  anonymousIndicator: TextStyle;
  editButton: ViewStyle;
  editButtonText: TextStyle;
  sectionTitle: TextStyle;
  interestsContainer: ViewStyle;
  interestItem: ViewStyle;
  interestText: TextStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  signOutButton: ViewStyle;
  signOutButtonText: TextStyle;
}

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
        const processedProfile = {
          ...profileData,
          display_name: profileData.display_name || '',
          interests: profileData.interests || [],
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
      <View style={styles.header}>
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

const styles = StyleSheet.create<Styles>({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(46, 125, 50, 0.1)', // Match app green with opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  anonymousIndicator: {
    marginTop: 5,
    fontSize: 14,
    color: '#555555',
    fontStyle: 'italic',
  },
  editButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  interestItem: {
    backgroundColor: '#E8F5E9', 
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.3)',
  },
  interestText: {
    color: '#2E7D32',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  signOutButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  signOutButtonText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
  },
});
