import { MAP_PACK_MANIFEST_URL } from '@/config/mapGlobe';
import type { OfflineMapPackManifest } from '@/types/map';
import { offlinePackContainsPoint } from '@/utils/livingPlanet';

const BASE_URL = (process.env.EXPO_PUBLIC_MAP_PACK_BASE_URL || '').replace(/\/$/, '');
const VERSION = '2026-08-01';
const EMPTY_SHA256 = '';

function pack(
  id: string,
  bg: string,
  en: string,
  bounds: OfflineMapPackManifest['bounds'],
  minZoom: number,
  maxZoom: number,
  byteSize: number,
): OfflineMapPackManifest {
  return {
    id,
    name: { bg, en },
    bounds,
    minZoom,
    maxZoom,
    byteSize,
    version: VERSION,
    sha256: EMPTY_SHA256,
    downloadUrl: BASE_URL ? `${BASE_URL}/${id}-${VERSION}.pmtiles` : '',
    attribution: '© OpenStreetMap contributors · Protomaps',
  };
}

/** Metadata-only fallback. Published manifests replace sizes, hashes and URLs. */
export const BUILTIN_OFFLINE_PACKS: OfflineMapPackManifest[] = [
  pack('bulgaria-overview', 'България — преглед', 'Bulgaria overview', [22.35, 41.23, 28.61, 44.22], 0, 10, 168_000_000),
  pack('sofia', 'София', 'Sofia', [22.98, 42.47, 23.72, 42.94], 11, 16, 286_000_000),
  pack('plovdiv', 'Пловдив', 'Plovdiv', [24.55, 42.00, 25.03, 42.29], 11, 16, 144_000_000),
  pack('varna', 'Варна', 'Varna', [27.68, 43.08, 28.17, 43.40], 11, 16, 151_000_000),
  pack('burgas', 'Бургас', 'Burgas', [27.17, 42.37, 27.75, 42.75], 11, 16, 139_000_000),
  pack('ruse', 'Русе', 'Ruse', [25.70, 43.72, 26.22, 44.03], 11, 16, 118_000_000),
  pack('stara-zagora', 'Стара Загора', 'Stara Zagora', [25.43, 42.27, 25.87, 42.59], 11, 16, 111_000_000),
];

function validPack(value: unknown): value is OfflineMapPackManifest {
  const pack = value as OfflineMapPackManifest;
  return Boolean(
    pack && typeof pack.id === 'string' && pack.name?.en && pack.name?.bg &&
    Array.isArray(pack.bounds) && pack.bounds.length === 4 &&
    Number.isFinite(pack.byteSize) && /^[a-f0-9]{64}$/i.test(pack.sha256) &&
    /^https:\/\//.test(pack.downloadUrl),
  );
}

export async function loadOfflineManifest(): Promise<OfflineMapPackManifest[]> {
  if (!MAP_PACK_MANIFEST_URL) return BUILTIN_OFFLINE_PACKS;
  try {
    const response = await fetch(MAP_PACK_MANIFEST_URL, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Manifest returned ${response.status}`);
    const body = await response.json();
    const values = Array.isArray(body) ? body : body?.packs;
    if (!Array.isArray(values) || !values.every(validPack)) throw new Error('Manifest shape is invalid');
    return values;
  } catch {
    return BUILTIN_OFFLINE_PACKS;
  }
}

export function isPackDownloadable(pack: OfflineMapPackManifest): boolean {
  return /^https:\/\//.test(pack.downloadUrl) && /^[a-f0-9]{64}$/i.test(pack.sha256);
}

export function selectBestOfflinePack(
  manifest: OfflineMapPackManifest[],
  installedIds: ReadonlySet<string>,
  point: { lat: number; lng: number },
): OfflineMapPackManifest | null {
  return manifest
    .filter((pack) => installedIds.has(pack.id) && offlinePackContainsPoint(pack.bounds, point))
    .sort((a, b) => b.maxZoom - a.maxZoom)[0] ?? null;
}
