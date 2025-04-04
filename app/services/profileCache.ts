import { Profile } from '../types/profiles';

// Simple in-memory cache for profile data
let profileCache: Record<string, { data: Profile; timestamp: number }> = {};

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION_MS = 5 * 60 * 1000;

/**
 * Get profile from cache
 * @param userId User ID to get profile for
 * @returns Cached profile or null if not in cache or expired
 */
export function getCachedProfile(userId: string): Profile | null {
  const cachedItem = profileCache[userId];
  
  // Return null if not in cache
  if (!cachedItem) {
    return null;
  }
  
  // Check if cache is expired
  const now = Date.now();
  if (now - cachedItem.timestamp > CACHE_EXPIRATION_MS) {
    // Remove expired item from cache
    delete profileCache[userId];
    return null;
  }
  
  return cachedItem.data;
}

/**
 * Store profile in cache
 * @param userId User ID to store profile for
 * @param profile Profile data to cache
 */
export function cacheProfile(userId: string, profile: Profile): void {
  profileCache[userId] = {
    data: profile,
    timestamp: Date.now()
  };
}

/**
 * Clear profile from cache
 * @param userId User ID to clear from cache
 */
export function clearCachedProfile(userId: string): void {
  delete profileCache[userId];
}

/**
 * Clear all profiles from cache
 */
export function clearAllCachedProfiles(): void {
  profileCache = {};
}
