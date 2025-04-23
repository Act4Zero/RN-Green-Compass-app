import supabase from '../../lib/supabase';
import { ProfileFormData } from './types';
import { uploadProfileImage } from '../profile/uploadProfileImage';
import { generateRandomAlias } from '../profile/utils';

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

    return { success: true };
  } catch (error) {
    console.error('Unexpected error creating profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}
