import AsyncStorage from '@react-native-async-storage/async-storage';
import type { KnowledgeBookmark, KnowledgeDownload, KnowledgeProgress } from './types';

const key = (userId: string | undefined, suffix: string) => `green-compass:knowledge:${userId || 'guest'}:${suffix}`;

async function readArray<T>(storageKey: string): Promise<T[]> {
  try {
    const value = await AsyncStorage.getItem(storageKey);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

async function writeArray<T>(storageKey: string, value: T[]) {
  await AsyncStorage.setItem(storageKey, JSON.stringify(value));
}

export const knowledgeStorage = {
  getProgress: (userId?: string) => readArray<KnowledgeProgress>(key(userId, 'progress')),
  async setProgress(userId: string | undefined, progress: KnowledgeProgress) {
    const entries = await this.getProgress(userId);
    const next = [...entries.filter((entry) => entry.itemId !== progress.itemId), progress];
    await writeArray(key(userId, 'progress'), next);
    return progress;
  },
  getBookmarks: (userId?: string) => readArray<KnowledgeBookmark>(key(userId, 'bookmarks')),
  async toggleBookmark(userId: string | undefined, itemId: string) {
    const entries = await this.getBookmarks(userId);
    const existing = entries.some((entry) => entry.itemId === itemId);
    const next = existing ? entries.filter((entry) => entry.itemId !== itemId) : [...entries, { itemId, createdAt: new Date().toISOString() }];
    await writeArray(key(userId, 'bookmarks'), next);
    return !existing;
  },
  getDownloads: (userId?: string) => readArray<KnowledgeDownload>(key(userId, 'downloads')),
  async saveDownload(userId: string | undefined, download: KnowledgeDownload) {
    const entries = await this.getDownloads(userId);
    const next = [...entries.filter((entry) => entry.itemId !== download.itemId), download];
    await writeArray(key(userId, 'downloads'), next);
    return download;
  },
  async removeDownload(userId: string | undefined, itemId: string) {
    const entries = await this.getDownloads(userId);
    await writeArray(key(userId, 'downloads'), entries.filter((entry) => entry.itemId !== itemId));
  },
};
