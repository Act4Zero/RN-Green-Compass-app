import { EUROPE_GLOBE_CAMERA } from '../config/mapGlobe';
import {
  LocationCategory,
  MapCameraCommand,
  MapCameraState,
  MapFilters,
  MapLocation,
  MapPoint,
  MapStyleId,
} from '../types/map';

export interface MapControllerState {
  filters: MapFilters;
  query: string;
  selectedLocation: MapLocation | null;
  styleId: MapStyleId;
  camera: MapCameraState;
  cameraCommand: MapCameraCommand | null;
  userLocation: MapPoint | null;
  isResultsOpen: boolean;
  isResultsRailCollapsed: boolean;
}

export type MapControllerAction =
  | { type: 'categories-ready'; categories: LocationCategory[] }
  | { type: 'category-toggled'; category: LocationCategory; enabled: boolean }
  | { type: 'all-categories-toggled'; enabled: boolean }
  | { type: 'query-changed'; query: string }
  | { type: 'location-selected'; location: MapLocation | null }
  | { type: 'style-changed'; styleId: MapStyleId }
  | { type: 'camera-changed'; camera: MapCameraState }
  | { type: 'camera-commanded'; command: MapCameraCommand }
  | { type: 'user-located'; location: MapPoint }
  | { type: 'results-visibility-changed'; open: boolean }
  | { type: 'results-rail-collapsed-changed'; collapsed: boolean };

export const INITIAL_MAP_CONTROLLER_STATE: MapControllerState = {
  filters: { categories: {} },
  query: '',
  selectedLocation: null,
  styleId: 'living-planet',
  camera: EUROPE_GLOBE_CAMERA,
  cameraCommand: null,
  userLocation: null,
  isResultsOpen: false,
  isResultsRailCollapsed: true,
};

export function mapControllerReducer(
  state: MapControllerState,
  action: MapControllerAction,
): MapControllerState {
  switch (action.type) {
    case 'categories-ready':
      return {
        ...state,
        filters: {
          categories: Object.fromEntries(action.categories.map((category) => [category, true])),
        },
      };
    case 'category-toggled':
      return {
        ...state,
        filters: {
          categories: { ...state.filters.categories, [action.category]: action.enabled },
        },
      };
    case 'all-categories-toggled':
      return {
        ...state,
        filters: {
          categories: Object.fromEntries(
            Object.keys(state.filters.categories).map((category) => [category, action.enabled]),
          ),
        },
      };
    case 'query-changed':
      return { ...state, query: action.query };
    case 'location-selected':
      return { ...state, selectedLocation: action.location };
    case 'style-changed':
      return { ...state, styleId: action.styleId };
    case 'camera-changed':
      return { ...state, camera: action.camera };
    case 'camera-commanded':
      return { ...state, cameraCommand: action.command };
    case 'user-located':
      return { ...state, userLocation: action.location };
    case 'results-visibility-changed':
      return { ...state, isResultsOpen: action.open };
    case 'results-rail-collapsed-changed':
      return { ...state, isResultsRailCollapsed: action.collapsed };
    default:
      return state;
  }
}
