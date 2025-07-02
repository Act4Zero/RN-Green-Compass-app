/**
 * Map Service
 * Handles loading and filtering map location data
 */
import { MapLocation, LocationCategory, GeographicBounds } from '../types/map';

// Default center coordinates for Sofia, Bulgaria
export const DEFAULT_CENTER = {
  lat: 42.698334,
  lng: 23.319941,
};

// Default zoom level for initial map load
export const DEFAULT_ZOOM = 12;

// Bulgaria approximate bounds
export const BULGARIA_BOUNDS: GeographicBounds = {
  north: 44.2,
  south: 41.2,
  east: 28.6,
  west: 22.4,
};

/**
 * Load locations from the static JSON file
 * In a real application, this might be replaced with an API call
 */
export const loadLocations = async (): Promise<MapLocation[]> => {
  try {
    // In a real application with API calls, we would use fetch here
    // For MVP, we're loading from a local JSON file
    const response = await fetch('/map/locations.json');
    
    if (!response.ok) {
      throw new Error(`Failed to load locations: ${response.statusText}`);
    }
    
    const data: MapLocation[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading locations:', error);
    throw error;
  }
};

/**
 * Filter locations by category
 */
export const filterLocationsByCategory = (
  locations: MapLocation[],
  enabledCategories: LocationCategory[]
): MapLocation[] => {
  if (enabledCategories.length === 0) {
    return [];
  }
  
  return locations.filter(location => 
    enabledCategories.includes(location.category)
  );
};

/**
 * Check if coordinates are within Bulgaria's bounds
 */
export const isWithinBulgaria = (lat: number, lng: number): boolean => {
  return (
    lat <= BULGARIA_BOUNDS.north &&
    lat >= BULGARIA_BOUNDS.south &&
    lng <= BULGARIA_BOUNDS.east &&
    lng >= BULGARIA_BOUNDS.west
  );
};

/**
 * Check if coordinates are outside the coverage area (>30km from Bulgaria)
 * This is a simplified implementation - a more accurate one would use
 * the Haversine formula to calculate distance
 */
export const isOutOfCoverage = (lat: number, lng: number): boolean => {
  // Simple buffer around Bulgaria's bounds (approximately 30km)
  const buffer = 0.27; // ~30km in decimal degrees
  
  return (
    lat > BULGARIA_BOUNDS.north + buffer ||
    lat < BULGARIA_BOUNDS.south - buffer ||
    lng > BULGARIA_BOUNDS.east + buffer ||
    lng < BULGARIA_BOUNDS.west - buffer
  );
};

/**
 * Generate a Google Maps navigation URL for a location
 */
export const getNavigationUrl = (location: MapLocation): string => {
  const destination = encodeURIComponent(
    `${location.name}, ${location.address_line_1 || ''}, ${location.town || ''}, ${location.state_or_province || ''}`
  );
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${location.id}`;
};

/**
 * Generate a simplified address string
 */
export const formatAddress = (location: MapLocation): string => {
  const parts = [
    location.address_line_1,
    location.address_line_2,
    location.town,
    location.state_or_province,
    location.postcode,
    location.country,
  ].filter(Boolean);
  
  return parts.join(', ');
};
