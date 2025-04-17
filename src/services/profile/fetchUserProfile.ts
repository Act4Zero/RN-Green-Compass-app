import supabase from '../../lib/supabase';
import { Profile } from './types';

/**
 * Fetch a user's profile by their user ID
 * @param userId User ID to fetch profile for
 */
export async function fetchUserProfile(userId: string): Promise<Profile | null> {
  console.log('Fetching profile from API for user:', userId);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  console.log('Raw profile data from database:', JSON.stringify(data, null, 2));
  
  // Check for avatar_url and try to get a signed URL
  if (data?.avatar_url) {
    console.log('Avatar URL found in profile data:', data.avatar_url);
    try {
      // data.avatar_url is something like "userId/profile.jpeg"
      const { data: signedData, error: signedUrlError } = await supabase.storage
        .from('profiles')
        .createSignedUrl(data.avatar_url, 60 * 60 * 24); // 1 day
    
      if (signedUrlError) {
        console.error('Error creating signed URL for avatar:', signedUrlError);
        // Keep the original avatar_url as a fallback
      } else if (signedData?.signedUrl) {
        console.log('Signed URL created successfully:', signedData.signedUrl);
        // This becomes the fully qualified URL that you can pass to <Image source={...} />
        data.avatar_url = signedData.signedUrl;
      } else {
        console.warn('No signed URL returned for avatar');
      }
    } catch (err) {
      console.error('Exception while creating signed URL:', err);
      // Keep the original avatar_url as a fallback
    }
  } else {
    console.log('No avatar_url found in profile data');
    
    // Try to check if there's an avatar in storage for this user
    try {
      const { data: fileData, error: fileError } = await supabase.storage
        .from('profiles')
        .list(userId);
      
      if (!fileError && fileData && fileData.length > 0) {
        console.log('Found files in storage for user:', fileData);
        // Find an image file
        const imageFile = fileData.find(file => 
          file.name.endsWith('.jpg') || 
          file.name.endsWith('.jpeg') || 
          file.name.endsWith('.png')
        );
        
        if (imageFile) {
          const avatarPath = `${userId}/${imageFile.name}`;
          console.log('Found image file, creating signed URL for:', avatarPath);
          
          const { data: signedData } = await supabase.storage
            .from('profiles')
            .createSignedUrl(avatarPath, 60 * 60 * 24); // 1 day
          
          if (signedData?.signedUrl) {
            console.log('Created signed URL for discovered avatar:', signedData.signedUrl);
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
      console.log('Parsed interests from string to array:', data.interests);
    } catch (err) {
      console.error('Error parsing interests JSON string:', err);
      data.interests = [];
    }
  }

  // Return the profile data
  const profileData = data as Profile;
  console.log('Returning processed profile data:', JSON.stringify(profileData, null, 2));
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
