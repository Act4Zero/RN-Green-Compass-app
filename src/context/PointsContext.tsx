import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import pointsService from '../services/pointsService';
import { PointEvent, PointBalance } from '../types/points';
import analyticsService from '../services/analyticsService';

// Define the context shape
interface PointsContextType {
  // State
  pointBalance: PointBalance;
  pointHistory: PointEvent[];
  isLoading: boolean;
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

// Provider component that wraps parts of the app needing points data
export const PointsProvider = ({ children }: PointsProviderProps) => {
  // State for points data
  const [pointBalance, setPointBalance] = useState<PointBalance>({ total: 0, lastUpdated: '' });
  const [pointHistory, setPointHistory] = useState<PointEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [lastAwardedPoints, setLastAwardedPoints] = useState<{ amount: number; source: string } | null>(null);
  
  // Get authentication context for user ID
  const { user } = useAuth();
  
  // Refresh point balance from the server
  const refreshBalance = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      const balance = await pointsService.getUserPointBalance(user.id);
      setPointBalance(balance);
    } catch (error) {
      console.error('Error fetching point balance:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Refresh point history from the server
  const refreshHistory = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      const history = await pointsService.getUserPointHistory(user.id);
      setPointHistory(history);
    } catch (error) {
      console.error('Error fetching point history:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process a daily check-in and award points
  const awardDailyCheckIn = async (): Promise<boolean> => {
    if (!user?.id) return false;
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      const result = await pointsService.processDailyCheckIn(user.id);
      
      if (result.success && result.data) {
        // Update balance
        if (result.data.pointBalance) {
          setPointBalance({
            total: result.data.pointBalance,
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
      setIsLoading(false);
    }
  };
  
  // Log a habit and award points
  const logHabit = async (habitId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      const result = await pointsService.processHabitLog(user.id, habitId);
      
      if (result.success && result.data) {
        // Update balance
        if (result.data.pointBalance) {
          setPointBalance({
            total: result.data.pointBalance,
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
      setIsLoading(false);
    }
  };
  
  // Track community activity and award points
  const trackCommunityActivity = async (
    type: 'post' | 'comment', 
    contentId: string
  ): Promise<boolean> => {
    if (!user?.id) return false;
    
    setIsLoading(true);
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
          setPointBalance({
            total: result.data.pointBalance,
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
      setIsLoading(false);
    }
  };
  
  // Load initial data when user changes
  useEffect(() => {
    if (user?.id) {
      refreshBalance();
      refreshHistory();
    } else {
      // Reset state when user logs out
      setPointBalance({ total: 0, lastUpdated: '' });
      setPointHistory([]);
      setLastAwardedPoints(null);
    }
  }, [user?.id]);
  
  // Context value
  const value = {
    pointBalance,
    pointHistory,
    isLoading,
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
