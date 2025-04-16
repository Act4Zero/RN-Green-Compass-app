import { Challenge, ChallengeParticipant, ActivityLog, PaginationParams, PaginatedResult } from '../../types/challenge';

/**
 * State for challenges
 */
export interface ChallengesState {
  challenges: Challenge[];
  count: number;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * State for a selected challenge
 */
export interface SelectedChallengeState {
  challenge: Challenge | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * State for challenge participants
 */
export interface ParticipantsState {
  participants: ChallengeParticipant[];
  count: number;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * State for activity logs
 */
export interface ActivityLogsState {
  logs: ActivityLog[];
  count: number;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * State for form submission
 */
export interface SubmitState {
  isSubmitting: boolean;
  error: string | null;
}

/**
 * Props for the useChallenges hook
 */
export interface UseChallengesProps {
  initialPage?: number;
  pageSize?: number;
}

/**
 * Props for the useParticipants hook
 */
export interface UseParticipantsProps {
  challengeId: string;
  initialPage?: number;
  pageSize?: number;
}

/**
 * Props for the useActivityLogs hook
 */
export interface UseActivityLogsProps {
  challengeId: string;
  userId?: string;
  initialPage?: number;
  pageSize?: number;
}

/**
 * Result of a join/leave operation
 */
export interface JoinResult {
  success: boolean;
  isJoined?: boolean;
}

export type { Challenge, ChallengeParticipant, ActivityLog, PaginationParams, PaginatedResult };
