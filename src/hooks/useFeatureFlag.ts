import { useFeatureFlagsContext } from '@/context/FeatureFlagsContext';

/**
 * Hook to check if a specific feature flag is enabled
 * 
 * @param key - The feature flag key to check
 * @param defaultValue - Optional default value if the flag doesn't exist (defaults to false)
 * @returns Boolean indicating if the feature is enabled
 */
export function useFeatureFlag(key: string, defaultValue = false): boolean {
  const { flags, isLoading } = useFeatureFlagsContext();
  
  // If flags are still loading, return the default value
  if (isLoading) {
    return defaultValue;
  }
  
  // Return the flag value or default if not found
  return key in flags ? flags[key] : defaultValue;
}
