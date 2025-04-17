import { useState, useCallback, useEffect } from 'react';
import supabase from '../../lib/supabase';
import { ActivityLog, PaginatedResult } from '../../types/challenge';
import { ActivityLogsState, UseActivityLogsProps } from './types';
import useCurrentUser from './useCurrentUser';

/**
 * Hook for managing activity logs for a challenge
 */
function useActivityLogs({
  challengeId,
  userId,
  initialPage = 1,
  pageSize = 20
}: UseActivityLogsProps) {
  const { currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id;

  // State for activity logs
  const [state, setState] = useState<ActivityLogsState>({
    logs: [],
    count: 0,
    page: initialPage,
    hasMore: false,
    isLoading: false,
    error: null
  });

  /**
   * Load activity logs with pagination
   */
  const loadActivityLogs = useCallback(async (page = initialPage) => {
    if (!challengeId) return null;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Calculate pagination parameters
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Build query
      let query = supabase
        .from('activity_logs')
        .select(`
          *,
          user:user_id(id, full_name, avatar_url)
        `, { count: 'exact' })
        .eq('challenge_id', challengeId)
        .order('created_at', { ascending: false })
        .range(from, to);
      
      // Filter by user if specified
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, count, error } = await query;
      
      if (error) throw error;
      
      const logs = data || [];
      const hasMore = count ? from + logs.length < count : false;
      
      setState(prev => ({
        ...prev,
        logs: page === 1 ? logs : [...prev.logs, ...logs],
        count: count || 0,
        page,
        hasMore,
        isLoading: false
      }));
      
      return {
        data: logs,
        count: count || 0,
        hasMore
      } as PaginatedResult<ActivityLog>;
    } catch (error) {
      console.error('Error loading activity logs:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load activity logs' 
      }));
      return null;
    }
  }, [challengeId, userId, initialPage, pageSize]);

  /**
   * Load more activity logs (pagination)
   */
  const loadMore = useCallback(async () => {
    if (state.isLoading || !state.hasMore) return null;
    return loadActivityLogs(state.page + 1);
  }, [state.isLoading, state.hasMore, state.page, loadActivityLogs]);

  /**
   * Refresh activity logs (reload from first page)
   */
  const refresh = useCallback(() => {
    return loadActivityLogs(1);
  }, [loadActivityLogs]);

  /**
   * Log a new activity
   */
  const logActivity = useCallback(async (
    description: string,
    impactValue: number
  ) => {
    if (!currentUserId || !challengeId) return null;
    
    try {
      // Create the activity log
      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          challenge_id: challengeId,
          user_id: currentUserId,
          description,
          impact_value: impactValue
        })
        .select(`
          *,
          user:user_id(id, full_name, avatar_url)
        `)
        .single();
      
      if (error) throw error;
      
      // Update the participant's progress metric
      await supabase.rpc('update_participant_progress', {
        p_challenge_id: challengeId,
        p_user_id: currentUserId,
        p_increment: impactValue
      });
      
      // Update state with the new log
      setState(prev => ({
        ...prev,
        logs: [data, ...prev.logs],
        count: prev.count + 1
      }));
      
      return data;
    } catch (error) {
      console.error('Error logging activity:', error);
      return null;
    }
  }, [currentUserId, challengeId]);

  /**
   * Delete an activity log
   */
  const deleteActivityLog = useCallback(async (logId: string) => {
    if (!currentUserId) return false;
    
    try {
      // Get the log to determine the impact value
      const { data: log } = await supabase
        .from('activity_logs')
        .select('impact_value, user_id')
        .eq('id', logId)
        .single();
      
      if (!log || log.user_id !== currentUserId) {
        return false; // Only the creator can delete their log
      }
      
      // Delete the log
      const { error } = await supabase
        .from('activity_logs')
        .delete()
        .eq('id', logId);
      
      if (error) throw error;
      
      // Decrement the participant's progress metric
      await supabase.rpc('update_participant_progress', {
        p_challenge_id: challengeId,
        p_user_id: currentUserId,
        p_increment: -log.impact_value // Negative to decrement
      });
      
      // Update state
      setState(prev => ({
        ...prev,
        logs: prev.logs.filter(l => l.id !== logId),
        count: prev.count - 1
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting activity log:', error);
      return false;
    }
  }, [currentUserId, challengeId]);

  /**
   * Get total impact value for a challenge
   */
  const getTotalImpact = useCallback(async () => {
    if (!challengeId) return 0;
    
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('impact_value')
        .eq('challenge_id', challengeId);
      
      if (error) throw error;
      
      return data?.reduce((sum, log) => sum + (log.impact_value || 0), 0) || 0;
    } catch (error) {
      console.error('Error getting total impact:', error);
      return 0;
    }
  }, [challengeId]);

  // Load activity logs on mount or when challengeId changes
  useEffect(() => {
    if (challengeId) {
      loadActivityLogs();
    }
  }, [challengeId, loadActivityLogs]);

  return {
    ...state,
    loadActivityLogs,
    loadMore,
    refresh,
    logActivity,
    deleteActivityLog,
    getTotalImpact
  };
}

export default useActivityLogs;
