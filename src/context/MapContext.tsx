/**
 * Map Context
 * Provides state management for the sustainability map feature
 */
import { createContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  MapState, 
  MapLocation, 
  LocationCategory, 
  MapFilters, 
  MapViewport 
} from '../types/map';
import { 
  loadLocations, 
  DEFAULT_CENTER, 
  DEFAULT_ZOOM, 
  filterLocationsByCategory,
  isOutOfCoverage
} from '../services/mapService';

// Define initial map filters with all categories enabled by default
const initialFilters: MapFilters = {
  categories: {
    'EV Charging Stations': true,
    'Recycling': true,
    'Organic Food': true,
    'Zero-Waste': true,
    'Green Building': true,
    'Community': true
  }
};

// Initial map state
const initialState: MapState = {
  locations: [],
  filteredLocations: [],
  isLoading: false,
  error: null,
  filters: initialFilters,
  selectedLocation: null,
  viewport: {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM
  },
  isOutOfCoverage: false
};

// Action types for the reducer
type MapAction =
  | { type: 'LOAD_LOCATIONS_START' }
  | { type: 'LOAD_LOCATIONS_SUCCESS'; payload: MapLocation[] }
  | { type: 'LOAD_LOCATIONS_ERROR'; payload: Error }
  | { type: 'SET_FILTER'; payload: { category: LocationCategory; enabled: boolean } }
  | { type: 'SELECT_LOCATION'; payload: MapLocation | null }
  | { type: 'SET_VIEWPORT'; payload: MapViewport }
  | { type: 'CHECK_COVERAGE' };

// Reducer for managing map state
function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case 'LOAD_LOCATIONS_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case 'LOAD_LOCATIONS_SUCCESS': {
      const locations = action.payload;
      // Apply current filters to the loaded locations
      const enabledCategories = Object.entries(state.filters.categories)
        .filter(([_, enabled]) => enabled)
        .map(([category]) => category as LocationCategory);
      
      const filteredLocations = filterLocationsByCategory(locations, enabledCategories);
      
      return {
        ...state,
        locations,
        filteredLocations,
        isLoading: false
      };
    }
    
    case 'LOAD_LOCATIONS_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    
    case 'SET_FILTER': {
      const { category, enabled } = action.payload;
      const newFilters = {
        ...state.filters,
        categories: {
          ...state.filters.categories,
          [category]: enabled
        }
      };
      
      // Apply updated filters
      const enabledCategories = Object.entries(newFilters.categories)
        .filter(([_, enabled]) => enabled)
        .map(([category]) => category as LocationCategory);
      
      const filteredLocations = filterLocationsByCategory(state.locations, enabledCategories);
      
      return {
        ...state,
        filters: newFilters,
        filteredLocations
      };
    }
    
    case 'SELECT_LOCATION':
      return {
        ...state,
        selectedLocation: action.payload
      };
    
    case 'SET_VIEWPORT': {
      const newViewport = action.payload;
      // Check if we're out of coverage whenever the viewport changes
      const isCurrentlyOutOfCoverage = isOutOfCoverage(
        newViewport.center.lat,
        newViewport.center.lng
      );
      
      return {
        ...state,
        viewport: newViewport,
        isOutOfCoverage: isCurrentlyOutOfCoverage
      };
    }
    
    case 'CHECK_COVERAGE': {
      const isCurrentlyOutOfCoverage = isOutOfCoverage(
        state.viewport.center.lat,
        state.viewport.center.lng
      );
      
      return {
        ...state,
        isOutOfCoverage: isCurrentlyOutOfCoverage
      };
    }
    
    default:
      return state;
  }
}

// Create context with initial state
interface MapContextType extends MapState {
  loadAllLocations: () => Promise<void>;
  toggleCategoryFilter: (category: LocationCategory, enabled: boolean) => void;
  selectLocation: (location: MapLocation | null) => void;
  updateViewport: (viewport: MapViewport) => void;
  checkCoverage: () => void;
}

// Create context with default values
export const MapContext = createContext<MapContextType>({
  ...initialState,
  loadAllLocations: async () => {},
  toggleCategoryFilter: () => {},
  selectLocation: () => {},
  updateViewport: () => {},
  checkCoverage: () => {}
});

// Provider component
interface MapProviderProps {
  children: ReactNode;
}

export function MapProvider({ children }: MapProviderProps) {
  const [state, dispatch] = useReducer(mapReducer, initialState);
  
  // Load locations on initial mount
  const loadAllLocations = async () => {
    dispatch({ type: 'LOAD_LOCATIONS_START' });
    try {
      const locations = await loadLocations();
      dispatch({ type: 'LOAD_LOCATIONS_SUCCESS', payload: locations });
    } catch (error) {
      dispatch({ 
        type: 'LOAD_LOCATIONS_ERROR', 
        payload: error instanceof Error ? error : new Error('Unknown error loading locations') 
      });
    }
  };
  
  // Toggle a category filter
  const toggleCategoryFilter = (category: LocationCategory, enabled: boolean) => {
    dispatch({ type: 'SET_FILTER', payload: { category, enabled } });
  };
  
  // Select a location
  const selectLocation = (location: MapLocation | null) => {
    dispatch({ type: 'SELECT_LOCATION', payload: location });
  };
  
  // Update the map viewport
  const updateViewport = (viewport: MapViewport) => {
    dispatch({ type: 'SET_VIEWPORT', payload: viewport });
  };
  
  // Check if we're out of coverage area
  const checkCoverage = () => {
    dispatch({ type: 'CHECK_COVERAGE' });
  };
  
  // Context value
  const contextValue: MapContextType = {
    ...state,
    loadAllLocations,
    toggleCategoryFilter,
    selectLocation,
    updateViewport,
    checkCoverage
  };
  
  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
}
