import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import supabase from '../lib/supabase';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Define the shape of the auth context
type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
  signInWithGoogle: () => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
  signOut: () => Promise<{ error: Error | null }>;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize Google Sign-In
WebBrowser.maybeCompleteAuthSession();

// Configure GoogleSignin for native platforms
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  GoogleSignin.configure({
    webClientId: Constants.expoConfig?.extra?.googleWebClientId,
    iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
    androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
    scopes: ['profile', 'email']
  });
}

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Setup Google Auth for web platform
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: Constants.expoConfig?.extra?.googleWebClientId,
    iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
    androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
    webClientId: Constants.expoConfig?.extra?.googleWebClientId,
    redirectUri: Constants.expoConfig?.extra?.googleRedirectUri,
  });
  
  // Log OAuth configuration for debugging
  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('Google OAuth Configuration:', {
        webClientId: Constants.expoConfig?.extra?.googleWebClientId,
        redirectUri: Constants.expoConfig?.extra?.googleRedirectUri
      });
    }
  }, []);

  useEffect(() => {
    // Get the current session
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error.message);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Google Sign-In function
  const signInWithGoogle = async () => {
    try {
      // Handle platform-specific Google Sign-In
      if (Platform.OS === 'web') {
        // Web implementation using expo-auth-session
        console.log('Starting Google Sign-In with redirect URI:', Constants.expoConfig?.extra?.googleRedirectUri);
        
        // For web, we'll use Supabase's built-in OAuth flow instead of Expo's
        // This ensures the state parameter is properly handled
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            skipBrowserRedirect: false,
          }
        });
        
        // The above call will redirect the browser, so we won't reach this point
        // until the user is redirected back after authentication
        
        // If we do reach here, it means there was an issue with the redirect
        if (error) {
          console.error('Supabase OAuth error:', error);
          return { data: null, error };
        }
        
        return { data, error };
      } else {
        // Native implementation using @react-native-google-signin/google-signin
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        
        if (userInfo.idToken) {
          // Exchange Google token for Supabase session
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: userInfo.idToken,
          });
          
          return { data, error };
        } else {
          return { 
            data: null, 
            error: new Error('Failed to get ID token from Google Sign In') 
          };
        }
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      return { data: null, error: error as Error };
    }
  };

  // Auth context value
  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Default export to fix the 'missing required default export' warning
export default {
  AuthProvider,
  useAuth,
};
