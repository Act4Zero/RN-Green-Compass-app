import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof Ionicons>['name'];

export interface AppNavItem {
  label: string;
  labelBg: string;
  href: '/home' | '/habits' | '/map' | '/knowledge' | '/community' | '/marketplace' | '/more' | '/profile';
  match: string;
  additionalMatches?: string[];
  icon: IconName;
  activeIcon: IconName;
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  { label: 'Home', labelBg: 'Начало', href: '/home', match: '/home', icon: 'home-outline', activeIcon: 'home' },
  { label: 'Habits', labelBg: 'Навици', href: '/habits', match: '/habits', icon: 'leaf-outline', activeIcon: 'leaf' },
  { label: 'Map', labelBg: 'Карта', href: '/map', match: '/map', icon: 'map-outline', activeIcon: 'map' },
  { label: 'Hub', labelBg: 'Знания', href: '/knowledge', match: '/knowledge', icon: 'library-outline', activeIcon: 'library' },
  { label: 'Community', labelBg: 'Общност', href: '/community', match: '/community', icon: 'people-outline', activeIcon: 'people' },
  { label: 'Marketplace', labelBg: 'Магазин', href: '/marketplace', match: '/marketplace', icon: 'storefront-outline', activeIcon: 'storefront' },
];

export const MOBILE_NAV_ITEMS: AppNavItem[] = [
  { label: 'Home', labelBg: 'Начало', href: '/home', match: '/home', icon: 'home-outline', activeIcon: 'home' },
  { label: 'Habits', labelBg: 'Навици', href: '/habits', match: '/habits', icon: 'leaf-outline', activeIcon: 'leaf' },
  { label: 'Map', labelBg: 'Карта', href: '/map', match: '/map', icon: 'map-outline', activeIcon: 'map' },
  { label: 'Marketplace', labelBg: 'Магазин', href: '/marketplace', match: '/marketplace', icon: 'storefront-outline', activeIcon: 'storefront' },
  { label: 'More', labelBg: 'Още', href: '/more', match: '/more', additionalMatches: ['/knowledge','/community','/profile'], icon: 'ellipsis-horizontal-circle-outline', activeIcon: 'ellipsis-horizontal-circle' },
];

export const PROFILE_NAV_ITEM: AppNavItem = { label: 'Profile', labelBg: 'Профил', href: '/profile', match: '/profile', icon: 'person-outline', activeIcon: 'person' };

export function isNavItemActive(pathname: string, item: AppNavItem): boolean {
  return [item.match, ...(item.additionalMatches || [])].some((match) => pathname === match || pathname.startsWith(`${match}/`));
}
