import supabase from '../../lib/supabase';
import { ProfileFormData } from './types';
import { uploadProfileImage } from '../profile/uploadProfileImage';
import { fetchUserProfile } from '../profile/fetchUserProfile';
import { generateRandomAlias } from '../profile/utils';

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

    // Handle avatar upload only if a new avatar is explicitly provided
    let avatar_url = currentProfile.avatar_url;
    if (profileData.avatar) {
      const { url, error: uploadError } = await uploadProfileImage(userId, profileData.avatar);
      if (uploadError) {
        return { success: false, error: `Failed to upload avatar: ${uploadError}` };
      }
      avatar_url = url || null;
    }
    // If no new avatar is provided, keep the existing avatar_url and don't update it

    // Update display name if anonymity setting changed
    let display_name = currentProfile.display_name;
    if (profileData.is_anonymous && !currentProfile.display_name) {
      display_name = profileData.display_name || generateRandomAlias();
    }

    // Prepare update data, only including avatar_url if it was changed
    const updateData: any = {
      display_name,
      is_anonymous: profileData.is_anonymous,
      interests: profileData.interests,
      updated_at: new Date().toISOString(),
    };
    
    // Only include avatar_url in the update if a new avatar was provided
    if (profileData.avatar) {
      updateData.avatar_url = avatar_url;
    }
    
    // Update profile in database
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
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
