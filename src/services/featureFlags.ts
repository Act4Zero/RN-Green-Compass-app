import { useEffect, useState, useCallback } from 'react';
import supabase, { isSupabaseConfigured } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

export type FeatureFlag = Database['public']['Tables']['feature_flags']['Row'];
export type FeatureFlagMap = Record<string, boolean>;

/**
 * Service for managing feature flags with real-time updates
 */
export const FeatureFlagsService = {
  /**
   * Fetch all feature flags from the database
   */
  async getFeatureFlags(): Promise<FeatureFlagMap> {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*');

      if (error) {
        console.error('Error fetching feature flags:', error);
        return {};
      }

      // Convert array of feature flags to a map of key -> enabled
      return (data || []).reduce((flags, flag) => {
        flags[flag.key] = flag.enabled;
        return flags;
      }, {} as FeatureFlagMap);
    } catch (error) {
      console.error('Unexpected error fetching feature flags:', error);
      return {};
    }
  },

  /**
   * Subscribe to real-time updates on the feature_flags table
   */
  subscribeToFeatureFlags(
    callback: (flags: FeatureFlagMap) => void
  ): RealtimeChannel {
    // First, get the initial state
    this.getFeatureFlags().then(callback);

    // Then subscribe to changes
    const channel = supabase
      .channel('feature_flags_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'feature_flags',
        },
        async () => {
          // When any change happens, fetch the complete set of flags
          const flags = await this.getFeatureFlags();
          callback(flags);
        }
      )
      .subscribe();

    return channel;
  },
};

/**
 * React hook to use feature flags with real-time updates
 */
export function useFeatureFlags(): {
  flags: FeatureFlagMap;
  loading: boolean;
  isEnabled: (key: string) => boolean;
} {
  const [flags, setFlags] = useState<FeatureFlagMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Public/static previews are intentionally usable without Supabase secrets.
    // Avoid querying the build placeholder (and emitting a console error) until
    // a real backend is configured.
    if (!isSupabaseConfigured) {
      setFlags({});
      setLoading(false);
      return;
    }

    // Subscribe to feature flags
    const channel = FeatureFlagsService.subscribeToFeatureFlags((newFlags) => {
      setFlags(newFlags);
      setLoading(false);
    });

    // Cleanup subscription
    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Utility function to check if a flag is enabled
  const isEnabled = useCallback(
    (key: string): boolean => {
      return !!flags[key];
    },
    [flags]
  );

  return { flags, loading, isEnabled };
}
