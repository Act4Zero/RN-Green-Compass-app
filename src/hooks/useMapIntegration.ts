/**
 * Map Integration Hook
 * Provides a unified interface for UI components to interact with map business logic
 */
import { useEffect, useState, useCallback } from 'react';
import { 
  useMapState, 
  useMapLocations, 
  useMapFilters, 
  useSelectedLocation,
  useMapViewport
} from './useMapState';
import { getCurrentPosition, getMapErrorMessage } from '../utils/mapUtils';
import { createAppError, ErrorType, AppError } from '../utils/errorHandling';
import { LoadingState, createInitialLoadingState, shouldReload, startLoading, loadSuccess, loadError } from '../utils/loadingState';
import { LocationCategory } from '../types/map';

/**
 * Unified hook for map integration
 * Combines all map-related functionality into a single interface
 * for easier consumption by UI components
 */
export function useMapIntegration() {
  // Get all the map state functionality
  const mapState = useMapState();
  const { filteredLocations, loadLocations } = useMapLocations();
  const { filters, toggleCategoryFilter, toggleAllCategories } = useMapFilters();
  const { selectedLocation, selectLocation, clearSelectedLocation } = useSelectedLocation();
  const { viewport, updateViewport, isOutOfCoverage } = useMapViewport();

  // Loading state management to prevent infinite loops
  const [locationLoadingState, setLocationLoadingState] = useState<LoadingState>(createInitialLoadingState());
  const [geolocationState, setGeolocationState] = useState<LoadingState>(createInitialLoadingState());
  const [error, setError] = useState<AppError | null>(null);

  // Load all locations on mount, with safeguards against redundant loads
  useEffect(() => {
    const loadAllLocations = async () => {
      // Check if we should reload data based on current state
      if (!shouldReload(locationLoadingState)) {
        return;
      }

      // Update loading state
      setLocationLoadingState(startLoading(locationLoadingState));

      try {
        await loadLocations();
        setLocationLoadingState(loadSuccess(locationLoadingState));
        setError(null);
      } catch (err) {
        const appError = createAppError(err, ErrorType.DATA);
        setLocationLoadingState(loadError(locationLoadingState, appError.originalError || new Error(appError.message)));
        setError(appError);
      }
    };

    loadAllLocations();
  }, []);  // Empty dependency array to ensure this only runs once

  // Get user location
  const getUserLocation = useCallback(async () => {
    // Don't attempt if already loading or if we've failed multiple times
    if (!shouldReload(geolocationState, { maxAttempts: 2 })) {
      return;
    }

    setGeolocationState(startLoading(geolocationState));

    try {
      const position = await getCurrentPosition();
      updateViewport({
        center: position,
        zoom: viewport.zoom
      });
      setGeolocationState(loadSuccess(geolocationState));
    } catch (err) {
      const appError = createAppError(err, ErrorType.LOCATION);
      setGeolocationState(loadError(geolocationState, appError.originalError || new Error(appError.message)));
      setError(appError);
    }
  }, [updateViewport, viewport.zoom, geolocationState]);

  // Reset any error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Handle category filter toggle with improved error handling
  const handleCategoryToggle = useCallback((category: LocationCategory, enabled: boolean) => {
    try {
      toggleCategoryFilter(category, enabled);
    } catch (err) {
      const appError = createAppError(err, ErrorType.DATA);
      setError(appError);
    }
  }, [toggleCategoryFilter]);

  // Get human-readable error message
  const errorMessage = error ? getMapErrorMessage(error.originalError || new Error(error.message)) : '';

  return {
    // Map data
    locations: filteredLocations,
    filteredLocations,  // Explicitly expose filteredLocations for use in components
    selectedLocation,
    
    // Map state
    isLoading: locationLoadingState.isLoading,
    isLocationsLoaded: locationLoadingState.isLoaded,
    isLoadingUserLocation: geolocationState.isLoading,
    isOutOfCoverage,
    
    // Filters
    filters: filters.categories,
    
    // Map viewport
    viewport,
    
    // Error state
    error,
    errorMessage,
    
    // Actions
    selectLocation,
    clearSelectedLocation,
    toggleCategory: handleCategoryToggle,
    toggleAllCategories,
    getUserLocation,
    updateViewport,
    clearError
  };
}
