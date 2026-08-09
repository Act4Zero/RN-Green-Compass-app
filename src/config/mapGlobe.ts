import { MapCameraState, MapStyleId, MapStylePreset, MapViewportBounds } from '../types/map';

export const EUROPE_GLOBE_CAMERA: MapCameraState = {
  center: { lat: 48.4, lng: 18.2 },
  zoom: 3.15,
  pitch: 18,
  heading: 0,
};

export const BULGARIA_CAMERA: MapCameraState = {
  center: { lat: 42.72, lng: 25.35 },
  zoom: 6.35,
  pitch: 38,
  heading: -8,
};

export const BULGARIA_BOUNDS: MapViewportBounds = {
  north: 44.22,
  south: 41.20,
  east: 28.65,
  west: 22.35,
};

export const MAP_STYLE_PRESETS: Record<MapStyleId, MapStylePreset> = {
  'living-earth': {
    id: 'living-earth',
    label: 'Living Earth',
    description: 'Daylight terrain and cities',
    styleUrl: 'mapbox://styles/mapbox/standard',
    lightPreset: 'day',
    icon: 'earth-outline',
    swatches: ['#8DD0BD', '#D7E6A8', '#174C35'],
  },
  'night-canopy': {
    id: 'night-canopy',
    label: 'Night Canopy',
    description: 'Low-light globe with bright pins',
    styleUrl: 'mapbox://styles/mapbox/standard',
    lightPreset: 'night',
    icon: 'moon-outline',
    swatches: ['#071C2C', '#174C35', '#C6F177'],
  },
  satellite: {
    id: 'satellite',
    label: 'Satellite',
    description: 'Imagery with 3D labels',
    styleUrl: 'mapbox://styles/mapbox/standard-satellite',
    lightPreset: 'day',
    icon: 'planet-outline',
    swatches: ['#1A3334', '#6C7A4B', '#E8F2C7'],
  },
};

export const MAP_STYLE_IDS = Object.keys(MAP_STYLE_PRESETS) as MapStyleId[];
export const MAP_STYLE_STORAGE_KEY = 'green-compass:map-style';

export const getMapboxAccessToken = (): string => process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim() ?? '';

export function isMapStyleId(value: unknown): value is MapStyleId {
  return typeof value === 'string' && MAP_STYLE_IDS.includes(value as MapStyleId);
}
