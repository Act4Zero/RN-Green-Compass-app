import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  fetchUserProfile, 
  updateUserProfile, 
  uploadProfileImage,
  getDisplayIdentifier 
} from '../services/profile';
import { Profile } from '../types/profiles';
import analyticsService from '../services/analyticsService';

/**
 * Custom hook for managing user profile data and operations
 */
export default function useProfileManager() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { user } = useAuth();

  /**
   * Load the user profile data
   */
  const loadProfile = useCallback(async () => {
    try {
      if (!user) {
        console.warn('No user available to load profile');
        return { success: false, error: 'User not authenticated' };
      }

      // Only set loading to true if we don't already have a profile
      if (!profile) {
        setIsLoading(true);
      }
      
      // Fetch profile data
      
      const profileData = await fetchUserProfile(user.id);
      
      if (profileData) {
        
        
        // Ensure all required fields are present with defaults if needed
        // Parse interests if it's a string (this is a backup in case it wasn't parsed in profileService)
        let interests = profileData.interests || [];
        if (typeof interests === 'string') {
          try {
            interests = JSON.parse(interests);
            
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
        
        
        setProfile(processedProfile);
        
        return { success: true, profile: processedProfile };
      } else {
        console.warn('No profile data returned from fetchUserProfile');
        return { success: false, error: 'No profile data found' };
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile data';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [user, profile]);

  /**
   * Update the user profile
   */
  const updateProfile = useCallback(async (values: {
    display_name: string;
    is_anonymous: boolean;
    interests: string[];
    avatar?: any;
  }) => {
    if (!user) {
      const errorMsg = 'You must be logged in to update your profile';
      setError(errorMsg);
      return { success: false, error: errorMsg };
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
        await loadProfile();
        
        return { success: true };
      } else {
        const errorMsg = result.error || 'Failed to update profile';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMsg = 'An unexpected error occurred';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsSaving(false);
    }
  }, [user, loadProfile]);

  /**
   * Track profile screen view in analytics
   */
  const trackProfileView = useCallback((screenName: string) => {
    analyticsService.trackScreenView(screenName);
  }, []);

  /**
   * Get display identifier for the profile
   */
  const getProfileDisplayIdentifier = useCallback(() => {
    if (!profile) return '';
    return getDisplayIdentifier(profile);
  }, [profile]);

  /**
   * Reset profile state (useful for sign out)
   */
  const resetProfile = useCallback(() => {
    setProfile(null);
    setError(undefined);
  }, []);

  return {
    profile,
    isLoading,
    isSaving,
    error,
    loadProfile,
    updateProfile,
    trackProfileView,
    getProfileDisplayIdentifier,
    resetProfile
  };
}
