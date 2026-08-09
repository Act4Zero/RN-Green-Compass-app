import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { AppTheme, createTheme, ResolvedTheme, resolveTheme, ThemePreference } from './tokens';
import { loadThemePreference, saveThemePreference } from './persistence';

interface ThemeContextValue {
  theme: AppTheme;
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    loadThemePreference(AsyncStorage)
      .then(setPreferenceState)
      .catch(() => undefined);
  }, []);

  const resolvedTheme = resolveTheme(preference, systemTheme);
  const theme = useMemo(() => createTheme(resolvedTheme), [resolvedTheme]);

  const setPreference = useCallback(async (nextPreference: ThemePreference) => {
    setPreferenceState(nextPreference);
    await saveThemePreference(AsyncStorage, nextPreference);
  }, []);

  const toggleTheme = useCallback(async () => {
    await setPreference(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setPreference]);

  const value = useMemo(
    () => ({ theme, preference, resolvedTheme, setPreference, toggleTheme }),
    [theme, preference, resolvedTheme, setPreference, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar
        barStyle={resolvedTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used within ThemeProvider');
  return context;
}
