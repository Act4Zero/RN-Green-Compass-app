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

    let filePath: string;
    
    // Maximum file size in bytes (290KB to stay safely under Supabase's 300KB limit)
    const MAX_FILE_SIZE = 290 * 1024; // 290KB
    
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
          // Estimate base64 size (4 chars in base64 represent 3 bytes)
          const estimatedSize = Math.ceil((base64Data.length * 3) / 4);
          
          // If image is too large, we need to compress it before converting to blob
          if (estimatedSize > MAX_FILE_SIZE && Platform.OS !== 'web') {
            // For React Native, we can use ImageManipulator to compress the image
            try {
              // Use a single compression attempt with fixed size of 400x400
              const quality = 0.7;
              const width = 400;
              let compressedBlob: Blob | null = null;
              
              console.log(`Using single compression with width=${width}, quality=${quality}`);
              
              const compressedImage = await ImageManipulator.manipulateAsync(
                file.uri,
                [{ resize: { width: width } }],
                { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
              );
              
              // Get the compressed image as blob
              const response = await fetch(compressedImage.uri);
              if (!response.ok) {
                throw new Error(`Failed to fetch compressed image: ${response.status}`);
              }
              
              compressedBlob = await response.blob();
              
              // Log the compressed size
              console.log(`Compressed image size: ${compressedBlob.size} bytes`);
              
              // Ensure we have a blob to upload
              if (!compressedBlob) {
                throw new Error('Failed to compress image');
              }
              
              // Upload the compressed blob
              const { error } = await supabase.storage
                .from('profiles')
                .upload(filePath, compressedBlob, {
                  contentType: 'image/jpeg',
                  upsert: true,
                });
                
              if (error) {
                console.error('Error uploading compressed image:', error);
                return { error: error.message };
              }
              
              return { url: filePath };
            } catch (compressError) {
              console.error('Error compressing image:', compressError);
              // Fall back to regular upload if compression fails
            }
          }
          
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
          
          // Check blob size
          if (blob.size > MAX_FILE_SIZE && Platform.OS === 'web') {
            return { error: 'Image file is too large. Please use an image under 300KB or compress it before uploading.' };
          }
          
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
          // For React Native, we need to compress the image first
          if (Platform.OS !== 'web') {
            try {
              // Use a single compression attempt with fixed size of 400x400
              const quality = 0.7;
              const width = 400;
              let compressedBlob: Blob | null = null;
              
              console.log(`Using single compression with width=${width}, quality=${quality}`);
              
              const compressedImage = await ImageManipulator.manipulateAsync(
                file.uri,
                [{ resize: { width: width } }],
                { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
              );
              
              // Get the compressed image as blob
              const response = await fetch(compressedImage.uri);
              if (!response.ok) {
                throw new Error(`Failed to fetch compressed image: ${response.status}`);
              }
              
              compressedBlob = await response.blob();
              
              // Log the compressed size
              console.log(`Compressed image size: ${compressedBlob.size} bytes`);
              
              // Ensure we have a blob to upload
              if (!compressedBlob) {
                throw new Error('Failed to compress image');
              }
              
              // Upload the compressed blob
              const { error } = await supabase.storage
                .from('profiles')
                .upload(filePath, compressedBlob, {
                  contentType: 'image/jpeg',
                  upsert: true
                });
                
              if (error) {
                console.error('Error uploading compressed image:', error);
                return { error: error.message };
              }
              
              return { url: filePath };
            } catch (compressError) {
              console.error('Error compressing image:', compressError);
              // Fall back to regular upload if compression fails
            }
          }
          
          // Regular upload flow (web or if compression failed)
          const response = await fetch(file.uri);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
          }
          
          const blob = await response.blob();
          
          // Check blob size
          if (blob.size > MAX_FILE_SIZE) {
            return { error: 'Image file is too large. Please use an image under 300KB or compress it before uploading.' };
          }
          
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
      
      // Check file size for web File objects
      if (file.size > MAX_FILE_SIZE) {
        // For web, we can use the browser's built-in compression capabilities
        if (typeof createImageBitmap === 'function' && typeof OffscreenCanvas === 'function') {
          try {
            // Create an image bitmap from the file
            const imageBitmap = await createImageBitmap(file);
            
            // Create an offscreen canvas
            // Use a single compression attempt with fixed size of 400x400
            const quality = 0.7;
            const width = 400;
            let compressedBlob: Blob | null = null;
            
            console.log(`Using single web compression with width=${width}, quality=${quality}`);
            
            const canvas = new OffscreenCanvas(width, width * (imageBitmap.height / imageBitmap.width));
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              throw new Error('Failed to get canvas context');
            }
            
            // Draw the image to the canvas with compression
            ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
            
            // Convert to blob with compression
            compressedBlob = await canvas.convertToBlob({
              type: 'image/jpeg',
              quality: quality
            });
            
            // Log the compressed size
            console.log(`Compressed web image size: ${compressedBlob.size} bytes`);
            
            // Ensure we have a blob to upload
            if (!compressedBlob) {
              throw new Error('Failed to compress web image');
            }
            
            // Upload the compressed blob
            const { error } = await supabase.storage
              .from('profiles')
              .upload(filePath, compressedBlob, {
                contentType: 'image/jpeg',
                upsert: true
              });
            
            if (error) {
              console.error('Error uploading compressed image:', error);
              return { error: error.message };
            }
            
            return { url: filePath };
          } catch (compressError) {
            console.error('Error compressing web image:', compressError);
            // Fall back to error message if compression fails
            return { error: 'Image file is too large. Please use an image under 300KB or compress it before uploading.' };
          }
        } else {
          // If the browser doesn't support these APIs, return an error
          return { error: 'Image file is too large. Please use an image under 300KB or compress it before uploading.' };
        }
      }
      
      try {
        // Regular upload for files under the size limit
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
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        return { error: uploadError instanceof Error ? uploadError.message : 'Failed to upload image' };
      }
    } else {
      return { error: 'Invalid file format' };
    }

    // We don't update the profile table here anymore, we just return the file path
    // This way, the avatar_url in the database will only be updated when the entire profile is updated
    // and only if a new avatar was explicitly provided
    
    // Return just the file path (not a signed URL)
    // This ensures we store only the relative path in the database
    return { url: filePath };
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
