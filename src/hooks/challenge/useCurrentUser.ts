import { useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import supabase from '../../lib/supabase';

/**
 * Hook for accessing current user information in challenge context
 */
function useCurrentUser() {
  const { user, session, loading: authLoading } = useAuth();
  
  const isAuthenticated = useMemo(() => {
    return !!session && !!user;
  }, [session, user]);
  
  const currentUser = useMemo(() => {
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      fullName: user.user_metadata?.full_name || null,
      avatarUrl: user.user_metadata?.avatar_url || null
    };
  }, [user]);
  
  /**
   * Update user progress metric for a specific challenge
   */
  const updateProgressMetric = useCallback(async (
    challengeId: string, 
    incrementValue: number
  ): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      // First get the current participant record
      const { data: participant, error: selectError } = await supabase
        .from('challenge_participants')
        .select('id, progress_metric')
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)
        .single();
      
      if (selectError || !participant) {
        console.error('Error fetching participant record:', selectError);
        return false;
      }
      
      // Then update the progress_metric
      const newProgressMetric = (participant.progress_metric || 0) + incrementValue;
      
      const { error: updateError } = await supabase
        .from('challenge_participants')
        .update({ progress_metric: newProgressMetric })
        .eq('id', participant.id);
      
      if (updateError) {
        console.error('Error updating progress metric:', updateError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateProgressMetric:', error);
      return false;
    }
  }, [user?.id]);
  
  return {
    currentUser,
    isAuthenticated,
    isLoading: authLoading,
    updateProgressMetric
  };
}

export default useCurrentUser;
