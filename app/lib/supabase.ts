import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get the environment variables from Expo Constants or use hardcoded values as fallback
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://okyxunjbqqeuarhqlznq.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9reXh1bmpicXFldWFyaHFsem5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMzA3MjksImV4cCI6MjA1NjYwNjcyOX0._BUE3i3NflPCFf2jRpArJXkv6_i40xWdm1d1hf6YU24';

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
      persistSession: false, // Don't try to persist the session since we're using in-memory storage
      detectSessionInUrl: false,
    },
  }
);

export default supabase;
