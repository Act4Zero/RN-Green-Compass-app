import { useState, useCallback, useEffect } from 'react';
import supabase from '../../lib/supabase';
import { ChallengeParticipant, PaginatedResult } from '../../types/community/challenge';
import { ParticipantsState, UseParticipantsProps, JoinResult } from './types';
import useCurrentUser from './useCurrentUser';
import { PROFILES_BUCKET } from '@/services/profile/types';

/**
 * Hook for managing challenge participants
 */
function useParticipants({
  challengeId,
  initialPage = 1,
  pageSize = 20
}: UseParticipantsProps) {
  const { currentUser } = useCurrentUser();
  const userId = currentUser?.id;

  // State for participants
  const [state, setState] = useState<ParticipantsState>({
    participants: [],
    count: 0,
    page: initialPage,
    hasMore: false,
    isLoading: false,
    error: null
  });

  // Simple cache to avoid redundant storage calls
  const avatarCache: Record<string, string> = {};

  /**
   * Load participants for a challenge with pagination
   */
  const loadParticipants = useCallback(async (page = initialPage) => {
    if (!challengeId) return null;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Calculate pagination parameters
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Fetch participants with user details
      const { data, count, error } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          user:user_id(id, display_name, avatar_url)
        `, { count: 'exact' })
        .eq('challenge_id', challengeId)
        .order('progress_metric', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      const participants = data || [];
      // Enrich participants with signed avatar URLs
      const enhancedParticipants: ChallengeParticipant[] = await Promise.all(
        participants.map(async p => {
          const path = p.user?.avatar_url;
          let signedUrl: string | null = null;
          if (path) {
            if (avatarCache[path]) {
              signedUrl = avatarCache[path];
            } else {
              const { data: urlData, error: urlError } = await supabase
                .storage
                .from(PROFILES_BUCKET)
                .createSignedUrl(path, 60);
              if (!urlError && urlData?.signedUrl) {
                signedUrl = urlData.signedUrl;
                avatarCache[path] = signedUrl;
              }
            }
          }
          return { ...p, user: { ...p.user, avatar_signed_url: signedUrl } };
        })
      );
      const hasMore = count ? from + participants.length < count : false;
      
      setState(prev => ({
        ...prev,
        participants: page === 1 ? enhancedParticipants : [...prev.participants, ...enhancedParticipants],
        count: count || 0,
        page,
        hasMore,
        isLoading: false
      }));
      
      return {
        data: enhancedParticipants,
        count: count || 0,
        hasMore
      } as PaginatedResult<ChallengeParticipant>;
    } catch (error) {
      console.error('Error loading participants:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load participants' 
      }));
      return null;
    }
  }, [challengeId, initialPage, pageSize]);

  /**
   * Load more participants (pagination)
   */
  const loadMore = useCallback(async () => {
    if (state.isLoading || !state.hasMore) return null;
    return loadParticipants(state.page + 1);
  }, [state.isLoading, state.hasMore, state.page, loadParticipants]);

  /**
   * Refresh participants (reload from first page)
   */
  const refresh = useCallback(() => {
    return loadParticipants(1);
  }, [loadParticipants]);

  /**
   * Join a challenge
   */
  const joinChallenge = useCallback(async (): Promise<JoinResult> => {
    if (!userId || !challengeId) {
      return { success: false };
    }
    
    try {
      // Check if already joined
      const { data: existingParticipation } = await supabase
        .from('challenge_participants')
        .select('id')
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .single();
      
      if (existingParticipation) {
        return { success: true, isJoined: true };
      }
      
      // Check if challenge has ended
      const { data: challenge } = await supabase
        .from('challenges')
        .select('end_date')
        .eq('id', challengeId)
        .single();
      
      if (!challenge) {
        return { success: false };
      }
      
      const endDate = new Date(challenge.end_date);
      const now = new Date();
      
      if (endDate < now) {
        return { success: false };
      }
      
      // Join the challenge
      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: userId,
          progress_metric: 0
        });
      
      if (error) throw error;
      
      // Update state
      const { data: newParticipant } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          user:user_id(id, full_name, avatar_url)
        `)
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .single();
      
      setState(prev => ({
        ...prev,
        participants: [newParticipant, ...prev.participants],
        count: prev.count + 1
      }));
      
      return { success: true, isJoined: true };
    } catch (error) {
      console.error('Error joining challenge:', error);
      return { success: false };
    }
  }, [userId, challengeId]);

  /**
   * Leave a challenge
   */
  const leaveChallenge = useCallback(async (): Promise<JoinResult> => {
    if (!userId || !challengeId) {
      return { success: false };
    }
    
    try {
      // Leave the challenge
      const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('challenge_id', challengeId)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Update state
      setState(prev => ({
        ...prev,
        participants: prev.participants.filter(p => p.user_id !== userId),
        count: prev.count - 1
      }));
      
      return { success: true, isJoined: false };
    } catch (error) {
      console.error('Error leaving challenge:', error);
      return { success: false };
    }
  }, [userId, challengeId]);

  /**
   * Get user's participation status and progress
   */
  const getUserParticipation = useCallback(async () => {
    if (!userId || !challengeId) return null;
    
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      
      return data || null;
    } catch (error) {
      console.error('Error getting user participation:', error);
      return null;
    }
  }, [userId, challengeId]);

  // Load participants on mount or when challengeId changes
  useEffect(() => {
    if (challengeId) {
      loadParticipants();
    }
  }, [challengeId, loadParticipants]);

  return {
    ...state,
    loadParticipants,
    loadMore,
    refresh,
    joinChallenge,
    leaveChallenge,
    getUserParticipation
  };
}

export default useParticipants;
