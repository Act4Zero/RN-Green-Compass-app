// OpenStreetMap extraction rules. Keep shared and mixed facilities distinct.
export const SOFIA_CYCLING_BOUNDS = [23.18, 42.58, 23.50, 42.80];
const denied = new Set(['no', 'private', 'customers']);
const allowed = new Set(['yes', 'designated', 'permissive', 'official']);
const infrastructure = { track: 'track', opposite_track: 'track', lane: 'lane', opposite_lane: 'lane', shared_lane: 'shared', share_busway: 'shared' };

export function cyclingKind(tags = {}) {
  if (denied.has(tags.bicycle) || (!allowed.has(tags.bicycle) && denied.has(tags.access))) return null;
  if (tags.highway === 'construction' || tags.highway === 'proposed' || tags.proposed === 'yes' || tags.construction === 'yes') return null;
  if (tags.highway === 'cycleway') return (['yes', 'designated'].includes(tags.foot) && tags.segregated !== 'yes') ? 'shared' : 'track';
  if (['path', 'footway', 'pedestrian'].includes(tags.highway) && tags.bicycle === 'designated') return tags.segregated === 'yes' ? 'track' : 'shared';
  if (!tags.highway) return null;
  const kinds = [...new Set(['cycleway', 'cycleway:left', 'cycleway:right', 'cycleway:both'].map(key => infrastructure[tags[key]]).filter(Boolean))];
  return kinds.length > 1 ? 'mixed' : kinds[0] || null;
}

export function buildCyclingSnapshot(raw, retrievedAt = new Date().toISOString()) {
  if (!Array.isArray(raw?.elements) || raw.remark) throw new Error('The map provider returned incomplete data. Keep the previous snapshot.');
  const seen = new Set();
  const features = [];
  for (const element of raw.elements) {
    const tags = element.tags || {};
    const id = `${element.type}/${element.id}`;
    if (!Number.isSafeInteger(element.id) || seen.has(id)) continue;
    seen.add(id);
    const common = { id, name: tags['name:bg'] || tags.name || '', sourceUrl: `https://www.openstreetmap.org/${id}` };
    if (element.type === 'way') {
      const kind = cyclingKind(tags);
      if (!kind) continue;
      const points = element.geometry?.map(point => [point.lon, point.lat]);
      if (!points || points.length < 2 || !points.every(validPoint)) continue;
      const coordinates = points.filter((point, index) => index === 0 || point[0] !== points[index - 1][0] || point[1] !== points[index - 1][1]);
      if (coordinates.length < 2) continue;
      features.push({ type: 'Feature', id, geometry: { type: 'LineString', coordinates }, properties: { ...common, kind, surface: tags.surface || '', segregated: tags.segregated || '' } });
    } else if (element.type === 'node' && !denied.has(tags.access)) {
      const kind = tags.amenity === 'bicycle_parking' ? 'parking' : tags.amenity === 'drinking_water' && tags.drinking_water !== 'no' ? 'water' : null;
      if (!kind || !validPoint([element.lon, element.lat])) continue;
      features.push({ type: 'Feature', id, geometry: { type: 'Point', coordinates: [element.lon, element.lat] }, properties: { ...common, kind, capacity: tags.capacity || '', covered: tags.covered || '' } });
    }
  }
  if (!features.some(f => f.geometry.type === 'LineString')) throw new Error('No cycling paths were found. Keep the previous snapshot.');
  return { type: 'FeatureCollection', metadata: { source: 'OpenStreetMap contributors', license: 'ODbL-1.0', licenseUrl: 'https://www.openstreetmap.org/copyright', retrievedAt, dataUpdatedAt: raw.osm3s?.timestamp_osm_base || null, bounds: SOFIA_CYCLING_BOUNDS }, features };
}
function validPoint(point) { return point.length === 2 && point.every(Number.isFinite) && point[0] >= -180 && point[0] <= 180 && point[1] >= -90 && point[1] <= 90; }
