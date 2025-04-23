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

// Target file size for aggressive compression (100KB)
const TARGET_FILE_SIZE = 100 * 1024;

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
  let quality = options.quality || DEFAULT_COMPRESSION_QUALITY;
  const width = options.width || DEFAULT_IMAGE_WIDTH;
  const format = options.format || ImageManipulator.SaveFormat.JPEG;
  
  // First compression attempt
  let compressedImage = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width } }],
    { compress: quality, format }
  );
  
  // Get the compressed image as blob
  let response = await fetch(compressedImage.uri);
  if (!response.ok) {
    throw new Error(`Failed to fetch compressed image: ${response.status}`);
  }
  
  let blob = await response.blob();
  
  // If the image is still too large, try more aggressive compression
  if (blob.size > TARGET_FILE_SIZE) {
    // Calculate a more aggressive quality setting based on how much we need to reduce
    const sizeRatio = TARGET_FILE_SIZE / blob.size;
    // Adjust quality more aggressively for larger files
    quality = Math.max(0.1, Math.min(0.6, quality * sizeRatio * 1.2));
    
    compressedImage = await ImageManipulator.manipulateAsync(
      compressedImage.uri,
      [], // No resize on second pass, just quality reduction
      { compress: quality, format }
    );
    
    response = await fetch(compressedImage.uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch second compressed image: ${response.status}`);
    }
    
    blob = await response.blob();
  }
  
  return { blob, uri: compressedImage.uri };
}

/**
 * Compress an image using Web APIs (for browsers)
 */
export async function compressImageWeb(
  file: File, 
  options: CompressionOptions = {}
): Promise<Blob> {
  if (typeof createImageBitmap !== 'function') {
    // Fallback for browsers without createImageBitmap
    return compressImageWebFallback(file, options);
  }
  
  let quality = options.quality || DEFAULT_COMPRESSION_QUALITY;
  const width = options.width || DEFAULT_IMAGE_WIDTH;
  
  try {
    // Create an image bitmap from the file
    const imageBitmap = await createImageBitmap(file);
    
    // Use OffscreenCanvas if available, otherwise regular canvas
    let canvas, ctx;
    
    if (typeof OffscreenCanvas === 'function') {
      canvas = new OffscreenCanvas(width, Math.round(width * (imageBitmap.height / imageBitmap.width)));
      ctx = canvas.getContext('2d');
    } else {
      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = Math.round(width * (imageBitmap.height / imageBitmap.width));
      ctx = canvas.getContext('2d');
    }
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    // Draw the image to the canvas
    ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
    
    // Convert to blob with compression
    let compressedBlob;
    if (canvas instanceof OffscreenCanvas) {
      compressedBlob = await canvas.convertToBlob({
        type: 'image/jpeg',
        quality
      });
    } else {
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else throw new Error('Failed to create blob from canvas');
        }, 'image/jpeg', quality);
      });
    }
    
    // If the image is still too large, try more aggressive compression
    if (compressedBlob.size > TARGET_FILE_SIZE) {
      // Calculate a more aggressive quality setting
      const sizeRatio = TARGET_FILE_SIZE / compressedBlob.size;
      quality = Math.max(0.1, Math.min(0.5, quality * sizeRatio * 1.2));
      
      // Second compression pass
      if (canvas instanceof OffscreenCanvas) {
        compressedBlob = await canvas.convertToBlob({
          type: 'image/jpeg',
          quality
        });
      } else {
        compressedBlob = await new Promise((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else throw new Error('Failed to create blob from canvas');
          }, 'image/jpeg', quality);
        });
      }
    }
    
    return compressedBlob;
  } catch (error) {
    console.error('Error in primary web compression method:', error);
    // Fall back to alternative method if primary fails
    return compressImageWebFallback(file, options);
  }
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
/**
 * Fallback compression method for web browsers that don't support createImageBitmap
 */
export async function compressImageWebFallback(
  file: File,
  options: CompressionOptions = {}
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const quality = options.quality || DEFAULT_COMPRESSION_QUALITY;
    const width = options.width || DEFAULT_IMAGE_WIDTH;
    
    // Create an image element
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      // Release the object URL
      URL.revokeObjectURL(url);
      
      // Create a canvas with the desired dimensions
      const canvas = document.createElement('canvas');
      const aspectRatio = img.height / img.width;
      canvas.width = width;
      canvas.height = Math.round(width * aspectRatio);
      
      // Draw the image to the canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Draw with better quality settings
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // First compression pass
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob from canvas'));
          return;
        }
        
        // If the image is still too large, try more aggressive compression
        if (blob.size > TARGET_FILE_SIZE) {
          // Calculate a more aggressive quality setting
          const sizeRatio = TARGET_FILE_SIZE / blob.size;
          const newQuality = Math.max(0.1, Math.min(0.5, quality * sizeRatio * 1.2));
          
          // Second compression pass
          canvas.toBlob((secondBlob) => {
            if (!secondBlob) {
              reject(new Error('Failed to create blob from second compression'));
              return;
            }
            
            resolve(secondBlob);
          }, 'image/jpeg', newQuality);
        } else {
          resolve(blob);
        }
      }, 'image/jpeg', quality);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };
    
    img.src = url;
  });
}

/**
 * Process a base64 data URI image
 */
export async function processBase64Image(
  userId: string, 
  dataUri: string
): Promise<{ url?: string; error?: string }> {
  const parsedData = parseBase64DataUri(dataUri);
  if (!parsedData) {
    return { error: 'Invalid base64 data URI format' };
  }
  
  const { contentType, base64Data, fileExt } = parsedData;
  const filePath = generateFilePath(userId, fileExt);
  
  try {
    // Estimate base64 size (4 chars in base64 represent 3 bytes)
    const estimatedSize = Math.ceil((base64Data.length * 3) / 4);
    
    // Always try to compress images on mobile, regardless of size
    if (Platform.OS !== 'web') {
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
    
    // For web platform, try to compress if the blob is too large
    if (blob.size > MAX_FILE_SIZE && Platform.OS === 'web') {
      try {
        // Create a File object from the blob
        const file = new File([blob], `temp.${fileExt}`, { type: contentType });
        const compressedBlob = await compressImageWeb(file);
        return await uploadToSupabase(filePath, compressedBlob, 'image/jpeg');
      } catch (compressError) {
        console.error('Error compressing base64 image on web:', compressError);
        return { error: 'Image file is too large. Please use an image under 300KB or compress it before uploading.' };
      }
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
  const fileExt = extractFileExtension(uri);
  const filePath = generateFilePath(userId, fileExt);
  const isImage = /^(jpg|jpeg|png|gif|webp|bmp|tiff)$/i.test(fileExt);
  
  try {
    // For images, always try to compress regardless of original size
    if (isImage && Platform.OS !== 'web') {
      try {
        const { blob } = await compressImageNative(uri);
        return await uploadToSupabase(filePath, blob, 'image/jpeg');
      } catch (compressError) {
        console.error('Error compressing image:', compressError);
        // Fall back to regular upload if compression fails
      }
    }
    
    // Regular upload flow (web, non-image files, or if compression failed)
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    // Check blob size
    if (blob.size > MAX_FILE_SIZE) {
      // If it's an image and we're here, it means compression failed
      if (isImage) {
        return { error: 'Image file is too large and compression failed. Please use an image under 300KB or compress it before uploading.' };
      }
      return { error: 'File is too large. Please use a file under 300KB.' };
    }
    
    // Upload the blob
    const contentType = isImage ? `image/${fileExt}` : 'application/octet-stream';
    return await uploadToSupabase(filePath, blob, contentType);
  } catch (error) {
    console.error('Error processing file URI:', error);
    return { error: error instanceof Error ? error.message : 'Failed to process file' };
  }
}

/**
 * Process a web File object
 */
export async function processWebFile(
  userId: string, 
  file: File
): Promise<{ url?: string; error?: string }> {
  const fileExt = extractFileExtension(file.name);
  const filePath = generateFilePath(userId, fileExt);
  
  // Always compress images for consistency, regardless of size
  if (file.type.startsWith('image/')) {
    try {
      // Try to compress the image
      const compressedBlob = await compressImageWeb(file);
      return await uploadToSupabase(filePath, compressedBlob, 'image/jpeg');
    } catch (compressError) {
      console.error('Error compressing web image:', compressError);
      // If compression fails, try to upload the original if it's under the size limit
      if (file.size <= MAX_FILE_SIZE) {
        return await uploadToSupabase(filePath, file, file.type);
      }
      return { error: 'Failed to compress image. Please use an image under 300KB or compress it before uploading.' };
    }
  }
  
  // For non-image files or if we get here
  if (file.size > MAX_FILE_SIZE) {
    return { error: 'File is too large. Please use a file under 300KB.' };
  }
  
  // Regular upload for non-image files under the size limit
  return await uploadToSupabase(filePath, file, file.type);
}
