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
  'living-planet': {
    id: 'living-planet',
    label: 'Living Planet',
    description: 'Green Compass day and night map',
    styleUrl: process.env.EXPO_PUBLIC_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/liberty',
    icon: 'earth-outline',
    swatches: ['#071C2C', '#174C35', '#C6F177'],
  },
};

export const MAP_STYLE_IDS = Object.keys(MAP_STYLE_PRESETS) as MapStyleId[];
export const MAP_STYLE_STORAGE_KEY = 'green-compass:map-style';
export const OPENFREEMAP_STYLE_URL = MAP_STYLE_PRESETS['living-planet'].styleUrl;
export const MAP_PACK_MANIFEST_URL = process.env.EXPO_PUBLIC_MAP_PACK_MANIFEST_URL || '';

export function isMapStyleId(value: unknown): value is MapStyleId {
  return typeof value === 'string' && MAP_STYLE_IDS.includes(value as MapStyleId);
}
