import supabase from '../lib/supabase';
import { Profile, ProfileFormData } from '../types/profiles';
// Profile cache import removed

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

  if (data?.avatar_url) {
    // data.avatar_url is something like "userId/profile.jpeg"
    const { data: signedData } = await supabase.storage
      .from('profiles')
      .createSignedUrl(data.avatar_url, 60 * 60 * 24); // 1 day
  
    // This becomes the fully qualified URL that you can pass to <Image source={...} />
    data.avatar_url = signedData?.signedUrl || null;
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

/**
 * Create a new user profile
 */
export async function createUserProfile(
  userId: string, 
  profileData: ProfileFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Handle avatar upload if provided
    let avatar_url = null;
    if (profileData.avatar) {
      const { url, error: uploadError } = await uploadProfileImage(userId, profileData.avatar);
      if (uploadError) {
        return { success: false, error: `Failed to upload avatar: ${uploadError}` };
      }
      avatar_url = url || null;
    }

    // Generate alias if anonymity is enabled but no display name is provided
    let alias = null;
    if (profileData.is_anonymous) {
      alias = profileData.display_name || generateRandomAlias();
    }

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      display_name: profileData.display_name,
      is_anonymous: profileData.is_anonymous,
      interests: profileData.interests,
      avatar_url,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error creating profile:', error);
      return { success: false, error: error.message };
    }

    // Cache clearing removed

    return { success: true };
  } catch (error) {
    console.error('Unexpected error creating profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Update an existing user profile
 */
export async function updateUserProfile(
  userId: string, 
  profileData: ProfileFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch current profile
    const currentProfile = await fetchUserProfile(userId);
    if (!currentProfile) {
      return { success: false, error: 'Profile not found' };
    }

    // Handle avatar upload if provided
    let avatar_url = currentProfile.avatar_url;
    if (profileData.avatar) {
      const { url, error: uploadError } = await uploadProfileImage(userId, profileData.avatar);
      if (uploadError) {
        return { success: false, error: `Failed to upload avatar: ${uploadError}` };
      }
      avatar_url = url || null;
    }

    // Update display name if anonymity setting changed
    let display_name = currentProfile.display_name;
    if (profileData.is_anonymous && !currentProfile.display_name) {
      display_name = profileData.display_name || generateRandomAlias();
    }

    // Update profile in database
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name,
        is_anonymous: profileData.is_anonymous,
        interests: profileData.interests,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }

    // Cache clearing removed

    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Upload a profile image to Supabase storage
 * Handles web File objects, React Native ImagePicker assets, and base64 data URIs
 */
async function uploadProfileImage(userId: string, file: any): Promise<{ url?: string; error?: string }> {
  try {
    // Check if file exists
    if (!file) {
      return { error: 'No file provided' };
    }

    let filePath: string;
    
    // Handle React Native asset object (from ImagePicker)
    if (file.uri) {
      console.log('Processing file with URI:', file.uri);
      
      // Handle base64 data URI (e.g., data:image/jpeg;base64,/9j/...)
      if (typeof file.uri === 'string' && file.uri.startsWith('data:')) {
        console.log('Processing base64 data URI');
        
        // Extract MIME type and base64 data
        const matches = file.uri.match(/^data:([\w/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          return { error: 'Invalid base64 data URI format' };
        }
        
        const contentType = matches[1];
        const base64Data = matches[2];
        const fileExt = contentType.split('/')[1] || 'jpg';
        const fileName = `profile.${fileExt}`;
        filePath = `${userId}/${fileName}`;
        
        try {
          // Convert base64 to blob
          const byteCharacters = atob(base64Data);
          const byteArrays = [];
          
          for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          
          const blob = new Blob(byteArrays, { type: contentType });
          
          // Upload the blob to Supabase storage
          const { error } = await supabase.storage
            .from('profiles')
            .upload(filePath, blob, {
              contentType: contentType,
              upsert: true,
            });
            
          if (error) {
            console.error('Error uploading base64 image:', error);
            return { error: error.message };
          }
        } catch (base64Error) {
          console.error('Error processing base64 data:', base64Error);
          return { error: base64Error instanceof Error ? base64Error.message : 'Failed to process base64 image data' };
        }
      } 
      // Handle regular file URI (not base64)
      else {
        // Extract extension from URI
        const uriParts = file.uri.split('.');
        const fileExt = uriParts[uriParts.length - 1] || 'jpg'; // Default to jpg if no extension
        const fileName = `profile.${fileExt}`;
        filePath = `${userId}/${fileName}`;
        
        try {
          // For React Native, we need to fetch the file as a blob first
          const response = await fetch(file.uri);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
          }
          
          const blob = await response.blob();
          
          // Upload the blob to Supabase storage
          const { error } = await supabase.storage
            .from('profiles')
            .upload(filePath, blob, {
              contentType: `image/${fileExt}`,
              upsert: true
            });
            
          if (error) {
            console.error('Error uploading image:', error);
            return { error: error.message };
          }
        } catch (fetchError) {
          console.error('Error processing image:', fetchError);
          return { error: fetchError instanceof Error ? fetchError.message : 'Failed to process image file' };
        }
      }
    } 
    // Handle web File object
    else if (file.name) {
      const nameParts = file.name.split('.');
      const fileExt = nameParts[nameParts.length - 1];
      const fileName = `profile.${fileExt}`;
      filePath = `${userId}/${fileName}`;
      
      const { error } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          contentType: `image/${fileExt}`,
          upsert: true
        });
        
      if (error) {
        console.error('Error uploading image:', error);
        return { error: error.message };
      }
    } 
    else {
      return { error: 'Invalid file format' };
    }

    // Get public URL for the uploaded image
    const { error: dbError } = await supabase
      .from('profiles')
      .update({ avatar_url: filePath })
      .eq('id', userId);
    
    if (dbError) {
      console.error('Error updating profile avatar in database:', dbError);
      return { error: dbError.message };
    }
    
    // Return the URL as provided by Supabase
    return { url: filePath };
  } catch (error) {
    console.error('Unexpected error uploading image:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

/**
 * Generate a random alias for anonymous users
 */
function generateRandomAlias(): string {
  const adjectives = ['Green', 'Blue', 'Eco', 'Solar', 'Wind', 'Ocean', 'Forest', 'Earth'];
  const nouns = ['Explorer', 'Guardian', 'Protector', 'Advocate', 'Champion', 'Pioneer', 'Ranger'];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNum = Math.floor(Math.random() * 1000);
  
  return `${randomAdjective}${randomNoun}${randomNum}`;
}

/**
 * Get display name or alias based on anonymity setting
 */
export function getDisplayIdentifier(profile: Profile): string {
  if (profile.is_anonymous) {
    return profile.display_name || 'Anonymous User';
  }
  return profile.display_name || profile.email.split('@')[0];
}
