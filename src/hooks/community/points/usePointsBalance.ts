import { useEffect, useState } from 'react';
import { usePoints } from '../../../context/PointsContext';
import { PointBalance } from '../../../types/community/points';

/**
 * Hook for accessing and refreshing a user's point balance
 * @returns Object with point balance, loading state, and refresh function
 */
console.log('usePointsBalance hook called');
function usePointsBalance() {
  const { pointBalance, isBalanceLoading, hasError, refreshBalance } = usePoints();
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Function to refresh balance data
  const refresh = async () => {
    await refreshBalance();
    setLastRefreshed(new Date());
  };

  // Format the points for display (with commas for thousands)
  const formattedPoints = pointBalance.total.toLocaleString();

  return {
    balance: pointBalance,
    formattedPoints,
    isLoading: isBalanceLoading, // Map isBalanceLoading to isLoading for backward compatibility
    hasError,
    refresh,
    lastRefreshed
  };
}

export default usePointsBalance;
