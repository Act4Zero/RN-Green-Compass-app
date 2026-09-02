import { Platform } from 'react-native';

export interface GeocodingResult {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

interface NominatimSearchResult {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
}

const DEFAULT_GEOCODING_URL = 'https://nominatim.openstreetmap.org';
const geocodingBaseUrl = (process.env.EXPO_PUBLIC_GEOCODING_BASE_URL || DEFAULT_GEOCODING_URL).replace(/\/$/, '');
const resultCache = new Map<string, GeocodingResult | null>();

/**
 * Resolves one user-submitted Bulgarian address. This is deliberately submit-only:
 * the public Nominatim service does not permit client-side autocomplete.
 */
export async function searchBulgarianAddress(query: string): Promise<GeocodingResult | null> {
  const normalized = query.trim().replace(/\s+/g, ' ');
  if (normalized.length < 3) return null;

  const cacheKey = normalized.toLocaleLowerCase('bg-BG');
  if (resultCache.has(cacheKey)) return resultCache.get(cacheKey) ?? null;

  const params = new URLSearchParams({
    q: normalized,
    format: 'jsonv2',
    addressdetails: '1',
    countrycodes: 'bg',
    limit: '1',
  });
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Accept-Language': 'bg,en;q=0.8',
  };
  if (Platform.OS !== 'web') {
    headers['User-Agent'] = 'GreenCompass/1.0 (https://github.com/Act4Zero/RN-Green-Compass-app)';
  }

  const response = await fetch(`${geocodingBaseUrl}/search?${params.toString()}`, { headers });
  if (!response.ok) throw new Error(`Address search failed (${response.status}).`);
  const values = await response.json() as NominatimSearchResult[];
  const first = values[0];
  if (!first) {
    resultCache.set(cacheKey, null);
    return null;
  }

  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('Address search returned invalid coordinates.');
  const result = { id: String(first.place_id), label: first.display_name, lat, lng };
  resultCache.set(cacheKey, result);
  return result;
}
