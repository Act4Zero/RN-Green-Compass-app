/**
 * Type definitions for the Sustainability Map feature
 */

/**
 * Categories for sustainable locations
 * Six required categories: EV, Recycling, Organic, Zero-Waste, Green Building, Community
 */
export type LocationCategory = 
  | 'EV Charging Stations'
  | 'Recycling'
  | 'Organic Food'
  | 'Zero-Waste'
  | 'Green Building'
  | 'Community';

/**
 * Map location data structure as defined in the technical specification
 * Based on the static JSON format from locations.json
 */
export interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  town: string;
  state_or_province: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  postcode: string | null;
  country: string | null;
  category: LocationCategory;
  source: string | null;
  licence: string | null;
  
  // Optional fields that may be specific to certain categories
  // EV Charging specific fields
  usage_cost?: string | null;
  connection_type?: string | null;
  power_kw?: number | null;
  level?: string | null;
  is_fast_charge_capable?: boolean;
  
  // Additional fields that might be useful
  description?: string;
  website?: string;
}

/**
 * Filter state for the map
 */
export interface MapFilters {
  categories: {
    [key in LocationCategory]: boolean;
  };
}

/**
 * Map viewport state
 */
export interface MapViewport {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
}

/**
 * Geographic bounds
 */
export interface GeographicBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Map state interface
 */
export interface MapState {
  locations: MapLocation[];
  filteredLocations: MapLocation[];
  isLoading: boolean;
  error: Error | null;
  filters: MapFilters;
  selectedLocation: MapLocation | null;
  viewport: MapViewport;
  isOutOfCoverage: boolean;
}
