import AsyncStorage from '@react-native-async-storage/async-storage';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import type { OfflineMapPackManifest, OfflineMapPackState } from '@/types/map';
import { createOfflineMapStyle } from './style';
import { loadOfflineManifest, selectBestOfflinePack } from './manifest';

const ROOT = `${FileSystem.documentDirectory || ''}green-compass-offline/`;
const STATE_KEY = 'green-compass:offline-map-packs:v1';
const CHUNK_BYTES = 1024 * 1024;

type ResumeState = { version: string; partialUri: string; resumeData?: string };
type PersistedPack = {
  version?: string;
  localUri?: string;
  byteSize?: number;
  installedAt?: string;
  resume?: ResumeState;
  /** Legacy fields kept readable for one release. */
  resumeData?: string;
};
type PersistedState = Record<string, PersistedPack>;

async function readState(): Promise<PersistedState> {
  try { return JSON.parse((await AsyncStorage.getItem(STATE_KEY)) || '{}'); } catch { return {}; }
}

async function writeState(value: PersistedState): Promise<void> {
  await AsyncStorage.setItem(STATE_KEY, JSON.stringify(value));
}

function decodeBase64(value: string): Uint8Array {
  const binary = globalThis.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hashFile(uri: string, size: number): Promise<string> {
  const hash = sha256.create();
  for (let position = 0; position < size; position += CHUNK_BYTES) {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64, position, length: Math.min(CHUNK_BYTES, size - position) });
    hash.update(decodeBase64(base64));
  }
  return bytesToHex(hash.digest());
}

export async function listOfflinePackStates(manifest: OfflineMapPackManifest[]): Promise<OfflineMapPackState[]> {
  const state = await readState();
  return Promise.all(manifest.map(async (pack) => {
    const saved = state[pack.id];
    if (!saved?.localUri || !saved.localUri.endsWith('.pmtiles')) return { manifest: pack, status: 'not-downloaded', progress: 0 };
    const info = await FileSystem.getInfoAsync(saved.localUri, { size: true });
    if (!info.exists) return { manifest: pack, status: 'not-downloaded', progress: 0 };
    return { manifest: pack, status: saved.version === pack.version ? 'ready' : 'update-available', progress: 1, localUri: saved.localUri };
  }));
}

export async function downloadOfflinePack(
  pack: OfflineMapPackManifest,
  onProgress: (progress: number) => void,
): Promise<string> {
  if (Platform.OS === 'web') throw new Error('Offline map downloads are available on iOS and Android.');
  if (!FileSystem.documentDirectory) throw new Error('App storage is unavailable.');
  const free = await FileSystem.getFreeDiskStorageAsync();
  if (free < pack.byteSize * 1.15) throw new Error('There is not enough free space for this map and its safety margin.');
  await FileSystem.makeDirectoryAsync(ROOT, { intermediates: true });
  const partialUri = `${ROOT}${pack.id}-${pack.version}.download`;
  const state = await readState();
  const previous = state[pack.id];
  const legacyResumeMatches = previous?.localUri === partialUri && previous.version === pack.version;
  const resumeData = previous?.resume?.version === pack.version
    ? previous.resume.resumeData
    : legacyResumeMatches ? previous.resumeData : undefined;
  const resumable = FileSystem.createDownloadResumable(
    pack.downloadUrl,
    partialUri,
    {},
    ({ totalBytesWritten, totalBytesExpectedToWrite }) => onProgress(totalBytesExpectedToWrite ? totalBytesWritten / totalBytesExpectedToWrite : 0),
    resumeData,
  );
  try {
    const result = await resumable.downloadAsync();
    if (!result || result.status < 200 || result.status >= 300) throw new Error(`Download failed (${result?.status || 'cancelled'}).`);
  } catch (error) {
    const snapshot = resumable.savable();
    state[pack.id] = {
      ...(previous?.localUri?.endsWith('.pmtiles') ? previous : {}),
      resume: { version: pack.version, partialUri, resumeData: snapshot.resumeData },
    };
    await writeState(state);
    throw error;
  }
  const info = await FileSystem.getInfoAsync(partialUri, { size: true });
  const size = info.exists ? info.size : 0;
  if (!size) throw new Error('The downloaded map is empty.');
  const checksum = await hashFile(partialUri, size);
  if (checksum.toLowerCase() !== pack.sha256.toLowerCase()) {
    await FileSystem.deleteAsync(partialUri, { idempotent: true });
    if (previous?.localUri?.endsWith('.pmtiles')) state[pack.id] = { ...previous, resume: undefined };
    else delete state[pack.id];
    await writeState(state);
    throw new Error('The map checksum is invalid. The incomplete file was removed.');
  }
  const finalUri = `${ROOT}${pack.id}-${pack.version}-${Date.now()}.pmtiles`;
  await FileSystem.moveAsync({ from: partialUri, to: finalUri });
  state[pack.id] = { version: pack.version, localUri: finalUri, byteSize: size, installedAt: new Date().toISOString() };
  await writeState(state);
  if (previous?.localUri && previous.localUri !== finalUri) {
    await FileSystem.deleteAsync(previous.localUri, { idempotent: true });
  }
  onProgress(1);
  return finalUri;
}

export async function deleteOfflinePack(id: string): Promise<void> {
  const state = await readState();
  const saved = state[id];
  if (saved?.localUri) await FileSystem.deleteAsync(saved.localUri, { idempotent: true });
  if (saved?.resume?.partialUri) await FileSystem.deleteAsync(saved.resume.partialUri, { idempotent: true });
  delete state[id];
  await writeState(state);
}

export async function getOfflineSource(point: { lat: number; lng: number }): Promise<{ style: Record<string, unknown>; attribution: string } | null> {
  if (Platform.OS === 'web') return null;
  const state = await readState();
  const installed = Object.entries(state)
    .filter(([, saved]) => saved.localUri?.endsWith('.pmtiles'))
    .map(([id, saved]) => ({ id, saved }));
  const manifest = await loadOfflineManifest();
  const selected = selectBestOfflinePack(manifest, new Set(installed.map(({ id }) => id)), point);
  if (!selected) return null;
  const saved = state[selected.id];
  if (!saved?.localUri) return null;
  const info = await FileSystem.getInfoAsync(saved.localUri);
  if (!info.exists) return null;
  return { style: createOfflineMapStyle(saved.localUri), attribution: selected.attribution || '© OpenStreetMap contributors · Protomaps' };
}
