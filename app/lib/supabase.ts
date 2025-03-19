import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// Debug flag - disable verbose logging to prevent terminal flood
const DEBUG = false; // Set to false to prevent excessive logging

// Get the environment variables from Expo Constants or use hardcoded values as fallback
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

// Validate URL and key
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

// Enhanced AsyncStorage adapter with error handling and retry logic
const enhancedAsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      // Silent error handling
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      // Silent error handling
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      // Silent error handling
    }
  },
};

// Create a localStorage adapter for web platforms with error handling
const localStorageAdapter = {
  getItem: (key: string): Promise<string | null> => {
    try {
      if (typeof window === 'undefined') return Promise.resolve(null);
      const value = window.localStorage.getItem(key);
      return Promise.resolve(value);
    } catch (error) {
      // Silent error handling
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string): Promise<void> => {
    try {
      if (typeof window === 'undefined') return Promise.resolve();
      window.localStorage.setItem(key, value);
      return Promise.resolve();
    } catch (error) {
      // Silent error handling
      return Promise.resolve();
    }
  },
  removeItem: (key: string): Promise<void> => {
    try {
      if (typeof window === 'undefined') return Promise.resolve();
      window.localStorage.removeItem(key);
      return Promise.resolve();
    } catch (error) {
      // Silent error handling
      return Promise.resolve();
    }
  },
};

// Fallback in-memory storage for server-side rendering contexts
const inMemoryStorage: Record<string, string> = {};

const memoryStorageAdapter = {
  getItem: (key: string): Promise<string | null> => {
    const value = inMemoryStorage[key] || null;
    return Promise.resolve(value);
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

// Function to check network connectivity
const checkNetworkConnectivity = async () => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected && netInfo.isInternetReachable;
};

// Select the appropriate storage adapter based on platform
const getStorageAdapter = () => {
  if (Platform.OS !== 'web') {
    return enhancedAsyncStorage;
  } else {
    return typeof window !== 'undefined' ? localStorageAdapter : memoryStorageAdapter;
  }
};

// Initialize Supabase client with platform-specific storage
const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: getStorageAdapter(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Increase the window for token refresh to prevent token expiration issues
      flowType: 'pkce',
    },
  }
);

// Set up auth state change listener with enhanced logging
supabase.auth.onAuthStateChange((event, session) => {
  if (DEBUG) {
    console.log(`[Auth] Event: ${event}`);
    console.log(`[Auth] Session exists: ${!!session}`);
    
    if (session) {
      console.log(`[Auth] User: ${session.user.email}`);
      const expiresAt = new Date(session.expires_at! * 1000);
      console.log(`[Auth] Session expires: ${expiresAt.toISOString()}`);
      console.log(`[Auth] Time until expiry: ${Math.floor((expiresAt.getTime() - Date.now()) / 1000 / 60)} minutes`);
    }
  }
});

// Helper function to check and refresh session if needed
export const ensureValidSession = async () => {
  try {
    // Check network connectivity first
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) return;

    const { data, error } = await supabase.auth.getSession();
    
    if (data.session) {
      // If session exists but is close to expiry, refresh it
      const expiresAt = new Date(data.session.expires_at! * 1000);
      const minutesUntilExpiry = Math.floor((expiresAt.getTime() - Date.now()) / 1000 / 60);
      
      if (minutesUntilExpiry < 10) {
        // Silently refresh the session
        await supabase.auth.refreshSession();
      }
    } else {
      // No session found, try to recover it
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (!refreshError && refreshData.session) {
        // Explicitly set the session again to ensure it's properly stored
        await supabase.auth.setSession({
          access_token: refreshData.session.access_token,
          refresh_token: refreshData.session.refresh_token
        });
      }
    }
  } catch (error) {
    console.error('[Auth] Error in ensureValidSession:', error);
  }
};

export default supabase;
