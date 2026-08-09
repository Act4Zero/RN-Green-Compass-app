import { useContext } from 'react';
import { MapContext } from '../context/MapContext';

/** Single presentation-facing facade for the Sustainability Globe controller. */
export function useMapIntegration() {
  const map = useContext(MapContext);
  return {
    ...map,
    toggleCategory: map.toggleCategoryFilter,
    clearSelectedLocation: () => map.selectLocation(null, false),
    getUserLocation: map.locateUser,
    updateViewport: map.updateCamera,
    errorMessage: map.error?.message ?? '',
    isLocationsLoaded: map.isDataInitialized,
    isLoadingUserLocation: map.isLocating,
    clearError: () => undefined,
  };
}
