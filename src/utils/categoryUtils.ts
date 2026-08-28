import { LocationCategory } from '../types/map';

/**
 * Centralized configuration for location categories with their icons, colors, and display labels
 */
export const categoryConfig: Record<LocationCategory, { 
  icon: string; 
  color: string; 
  label: string;
  labelBg: string;
}> = {
  renewable_energy: { icon: 'sunny-outline', color: '#E3A624', label: 'Renewable energy', labelBg: 'Възобновяема енергия' },
  local_organic: { icon: 'leaf-outline', color: '#6E9F42', label: 'Local & organic', labelBg: 'Местно и органично' },
  zero_waste: { icon: 'infinite-outline', color: '#C87829', label: 'Zero-waste', labelBg: 'Нулев отпадък' },
  ev_charging: { icon: 'flash-outline', color: '#2F8F67', label: 'EV charging', labelBg: 'Зареждане на електромобили' },
  recycling: { icon: 'refresh-circle-outline', color: '#347DB8', label: 'Recycling', labelBg: 'Рециклиране' },
  green_spaces: { icon: 'trail-sign-outline', color: '#4B8B55', label: 'Green spaces', labelBg: 'Зелени пространства' },
  community_events: { icon: 'people-outline', color: '#A2588C', label: 'Community & events', labelBg: 'Общност и събития' },
};

/**
 * Get icon and color for a category
 * @param category The location category
 * @returns Object with icon name and color
 */
export function getCategoryIcon(category: LocationCategory) {
  const config = categoryConfig[category] || categoryConfig.community_events;
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
  return categoryConfig[category] || categoryConfig.community_events;
}

/**
 * Get all categories configuration
 * @returns Full categories configuration object
 */
export function getAllCategoryConfigs() {
  return categoryConfig;
}
