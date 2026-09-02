import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AppLocale = 'en' | 'bg';
const STORAGE_KEY = 'green-compass:app:locale';
const LEGACY_STORAGE_KEY = 'green-compass:knowledge:locale';

interface AppLocaleContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => Promise<void>;
  t: (english: string, bulgarian: string) => string;
}

const AppLocaleContext = createContext<AppLocaleContextValue | null>(null);

export function AppLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>('bg');
  useEffect(() => {
    void Promise.all([AsyncStorage.getItem(STORAGE_KEY), AsyncStorage.getItem(LEGACY_STORAGE_KEY)]).then(([current, legacy]) => {
      const saved = current || legacy;
      if (saved === 'bg' || saved === 'en') setLocaleState(saved);
    });
  }, []);
  const setLocale = async (next: AppLocale) => { setLocaleState(next); await AsyncStorage.setItem(STORAGE_KEY, next); };
  const value = useMemo(() => ({ locale, setLocale, t: (english: string, bulgarian: string) => locale === 'bg' ? bulgarian : english }), [locale]);
  return <AppLocaleContext.Provider value={value}>{children}</AppLocaleContext.Provider>;
}

export function useAppLocale() {
  const context = useContext(AppLocaleContext);
  if (!context) throw new Error('useAppLocale must be used within AppLocaleProvider');
  return context;
}
