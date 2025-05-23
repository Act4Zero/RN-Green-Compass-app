import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import supabase from '@/lib/supabase';
import { Profile } from '@/types/profiles';
import { getDisplayIdentifier } from '@/services/profile/utils';

/**
 * Custom hook to retrieve a user's display name from their profile
 * @returns The user's display name or a fallback
 */
export function useUserDisplayName(): { displayName: string | undefined; isLoading: boolean } {
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;
    
    if (user?.id) {
      setIsLoading(true);
      
      const fetchUserProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (isMounted) {
          if (!error && data) {
            setUserProfile(data as Profile);
          }
          setIsLoading(false);
        }
      };
      
      fetchUserProfile();
    }
    
    return () => {
      isMounted = false;
    };
  }, [user?.id]);
  
  // Get user display name with profile info
  // Don't fall back to email-based username to protect privacy
  const displayName = userProfile 
    ? getDisplayIdentifier(userProfile) 
    : isLoading ? 'Loading...' : 'GreenCompass User';
    
  return { displayName, isLoading };
}

export default useUserDisplayName;
