import { Discussion, Comment, PaginationParams, PaginatedResult } from '../../types/community';

/**
 * State for discussions
 */
export interface DiscussionsState {
  discussions: Discussion[];
  count: number;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * State for a selected discussion
 */
export interface SelectedDiscussionState {
  discussion: Discussion | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * State for comments
 */
export interface CommentsState {
  comments: Comment[];
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
 * Props for the useDiscussions hook
 */
export interface UseDiscussionsProps {
  initialPage?: number;
  pageSize?: number;
}

/**
 * Props for the useComments hook
 */
export interface UseCommentsProps {
  discussionId: string;
  initialPage?: number;
  pageSize?: number;
}

/**
 * Result of a toggle operation
 */
export interface ToggleResult {
  success: boolean;
  isAdded?: boolean;
}

export type { Discussion, Comment, PaginationParams, PaginatedResult };
