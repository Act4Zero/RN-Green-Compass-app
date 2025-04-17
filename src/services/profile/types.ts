import { Profile, ProfileFormData } from '../../types/profiles';

/**
 * Interface for file metadata
 */
export interface FileMetadata {
  filePath: string;
  contentType: string;
  fileExt: string;
}

/**
 * Interface for compression options
 */
export interface CompressionOptions {
  quality?: number;
  width?: number;
  format?: any; // Using any to accommodate ImageManipulator.SaveFormat
}

// Constants for image processing
export const MAX_FILE_SIZE = 290 * 1024; // 290KB (safely under Supabase's 300KB limit)
export const DEFAULT_COMPRESSION_QUALITY = 0.7;
export const DEFAULT_IMAGE_WIDTH = 400;
export const PROFILES_BUCKET = 'profiles';

// Export types for reuse across profile services
export type { Profile, ProfileFormData };
