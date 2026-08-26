import { LocationConnector, MapLocation } from '../types/map';

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
    return normalizeLegacyEVLocations(require('../../assets/data/locations_ev_bulgaria.json'));
  } catch (error) {
    console.error('Failed to load EV locations data:', error);
    throw error;
  }
};

/**
 * Transform raw location data to match the MapLocation type
 */
export const getLegacyEVConnectorRows = (): Record<string, unknown>[] => (
  require('../../assets/data/locations_ev_bulgaria.json') as Record<string, unknown>[]
);

/** Groups the 89 licensed connector rows into 57 physical places. */
export const normalizeLegacyEVLocations = (rawData: any[]): MapLocation[] => {
  if (!Array.isArray(rawData)) {
    console.error('[transformLocationsData] Expected array, got:', typeof rawData, rawData);
    return [];
  }
  const grouped = new Map<string, MapLocation>();
  rawData.forEach((item, index) => {
    const id = String(item.id);
    const connector: LocationConnector = {
      id: `${id}:${item.connection_type || 'connector'}:${item.power_kw || 0}:${index}`,
      connectionType: item.connection_type || null,
      powerKw: item.power_kw == null ? null : Number(item.power_kw),
      level: item.level || null,
      usageCost: item.usage_cost || null,
      fastCharge: Boolean(item.is_fast_charge_capable),
    };
    const existing = grouped.get(id);
    if (existing) {
      existing.connectors.push(connector);
      if ((connector.powerKw || 0) > (existing.power_kw || 0)) {
        existing.power_kw = connector.powerKw;
        existing.connection_type = connector.connectionType;
        existing.usage_cost = connector.usageCost;
        existing.level = connector.level;
      }
      existing.is_fast_charge_capable = Boolean(existing.is_fast_charge_capable || connector.fastCharge);
      existing.description = describeConnectors(existing.connectors);
      return;
    }
    grouped.set(id, {
      id,
      name: item.name,
      lat: Number(item.lat),
      lng: Number(item.lng),
      town: item.town || '',
      state_or_province: item.state_or_province || null,
      address_line_1: item.address_line_1 || null,
      address_line_2: item.address_line_2 || null,
      postcode: item.postcode || null,
      country: item.country || 'Bulgaria',
      category: 'ev_charging',
      categories: ['ev_charging'],
      source: item.source || 'Open Charge Map',
      licence: item.licence || 'Open Data Commons ODbL',
      verified: true,
      connectors: [connector],
      credentials: [],
      sustainability_features: [],
      description: generateDescription(item),
      usage_cost: connector.usageCost,
      connection_type: connector.connectionType,
      power_kw: connector.powerKw,
      level: connector.level,
      is_fast_charge_capable: connector.fastCharge,
    });
  });
  return Array.from(grouped.values());
};

const describeConnectors = (connectors: LocationConnector[]): string => {
  const power = Math.max(0, ...connectors.map((connector) => connector.powerKw || 0));
  const types = Array.from(new Set(connectors.map((connector) => connector.connectionType).filter(Boolean)));
  return [power ? `Up to ${power}kW charging power` : null, types.length ? `${types.join(', ')} connectors` : null]
    .filter(Boolean)
    .join(', ') || 'EV charging station';
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
  if (evLocations.length > 0) {
    return evLocations;
  }
  try {
    evLocations = await loadEVLocations();
    return evLocations;
  } catch (error) {
    console.error('Failed to get EV locations:', error);
    throw error;
  }
};
