import type { ThemePreference } from './tokens';

export interface ThemeStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export const THEME_STORAGE_KEY = 'green-compass:theme-preference';

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export async function loadThemePreference(storage: ThemeStorage): Promise<ThemePreference> {
  const stored = await storage.getItem(THEME_STORAGE_KEY);
  return isThemePreference(stored) ? stored : 'system';
}

export async function saveThemePreference(storage: ThemeStorage, preference: ThemePreference): Promise<void> {
  await storage.setItem(THEME_STORAGE_KEY, preference);
}
