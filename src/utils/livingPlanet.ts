import type { MapExperienceMode, MapPoint } from '../types/map';

const DEG_TO_RAD = Math.PI / 180;

export type Vector3Tuple = [x: number, y: number, z: number];

export function latLngToSphere(point: MapPoint, radius = 1): Vector3Tuple {
  const phi = (90 - point.lat) * DEG_TO_RAD;
  const theta = (point.lng + 180) * DEG_TO_RAD;
  return [
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

export function isSpherePointVisible(point: Vector3Tuple, cameraDirection: Vector3Tuple = [0, 0, 1]): boolean {
  return point[0] * cameraDirection[0] + point[1] * cameraDirection[1] + point[2] * cameraDirection[2] > 0;
}

export function getUtcSunDirection(date = new Date()): Vector3Tuple {
  const dayStart = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = (date.getTime() - dayStart) / 86_400_000;
  const declination = -23.44 * Math.cos((2 * Math.PI / 365) * (day + 10));
  const longitude = 180 - (date.getUTCHours() * 15 + date.getUTCMinutes() * 0.25);
  return latLngToSphere({ lat: declination, lng: longitude }, 8);
}

export type MapExperienceAction =
  | { type: 'open-map' }
  | { type: 'open-globe' }
  | { type: 'transition-complete' };

export function mapExperienceReducer(mode: MapExperienceMode, action: MapExperienceAction): MapExperienceMode {
  if (action.type === 'open-map') return mode === 'globe' || mode === 'to-globe' ? 'to-map' : mode;
  if (action.type === 'open-globe') return mode === 'map' || mode === 'to-map' ? 'to-globe' : mode;
  if (action.type === 'transition-complete') {
    if (mode === 'to-map') return 'map';
    if (mode === 'to-globe') return 'globe';
  }
  return mode;
}

export function offlinePackContainsPoint(bounds: [number, number, number, number], point: MapPoint): boolean {
  const [west, south, east, north] = bounds;
  return point.lng >= west && point.lng <= east && point.lat >= south && point.lat <= north;
}
