import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import analyticsService from '../services/analyticsService';
import { loadLocations } from '../services/mapService';
import {
  LocationCategory,
  MapCameraCommand,
  MapCameraState,
  MapFilters,
  MapLocation,
  MapPoint,
  MapStyleId,
} from '../types/map';
import {
  BULGARIA_CAMERA,
  EUROPE_GLOBE_CAMERA,
  isMapStyleId,
  MAP_STYLE_STORAGE_KEY,
} from '../config/mapGlobe';
import {
  filterMapLocations,
  getAvailableCategories,
  getVisibleResults,
  isDetailedCameraOutOfCoverage,
} from '../utils/mapGlobe';
import { getCurrentPosition } from '../utils/mapUtils';
import { sustainabilityMapService } from '../features/sustainability-map';
import { INITIAL_MAP_CONTROLLER_STATE, mapControllerReducer } from './mapControllerReducer';

export interface MapContextType {
  locations: MapLocation[];
  filteredLocations: MapLocation[];
  visibleLocations: MapLocation[];
  availableCategories: LocationCategory[];
  filters: MapFilters;
  query: string;
  selectedLocation: MapLocation | null;
  styleId: MapStyleId;
  camera: MapCameraState;
  cameraCommand: MapCameraCommand | null;
  userLocation: MapPoint | null;
  isLoading: boolean;
  error: Error | null;
  isLocating: boolean;
  locationError: string | null;
  isOutOfCoverage: boolean;
  isResultsOpen: boolean;
  isResultsRailCollapsed: boolean;
  isDataInitialized: boolean;
  recommendationIds: string[];
  loadAllLocations: () => Promise<void>;
  toggleCategoryFilter: (category: LocationCategory, enabled: boolean) => void;
  toggleAllCategories: (enabled: boolean) => void;
  setQuery: (query: string) => void;
  selectLocation: (location: MapLocation | null, moveCamera?: boolean) => void;
  setStyleId: (styleId: MapStyleId) => void;
  updateCamera: (camera: MapCameraState) => void;
  moveCamera: (camera: Partial<MapCameraState>, durationMs?: number) => void;
  locateUser: () => Promise<MapPoint | null>;
  clearLocationError: () => void;
  setResultsOpen: (open: boolean) => void;
  setResultsRailCollapsed: (collapsed: boolean) => void;
  resetViewportToDefault: () => void;
  checkCoverage: () => void;
  refreshRecommendations: (point?: MapPoint) => Promise<void>;
}

const unavailable = () => undefined;

export const MapContext = createContext<MapContextType>({
  locations: [], filteredLocations: [], visibleLocations: [], availableCategories: [],
  filters: { categories: {} }, query: '', selectedLocation: null, styleId: 'living-earth',
  camera: EUROPE_GLOBE_CAMERA, cameraCommand: null, userLocation: null, isLoading: false,
  error: null, isLocating: false, locationError: null, isOutOfCoverage: false,
  isResultsOpen: false, isResultsRailCollapsed: false, isDataInitialized: false,
  recommendationIds: [],
  loadAllLocations: async () => undefined,
  toggleCategoryFilter: unavailable, toggleAllCategories: unavailable, setQuery: unavailable,
  selectLocation: unavailable, setStyleId: unavailable, updateCamera: unavailable,
  moveCamera: unavailable, locateUser: async () => null, clearLocationError: unavailable,
  setResultsOpen: unavailable, setResultsRailCollapsed: unavailable,
  resetViewportToDefault: unavailable, checkCoverage: unavailable,
  refreshRecommendations: async () => undefined,
});

export function MapProvider({ children }: { children: ReactNode }) {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [controller, dispatch] = useReducer(mapControllerReducer, INITIAL_MAP_CONTROLLER_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [recommendationIds, setRecommendationIds] = useState<string[]>([]);
  const commandId = useRef(0);
  const hasTrackedSearch = useRef(false);
  const loaded = useRef(false);
  const recommendationsLoaded = useRef(false);

  const loadAllLocations = useCallback(async () => {
    if (loaded.current) return;
    loaded.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const nextLocations = await loadLocations();
      const categories = getAvailableCategories(nextLocations);
      setLocations(nextLocations);
      dispatch({ type: 'categories-ready', categories });
    } catch (loadError) {
      const nextError = loadError instanceof Error ? loadError : new Error('Unable to load map locations.');
      setError(nextError);
      loaded.current = false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadAllLocations(); }, [loadAllLocations]);
  useEffect(() => {
    void AsyncStorage.getItem(MAP_STYLE_STORAGE_KEY).then((stored) => {
      if (isMapStyleId(stored)) dispatch({ type: 'style-changed', styleId: stored });
    }).catch(() => undefined);
  }, []);

  const availableCategories = useMemo(() => getAvailableCategories(locations), [locations]);
  const {
    camera, cameraCommand, filters, isResultsOpen, isResultsRailCollapsed,
    query, selectedLocation, styleId, userLocation,
  } = controller;
  const filteredLocations = useMemo(
    () => filterMapLocations(locations, filters.categories, query),
    [filters.categories, locations, query],
  );
  const visibleLocations = useMemo(
    () => getVisibleResults(filteredLocations, camera.bounds, camera.center, Boolean(query.trim())),
    [camera.bounds, camera.center, filteredLocations, query],
  );
  const isOutOfCoverage = isDetailedCameraOutOfCoverage(camera.center, camera.zoom);

  const moveCamera = useCallback((next: Partial<MapCameraState>, durationMs = 900) => {
    commandId.current += 1;
    dispatch({ type: 'camera-commanded', command: { ...next, id: commandId.current, durationMs } });
  }, []);

  const refreshRecommendations = useCallback(async (point?: MapPoint) => {
    try {
      const recommendations = await sustainabilityMapService.listRecommendations(point || controller.userLocation || controller.camera.center);
      setRecommendationIds(recommendations.map((item) => item.locationId));
    } catch { setRecommendationIds([]); }
  }, [controller.camera.center, controller.userLocation]);

  useEffect(() => {
    if (!locations.length || recommendationsLoaded.current) return;
    recommendationsLoaded.current = true;
    void refreshRecommendations();
  }, [locations.length, refreshRecommendations]);

  const toggleCategoryFilter = useCallback((category: LocationCategory, enabled: boolean) => {
    dispatch({ type: 'category-toggled', category, enabled });
    analyticsService.trackEvent('map_filter_toggled', { category, enabled });
  }, []);

  const toggleAllCategories = useCallback((enabled: boolean) => {
    dispatch({ type: 'all-categories-toggled', enabled });
    analyticsService.trackEvent('map_filter_toggled', { category: 'all', enabled });
  }, []);

  const setQuery = useCallback((nextQuery: string) => {
    dispatch({ type: 'query-changed', query: nextQuery });
    if (nextQuery.trim() && !hasTrackedSearch.current) {
      hasTrackedSearch.current = true;
      analyticsService.trackEvent('map_search_used');
    }
    if (!nextQuery.trim()) hasTrackedSearch.current = false;
  }, []);

  const selectLocation = useCallback((location: MapLocation | null, shouldMove = true) => {
    dispatch({ type: 'location-selected', location });
    if (location) {
      analyticsService.trackEvent('map_pin_selected', { location_id: location.id, category: location.category });
      if (shouldMove) moveCamera({ center: { lat: location.lat, lng: location.lng }, zoom: 13.2, pitch: 48 }, 850);
    }
  }, [moveCamera]);

  const setStyleId = useCallback((nextStyleId: MapStyleId) => {
    dispatch({ type: 'style-changed', styleId: nextStyleId });
    void AsyncStorage.setItem(MAP_STYLE_STORAGE_KEY, nextStyleId).catch(() => undefined);
    analyticsService.trackEvent('map_style_changed', { style: nextStyleId });
  }, []);

  const locateUser = useCallback(async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const point = await getCurrentPosition();
      dispatch({ type: 'user-located', location: point });
      moveCamera({ center: point, zoom: 13.5, pitch: 42 }, 900);
      void refreshRecommendations(point);
      analyticsService.trackEvent('map_locate_outcome', { outcome: 'success' });
      return point;
    } catch (locateError) {
      const message = locateError instanceof Error ? locateError.message : 'Could not get your location.';
      setLocationError(message);
      analyticsService.trackEvent('map_locate_outcome', { outcome: 'error' });
      return null;
    } finally {
      setIsLocating(false);
    }
  }, [moveCamera, refreshRecommendations]);

  const resetViewportToDefault = useCallback(() => {
    moveCamera(BULGARIA_CAMERA, 950);
    analyticsService.trackEvent('map_coverage_return');
  }, [moveCamera]);

  const value = useMemo<MapContextType>(() => ({
    locations, filteredLocations, visibleLocations, availableCategories, filters, query,
    selectedLocation, styleId, camera, cameraCommand, userLocation, isLoading, error,
    isLocating, locationError, isOutOfCoverage, isResultsOpen, isResultsRailCollapsed,
    isDataInitialized: !isLoading && !error,
    recommendationIds,
    loadAllLocations, toggleCategoryFilter, toggleAllCategories, setQuery, selectLocation,
    setStyleId, updateCamera: (nextCamera) => dispatch({ type: 'camera-changed', camera: nextCamera }), moveCamera, locateUser,
    clearLocationError: () => setLocationError(null),
    setResultsOpen: (open) => dispatch({ type: 'results-visibility-changed', open }),
    setResultsRailCollapsed: (collapsed) => dispatch({ type: 'results-rail-collapsed-changed', collapsed }),
    resetViewportToDefault, checkCoverage: () => undefined, refreshRecommendations,
  }), [
    locations, filteredLocations, visibleLocations, availableCategories, filters, query,
    selectedLocation, styleId, camera, cameraCommand, userLocation, isLoading, error,
    isLocating, locationError, isOutOfCoverage, isResultsOpen, isResultsRailCollapsed, loadAllLocations,
    toggleCategoryFilter, toggleAllCategories, setQuery, selectLocation, setStyleId,
    moveCamera, locateUser, resetViewportToDefault, recommendationIds, refreshRecommendations,
  ]);

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}
