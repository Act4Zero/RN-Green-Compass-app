import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Get the environment variables from Expo Constants or use hardcoded values as fallback
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

// Validate URL and key
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

// Create a localStorage adapter for web platforms
const localStorageAdapter = {
  getItem: (key: string): Promise<string | null> => {
    if (typeof window === 'undefined') return Promise.resolve(null);
    return Promise.resolve(window.localStorage.getItem(key));
  },
  setItem: (key: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return Promise.resolve();
    window.localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string): Promise<void> => {
    if (typeof window === 'undefined') return Promise.resolve();
    window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

// Fallback in-memory storage for server-side rendering contexts
const inMemoryStorage: Record<string, string> = {};

const memoryStorageAdapter = {
  getItem: (key: string): Promise<string | null> => {
    return Promise.resolve(inMemoryStorage[key] || null);
  },
  setItem: (key: string, value: string): Promise<void> => {
    inMemoryStorage[key] = value;
    return Promise.resolve();
  },
  removeItem: (key: string): Promise<void> => {
    delete inMemoryStorage[key];
    return Promise.resolve();
  },
};

// Initialize Supabase client with platform-specific storage
// Uses AsyncStorage for mobile platforms and localStorage for web (with SSR fallback)
const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: Platform.OS !== 'web' 
        ? AsyncStorage 
        : (typeof window !== 'undefined' ? localStorageAdapter : memoryStorageAdapter),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true, // Enable this to detect OAuth state in URL
    },
  }
);

// For web platform, handle OAuth response in URL
if (typeof window !== 'undefined') {
  // This will capture the OAuth response and set the session
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Supabase auth event:', event);
    if (session) {
      console.log('Session established');
    }
  });
}

export default supabase;
