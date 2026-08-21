import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof Ionicons>['name'];

export interface AppNavItem {
  label: string;
  href: '/home' | '/habits/log' | '/map' | '/knowledge' | '/community' | '/profile';
  match: string;
  icon: IconName;
  activeIcon: IconName;
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  { label: 'Home', href: '/home', match: '/home', icon: 'home-outline', activeIcon: 'home' },
  { label: 'Habits', href: '/habits/log', match: '/habits', icon: 'leaf-outline', activeIcon: 'leaf' },
  { label: 'Map', href: '/map', match: '/map', icon: 'map-outline', activeIcon: 'map' },
  { label: 'Hub', href: '/knowledge', match: '/knowledge', icon: 'library-outline', activeIcon: 'library' },
  { label: 'Community', href: '/community', match: '/community', icon: 'people-outline', activeIcon: 'people' },
];

export const PROFILE_NAV_ITEM: AppNavItem = { label: 'Profile', href: '/profile', match: '/profile', icon: 'person-outline', activeIcon: 'person' };

export function isNavItemActive(pathname: string, item: AppNavItem): boolean {
  return pathname === item.match || pathname.startsWith(`${item.match}/`);
}
