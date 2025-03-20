import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import supabase, { ensureValidSession } from '../lib/supabase';
import { AppState, AppStateStatus, Platform } from 'react-native';

// Define the shape of the auth context
type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  sessionError: Error | null;
  signUp: (email: string, password: string, captchaToken?: string) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
  signIn: (email: string, password: string, captchaToken?: string) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
  signOut: () => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<Error | null>(null);
  const appStateRef = useRef<AppStateStatus>(Platform.OS === 'web' ? 'active' : AppState.currentState);
  const sessionRetryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    // Enhanced session retrieval with retry logic
    const getSession = async (retryCount = 0) => {
      try {
        setLoading(true);
        setSessionError(null);
        
        // First ensure we have a valid session (checks and refreshes if needed)
        await ensureValidSession();
        
        // Then get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error.message);
          setSessionError(error);
          
          // Implement retry logic
          if (retryCount < maxRetries) {
            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.pow(2, retryCount) * 1000;
            setTimeout(() => getSession(retryCount + 1), delay);
            return;
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        sessionRetryCount.current = 0; // Reset retry counter on success
      } catch (err) {
        console.error('Unexpected error in getSession:', err);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Subscribe to auth changes with enhanced logging
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // On sign-in, ensure we have a valid session
      if (event === 'SIGNED_IN' && session) {
        ensureValidSession();
      }
    });
    
    // Set up app state change listener to refresh session when app comes to foreground
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) && 
        nextAppState === 'active'
      ) {
        getSession();
      }
      appStateRef.current = nextAppState;
    };
    
    // Only set up AppState listener on mobile platforms
    let appStateSubscription: any;
    if (Platform.OS !== 'web') {
      appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    }

    // Cleanup the subscriptions
    return () => {
      subscription.unsubscribe();
      if (appStateSubscription && Platform.OS !== 'web') {
        appStateSubscription.remove();
      }
    };
  }, []);

  // Enhanced sign up function with session persistence
  const signUp = async (email: string, password: string, captchaToken?: string) => {
    try {
      setLoading(true);
      const options = captchaToken ? { captchaToken } : {};
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options
      });
      
      if (error) {
        console.error('Sign up error:', error.message);
        return { data, error };
      }
      
      if (data.session) {
        // For new users, explicitly set the session to ensure it's properly stored
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
        
        // Set the user and session state directly
        setSession(data.session);
        setUser(data.user);
        
        // Ensure we have a valid session
        await ensureValidSession();
      } else {
        // If no session is returned, try to sign in immediately to establish a session
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (!signInError && signInData.session) {
          // Set the user and session state directly
          setSession(signInData.session);
          setUser(signInData.user);
        }
      }
      
      return { data, error };
    } catch (error) {
      console.error('Unexpected error during sign up:', error);
      return { data: null, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  // Enhanced sign in function with session validation
  const signIn = async (email: string, password: string, captchaToken?: string) => {
    try {
      setLoading(true);
      const options = captchaToken ? { captchaToken } : {};
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password,
        options
      });
      
      if (error) {
        console.error('Sign in error:', error.message);
        return { data, error };
      }
      
      if (data.session) {
        // Explicitly set the session to ensure it's properly stored
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
      }
      
      return { data, error };
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      return { data: null, error: error as Error };
    } finally {
      setLoading(false);
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

  // Function to manually refresh the session
  const refreshSession = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error.message);
        return { data, error };
      }
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
      
      return { data, error };
    } catch (error) {
      console.error('Unexpected error during session refresh:', error);
      return { data: null, error: error as Error };
    } finally {
      setLoading(false);
    }
  };
  
  // The context value exposing auth functions and state
  const value = {
    user,
    session,
    loading,
    sessionError,
    signUp,
    signIn,
    signOut,
    refreshSession,
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

// Default export to avoid the "missing required default export" warning
export default {
  AuthProvider,
  useAuth,
};