import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { KnowledgeLocale } from './types';
import type { KnowledgeTopic } from './types';

const STORAGE_KEY = 'green-compass:knowledge:locale';

interface KnowledgeLocaleContextValue {
  locale: KnowledgeLocale;
  setLocale: (locale: KnowledgeLocale) => Promise<void>;
  t: (english: string, bulgarian: string) => string;
}

const KnowledgeLocaleContext = createContext<KnowledgeLocaleContextValue | null>(null);

export function KnowledgeLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<KnowledgeLocale>('en');
  useEffect(() => { void AsyncStorage.getItem(STORAGE_KEY).then((value) => { if (value === 'bg' || value === 'en') setLocaleState(value); }); }, []);
  const setLocale = async (next: KnowledgeLocale) => { setLocaleState(next); await AsyncStorage.setItem(STORAGE_KEY, next); };
  const value = useMemo(() => ({ locale, setLocale, t: (english: string, bulgarian: string) => locale === 'bg' ? bulgarian : english }), [locale]);
  return <KnowledgeLocaleContext.Provider value={value}>{children}</KnowledgeLocaleContext.Provider>;
}

export function useKnowledgeLocale() {
  const context = useContext(KnowledgeLocaleContext);
  if (!context) throw new Error('useKnowledgeLocale must be used within KnowledgeLocaleProvider');
  return context;
}

const TOPIC_BG: Record<string, { name: string; description: string }> = {
  'zero-waste': { name: 'Нулев отпадък', description: 'Предотвратявайте отпадъци, използвайте повторно и рециклирайте правилно.' },
  'clean-energy': { name: 'Чиста енергия', description: 'Използвайте енергията разумно и разберете чистия преход.' },
  'sustainable-food': { name: 'Устойчива храна', description: 'Избирайте хранителни системи, добри за хората и планетата.' },
  'ethical-fashion': { name: 'Етична мода', description: 'Купувайте по-малко, грижете се по-дълго и задавайте по-добри въпроси.' },
  conservation: { name: 'Опазване на природата', description: 'Пазете местообитанията, биоразнообразието и общите природни места.' },
  'climate-action': { name: 'Действия за климата', description: 'Разберете климатичните промени и избирайте ефективни действия.' },
  'water-conservation': { name: 'Грижа за водата', description: 'Намалете загубите на вода у дома и в общността.' },
  'green-transportation': { name: 'Устойчива мобилност', description: 'Придвижвайте се с по-малко емисии и по-здравословни улици.' },
  permaculture: { name: 'Пермакултура', description: 'Проектирайте устойчиви градини и регенеративни системи.' },
  'sustainable-building': { name: 'Устойчиво строителство', description: 'Създавайте ефективни, комфортни и по-щадящи пространства.' },
};

export function localizedTopic(topic: KnowledgeTopic, locale: KnowledgeLocale) {
  return locale === 'bg' && TOPIC_BG[topic.slug] ? TOPIC_BG[topic.slug] : { name: topic.name, description: topic.description };
}
