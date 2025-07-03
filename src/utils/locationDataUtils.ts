import { Platform } from 'react-native';
import { MapLocation, LocationCategory } from '../types/map';

// Import the locations data when in a bundled environment
// This is the best practice for importing JSON data in a React Native app
let evLocations: MapLocation[] = [];

/**
 * Load EV charging station locations
 * 
 * This function handles loading locations data consistently across platforms
 */
export const loadEVLocations = async (): Promise<MapLocation[]> => {
  try {
    // Use require for both platforms - safer with current TypeScript config
    // This approach avoids dynamic import issues
    const locationsData = require('../../assets/data/locations_ev_bulgaria.json');
    return transformLocationsData(locationsData);
  } catch (error) {
    console.error('Failed to load EV locations data:', error);
    return [];
  }
};

/**
 * Transform raw location data to match the MapLocation type
 */
const transformLocationsData = (rawData: any[]): MapLocation[] => {
  return rawData.map(item => ({
    id: item.id,
    name: item.name,
    lat: item.lat,
    lng: item.lng,
    town: item.town || '',
    state_or_province: item.state_or_province,
    address_line_1: item.address_line_1,
    address_line_2: item.address_line_2,
    postcode: item.postcode,
    country: item.country || 'Bulgaria',
    category: (item.category || 'EV Charging Stations') as LocationCategory,
    source: item.source,
    licence: item.licence,
    description: generateDescription(item),
    usage_cost: item.usage_cost,
    connection_type: item.connection_type,
    power_kw: item.power_kw,
    level: item.level,
    is_fast_charge_capable: item.is_fast_charge_capable || false
  }));
};

/**
 * Generate a description string based on available EV station details
 */
const generateDescription = (item: any): string => {
  const parts = [];
  
  if (item.power_kw) {
    parts.push(`${item.power_kw}kW charging power`);
  }
  
  if (item.is_fast_charge_capable) {
    parts.push('Fast charging available');
  }
  
  if (item.connection_type) {
    parts.push(`${item.connection_type} connector`);
  }
  
  if (parts.length === 0) {
    return 'EV Charging Station';
  }
  
  return parts.join(', ');
};

/**
 * Get all locations from the dataset
 */
export const getEVLocations = async (): Promise<MapLocation[]> => {
  // If we already loaded the locations, return them
  if (evLocations.length > 0) {
    return evLocations;
  }
  
  // Load the locations
  evLocations = await loadEVLocations();
  return evLocations;
};
