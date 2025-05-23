import React, { createContext, useReducer, useContext, ReactNode, useCallback } from 'react';

// Notification types
export type NotificationType = 'toast' | 'modal' | 'banner' | 'alert';

// Notification severity levels
export type NotificationSeverity = 'success' | 'info' | 'warning' | 'error';

// Notification data structure
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  severity?: NotificationSeverity;
  duration?: number; // Duration in ms (for auto-dismissible notifications)
  autoClose?: boolean; // Whether notification should auto-close
  action?: {
    label: string;
    onPress: () => void;
  };
  data?: Record<string, any>; // Additional custom data
}

// Context state
interface NotificationState {
  notifications: Notification[];
}

// Action types
type NotificationAction = 
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id'> & { id: string } }
  | { type: 'REMOVE_NOTIFICATION'; payload: { id: string } }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' };

// Initial state
const initialState: NotificationState = {
  notifications: [],
};

// Create context
const NotificationContext = createContext<{
  state: NotificationState;
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
} | undefined>(undefined);

// Reducer function
function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload.id),
      };
    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };
    default:
      return state;
  }
}

// Generate a simple unique ID (since we can't import uuid in React Native without additional setup)
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Provider component
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const defaults = {
      severity: 'info' as NotificationSeverity,
      autoClose: true,
      duration: 3000,
    };
    
    const id = generateId();
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { ...defaults, ...notification, id },
    });
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: { id } });
  }, []);

  const clearAllNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  }, []);

  return (
    <NotificationContext.Provider
      value={{ state, addNotification, removeNotification, clearAllNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook to use notification context
export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
