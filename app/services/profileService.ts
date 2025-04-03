import supabase from '../lib/supabase';
import { Profile, ProfileFormData } from '../types/profiles';

/**
 * Fetch a user's profile by their user ID
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

  return data as Profile;
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
      alias,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error creating profile:', error);
      return { success: false, error: error.message };
    }

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
    // Fetch current profile first
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

    // Update alias if anonymity setting changed
    let alias = currentProfile.alias;
    if (profileData.is_anonymous && !currentProfile.alias) {
      alias = profileData.display_name || generateRandomAlias();
    }

    // Update profile in database
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: profileData.display_name,
        is_anonymous: profileData.is_anonymous,
        interests: profileData.interests,
        avatar_url,
        alias,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }

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
 */
async function uploadProfileImage(userId: string, file: File): Promise<{ url?: string; error?: string }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error } = await supabase.storage
      .from('profiles')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading image:', error);
      return { error: error.message };
    }

    // Get public URL for the uploaded image
    const { data } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    return { url: data.publicUrl };
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
    return profile.alias || 'Anonymous User';
  }
  return profile.display_name || profile.email.split('@')[0];
}
