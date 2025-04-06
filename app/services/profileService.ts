import supabase from '../lib/supabase';
import { Profile, ProfileFormData } from '../types/profiles';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';
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

// Constants
const MAX_FILE_SIZE = 290 * 1024; // 290KB (safely under Supabase's 300KB limit)
const DEFAULT_COMPRESSION_QUALITY = 0.7;
const DEFAULT_IMAGE_WIDTH = 400;
const PROFILES_BUCKET = 'profiles';

/**
 * Interface for file metadata
 */
interface FileMetadata {
  filePath: string;
  contentType: string;
  fileExt: string;
}

/**
 * Interface for compression options
 */
interface CompressionOptions {
  quality?: number;
  width?: number;
  format?: any; // Using any to accommodate ImageManipulator.SaveFormat
}

/**
 * Generate a file path for storage
 */
function generateFilePath(userId: string, fileExt: string): string {
  const fileName = `profile.${fileExt}`;
  return `${userId}/${fileName}`;
}

/**
 * Extract file extension from a file name or URI
 */
function extractFileExtension(path: string): string {
  const parts = path.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : 'jpg';
}

/**
 * Extract content type and data from base64 data URI
 */
function parseBase64DataUri(dataUri: string): { contentType: string; base64Data: string; fileExt: string } | null {
  const matches = dataUri.match(/^data:([\w/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return null;
  }
  
  const contentType = matches[1];
  const base64Data = matches[2];
  const fileExt = contentType.split('/')[1] || 'jpg';
  
  return { contentType, base64Data, fileExt };
}

/**
 * Convert base64 data to a Blob
 */
async function base64ToBlob(base64Data: string, contentType: string): Promise<Blob> {
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
  
  return new Blob(byteArrays, { type: contentType });
}

/**
 * Compress an image using Expo ImageManipulator (for React Native)
 */
async function compressImageNative(
  uri: string, 
  options: CompressionOptions = {}
): Promise<{ blob: Blob; uri: string }> {
  const quality = options.quality || DEFAULT_COMPRESSION_QUALITY;
  const width = options.width || DEFAULT_IMAGE_WIDTH;
  const format = options.format || ImageManipulator.SaveFormat.JPEG;
  
  console.log(`Compressing image with width=${width}, quality=${quality}`);
  
  const compressedImage = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width } }],
    { compress: quality, format }
  );
  
  // Get the compressed image as blob
  const response = await fetch(compressedImage.uri);
  if (!response.ok) {
    throw new Error(`Failed to fetch compressed image: ${response.status}`);
  }
  
  const blob = await response.blob();
  console.log(`Compressed image size: ${blob.size} bytes`);
  
  return { blob, uri: compressedImage.uri };
}

/**
 * Compress an image using Web APIs (for browsers)
 */
async function compressImageWeb(
  file: File, 
  options: CompressionOptions = {}
): Promise<Blob> {
  if (typeof createImageBitmap !== 'function' || typeof OffscreenCanvas !== 'function') {
    throw new Error('Browser does not support required compression APIs');
  }
  
  const quality = options.quality || DEFAULT_COMPRESSION_QUALITY;
  const width = options.width || DEFAULT_IMAGE_WIDTH;
  
  console.log(`Compressing web image with width=${width}, quality=${quality}`);
  
  // Create an image bitmap from the file
  const imageBitmap = await createImageBitmap(file);
  
  // Create an offscreen canvas with proportional height
  const canvas = new OffscreenCanvas(width, width * (imageBitmap.height / imageBitmap.width));
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // Draw the image to the canvas
  ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
  
  // Convert to blob with compression
  const compressedBlob = await canvas.convertToBlob({
    type: 'image/jpeg',
    quality
  });
  
  console.log(`Compressed web image size: ${compressedBlob.size} bytes`);
  return compressedBlob;
}

/**
 * Upload a blob to Supabase storage
 */
async function uploadToSupabase(
  filePath: string, 
  data: Blob | File, 
  contentType: string
): Promise<{ url?: string; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(PROFILES_BUCKET)
      .upload(filePath, data, {
        contentType,
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading to storage:', error);
      return { error: error.message };
    }
    
    return { url: filePath };
  } catch (error) {
    console.error('Error in upload:', error);
    return { error: error instanceof Error ? error.message : 'Unknown upload error' };
  }
}

/**
 * Process a base64 data URI image
 */
async function processBase64Image(
  userId: string, 
  dataUri: string
): Promise<{ url?: string; error?: string }> {
  console.log('Processing base64 data URI');
  
  const parsedData = parseBase64DataUri(dataUri);
  if (!parsedData) {
    return { error: 'Invalid base64 data URI format' };
  }
  
  const { contentType, base64Data, fileExt } = parsedData;
  const filePath = generateFilePath(userId, fileExt);
  
  try {
    // Estimate base64 size (4 chars in base64 represent 3 bytes)
    const estimatedSize = Math.ceil((base64Data.length * 3) / 4);
    
    // If image is too large and we're on mobile, compress it
    if (estimatedSize > MAX_FILE_SIZE && Platform.OS !== 'web') {
      try {
        const { blob } = await compressImageNative(dataUri);
        return await uploadToSupabase(filePath, blob, 'image/jpeg');
      } catch (compressError) {
        console.error('Error compressing base64 image:', compressError);
        // Fall back to regular upload if compression fails
      }
    }
    
    // Convert base64 to blob
    const blob = await base64ToBlob(base64Data, contentType);
    
    // Check blob size for web
    if (blob.size > MAX_FILE_SIZE && Platform.OS === 'web') {
      return { error: 'Image file is too large. Please use an image under 300KB or compress it before uploading.' };
    }
    
    // Upload the blob
    return await uploadToSupabase(filePath, blob, contentType);
  } catch (error) {
    console.error('Error processing base64 data:', error);
    return { error: error instanceof Error ? error.message : 'Failed to process base64 image data' };
  }
}

/**
 * Process a regular file URI (not base64)
 */
async function processFileUri(
  userId: string, 
  uri: string
): Promise<{ url?: string; error?: string }> {
  console.log('Processing file with URI:', uri);
  
  const fileExt = extractFileExtension(uri);
  const filePath = generateFilePath(userId, fileExt);
  
  try {
    // For React Native, try to compress the image first
    if (Platform.OS !== 'web') {
      try {
        const { blob } = await compressImageNative(uri);
        return await uploadToSupabase(filePath, blob, 'image/jpeg');
      } catch (compressError) {
        console.error('Error compressing image:', compressError);
        // Fall back to regular upload if compression fails
      }
    }
    
    // Regular upload flow (web or if compression failed)
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Check blob size
    if (blob.size > MAX_FILE_SIZE) {
      return { error: 'Image file is too large. Please use an image under 300KB or compress it before uploading.' };
    }
    
    // Upload the blob
    return await uploadToSupabase(filePath, blob, `image/${fileExt}`);
  } catch (error) {
    console.error('Error processing image URI:', error);
    return { error: error instanceof Error ? error.message : 'Failed to process image file' };
  }
}

/**
 * Process a web File object
 */
async function processWebFile(
  userId: string, 
  file: File
): Promise<{ url?: string; error?: string }> {
  console.log('Processing web File object:', file.name);
  
  const fileExt = extractFileExtension(file.name);
  const filePath = generateFilePath(userId, fileExt);
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    try {
      // Try to compress the image
      const compressedBlob = await compressImageWeb(file);
      return await uploadToSupabase(filePath, compressedBlob, 'image/jpeg');
    } catch (compressError) {
      console.error('Error compressing web image:', compressError);
      return { error: 'Image file is too large. Please use an image under 300KB or compress it before uploading.' };
    }
  }
  
  // Regular upload for files under the size limit
  return await uploadToSupabase(filePath, file, `image/${fileExt}`);
}

/**
 * Upload a profile image to Supabase storage
 * Handles web File objects, React Native ImagePicker assets, and base64 data URIs
 */
export async function uploadProfileImage(userId: string, file: any): Promise<{ url?: string; error?: string }> {
  try {
    // Check if file exists
    if (!file) {
      return { error: 'No file provided' };
    }
    
    // Handle React Native asset object (from ImagePicker)
    if (file.uri) {
      // Handle base64 data URI
      if (typeof file.uri === 'string' && file.uri.startsWith('data:')) {
        return await processBase64Image(userId, file.uri);
      } 
      // Handle regular file URI
      else {
        return await processFileUri(userId, file.uri);
      }
    } 
    // Handle web File object
    else if (file.name) {
      return await processWebFile(userId, file);
    } 
    // Unknown file format
    else {
      return { error: 'Invalid file format' };
    }
  } catch (error) {
    console.error('Unexpected error uploading image:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

/**
 * Generate a random alias for anonymous users
 */
export function generateRandomAlias(): string {
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
