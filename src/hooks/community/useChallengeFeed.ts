/**
 * Main hook for challenge functionality
 * 
 * This hook composes all the individual challenge hooks into a single interface.
 * For more granular control, you can use the individual hooks directly.
 */
import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Challenge } from '../../types/community/challenge';
import {
  useCurrentUser,
  useChallenges,
  useSelectedChallenge,
  useParticipants,
  useActivityLogs,
  useFormState
} from '../challenge';

/**
 * Custom hook for challenge feed functionality
 */
function useChallengeFeed() {
  const router = useRouter();
  
  // User state
  const { 
    currentUser, 
    isAuthenticated, 
    isLoading: userLoading, 
    updateProgressMetric 
  } = useCurrentUser();
  
  // Challenges state
  const {
    challenges,
    count: challengesCount,
    page: challengesPage,
    hasMore: hasMoreChallenges,
    isLoading: isLoadingChallenges,
    error: challengesError,
    loadChallenges,
    loadMore: loadMoreChallenges,
    refresh: refreshChallenges,
    createChallenge: createChallengeBase,
    updateChallenge,
    deleteChallenge,
    loadUserChallenges,
    updateChallengeInState
  } = useChallenges();
  
  // Selected challenge state
  const {
    challenge: selectedChallenge,
    isLoading: isLoadingSelectedChallenge,
    error: selectedChallengeError,
    loadChallenge,
    updateParticipantCount,
    updateProgressMetrics,
    clearChallenge
  } = useSelectedChallenge();
  
  // Participants state - using a memoized challengeId to prevent infinite loops
  const currentChallengeId = selectedChallenge?.id || '';
  
  const {
    participants,
    count: participantsCount,
    page: participantsPage,
    hasMore: hasMoreParticipants,
    isLoading: isLoadingParticipants,
    error: participantsError,
    loadParticipants: loadParticipantsBase,
    loadMore: loadMoreParticipants,
    refresh: refreshParticipants,
    joinChallenge: joinChallengeBase,
    leaveChallenge: leaveChallengeBase,
    getUserParticipation
  } = useParticipants({
    challengeId: currentChallengeId,
    initialPage: 1,
    pageSize: 20
  });
  
  // Wrapper for loadParticipants that ensures we're using the latest challengeId
  const loadParticipants = useCallback(() => {
    if (selectedChallenge?.id) {
      return loadParticipantsBase();
    }
    return Promise.resolve(null);
  }, [selectedChallenge?.id, loadParticipantsBase]);
  
  // Activity logs state
  const {
    logs: activityLogs,
    count: activityLogsCount,
    page: activityLogsPage,
    hasMore: hasMoreActivityLogs,
    isLoading: isLoadingActivityLogs,
    error: activityLogsError,
    loadActivityLogs: loadActivityLogsBase,
    loadMore: loadMoreActivityLogs,
    refresh: refreshActivityLogs,
    logActivity: logActivityBase,
    deleteActivityLog,
    getTotalImpact
  } = useActivityLogs({
    challengeId: currentChallengeId,
    initialPage: 1,
    pageSize: 20
  });
  
  // Wrapper for loadActivityLogs that ensures we're using the latest challengeId
  const loadActivityLogs = useCallback(() => {
    if (selectedChallenge?.id) {
      return loadActivityLogsBase();
    }
    return Promise.resolve(null);
  }, [selectedChallenge?.id, loadActivityLogsBase]);
  
  // Form state
  const {
    // Challenge form
    newChallengeTitle,
    setNewChallengeTitle,
    newChallengeDescription,
    setNewChallengeDescription,
    newChallengeStartDate,
    setNewChallengeStartDate,
    newChallengeEndDate,
    setNewChallengeEndDate,
    resetChallengeForm,
    validateChallengeForm,
    
    // Activity log form
    newActivityDescription,
    setNewActivityDescription,
    newActivityImpactValue,
    setNewActivityImpactValue,
    resetActivityForm,
    validateActivityForm,
    
    // Submission state
    isSubmitting,
    setSubmitting,
    error: submitError,
    setError: setSubmitError
  } = useFormState();
  
  /**
   * Create a challenge with form validation
   */
  const createChallenge = useCallback(async () => {
    if (!validateChallengeForm()) return null;
    
    setSubmitting(true);
    
    try {
      const result = await createChallengeBase(
        newChallengeTitle,
        newChallengeDescription,
        newChallengeStartDate,
        newChallengeEndDate
      );
      
      if (result) {
        resetChallengeForm();
      }
      
      return result;
    } catch (error) {
      console.error('Error in createChallenge:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create challenge');
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [
    validateChallengeForm,
    createChallengeBase,
    newChallengeTitle,
    newChallengeDescription,
    newChallengeStartDate,
    newChallengeEndDate,
    resetChallengeForm,
    setSubmitting,
    setSubmitError
  ]);
  
  /**
   * Join a challenge with side effects
   */
  const joinChallenge = useCallback(async () => {
    if (!selectedChallenge) return false;
    
    setSubmitting(true);
    
    try {
      const result = await joinChallengeBase();
      
      if (result.success && result.isJoined) {
        // Update participant count in the selected challenge
        updateParticipantCount(true);
      }
      
      return result.success;
    } finally {
      setSubmitting(false);
    }
  }, [selectedChallenge, joinChallengeBase, updateParticipantCount, setSubmitting]);
  
  /**
   * Leave a challenge with side effects
   */
  const leaveChallenge = useCallback(async () => {
    if (!selectedChallenge) return false;
    
    setSubmitting(true);
    
    try {
      const result = await leaveChallengeBase();
      
      if (result.success && !result.isJoined) {
        // Update participant count in the selected challenge
        updateParticipantCount(false);
      }
      
      return result.success;
    } finally {
      setSubmitting(false);
    }
  }, [selectedChallenge, leaveChallengeBase, updateParticipantCount, setSubmitting]);
  
  /**
   * Log an activity with form validation
   */
  const logActivity = useCallback(async () => {
    if (!selectedChallenge || !validateActivityForm()) return null;
    
    setSubmitting(true);
    
    try {
      const result = await logActivityBase(
        'Challenge activity',
        newActivityDescription,
        newActivityImpactValue
      );
      
      if (result) {
        // Update progress metrics in the selected challenge
        updateProgressMetrics(newActivityImpactValue, newActivityImpactValue);
        
        // Reset form
        resetActivityForm();
      }
      
      return result;
    } catch (error) {
      console.error('Error in logActivity:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to log activity');
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [
    selectedChallenge,
    validateActivityForm,
    logActivityBase,
    newActivityDescription,
    newActivityImpactValue,
    updateProgressMetrics,
    resetActivityForm,
    setSubmitting,
    setSubmitError
  ]);
  
  /**
   * Handle challenge deletion with proper cleanup
   */
  const handleDeleteChallenge = useCallback(async (challengeId: string) => {
    const success = await deleteChallenge(challengeId);
    
    if (success) {
      // If we just deleted the selected challenge, clear it
      if (selectedChallenge?.id === challengeId) {
        clearChallenge();
        
        // Navigate back to challenges list
        router.replace('/community/challenges');
      }
    }
    
    return success;
  }, [deleteChallenge, selectedChallenge, clearChallenge, router]);

  /**
   * Navigate to challenge detail
   */
  const navigateToChallengeDetail = useCallback((challengeId: string) => {
    router.push({ pathname: '/community/challenges/[id]', params: { id: challengeId } });
  }, [router]);
  
  /**
   * Navigate to create challenge screen
   */
  const navigateToCreateChallenge = useCallback(() => {
    router.push('/community/challenges');
  }, [router]);
  
  /**
   * Check if a challenge is active (current date is between start and end dates)
   */
  const isChallengeActive = useCallback((challenge: Challenge | null) => {
    if (!challenge) return false;
    
    const now = new Date();
    const startDate = new Date(challenge.start_date);
    const endDate = new Date(challenge.end_date);
    
    return now >= startDate && now <= endDate;
  }, []);
  
  /**
   * Check if a challenge is upcoming (current date is before start date)
   */
  const isChallengeUpcoming = useCallback((challenge: Challenge | null) => {
    if (!challenge) return false;
    
    const now = new Date();
    const startDate = new Date(challenge.start_date);
    
    return now < startDate;
  }, []);
  
  /**
   * Check if a challenge is completed (current date is after end date)
   */
  const isChallengeCompleted = useCallback((challenge: Challenge | null) => {
    if (!challenge) return false;
    
    const now = new Date();
    const endDate = new Date(challenge.end_date);
    
    return now > endDate;
  }, []);
  
  return {
    // User
    currentUser,
    isAuthenticated,
    
    // Challenges
    challenges,
    challengesCount,
    challengesPage,
    hasMoreChallenges,
    isLoadingChallenges,
    challengesError,
    loadChallenges,
    loadMoreChallenges,
    refreshChallenges,
    createChallenge,
    updateChallenge,
    deleteChallenge: handleDeleteChallenge,
    loadUserChallenges,
    
    // Selected challenge
    selectedChallenge,
    isLoadingSelectedChallenge,
    selectedChallengeError,
    loadChallenge,
    clearChallenge,
    
    // Participants
    participants,
    participantsCount,
    participantsPage,
    hasMoreParticipants,
    isLoadingParticipants,
    participantsError,
    loadParticipants,
    loadMoreParticipants,
    refreshParticipants,
    joinChallenge,
    leaveChallenge,
    getUserParticipation,
    
    // Activity logs
    activityLogs,
    activityLogsCount,
    activityLogsPage,
    hasMoreActivityLogs,
    isLoadingActivityLogs,
    activityLogsError,
    loadActivityLogs,
    loadMoreActivityLogs,
    refreshActivityLogs,
    logActivity,
    deleteActivityLog,
    getTotalImpact,
    
    // Form state
    newChallengeTitle,
    setNewChallengeTitle,
    newChallengeDescription,
    setNewChallengeDescription,
    newChallengeStartDate,
    setNewChallengeStartDate,
    newChallengeEndDate,
    setNewChallengeEndDate,
    resetChallengeForm,
    
    newActivityDescription,
    setNewActivityDescription,
    newActivityImpactValue,
    setNewActivityImpactValue,
    resetActivityForm,
    
    isSubmitting,
    submitError,
    
    // Navigation helpers
    navigateToChallengeDetail,
    navigateToCreateChallenge,
    
    // Challenge status helpers
    isChallengeActive,
    isChallengeUpcoming,
    isChallengeCompleted
  };
}

export default useChallengeFeed;
