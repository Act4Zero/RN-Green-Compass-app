import supabase from '../../lib/supabase';
import { Profile } from './types';

/**
 * Fetch a user's profile by their user ID
 * @param userId User ID to fetch profile for
 */
export async function fetchUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  // Check for avatar_url and try to get a signed URL
  if (data?.avatar_url) {
    try {
      // Validate avatar_url format
      // It should be something like "userId/profile.jpeg"
      if (!data.avatar_url.includes('/')) {
        console.warn('Invalid avatar_url format:', data.avatar_url);
        data.avatar_url = null;
      } else {
        // Create signed URL with error handling
        const { data: signedData, error: signedUrlError } = await supabase.storage
          .from('profiles')
          .createSignedUrl(data.avatar_url, 60 * 60 * 24); // 1 day
      
        if (signedUrlError) {
          console.error('Error creating signed URL for avatar:', signedUrlError);
          data.avatar_url = null;
        } else if (signedData?.signedUrl) {
          data.avatar_url = signedData.signedUrl;
        } else {
          console.warn('No signed URL returned for avatar');
          data.avatar_url = null;
        }
      }
    } catch (err) {
      console.error('Exception while creating signed URL:', err);
      // Set to null rather than keeping possibly invalid URL
      data.avatar_url = null;
    }
  } else {
    console.log('No avatar_url found in profile data');
    data.avatar_url = null;
    
    // Try to check if there's an avatar in storage for this user
    try {
      const { data: fileData, error: fileError } = await supabase.storage
        .from('profiles')
        .list(userId);
      
      if (!fileError && fileData && fileData.length > 0) {
        // Find an image file
        const imageFile = fileData.find(file => 
          file.name.endsWith('.jpg') || 
          file.name.endsWith('.jpeg') || 
          file.name.endsWith('.png')
        );
        
        if (imageFile) {
          const avatarPath = `${userId}/${imageFile.name}`;
          const { data: signedData, error: signedUrlError } = await supabase.storage
            .from('profiles')
            .createSignedUrl(avatarPath, 60 * 60 * 24); // 1 day
          
          if (signedUrlError) {
            console.error('Error creating signed URL for found avatar:', signedUrlError);
          } else if (signedData?.signedUrl) {
            data.avatar_url = signedData.signedUrl;
          }
        }
      }
    } catch (err) {
      console.error('Error checking for avatar in storage:', err);
    }
  }
  
  // Parse interests if it's a string
  if (data?.interests && typeof data.interests === 'string') {
    try {
      data.interests = JSON.parse(data.interests);
    } catch (err) {
      console.error('Error parsing interests JSON string:', err);
      data.interests = [];
    }
  }

  // Return the profile data
  const profileData = data as Profile;
  return profileData;
}

/**
 * Check if a user profile exists
 */
export async function checkProfileExists(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is the error code for "no rows returned"
    console.error('Error checking profile existence:', error);
  }

  return !!data;
}
