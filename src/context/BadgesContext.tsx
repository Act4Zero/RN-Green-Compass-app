import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import useBadgesManager from '@/hooks/useBadgesManager';
import { Badge, UserBadge, BadgeNotification } from '@/types/community/badges';

interface BadgesContextType {
  // Data
  allBadges: Badge[];
  userBadges: UserBadge[];
  isLoading: boolean;
  error: string | null;
  newBadgeNotification: BadgeNotification | null;
  
  // Actions
  loadAllBadges: () => Promise<Badge[]>;
  loadUserBadges: () => Promise<void>;
  hasBadge: (badgeCode: string) => boolean;
  dismissBadgeNotification: () => void;
  checkAndAwardStreakBadges: (currentStreak: number) => Promise<boolean>;
  checkAndAwardFirstHabitBadge: () => Promise<boolean>;
}

const BadgesContext = createContext<BadgesContextType | null>(null);

export function useBadges(): BadgesContextType {
  const context = useContext(BadgesContext);
  if (!context) {
    throw new Error('useBadges must be used within a BadgesProvider');
  }
  return context;
}

interface BadgesProviderProps {
  children: ReactNode;
}

export function BadgesProvider({ children }: BadgesProviderProps) {
  const badgesManager = useBadgesManager();
  
  return (
    <BadgesContext.Provider value={badgesManager}>
      {children}
    </BadgesContext.Provider>
  );
}
