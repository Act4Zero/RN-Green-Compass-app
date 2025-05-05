import { useState } from 'react';
import { usePoints } from '../context/PointsContext';
import { PointEvent, PointSource } from '../types/points';

/**
 * Hook for accessing and filtering a user's point history
 * @returns Object with point history data and filtering functions
 */
function usePointsHistory() {
  const { pointHistory, isLoading, hasError, refreshHistory } = usePoints();
  const [activeFilters, setActiveFilters] = useState<PointSource[]>([]);

  // Get filtered history based on active source filters
  const filteredHistory = activeFilters.length > 0 
    ? pointHistory.filter(event => activeFilters.includes(event.source))
    : pointHistory;

  // Toggle a filter on/off
  const toggleFilter = (source: PointSource) => {
    setActiveFilters(prev => 
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters([]);
  };

  // Group history by date
  const historyByDate = filteredHistory.reduce<Record<string, PointEvent[]>>((acc, event) => {
    const date = new Date(event.created_at).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});

  // Calculate total points by source
  const pointsBySource = pointHistory.reduce<Record<PointSource, number>>((acc, event) => {
    if (!acc[event.source]) {
      acc[event.source] = 0;
    }
    acc[event.source] += event.points;
    return acc;
  }, {} as Record<PointSource, number>);

  return {
    history: filteredHistory,
    historyByDate,
    pointsBySource,
    activeFilters,
    toggleFilter,
    clearFilters,
    isLoading,
    hasError,
    refresh: refreshHistory
  };
}

export default usePointsHistory;
