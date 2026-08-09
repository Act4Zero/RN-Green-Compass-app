/** Shared contracts for the Sustainability Globe feature. */
export type LocationCategory =
  | 'EV Charging Stations'
  | 'Recycling'
  | 'Organic Food'
  | 'Zero-Waste'
  | 'Green Building'
  | 'Community';

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
  usage_cost?: string | null;
  connection_type?: string | null;
  power_kw?: number | null;
  level?: string | null;
  is_fast_charge_capable?: boolean;
  description?: string;
  website?: string;
}

export type MapStyleId = 'living-earth' | 'night-canopy' | 'satellite';

export interface MapStylePreset {
  id: MapStyleId;
  label: string;
  description: string;
  styleUrl: string;
  lightPreset: 'day' | 'night';
  icon: 'earth-outline' | 'moon-outline' | 'planet-outline';
  swatches: readonly [string, string, string];
}

export interface MapPoint {
  lat: number;
  lng: number;
}

export interface MapViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapCameraState {
  center: MapPoint;
  zoom: number;
  pitch: number;
  heading: number;
  bounds?: MapViewportBounds;
}

export interface MapCameraCommand extends Partial<MapCameraState> {
  id: number;
  durationMs?: number;
}

export interface MapLocationFeatureProperties {
  id: string;
  name: string;
  category: LocationCategory;
  powerKw: number | null;
  fastCharge: boolean;
}

export type MapLocationFeature = GeoJSON.Feature<GeoJSON.Point, MapLocationFeatureProperties>;
export type MapLocationFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Point,
  MapLocationFeatureProperties
>;

export interface MapRendererProps {
  accessToken: string;
  locations: MapLocation[];
  selectedLocationId: string | null;
  styleId: MapStyleId;
  cameraCommand: MapCameraCommand | null;
  userLocation: MapPoint | null;
  reducedMotion: boolean;
  onReady: () => void;
  onCameraChanged: (camera: MapCameraState) => void;
  onLocationPress: (locationId: string) => void;
  onClusterPress: (center: MapPoint, expansionZoom: number) => void;
  onError: (message: string) => void;
}

export interface MapFilters {
  categories: Partial<Record<LocationCategory, boolean>>;
}

export type GeographicBounds = MapViewportBounds;

export interface MapState {
  locations: MapLocation[];
  filteredLocations: MapLocation[];
  visibleLocations: MapLocation[];
  availableCategories: LocationCategory[];
  isLoading: boolean;
  error: Error | null;
  filters: MapFilters;
  query: string;
  selectedLocation: MapLocation | null;
  styleId: MapStyleId;
  camera: MapCameraState;
  cameraCommand: MapCameraCommand | null;
  userLocation: MapPoint | null;
  isLocating: boolean;
  locationError: string | null;
  isOutOfCoverage: boolean;
  isResultsOpen: boolean;
  isResultsRailCollapsed: boolean;
}
