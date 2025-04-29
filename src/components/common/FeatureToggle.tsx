import React, { ReactNode } from 'react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

interface FeatureToggleProps {
  /**
   * The feature flag key to check
   */
  featureKey: string;
  
  /**
   * Optional default value if flag doesn't exist (defaults to false)
   */
  defaultEnabled?: boolean;
  
  /**
   * Content to render when feature is enabled
   */
  children: ReactNode;
  
  /**
   * Optional content to render when feature is disabled
   */
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders content based on feature flag status
 * This component will automatically re-render when the flag changes in the database
 */
export function FeatureToggle({
  featureKey,
  defaultEnabled = false,
  children,
  fallback = null
}: FeatureToggleProps) {
  const isEnabled = useFeatureFlag(featureKey, defaultEnabled);
  
  return isEnabled ? <>{children}</> : <>{fallback}</>;
}
