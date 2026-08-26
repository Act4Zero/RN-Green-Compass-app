import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import supabase, { isSupabaseConfigured } from '@/lib/supabase';
import {
  EcoRoute,
  LocationCategory,
  LocationReview,
  LocationSubmission,
  MapCheckIn,
  MapLocation,
  MapSessionReservation,
  PersonalMapImpact,
  SustainabilityEvent,
} from '@/types/map';
import { getLegacyEVConnectorRows, normalizeLegacyEVLocations } from '@/utils/locationDataUtils';

const INSTALLATION_KEY = 'green-compass:map-installation-id';
const rpc = (name: string, params: Record<string, unknown> = {}) => (supabase as any).rpc(name, params);
const table = (name: string) => (supabase as any).from(name);

function randomInstallationId(): string {
  const random = () => Math.random().toString(36).slice(2);
  return `${Date.now().toString(36)}-${random()}-${random()}-${random()}`;
}

async function getInstallationId(): Promise<string> {
  const stored = await AsyncStorage.getItem(INSTALLATION_KEY);
  if (stored && stored.length >= 16) return stored;
  const next = randomInstallationId();
  await AsyncStorage.setItem(INSTALLATION_KEY, next);
  return next;
}

function asCategory(value: unknown): LocationCategory {
  const categories: LocationCategory[] = ['renewable_energy','local_organic','zero_waste','ev_charging','recycling','green_spaces','community_events'];
  return categories.includes(value as LocationCategory) ? value as LocationCategory : 'community_events';
}

export function mapLocationFromRow(row: any): MapLocation {
  const categories = (row.category_ids || row.categories || []).map(asCategory);
  const connectors = Array.isArray(row.connectors) ? row.connectors : [];
  const primaryConnector = [...connectors].sort((a, b) => Number(b.powerKw || b.power_kw || 0) - Number(a.powerKw || a.power_kw || 0))[0];
  return {
    id: String(row.id),
    name: row.name,
    name_bg: row.name_bg,
    description: row.description_en || row.description || '',
    description_bg: row.description_bg,
    lat: Number(row.latitude ?? row.lat),
    lng: Number(row.longitude ?? row.lng),
    town: row.town || '',
    state_or_province: row.state_or_province || null,
    address_line_1: row.address_line_1 || null,
    address_line_2: row.address_line_2 || null,
    postcode: row.postcode || null,
    country: row.country || 'Bulgaria',
    category: categories[0] || 'community_events',
    categories: categories.length ? categories : ['community_events'],
    source: row.source || null,
    licence: row.licence || null,
    source_url: row.source_url || null,
    verified: Boolean(row.verified),
    featured: Boolean(row.featured),
    published_at: row.published_at || null,
    phone: row.phone || null,
    email: row.email || null,
    website: row.website || null,
    opening_hours: row.opening_hours || {},
    sustainability_features: Array.isArray(row.sustainability_features) ? row.sustainability_features : [],
    connectors: connectors.map((connector: any) => ({
      id: String(connector.id),
      connectionType: connector.connectionType ?? connector.connection_type ?? null,
      powerKw: connector.powerKw == null && connector.power_kw == null ? null : Number(connector.powerKw ?? connector.power_kw),
      level: connector.level || null,
      usageCost: connector.usageCost ?? connector.usage_cost ?? null,
      fastCharge: Boolean(connector.fastCharge ?? connector.fast_charge),
    })),
    credentials: (Array.isArray(row.credentials) ? row.credentials : []).map((credential: any) => ({
      id: String(credential.id), type: credential.type, issuer: credential.issuer,
      evidenceUrl: credential.evidenceUrl ?? credential.evidence_url,
      validFrom: credential.validFrom ?? credential.valid_from,
      validUntil: credential.validUntil ?? credential.valid_until,
    })),
    rating: row.rating == null ? null : Number(row.rating),
    review_count: Number(row.review_count || 0),
    usage_cost: primaryConnector?.usageCost ?? primaryConnector?.usage_cost ?? null,
    connection_type: primaryConnector?.connectionType ?? primaryConnector?.connection_type ?? null,
    power_kw: primaryConnector?.powerKw == null && primaryConnector?.power_kw == null ? null : Number(primaryConnector.powerKw ?? primaryConnector.power_kw),
    level: primaryConnector?.level || null,
    is_fast_charge_capable: connectors.some((connector: any) => Boolean(connector.fastCharge ?? connector.fast_charge)),
  };
}

export function mapSessionReservationFromValue(value: any): MapSessionReservation {
  return {
    allowed: Boolean(value?.allowed),
    reason: value?.reason || 'unavailable',
    message: value?.message,
    used: value?.used == null ? undefined : Number(value.used),
    limit: value?.limit == null ? undefined : Number(value.limit),
    percent: value?.percent == null ? undefined : Number(value.percent),
    periodStart: value?.period_start,
    periodEnd: value?.period_end,
  };
}

export async function reserveMapSession(): Promise<MapSessionReservation> {
  if (__DEV__ && process.env.EXPO_PUBLIC_MAP_BUDGET_BYPASS === 'true') return { allowed: true, reason: 'reserved' };
  if (!isSupabaseConfigured) return { allowed: false, reason: 'unavailable', message: 'The account service is not configured, so the paid map cannot be started safely.' };
  const platform = Platform.OS === 'web' ? 'web' : Platform.OS;
  const installationId = platform === 'web' ? null : await getInstallationId();
  const { data, error } = await rpc('reserve_map_session', { p_platform: platform, p_installation_hash: installationId });
  if (error) return { allowed: false, reason: 'unavailable', message: 'The map budget could not be verified. The globe stayed off to prevent untracked usage.' };
  const value = Array.isArray(data) ? data[0] : data;
  return mapSessionReservationFromValue(value);
}

export async function loadCatalogLocations(): Promise<{ locations: MapLocation[]; source: 'remote' | 'bundled' }> {
  if (isSupabaseConfigured) {
    const { data, error } = await rpc('get_sustainability_map', { p_limit: 2000 });
    if (!error && Array.isArray(data) && data.length) return { locations: data.map(mapLocationFromRow), source: 'remote' };
  }
  return { locations: normalizeLegacyEVLocations(getLegacyEVConnectorRows()), source: 'bundled' };
}

function reviewFromRow(row: any): LocationReview {
  return { id: row.id, locationId: row.location_id, userId: row.user_id, rating: Number(row.rating), body: row.body, status: row.status, authorName: row.profiles?.display_name || null, createdAt: row.created_at };
}

export const sustainabilityMapService = {
  reserveMapSession,
  loadCatalogLocations,

  async listApprovedReviews(locationId: string): Promise<LocationReview[]> {
    const { data, error } = await table('sustainability_reviews').select('*,profiles:user_id(display_name)').eq('location_id', locationId).eq('status', 'approved').order('created_at', { ascending: false }).limit(50);
    if (error) throw new Error(error.message || 'Unable to load reviews.');
    return (data || []).map(reviewFromRow);
  },

  async submitReview(userId: string, locationId: string, rating: number, body: string): Promise<LocationReview> {
    const cleanBody = body.trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error('Choose a rating between 1 and 5.');
    if (cleanBody.length < 20 || cleanBody.length > 2000) throw new Error('Review must be between 20 and 2,000 characters.');
    const { data, error } = await table('sustainability_reviews').upsert({ user_id: userId, location_id: locationId, rating, body: cleanBody, status: 'pending', reviewer_id: null, reviewer_notes: null, reviewed_at: null, updated_at: new Date().toISOString() }, { onConflict: 'location_id,user_id' }).select().single();
    if (error) throw new Error(error.message || 'Unable to submit your review.');
    return reviewFromRow(data);
  },

  async submitLocation(userId: string, input: { kind: 'new_location' | 'correction'; locationId?: string | null; proposedData: Record<string, unknown>; evidenceUrls?: string[] }): Promise<LocationSubmission> {
    const name = String(input.proposedData.name || '').trim();
    if (name.length < 2) throw new Error('Enter the place name.');
    const evidenceUrls = (input.evidenceUrls || []).map((url) => url.trim()).filter((url) => /^https:\/\//.test(url));
    const { data, error } = await table('sustainability_location_submissions').insert({ user_id: userId, kind: input.kind, location_id: input.locationId || null, proposed_data: { ...input.proposedData, name }, evidence_urls: evidenceUrls }).select().single();
    if (error) throw new Error(error.message || 'Unable to submit this place.');
    return { id: data.id, userId: data.user_id, kind: data.kind, locationId: data.location_id, proposedData: data.proposed_data, evidenceUrls: data.evidence_urls || [], status: data.status, createdAt: data.created_at };
  },

  async checkIn(locationId: string): Promise<MapCheckIn> {
    const { data, error } = await rpc('check_in_sustainability_location', { p_location_id: locationId });
    if (error) throw new Error(error.message || 'Unable to check in.');
    const value = Array.isArray(data) ? data[0] : data;
    return { id: value.id, firstVisit: Boolean(value.first_visit), pointsAwarded: Number(value.points_awarded || 0) };
  },

  async getMyImpact(): Promise<PersonalMapImpact> {
    const { data, error } = await rpc('get_my_sustainability_impact');
    if (error) throw new Error(error.message || 'Unable to load your map impact.');
    const value = Array.isArray(data) ? data[0] : data;
    return { visitCount: Number(value?.visit_count || 0), uniqueLocations: Number(value?.unique_locations || 0), byCategory: value?.by_category || {}, estimates: (value?.estimates || []).map((entry: any) => ({ metric: entry.metric, value: Number(entry.value), unit: entry.unit, methodologyVersion: entry.methodology_version, sourceUrl: entry.source_url })) };
  },

  async listRecommendations(point: { lat: number; lng: number }): Promise<{ locationId: string; score: number; reasons: string[] }[]> {
    const { data, error } = await rpc('get_sustainability_recommendations', { p_lat: point.lat, p_lng: point.lng, p_limit: 12 });
    if (error) throw new Error(error.message || 'Unable to load recommendations.');
    return (data || []).map((row: any) => ({ locationId: row.location_id, score: Number(row.score), reasons: row.reasons || [] }));
  },

  async listEvents(): Promise<SustainabilityEvent[]> {
    const { data, error } = await table('community_projects').select('id,title,summary,starts_at,ends_at,latitude,longitude,event_type,sustainability_location_id').eq('status', 'published').gt('ends_at', new Date().toISOString()).not('latitude', 'is', null).not('longitude', 'is', null).order('starts_at');
    if (error) throw new Error(error.message || 'Unable to load events.');
    return (data || []).map((row: any) => ({ id: row.id, title: row.title, summary: row.summary, startsAt: row.starts_at, endsAt: row.ends_at, latitude: Number(row.latitude), longitude: Number(row.longitude), eventType: row.event_type, locationId: row.sustainability_location_id }));
  },

  async listRoutes(locale: 'en' | 'bg' = 'en'): Promise<EcoRoute[]> {
    const { data, error } = await table('sustainability_routes').select('*,sustainability_route_stops(stop_order,note_en,note_bg,sustainability_locations(*,sustainability_location_categories(category_id),sustainability_connectors(*),sustainability_credentials(*)))').eq('status', 'published').order('featured', { ascending: false });
    if (error) throw new Error(error.message || 'Unable to load eco-routes.');
    return (data || []).map((row: any) => ({ id: row.id, slug: row.slug, title: locale === 'bg' ? row.title_bg : row.title_en, description: locale === 'bg' ? row.description_bg : row.description_en, categoryId: row.category_id, durationMinutes: Number(row.duration_minutes), stops: (row.sustainability_route_stops || []).sort((a: any,b: any) => a.stop_order-b.stop_order).map((stop: any) => ({ order: Number(stop.stop_order), note: locale === 'bg' ? stop.note_bg : stop.note_en, location: mapLocationFromRow({ ...stop.sustainability_locations, category_ids: (stop.sustainability_locations?.sustainability_location_categories || []).map((item: any) => item.category_id), connectors: stop.sustainability_locations?.sustainability_connectors || [], credentials: stop.sustainability_locations?.sustainability_credentials || [] }) })) }));
  },
};

export type MapBudgetStatus = { enabled: boolean; webUsed: number; webLimit: number; mobileUsed: number; mobileLimit: number; periodStart: string; periodEnd: string; message: string };

export const sustainabilityMapAdminService = {
  async getBudgetStatus(): Promise<MapBudgetStatus> {
    const { data, error } = await rpc('get_map_budget_status');
    if (error) throw new Error(error.message || 'Unable to load map budget.');
    const value = Array.isArray(data) ? data[0] : data;
    return { enabled: Boolean(value.enabled), webUsed: Number(value.web_used || 0), webLimit: Number(value.web_limit), mobileUsed: Number(value.mobile_used || 0), mobileLimit: Number(value.mobile_limit), periodStart: value.period_start, periodEnd: value.period_end, message: value.message };
  },

  async setBudget(input: { enabled: boolean; webLimit: number; mobileLimit: number; periodStart: string; periodEnd: string; message: string }): Promise<void> {
    const { error } = await rpc('set_map_runtime_config', { p_enabled: input.enabled, p_web_limit: input.webLimit, p_mobile_limit: input.mobileLimit, p_period_start: input.periodStart, p_period_end: input.periodEnd, p_message: input.message });
    if (error) throw new Error(error.message || 'Unable to update map budget.');
  },

  async listModerationQueue(): Promise<{ submissions: any[]; reviews: any[]; media: any[] }> {
    const [submissions, reviews, media] = await Promise.all([
      table('sustainability_location_submissions').select('*,profiles:user_id(display_name)').in('status', ['pending','in_review']).order('created_at'),
      table('sustainability_reviews').select('*,profiles:user_id(display_name),sustainability_locations(name)').in('status', ['pending','in_review']).order('created_at'),
      table('sustainability_media').select('*,profiles:user_id(display_name),sustainability_locations(name)').eq('status', 'pending').order('created_at'),
    ]);
    const error = submissions.error || reviews.error || media.error;
    if (error) throw new Error(error.message || 'Unable to load map moderation.');
    return { submissions: submissions.data || [], reviews: reviews.data || [], media: media.data || [] };
  },

  async moderate(kind: 'submission' | 'review' | 'media', id: string, status: 'approved' | 'rejected', notes = ''): Promise<void> {
    const { error } = await rpc('review_sustainability_content', { p_kind: kind, p_id: id, p_status: status, p_notes: notes });
    if (error) throw new Error(error.message || 'Unable to review map content.');
  },

  async importBundledEVLocations(): Promise<{ locations: number; connectors: number }> {
    const locations = normalizeLegacyEVLocations(getLegacyEVConnectorRows());
    let connectorCount = 0;
    for (const location of locations) {
      const { data, error } = await table('sustainability_locations').upsert({ source: location.source, source_ref: location.id, licence: location.licence, name: location.name, town: location.town, state_or_province: location.state_or_province, address_line_1: location.address_line_1, address_line_2: location.address_line_2, postcode: location.postcode, country: location.country || 'Bulgaria', latitude: location.lat, longitude: location.lng, description_en: location.description || '', status: 'published', verified: true, published_at: new Date().toISOString() }, { onConflict: 'source,source_ref' }).select('id').single();
      if (error) throw new Error(error.message || `Unable to import ${location.name}.`);
      await table('sustainability_location_categories').upsert({ location_id: data.id, category_id: 'ev_charging' }, { onConflict: 'location_id,category_id' });
      for (const connector of location.connectors) {
        const { error: connectorError } = await table('sustainability_connectors').upsert({ location_id: data.id, source_ref: connector.id, connection_type: connector.connectionType, power_kw: connector.powerKw, level: connector.level, usage_cost: connector.usageCost, fast_charge: connector.fastCharge }, { onConflict: 'location_id,source_ref' });
        if (connectorError) throw new Error(connectorError.message || `Unable to import connectors for ${location.name}.`);
        connectorCount += 1;
      }
    }
    return { locations: locations.length, connectors: connectorCount };
  },
};
