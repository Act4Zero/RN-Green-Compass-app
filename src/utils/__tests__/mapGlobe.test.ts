import locations from '../../../assets/data/locations_ev_bulgaria.json';
import { BULGARIA_BOUNDS, isMapStyleId, MAP_STYLE_PRESETS } from '../../config/mapGlobe';
import { MapLocation } from '../../types/map';
import { normalizeLegacyEVLocations } from '../locationDataUtils';
import {
  filterMapLocations,
  getAvailableCategories,
  getVisibleResults,
  isDetailedCameraOutOfCoverage,
  isPointInBounds,
  locationsToFeatureCollection,
  normalizeMapSearch,
} from '../mapGlobe';

const typedLocations = normalizeLegacyEVLocations(locations) as MapLocation[];

describe('Sustainability Globe data helpers', () => {
  it('converts every verified location to a clustered-renderer compatible GeoJSON point', () => {
    const collection = locationsToFeatureCollection(typedLocations);
    expect(collection.type).toBe('FeatureCollection');
    expect(collection.features).toHaveLength(57);
    expect(collection.features[0]).toMatchObject({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [27.100741618369852, 42.848070270555496] },
      properties: { id: '311445', category: 'ev_charging' },
    });
  });

  it('derives filters only from categories that contain real data', () => {
    expect(getAvailableCategories(typedLocations)).toEqual(['ev_charging']);
    expect(filterMapLocations(typedLocations, { ev_charging: false }, '')).toHaveLength(0);
    expect(filterMapLocations(typedLocations, { ev_charging: true }, '')).toHaveLength(57);
  });

  it('normalizes accents and searches across names, towns, addresses, and postcodes', () => {
    expect(normalizeMapSearch('  Véliko  ')).toBe('veliko');
    expect(filterMapLocations(typedLocations, { ev_charging: true }, 'Melnik')).toHaveLength(1);
    expect(filterMapLocations(typedLocations, { ev_charging: true }, '6888')[0].name).toBe('Fines Kirkovo');
  });

  it('filters visible results and sorts them nearest to camera center', () => {
    const results = getVisibleResults(typedLocations, BULGARIA_BOUNDS, { lat: 42.7, lng: 23.32 }, false);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(57);
    expect(isPointInBounds({ lat: results[0].lat, lng: results[0].lng }, BULGARIA_BOUNDS)).toBe(true);
    const globalSearchResults = getVisibleResults(typedLocations.slice(0, 2), undefined, { lat: 42.7, lng: 23.32 }, true);
    expect(globalSearchResults).toHaveLength(2);
  });

  it('does not warn at globe scale and activates coverage guidance only on detailed views', () => {
    expect(isDetailedCameraOutOfCoverage({ lat: 48.4, lng: 18.2 }, 3.15)).toBe(false);
    expect(isDetailedCameraOutOfCoverage({ lat: 51.5, lng: -0.12 }, 8)).toBe(true);
    expect(isDetailedCameraOutOfCoverage({ lat: 42.7, lng: 23.32 }, 8)).toBe(false);
  });

  it('defines only the automatic Living Planet style', () => {
    expect(Object.keys(MAP_STYLE_PRESETS)).toEqual(['living-planet']);
    expect(isMapStyleId('living-planet')).toBe(true);
    expect(isMapStyleId('satellite')).toBe(false);
    expect(isMapStyleId('streets')).toBe(false);
  });
});
