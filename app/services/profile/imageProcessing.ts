import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';
import supabase from '../../lib/supabase';
import { 
  CompressionOptions, 
  MAX_FILE_SIZE, 
  DEFAULT_COMPRESSION_QUALITY, 
  DEFAULT_IMAGE_WIDTH,
  PROFILES_BUCKET
} from './types';

/**
 * Generate a file path for storage
 */
export function generateFilePath(userId: string, fileExt: string): string {
  const fileName = `profile.${fileExt}`;
  return `${userId}/${fileName}`;
}

/**
 * Extract file extension from a file name or URI
 */
export function extractFileExtension(path: string): string {
  const parts = path.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : 'jpg';
}

/**
 * Extract content type and data from base64 data URI
 */
export function parseBase64DataUri(dataUri: string): { contentType: string; base64Data: string; fileExt: string } | null {
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
export async function base64ToBlob(base64Data: string, contentType: string): Promise<Blob> {
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
export async function compressImageNative(
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
export async function compressImageWeb(
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
export async function uploadToSupabase(
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
export async function processBase64Image(
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
export async function processFileUri(
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
export async function processWebFile(
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
