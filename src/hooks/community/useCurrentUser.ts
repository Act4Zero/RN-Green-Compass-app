import { useState, useEffect } from 'react';
import supabase from '../../lib/supabase';

/**
 * Hook for managing the current user state
 */
const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          setCurrentUser({ id: data.user.id });
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setCurrentUser({ id: session.user.id });
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser
  };
};

export default useCurrentUser;
