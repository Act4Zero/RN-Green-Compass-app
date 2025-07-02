/**
 * Loading state utilities
 * Helps manage loading states and prevent infinite loops
 */

/**
 * Loading state tracking interface
 */
export interface LoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  isError: boolean;
  error: Error | null;
  timestamp: number | null;
  attempts: number;
}

/**
 * Create an initial loading state
 */
export function createInitialLoadingState(): LoadingState {
  return {
    isLoading: false,
    isLoaded: false,
    isError: false,
    error: null,
    timestamp: null,
    attempts: 0
  };
}

/**
 * Update loading state when starting a load operation
 */
export function startLoading(state: LoadingState): LoadingState {
  return {
    ...state,
    isLoading: true,
    isError: false,
    error: null,
    attempts: state.attempts + 1
  };
}

/**
 * Update loading state on successful load
 */
export function loadSuccess(state: LoadingState): LoadingState {
  return {
    ...state,
    isLoading: false,
    isLoaded: true,
    isError: false,
    error: null,
    timestamp: Date.now()
  };
}

/**
 * Update loading state on error
 */
export function loadError(state: LoadingState, error: Error): LoadingState {
  return {
    ...state,
    isLoading: false,
    isError: true,
    error
  };
}

/**
 * Determine if data should be reloaded based on current state
 * Helps prevent redundant data fetches
 */
export function shouldReload(
  state: LoadingState,
  options: {
    maxAge?: number;      // Maximum age in milliseconds before considering data stale
    forceReload?: boolean; // Force reload regardless of other conditions
    maxAttempts?: number;  // Maximum number of attempts before stopping retries
  } = {}
): boolean {
  const { maxAge = 5 * 60 * 1000, forceReload = false, maxAttempts = 3 } = options;
  
  // If force reload is specified, always reload
  if (forceReload) {
    return true;
  }
  
  // Don't reload if currently loading
  if (state.isLoading) {
    return false;
  }
  
  // If we've reached max attempts and there was an error, don't reload
  if (state.isError && state.attempts >= maxAttempts) {
    return false;
  }
  
  // If no data has been loaded yet, reload
  if (!state.isLoaded) {
    return true;
  }
  
  // If data is older than maxAge, reload
  if (state.timestamp && Date.now() - state.timestamp > maxAge) {
    return true;
  }
  
  // Default: don't reload
  return false;
}
