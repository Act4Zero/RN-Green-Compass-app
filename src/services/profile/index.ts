// Export all profile service functionality
export { fetchUserProfile, checkProfileExists } from './fetchUserProfile';
export { createUserProfile } from './createUserProfile';
export { updateUserProfile } from './updateUserProfile';
export { uploadProfileImage } from './uploadProfileImage';
export { generateRandomAlias, getDisplayIdentifier } from './utils';

// Re-export types
export * from './types';
