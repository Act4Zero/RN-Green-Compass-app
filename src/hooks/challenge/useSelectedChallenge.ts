import { useState, useCallback } from 'react';
import supabase from '../../lib/supabase';
import { Challenge } from '../../types/challenge';
import { SelectedChallengeState } from './types';
import useCurrentUser from './useCurrentUser';

/**
 * Hook for managing the currently selected challenge
 */
function useSelectedChallenge() {
  const { currentUser } = useCurrentUser();
  const userId = currentUser?.id;

  // State for selected challenge
  const [state, setState] = useState<SelectedChallengeState>({
    challenge: null,
    isLoading: false,
    error: null
  });

  /**
   * Load a specific challenge by ID
   */
  const loadChallenge = useCallback(async (challengeId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Fetch the challenge with all related data
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          creator:creator_id(id, display_name:full_name, avatar_url),
          participant_count:challenge_participants(count)
        `)
        .eq('id', challengeId)
        .single();
      
      if (error) throw error;
      
      // Process challenge data
      let challengeWithDetails: Challenge = {
        ...data,
        participant_count: data.participant_count?.[0]?.count || 0
      };
      
      // If user is logged in, check if they're participating
      if (userId) {
        // Fetch participation as an array to always return 200 OK
        const { data: participants, error: participationError } = await supabase
          .from('challenge_participants')
          .select('id, progress_metric')
          .eq('challenge_id', challengeId)
          .eq('user_id', userId)
          .range(0, 0);
        
        if (participationError) console.error('Error fetching participation:', participationError);
        const participation = participants?.[0] ?? null;
        
        challengeWithDetails = {
          ...challengeWithDetails,
          is_participant: !!participation,
          progress_metric: participation?.progress_metric || 0
        };
      }
      
      // Get the overall group progress metric
      const { data: totalProgress } = await supabase
        .from('challenge_participants')
        .select('progress_metric')
        .eq('challenge_id', challengeId);
      
      const groupProgressMetric = totalProgress?.reduce(
        (sum, item) => sum + (item.progress_metric || 0), 
        0
      ) || 0;
      
      challengeWithDetails = {
        ...challengeWithDetails,
        group_progress_metric: groupProgressMetric
      };
      
      setState({
        challenge: challengeWithDetails,
        isLoading: false,
        error: null
      });
      
      return challengeWithDetails;
    } catch (error) {
      console.error('Error loading challenge:', error);
      setState({ 
        challenge: null,
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load challenge'
      });
      return null;
    }
  }, [userId]);

  /**
   * Update participant count in the selected challenge
   */
  const updateParticipantCount = useCallback((isJoining: boolean) => {
    setState(prev => {
      if (!prev.challenge) return prev;
      
      const participant_count = (prev.challenge.participant_count || 0) + (isJoining ? 1 : -1);
      
      return {
        ...prev,
        challenge: {
          ...prev.challenge,
          participant_count,
          is_participant: isJoining
        }
      };
    });
  }, []);

  /**
   * Update progress metrics in the selected challenge
   */
  const updateProgressMetrics = useCallback((
    personalIncrement: number, 
    groupIncrement: number
  ) => {
    setState(prev => {
      if (!prev.challenge) return prev;
      
      return {
        ...prev,
        challenge: {
          ...prev.challenge,
          progress_metric: (prev.challenge.progress_metric || 0) + personalIncrement,
          group_progress_metric: (prev.challenge.group_progress_metric || 0) + groupIncrement
        }
      };
    });
  }, []);

  /**
   * Clear the selected challenge
   */
  const clearChallenge = useCallback(() => {
    setState({
      challenge: null,
      isLoading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    loadChallenge,
    updateParticipantCount,
    updateProgressMetrics,
    clearChallenge
  };
}

export default useSelectedChallenge;
