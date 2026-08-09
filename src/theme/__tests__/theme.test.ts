import { loadThemePreference, saveThemePreference, THEME_STORAGE_KEY, ThemeStorage } from '../persistence';
import { createTheme, resolveTheme } from '../tokens';

describe('Green Compass theme', () => {
  it('resolves the system preference and explicit overrides', () => {
    expect(resolveTheme('system', 'dark')).toBe('dark');
    expect(resolveTheme('system', 'light')).toBe('light');
    expect(resolveTheme('system', null)).toBe('light');
    expect(resolveTheme('dark', 'light')).toBe('dark');
  });

  it('provides complete, distinct semantic palettes', () => {
    const light = createTheme('light');
    const dark = createTheme('dark');
    expect(light.colors.background).not.toBe(dark.colors.background);
    expect(light.colors.primary).not.toBe(dark.colors.primary);
    expect(light.breakpoints.desktop).toBe(1024);
    expect(light.typography.metric.fontFamily).toBe('SpaceMono');
  });

  it('restores and persists a valid user preference', async () => {
    const values = new Map<string, string>([[THEME_STORAGE_KEY, 'dark']]);
    const storage: ThemeStorage = {
      getItem: async (key) => values.get(key) ?? null,
      setItem: async (key, value) => { values.set(key, value); },
    };
    expect(await loadThemePreference(storage)).toBe('dark');
    await saveThemePreference(storage, 'light');
    expect(values.get(THEME_STORAGE_KEY)).toBe('light');
    values.set(THEME_STORAGE_KEY, 'invalid');
    expect(await loadThemePreference(storage)).toBe('system');
  });
});
