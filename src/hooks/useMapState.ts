/**
 * Map state hook
 * Provides access to the map context state and actions
 */
import { useContext, useCallback } from 'react';
import { MapContext } from '../context/MapContext';
import { LocationCategory } from '../types/map';

/**
 * Hook to access and manipulate map state
 */
export function useMapState() {
  const context = useContext(MapContext);

  if (!context) {
    throw new Error('useMapState must be used within a MapProvider');
  }

  return context;
}

/**
 * Simplified hook for accessing map locations
 */
export function useMapLocations() {
  const { 
    locations, 
    filteredLocations, 
    isLoading, 
    error, 
    loadAllLocations 
  } = useMapState();

  return {
    allLocations: locations,
    filteredLocations,
    isLoading,
    error,
    loadLocations: loadAllLocations
  };
}

/**
 * Hook for managing map filters
 */
export function useMapFilters() {
  const { filters, toggleCategoryFilter, toggleAllCategories } = useMapState();

  const enabledCategories = useCallback(() => {
    return Object.entries(filters.categories)
      .filter(([_, enabled]) => enabled)
      .map(([category]) => category as LocationCategory);
  }, [filters.categories]);

  const disabledCategories = useCallback(() => {
    return Object.entries(filters.categories)
      .filter(([_, enabled]) => !enabled)
      .map(([category]) => category as LocationCategory);
  }, [filters.categories]);

  const areAllCategoriesEnabled = useCallback(() => {
    return Object.values(filters.categories).every(enabled => enabled);
  }, [filters.categories]);

  const areAllCategoriesDisabled = useCallback(() => {
    return Object.values(filters.categories).every(enabled => !enabled);
  }, [filters.categories]);

  return {
    filters,
    toggleCategoryFilter,
    enabledCategories,
    disabledCategories,
    areAllCategoriesEnabled,
    areAllCategoriesDisabled,
    toggleAllCategories
  };
}

/**
 * Hook for selected location management
 */
export function useSelectedLocation() {
  const { selectedLocation, selectLocation } = useMapState();

  const hasSelectedLocation = !!selectedLocation;

  const clearSelectedLocation = useCallback(() => {
    selectLocation(null);
  }, [selectLocation]);

  return {
    selectedLocation,
    hasSelectedLocation,
    selectLocation,
    clearSelectedLocation
  };
}

/**
 * Hook for viewport and coverage management
 */
export function useMapViewport() {
  const { camera, isOutOfCoverage, updateCamera, checkCoverage } = useMapState();

  return {
    viewport: camera,
    isOutOfCoverage,
    updateViewport: updateCamera,
    checkCoverage
  };
}
