import { useState, useEffect } from 'react';
import { getEVLocations } from '../utils/locationDataUtils';
import { MapLocation } from '../types/map';

/**
 * Hook to load and manage location data from local sources
 */
export function useLocationData() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Load locations on mount
  useEffect(() => {
    async function loadLocations() {
      try {
        setIsLoading(true);
        const evLocations = await getEVLocations();
        setLocations(evLocations);
        setHasError(false);
      } catch (error) {
        console.error('Error loading location data:', error);
        setHasError(true);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load location data');
      } finally {
        setIsLoading(false);
      }
    }

    loadLocations();
  }, []);

  return {
    locations,
    isLoading,
    hasError,
    errorMessage
  };
}
