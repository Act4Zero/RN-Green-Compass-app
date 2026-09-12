import snapshot from './data/sofia-cycling.json';

export type CyclingKind = 'track' | 'lane' | 'shared' | 'mixed' | 'parking' | 'water';
export type CyclingProperties = { id: string; kind: CyclingKind; name: string; sourceUrl: string; surface?: string; capacity?: string; covered?: string };
export type CyclingFeature = GeoJSON.Feature<GeoJSON.LineString | GeoJSON.MultiLineString | GeoJSON.Point, CyclingProperties>;
export const SOFIA_CYCLING = snapshot as unknown as { type: 'FeatureCollection'; metadata: { source: string; licenseUrl: string; retrievedAt: string; dataUpdatedAt: string | null }; features: CyclingFeature[] };
export const CYCLING_PATHS: GeoJSON.FeatureCollection<GeoJSON.LineString | GeoJSON.MultiLineString, CyclingProperties> = { type: 'FeatureCollection', features: SOFIA_CYCLING.features.filter(feature => feature.geometry.type !== 'Point') as GeoJSON.Feature<GeoJSON.LineString | GeoJSON.MultiLineString, CyclingProperties>[] };
export const CYCLING_PLACES: GeoJSON.FeatureCollection<GeoJSON.Point, CyclingProperties> = { type: 'FeatureCollection', features: SOFIA_CYCLING.features.filter(feature => feature.geometry.type === 'Point') as GeoJSON.Feature<GeoJSON.Point, CyclingProperties>[] };
export const CYCLING_COLORS: Record<CyclingKind, string> = { track: '#087C67', lane: '#3166DD', shared: '#C87816', mixed: '#9763BF', parking: '#1951BE', water: '#087DAB' };
export const CYCLING_LABELS: Record<CyclingKind, { en: string; bg: string }> = {
  track: { en: 'Cycle path', bg: 'Велоалея' }, lane: { en: 'Cycle lane', bg: 'Велолента' }, shared: { en: 'Shared section', bg: 'Споделен участък' }, mixed: { en: 'Mixed facilities', bg: 'Смесен тип' }, parking: { en: 'Bicycle parking', bg: 'Велопаркинг' }, water: { en: 'Drinking fountain', bg: 'Чешма' },
};
export const CYCLING_LINE_COLOR = ['match', ['get', 'kind'], 'track', CYCLING_COLORS.track, 'lane', CYCLING_COLORS.lane, 'shared', CYCLING_COLORS.shared, CYCLING_COLORS.mixed];
export const CYCLING_SOFIA_CAMERA = { center: { lat: 42.691, lng: 23.323 }, zoom: 12.1, pitch: 0, heading: 0 };
