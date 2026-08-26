/** Shared contracts for the Sustainability Globe feature. */
export type LocationCategory =
  | 'renewable_energy'
  | 'local_organic'
  | 'zero_waste'
  | 'ev_charging'
  | 'recycling'
  | 'green_spaces'
  | 'community_events';

export type SustainabilityContentStatus = 'draft' | 'pending' | 'published' | 'rejected';

export interface LocationConnector {
  id: string;
  connectionType: string | null;
  powerKw: number | null;
  level: string | null;
  usageCost: string | null;
  fastCharge: boolean;
}

export interface LocationCredential {
  id: string;
  type: string;
  issuer: string;
  evidenceUrl: string;
  validFrom?: string | null;
  validUntil?: string | null;
}

export interface SustainabilityFeature {
  label: string;
  value?: string;
  sourceUrl?: string;
  verified?: boolean;
}

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
  categories: LocationCategory[];
  source: string | null;
  licence: string | null;
  source_url?: string | null;
  verified?: boolean;
  featured?: boolean;
  published_at?: string | null;
  name_bg?: string | null;
  description_bg?: string | null;
  phone?: string | null;
  email?: string | null;
  opening_hours?: Record<string, unknown>;
  sustainability_features?: SustainabilityFeature[];
  connectors: LocationConnector[];
  credentials: LocationCredential[];
  rating?: number | null;
  review_count?: number;
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

export interface LocationReview {
  id: string;
  locationId: string;
  userId: string;
  rating: number;
  body: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  authorName?: string | null;
  createdAt: string;
}

export interface LocationSubmission {
  id: string;
  userId: string;
  kind: 'new_location' | 'correction';
  locationId?: string | null;
  proposedData: Record<string, unknown>;
  evidenceUrls: string[];
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  createdAt: string;
}

export interface MapCheckIn {
  id: string;
  firstVisit: boolean;
  pointsAwarded: number;
}

export interface ImpactEstimate {
  metric: 'co2e_kg' | 'water_l' | 'waste_kg' | 'plastic_kg';
  value: number;
  unit: string;
  methodologyVersion: string;
  sourceUrl: string;
}

export interface PersonalMapImpact {
  visitCount: number;
  uniqueLocations: number;
  byCategory: Partial<Record<LocationCategory, number>>;
  estimates: ImpactEstimate[];
}

export interface SustainabilityEvent {
  id: string;
  title: string;
  summary: string;
  startsAt: string;
  endsAt: string;
  latitude: number;
  longitude: number;
  eventType: 'community' | 'market' | 'cleanup' | 'tree_planting' | 'workshop' | 'repair';
  locationId?: string | null;
}

export interface EcoRouteStop {
  order: number;
  location: MapLocation;
  note: string;
}

export interface EcoRoute {
  id: string;
  slug: string;
  title: string;
  description: string;
  categoryId?: LocationCategory | null;
  durationMinutes: number;
  stops: EcoRouteStop[];
}

export interface MapSessionReservation {
  allowed: boolean;
  reason: 'reserved' | 'disabled' | 'budget' | 'unavailable';
  message?: string;
  used?: number;
  limit?: number;
  percent?: number;
  periodStart?: string;
  periodEnd?: string;
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
