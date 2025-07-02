/**
 * Error handling utilities for the Map feature
 * Provides consistent error handling across the application
 */

/**
 * Standard error types for better error categorization
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  LOCATION = 'LOCATION',
  DATA = 'DATA',
  PERMISSION = 'PERMISSION',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Structured error with type information
 */
export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  timestamp: number;
}

/**
 * Create a structured error from any caught error
 */
export function createAppError(error: unknown, defaultType = ErrorType.UNKNOWN): AppError {
  if (error instanceof Error) {
    const message = error.message;
    let type = defaultType;
    
    // Determine error type based on message content
    if (message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch')) {
      type = ErrorType.NETWORK;
    } else if (message.toLowerCase().includes('permission') || message.toLowerCase().includes('denied')) {
      type = ErrorType.PERMISSION;
    } else if (message.toLowerCase().includes('location')) {
      type = ErrorType.LOCATION;
    } else if (message.toLowerCase().includes('timeout')) {
      type = ErrorType.TIMEOUT;
    } else if (message.toLowerCase().includes('data') || message.toLowerCase().includes('json')) {
      type = ErrorType.DATA;
    }
    
    return {
      type,
      message: message || 'An unknown error occurred',
      originalError: error,
      timestamp: Date.now()
    };
  }
  
  // Handle non-Error objects
  return {
    type: defaultType,
    message: error ? String(error) : 'An unknown error occurred',
    timestamp: Date.now()
  };
}

/**
 * Get user-friendly message based on error type
 */
export function getUserFriendlyErrorMessage(error: AppError): string {
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'Network connection issue. Please check your internet connection and try again.';
    case ErrorType.LOCATION:
      return 'Could not determine your location. Please try again later.';
    case ErrorType.PERMISSION:
      return 'Location permission denied. Please enable location access in your settings.';
    case ErrorType.DATA:
      return 'Could not load sustainability data. Please try again later.';
    case ErrorType.TIMEOUT:
      return 'Request timed out. Please try again later.';
    case ErrorType.UNKNOWN:
    default:
      return 'Something went wrong. Please try again later.';
  }
}

/**
 * Log error with useful context for debugging
 */
export function logError(error: AppError, context?: Record<string, unknown>): void {
  console.error({
    timestamp: new Date(error.timestamp).toISOString(),
    type: error.type,
    message: error.message,
    originalError: error.originalError,
    context
  });
  
  // In a production app, you might send this to an error reporting service
}

/**
 * Safely handle any async operation with consistent error handling
 */
export async function safeAsync<T>(
  asyncFn: () => Promise<T>,
  errorType = ErrorType.UNKNOWN
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const result = await asyncFn();
    return { data: result, error: null };
  } catch (error) {
    const appError = createAppError(error, errorType);
    logError(appError);
    return { data: null, error: appError };
  }
}
