import legacyRows from '../../../../assets/data/locations_ev_bulgaria.json';
import { mapLocationFromRow, mapSessionReservationFromValue } from '../service';
import { normalizeLegacyEVLocations } from '@/utils/locationDataUtils';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

describe('sustainability map platform transforms', () => {
  it('normalizes all licensed connector rows into physical locations without losing connectors', () => {
    const locations = normalizeLegacyEVLocations(legacyRows);
    expect(legacyRows).toHaveLength(89);
    expect(locations).toHaveLength(57);
    expect(locations.reduce((total, location) => total + location.connectors.length, 0)).toBe(89);
    expect(new Set(locations.map((location) => location.id)).size).toBe(57);
    expect(locations.every((location) => location.category === 'ev_charging' && location.verified)).toBe(true);
  });

  it('maps a curated Supabase profile with multiple categories, credentials and connector summary', () => {
    const location = mapLocationFromRow({
      id: 'place-1', name: 'Circular Market', latitude: 42.7, longitude: 23.3, town: 'Sofia',
      category_ids: ['local_organic', 'zero_waste'], verified: true, rating: '4.75', review_count: 8,
      connectors: [{ id: 'c1', powerKw: 22, connectionType: 'Type 2', fastCharge: false }],
      credentials: [{ id: 'v1', type: 'Organic', issuer: 'Verifier', evidenceUrl: 'https://example.com/evidence' }],
      sustainability_features: [{ label: 'Refill station', verified: true }], source: 'Curated', licence: 'Licensed',
    });
    expect(location.categories).toEqual(['local_organic', 'zero_waste']);
    expect(location.category).toBe('local_organic');
    expect(location.power_kw).toBe(22);
    expect(location.rating).toBe(4.75);
    expect(location.credentials[0].evidenceUrl).toBe('https://example.com/evidence');
  });

  it('normalizes the atomic budget response used before Mapbox starts', () => {
    expect(mapSessionReservationFromValue({ allowed: true, reason: 'reserved', used: '35000', limit: 45000, percent: '77.78', period_start: '2026-08-01', period_end: '2026-09-01' })).toEqual({
      allowed: true, reason: 'reserved', used: 35000, limit: 45000, percent: 77.78,
      periodStart: '2026-08-01', periodEnd: '2026-09-01', message: undefined,
    });
    expect(mapSessionReservationFromValue({ allowed: false, reason: 'budget', message: 'Paused' })).toMatchObject({ allowed: false, reason: 'budget', message: 'Paused' });
  });
});
