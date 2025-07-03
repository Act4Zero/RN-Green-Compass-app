import { LocationCategory } from '../types/map';

/**
 * Centralized configuration for location categories with their icons, colors, and display labels
 */
export const categoryConfig: Record<LocationCategory, { 
  icon: string; 
  color: string; 
  label: string 
}> = {
  'EV Charging Stations': { 
    icon: 'flash', 
    color: '#4CAF50', 
    label: 'EV Charging' 
  },
  'Recycling': { 
    icon: 'refresh-circle', 
    color: '#2196F3', 
    label: 'Recycling' 
  },
  'Organic Food': { 
    icon: 'leaf', 
    color: '#8BC34A', 
    label: 'Organic' 
  },
  'Zero-Waste': { 
    icon: 'trash-bin-outline', 
    color: '#FF9800', 
    label: 'Zero-Waste' 
  },
  'Green Building': { 
    icon: 'home', 
    color: '#9C27B0', 
    label: 'Green Building' 
  },
  'Community': { 
    icon: 'people', 
    color: '#E91E63', 
    label: 'Community' 
  },
};

/**
 * Get icon and color for a category
 * @param category The location category
 * @returns Object with icon name and color
 */
export function getCategoryIcon(category: LocationCategory) {
  const config = categoryConfig[category] || categoryConfig['Community'];
  return { 
    name: config.icon, 
    color: config.color 
  };
}

/**
 * Get full config for a category including label
 * @param category The location category
 * @returns Full category configuration
 */
export function getCategoryConfig(category: LocationCategory) {
  return categoryConfig[category] || categoryConfig['Community'];
}

/**
 * Get all categories configuration
 * @returns Full categories configuration object
 */
export function getAllCategoryConfigs() {
  return categoryConfig;
}
