import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import pointsService from '@/services/community/pointsService';
import { PointEvent, PointSource } from '@/types/community/points';

/**
 * A simplified hook for accessing user point history
 * Designed to avoid circular dependencies and infinite loops
 */
function useSimplePointHistory() {
  const [pointHistory, setPointHistory] = useState<PointEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [activeFilters, setActiveFilters] = useState<PointSource[]>([]);
  
  const { user } = useAuth();
  
  // Fetch point history - optimized to prevent infinite loops
  const fetchHistory = useCallback(async () => {
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
  }, [user?.id]);
  
  // Toggle a filter on/off
  const toggleFilter = useCallback((source: PointSource) => {
    setActiveFilters(prev => 
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  }, []);
  
  // Clear all filters
  const clearFilters = useCallback(() => {
    setActiveFilters([]);
  }, []);
  
  // Get filtered history based on active source filters
  const filteredHistory = activeFilters.length > 0 
    ? pointHistory.filter(event => activeFilters.includes(event.source))
    : pointHistory;
  
  // Group history by date
  const historyByDate = filteredHistory.reduce<Record<string, PointEvent[]>>((acc, event) => {
    const date = new Date(event.created_at).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});
  
  return {
    history: filteredHistory,
    historyByDate,
    activeFilters,
    toggleFilter,
    clearFilters,
    isLoading,
    hasError,
    fetchHistory
  };
}

export default useSimplePointHistory;
