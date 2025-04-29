import React, { createContext, useContext, ReactNode } from 'react';
import { useFeatureFlags, FeatureFlagMap } from '../services/featureFlags';

interface FeatureFlagsContextType {
  flags: FeatureFlagMap;
  isLoading: boolean;
  isEnabled: (key: string) => boolean;
}

// Create context with default values
const FeatureFlagsContext = createContext<FeatureFlagsContextType>({
  flags: {},
  isLoading: true,
  isEnabled: () => false,
});

interface FeatureFlagsProviderProps {
  children: ReactNode;
}

/**
 * Provider component for feature flags with real-time updates
 */
export function FeatureFlagsProvider({ children }: FeatureFlagsProviderProps) {
  const { flags, loading: isLoading, isEnabled } = useFeatureFlags();

  const value = {
    flags,
    isLoading,
    isEnabled,
  };

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

/**
 * Hook to use feature flags from any component
 */
export function useFeatureFlagsContext() {
  const context = useContext(FeatureFlagsContext);
  
  if (context === undefined) {
    throw new Error('useFeatureFlagsContext must be used within a FeatureFlagsProvider');
  }
  
  return context;
}
