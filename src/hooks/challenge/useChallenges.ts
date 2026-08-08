import { useState, useCallback, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { Challenge, PaginatedResult } from '@/types/community/challenge';
import { ChallengesState, UseChallengesProps } from '@/hooks/challenge/types';
import useCurrentUser from '@/hooks/challenge/useCurrentUser';

/**
 * Hook for managing challenges
 */
function useChallenges({
  initialPage = 1,
  pageSize = 10
}: UseChallengesProps = {}) {
  const { currentUser } = useCurrentUser();
  const userId = currentUser?.id;

  // State for challenges
  const [state, setState] = useState<ChallengesState>({
    challenges: [],
    count: 0,
    page: initialPage,
    hasMore: false,
    isLoading: false,
    error: null
  });

  /**
   * Load challenges with pagination
   */
  const loadChallenges = useCallback(async (page = initialPage) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Calculate pagination parameters
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Fetch challenges with aggregated data
      let query = supabase
        .from('challenges')
        .select(`
          *,
          creator:creator_id(id, full_name, avatar_url),
          participant_count:challenge_participants(count)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
      
      const { data, count, error } = await query;
      
      if (error) throw error;
      
      // If the user is logged in, check which challenges they're participating in
      let challengesWithParticipation: Challenge[] = data || [];
      if (userId) {
        const { data: participations } = await supabase
          .from('challenge_participants')
          .select('challenge_id, progress_metric')
          .eq('user_id', userId);
        
        const participationMap = new Map();
        participations?.forEach(p => {
          participationMap.set(p.challenge_id, p.progress_metric);
        });
        
        challengesWithParticipation = challengesWithParticipation.map(challenge => ({
          ...challenge,
          is_participant: participationMap.has(challenge.id),
          progress_metric: participationMap.get(challenge.id) || 0
        }));
      }
      
      // Process the data to format the challenges correctly
      const processedChallenges = challengesWithParticipation.map((challenge: Challenge) => ({
        ...challenge,
        participant_count: (challenge as any).participant_count?.[0]?.count || 0
      }));
      
      const hasMore = count ? from + processedChallenges.length < count : false;
      
      setState(prev => ({
        ...prev,
        challenges: page === 1 ? processedChallenges : [...prev.challenges, ...processedChallenges],
        count: count || 0,
        page,
        hasMore,
        isLoading: false
      }));
      
      return {
        data: processedChallenges,
        count: count || 0,
        hasMore
      } as PaginatedResult<Challenge>;
    } catch (error) {
      console.error('Error loading challenges:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load challenges' 
      }));
      return null;
    }
  }, [initialPage, pageSize, userId]);

  /**
   * Load more challenges (pagination)
   */
  const loadMore = useCallback(async () => {
    if (state.isLoading || !state.hasMore) return null;
    return loadChallenges(state.page + 1);
  }, [state.isLoading, state.hasMore, state.page, loadChallenges]);

  /**
   * Refresh challenges (reload from first page)
   */
  const refresh = useCallback(() => {
    return loadChallenges(1);
  }, [loadChallenges]);

  /**
   * Load challenges created by a specific user
   */
  const loadUserChallenges = useCallback(async (targetUserId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data, count, error } = await supabase
        .from('challenges')
        .select(`
          *,
          creator:creator_id(id, full_name, avatar_url),
          participant_count:challenge_participants(count)
        `, { count: 'exact' })
        .eq('creator_id', targetUserId)
        .order('created_at', { ascending: false })
        .range(0, pageSize - 1);
      
      if (error) throw error;
      
      // Process the data to format the challenges correctly
      const processedChallenges = (data || []).map(challenge => ({
        ...challenge,
        participant_count: (challenge as any).participant_count?.[0]?.count || 0
      }));
      
      setState(prev => ({
        ...prev,
        challenges: processedChallenges,
        count: count || 0,
        page: 1,
        hasMore: count ? processedChallenges.length < count : false,
        isLoading: false
      }));
      
      return {
        data: processedChallenges,
        count: count || 0,
        hasMore: count ? processedChallenges.length < count : false
      } as PaginatedResult<Challenge>;
    } catch (error) {
      console.error('Error loading user challenges:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load user challenges' 
      }));
      return null;
    }
  }, [pageSize]);

  /**
   * Create a new challenge
   */
  const createChallenge = useCallback(async (
    title: string,
    description: string,
    startDate: string,
    endDate: string
  ) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('challenges')
        .insert({
          creator_id: userId,
          title,
          description,
          start_date: startDate,
          end_date: endDate
        })
        .select(`
          *,
          creator:creator_id(id, full_name, avatar_url)
        `)
        .single();
      
      if (error) throw error;
      
      // Auto-join the creator to their own challenge
      await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: data.id,
          user_id: userId,
          progress_metric: 0
        });
      
      const newChallenge: Challenge = {
        ...data,
        participant_count: 1,
        is_participant: true,
        progress_metric: 0
      };
      
      // Update state with the new challenge
      setState(prev => ({
        ...prev,
        challenges: [newChallenge, ...prev.challenges],
        count: prev.count + 1
      }));
      
      return newChallenge;
    } catch (error) {
      console.error('Error creating challenge:', error);
      return null;
    }
  }, [userId]);

  /**
   * Update a challenge
   */
  const updateChallenge = useCallback(async (
    id: string,
    updates: {
      title?: string;
      description?: string;
      start_date?: string;
      end_date?: string;
    }
  ) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabase
        .from('challenges')
        .update(updates)
        .eq('id', id)
        .eq('creator_id', userId) // Only the creator can update
        .select(`
          *,
          creator:creator_id(id, full_name, avatar_url),
          participant_count:challenge_participants(count)
        `)
        .single();
      
      if (error) throw error;
      
      // Process the updated challenge
      const updatedChallenge: Challenge = {
        ...data,
        participant_count: (data as any).participant_count?.[0]?.count || 0
      };
      
      // Update state
      setState(prev => ({
        ...prev,
        challenges: prev.challenges.map(c => 
          c.id === id ? updatedChallenge : c
        )
      }));
      
      return updatedChallenge;
    } catch (error) {
      console.error('Error updating challenge:', error);
      return null;
    }
  }, [userId]);

  /**
   * Delete a challenge
   */
  const deleteChallenge = useCallback(async (id: string) => {
    if (!userId) return false;
    
    try {
      // Only the creator can delete
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', id)
        .eq('creator_id', userId);
      
      if (error) throw error;
      
      // Update state
      setState(prev => ({
        ...prev,
        challenges: prev.challenges.filter(c => c.id !== id),
        count: prev.count - 1
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting challenge:', error);
      return false;
    }
  }, [userId]);

  /**
   * Update challenge info in state (for when participant count changes)
   */
  const updateChallengeInState = useCallback((
    challengeId: string, 
    isJoining: boolean
  ) => {
    setState(prev => ({
      ...prev,
      challenges: prev.challenges.map(c => {
        if (c.id === challengeId) {
          const participant_count = (c.participant_count || 0) + (isJoining ? 1 : -1);
          return {
            ...c,
            participant_count,
            is_participant: isJoining
          };
        }
        return c;
      })
    }));
  }, []);

  // Load challenges on initial mount
  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  return {
    ...state,
    loadChallenges,
    loadMore,
    refresh,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    loadUserChallenges,
    updateChallengeInState
  };
}

export default useChallenges;
