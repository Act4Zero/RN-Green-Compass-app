import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get the environment variables from Expo Constants or use hardcoded values as fallback
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

// Validate URL and key
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

// Create a simple in-memory storage for development purposes
// This won't persist data between app restarts but will allow the app to run
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

// Initialize Supabase client with in-memory storage
const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: memoryStorageAdapter,
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
