import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import pointsService from '../services/community/pointsService';
import { PointEvent, PointBalance } from '../types/community/points';
import analyticsService from '../services/analyticsService';

// Define the context shape
interface PointsContextType {
  // State
  pointBalance: PointBalance;
  pointHistory: PointEvent[];
  isLoading: boolean; // General loading state (for backward compatibility)
  isBalanceLoading: boolean; // Specific to balance loading
  isHistoryLoading: boolean; // Specific to history loading
  hasError: boolean;
  lastAwardedPoints: { amount: number; source: string } | null;
  
  // Actions
  refreshBalance: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  awardDailyCheckIn: () => Promise<boolean>;
  logHabit: (habitId: string) => Promise<boolean>;
  trackCommunityActivity: (type: 'post' | 'comment', contentId: string) => Promise<boolean>;
}

// Create the context with default values
const PointsContext = createContext<PointsContextType>({
  pointBalance: { total: 0, lastUpdated: '' },
  pointHistory: [],
  isLoading: false,
  isBalanceLoading: false,
  isHistoryLoading: false,
  hasError: false,
  lastAwardedPoints: null,
  
  refreshBalance: async () => {},
  refreshHistory: async () => {},
  awardDailyCheckIn: async () => false,
  logHabit: async () => false,
  trackCommunityActivity: async () => false,
});

// Hook for components to use the points context
export const usePoints = () => useContext(PointsContext);

interface PointsProviderProps {
  children: ReactNode;
}

// Type guard for point balance shape
function isPointBalanceObject(obj: any): obj is { total: number } {
  return obj && typeof obj === 'object' && 'total' in obj;
}

// Provider component that wraps parts of the app needing points data
export const PointsProvider = ({ children }: PointsProviderProps) => {
  // Use ref to track if initial data has been loaded for the current user
  const initialLoadRef = useRef<string | null>(null);
  // State for points data
  const [pointBalance, setPointBalance] = useState<PointBalance>({ total: 0, lastUpdated: '' });
  const [pointHistory, setPointHistory] = useState<PointEvent[]>([]);
  
  // Separate loading states to prevent race conditions
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  
  // Computed general loading state for backward compatibility
  const isLoading = isBalanceLoading || isHistoryLoading;
  
  const [hasError, setHasError] = useState(false);
  const [lastAwardedPoints, setLastAwardedPoints] = useState<{ amount: number; source: string } | null>(null);
  
  // Get authentication context for user ID
  const { user } = useAuth();
  
  // Refresh point balance from the server
  const refreshBalance = async () => {
  console.log('refreshBalance called with user?.id:', user?.id);
    if (!user?.id) return;
    
    // Use the dedicated balance loading state
    setIsBalanceLoading(true);
    setHasError(false);
    
    try {
      const balance = await pointsService.getUserPointBalance(user.id);
      console.log('refreshBalance got balance:', balance);
      setPointBalance(balance);
    } catch (error) {
      console.error('Error fetching point balance:', error);
      setHasError(true);
    } finally {
      setIsBalanceLoading(false);
    }
  };
  
  // Refresh point history from the server
  const refreshHistory = async () => {
    console.log('refreshHistory called with user?.id:', user?.id);
    if (!user?.id) return;
    
    // Use the dedicated history loading state
    setIsHistoryLoading(true);
    setHasError(false);
    
    try {
      const history = await pointsService.getUserPointHistory(user.id);
      setPointHistory(history);
    } catch (error) {
      console.error('Error fetching point history:', error);
      setHasError(true);
    } finally {
      setIsHistoryLoading(false);
    }
  };
  
  // Process a daily check-in and award points
  const awardDailyCheckIn = async (): Promise<boolean> => {
    if (!user?.id) return false;
    
    // Use both loading states since this affects both balance and history
    setIsBalanceLoading(true);
    setIsHistoryLoading(true);
    setHasError(false);
    
    try {
      const result = await pointsService.processDailyCheckIn(user.id);
      
      if (result.success && result.data) {
        // Update balance
        if (result.data.pointBalance) {
          const total = isPointBalanceObject(result.data.pointBalance)
  ? result.data.pointBalance.total
  : result.data.pointBalance;
setPointBalance({
  total,
  lastUpdated: new Date().toISOString(),
});
        }
        
        // Set last awarded points for animation
        if (result.data.pointEvent) {
          setLastAwardedPoints({
            amount: result.data.pointEvent.points,
            source: 'daily_login',
          });
          
          // Clear the last awarded points after animation (3 seconds)
          setTimeout(() => {
            setLastAwardedPoints(null);
          }, 3000);
        }
        
        // Track event in analytics
        analyticsService.trackEvent('daily_check_in', {
          streak: result.data.streak,
          points_earned: result.data.pointEvent?.points,
        });
        
        // Refresh history to include new point event
        refreshHistory();
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error processing daily check-in:', error);
      setHasError(true);
      return false;
    } finally {
      setIsBalanceLoading(false);
      setIsHistoryLoading(false);
    }
  };
  
  // Log a habit and award points
  const logHabit = async (habitId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    // Use both loading states since this affects both balance and history
    setIsBalanceLoading(true);
    setIsHistoryLoading(true);
    setHasError(false);
    
    try {
      const result = await pointsService.processHabitLog(user.id, habitId);
      
      if (result.success && result.data) {
        // Update balance
        if (result.data.pointBalance) {
          const total = isPointBalanceObject(result.data.pointBalance)
  ? result.data.pointBalance.total
  : result.data.pointBalance;
setPointBalance({
  total,
  lastUpdated: new Date().toISOString(),
});
        }
        
        // Set last awarded points for animation
        if (result.data.pointEvent) {
          setLastAwardedPoints({
            amount: result.data.pointEvent.points,
            source: 'habit_log',
          });
          
          // Clear the last awarded points after animation (3 seconds)
          setTimeout(() => {
            setLastAwardedPoints(null);
          }, 3000);
        }
        
        // Track event in analytics
        analyticsService.trackEvent('habit_logged', {
          habit_id: habitId,
          streak: result.data.streak,
          points_earned: result.data.pointEvent?.points,
        });
        
        // Refresh history to include new point event
        refreshHistory();
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error logging habit:', error);
      setHasError(true);
      return false;
    } finally {
      setIsBalanceLoading(false);
      setIsHistoryLoading(false);
    }
  };
  
  // Track community activity and award points
  const trackCommunityActivity = async (
    type: 'post' | 'comment', 
    contentId: string
  ): Promise<boolean> => {
    if (!user?.id) return false;
    
    // Use both loading states since this affects both balance and history
    setIsBalanceLoading(true);
    setIsHistoryLoading(true);
    setHasError(false);
    
    try {
      const result = await pointsService.processCommunityParticipation(
        user.id,
        type,
        contentId
      );
      
      if (result.success && result.data) {
        // Update balance
        if (result.data.pointBalance) {
          const total = isPointBalanceObject(result.data.pointBalance)
  ? result.data.pointBalance.total
  : result.data.pointBalance;
setPointBalance({
  total,
  lastUpdated: new Date().toISOString(),
});
        }
        
        // Set last awarded points for animation
        if (result.data.pointEvent) {
          setLastAwardedPoints({
            amount: result.data.pointEvent.points,
            source: 'discussion_participation',
          });
          
          // Clear the last awarded points after animation (3 seconds)
          setTimeout(() => {
            setLastAwardedPoints(null);
          }, 3000);
        }
        
        // Track event in analytics
        analyticsService.trackEvent('community_participation', {
          type,
          content_id: contentId,
          points_earned: result.data.pointEvent?.points,
        });
        
        // Refresh history to include new point event
        refreshHistory();
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error tracking community activity:', error);
      setHasError(true);
      return false;
    } finally {
      setIsBalanceLoading(false);
      setIsHistoryLoading(false);
    }
  };
  
  // Load initial data when user changes, but only once per user
  useEffect(() => {
    if (user?.id) {
      // Only load if we haven't loaded for this user yet
      if (initialLoadRef.current !== user.id) {
        // Set the ref to current user id to prevent duplicate loads
        initialLoadRef.current = user.id;
        // Load data
        refreshBalance();
        refreshHistory();
      }
    } else {
      // Reset state when user logs out
      setPointBalance({ total: 0, lastUpdated: '' });
      setPointHistory([]);
      setLastAwardedPoints(null);
      // Reset ref when user logs out
      initialLoadRef.current = null;
    }
  }, [user?.id]);
  
  // Context value
  const value = {
    pointBalance,
    pointHistory,
    isLoading,
    isBalanceLoading,
    isHistoryLoading,
    hasError,
    lastAwardedPoints,
    
    refreshBalance,
    refreshHistory,
    awardDailyCheckIn,
    logHabit,
    trackCommunityActivity,
  };
  
  return (
    <PointsContext.Provider value={value}>
      {children}
    </PointsContext.Provider>
  );
};

export default PointsProvider;
