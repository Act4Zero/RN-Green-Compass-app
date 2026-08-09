import {
  LocationCategory,
  MapLocation,
  MapLocationFeatureCollection,
  MapPoint,
  MapViewportBounds,
} from '../types/map';
import { BULGARIA_BOUNDS } from '../config/mapGlobe';
import { calculateDistance } from './mapUtils';

export function locationsToFeatureCollection(locations: MapLocation[]): MapLocationFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: locations.map((location) => ({
      type: 'Feature',
      id: location.id,
      geometry: { type: 'Point', coordinates: [location.lng, location.lat] },
      properties: {
        id: location.id,
        name: location.name,
        category: location.category,
        powerKw: location.power_kw ?? null,
        fastCharge: Boolean(location.is_fast_charge_capable),
      },
    })),
  };
}

export function normalizeMapSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim();
}

function locationSearchText(location: MapLocation): string {
  return normalizeMapSearch([
    location.name,
    location.town,
    location.address_line_1,
    location.address_line_2,
    location.state_or_province,
    location.postcode,
    location.country,
  ].filter(Boolean).join(' '));
}

export function getAvailableCategories(locations: MapLocation[]): LocationCategory[] {
  return Array.from(new Set(locations.map((location) => location.category)));
}

export function filterMapLocations(
  locations: MapLocation[],
  enabledCategories: Partial<Record<LocationCategory, boolean>>,
  query: string,
): MapLocation[] {
  const normalizedQuery = normalizeMapSearch(query);
  return locations.filter((location) => {
    if (!enabledCategories[location.category]) return false;
    return !normalizedQuery || locationSearchText(location).includes(normalizedQuery);
  });
}

export function isPointInBounds(point: MapPoint, bounds?: MapViewportBounds): boolean {
  if (!bounds) return true;
  const longitudeMatches = bounds.west <= bounds.east
    ? point.lng >= bounds.west && point.lng <= bounds.east
    : point.lng >= bounds.west || point.lng <= bounds.east;
  return point.lat >= bounds.south && point.lat <= bounds.north && longitudeMatches;
}

export function getVisibleResults(
  locations: MapLocation[],
  bounds: MapViewportBounds | undefined,
  center: MapPoint,
  hasQuery: boolean,
): MapLocation[] {
  const visible = hasQuery
    ? locations
    : locations.filter((location) => isPointInBounds({ lat: location.lat, lng: location.lng }, bounds));
  return [...visible].sort((a, b) => {
    const distanceA = calculateDistance(center.lat, center.lng, a.lat, a.lng);
    const distanceB = calculateDistance(center.lat, center.lng, b.lat, b.lng);
    return distanceA - distanceB || a.name.localeCompare(b.name);
  });
}

export function isDetailedCameraOutOfCoverage(center: MapPoint, zoom: number): boolean {
  if (zoom < 5.5) return false;
  const buffer = 0.27;
  return center.lat > BULGARIA_BOUNDS.north + buffer
    || center.lat < BULGARIA_BOUNDS.south - buffer
    || center.lng > BULGARIA_BOUNDS.east + buffer
    || center.lng < BULGARIA_BOUNDS.west - buffer;
}

export function distanceFromPoint(location: MapLocation, point: MapPoint | null): number | null {
  if (!point) return null;
  return calculateDistance(point.lat, point.lng, location.lat, location.lng);
}
