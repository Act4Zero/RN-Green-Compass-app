import { processBase64Image, processFileUri, processWebFile } from './imageProcessing';

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
