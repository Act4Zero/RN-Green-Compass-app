/**
 * Map Utility Functions
 * Provides helper functions for map operations
 */
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { GeographicBounds, MapLocation } from '../types/map';

type SupportedMapLocale = 'en' | 'bg';

const BULGARIAN_PLACE_NAMES: Record<string, string> = {
  '2700 Blagoevgrad': '2700 Благоевград',
  Bansko: 'Банско', Blagoevgrad: 'Благоевград', Botevgrad: 'Ботевград',
  Bourgas: 'Бургас', Burgas: 'Бургас', Dimitrovgrad: 'Димитровград',
  'Dobrich Region': 'област Добрич', 'Elin Pelin': 'Елин Пелин',
  Gelemenovo: 'Гелеменово', Kulata: 'Кулата', Luliakovo: 'Люляково',
  Lyubimets: 'Любимец', Marikostinovo: 'Марикостиново', Melnik: 'Мелник',
  Montana: 'Монтана', Nessebar: 'Несебър', Obnova: 'Обнова',
  Pamporovo: 'Пампорово', Petrich: 'Петрич', Pleven: 'Плевен',
  Plovdiv: 'Пловдив', Ruse: 'Русе', Sandanski: 'Сандански',
  Sinemorets: 'Синеморец', Smolyan: 'Смолян', Sofia: 'София',
  'Sofia City': 'София-град', 'Sofia-City Region': 'област София-град',
  'Stara Zagora': 'Стара Загора', 'Stara Zagora Region': 'област Стара Загора',
  Stryama: 'Стряма', 'Sunny Beach': 'Слънчев бряг',
  'Targovishte municipality': 'община Търговище', Varna: 'Варна',
  'Varna Municipality': 'община Варна', Bulgaria: 'България',
};

const localizeBulgarianAddressPart = (value: string | null | undefined): string => {
  if (!value) return '';
  const exact = BULGARIAN_PLACE_NAMES[value.trim()];
  if (exact) return exact;
  if (/[А-Яа-я]/.test(value)) return value;
  return value
    .replace(/\b(?:bul\.|boulevard|blvd\.?)\s*/gi, 'бул. ')
    .replace(/\b(?:ulitsa|ul\.|street|str\.?)\s*/gi, 'ул. ')
    .replace(/\b(?:square|sq\.?)\s*/gi, 'пл. ')
    .replace(/\bNorthern Industrial Zone\b/gi, 'Северна промишлена зона')
    .replace(/\bIndustrial Zone\b/gi, 'Промишлена зона')
    .replace(/\bmunicipality\b/gi, 'община')
    .replace(/\bregion\b/gi, 'област');
};

export const getLocalizedLocationName = (location: MapLocation, locale: SupportedMapLocale): string =>
  locale === 'bg' ? location.name_bg?.trim() || location.name : location.name;

/**
 * Get the user's current position using the Geolocation API
 * Returns a Promise with the latitude and longitude
 */
export const formatAddress = (location: MapLocation): string => {
  let addressParts = [];
  
  // Address lines
  if (location.address_line_1) addressParts.push(location.address_line_1);
  if (location.address_line_2) addressParts.push(location.address_line_2);
  
  // Town/city
  if (location.town) addressParts.push(location.town);
  
  // State/province and postcode
  let regionPostcode = '';
  if (location.state_or_province) regionPostcode += location.state_or_province;
  if (location.postcode) regionPostcode += (location.state_or_province ? ' ' : '') + location.postcode;
  if (regionPostcode) addressParts.push(regionPostcode);
  
  // Country
  if (location.country) addressParts.push(location.country);
  
  return addressParts.join(', ');
};

/** Use available Bulgarian fields and conservative address-term localization without inventing data. */
export const formatLocalizedAddress = (location: MapLocation, locale: SupportedMapLocale): string => {
  if (locale === 'en') return formatAddress(location);
  const parts = [
    localizeBulgarianAddressPart(location.address_line_1),
    localizeBulgarianAddressPart(location.address_line_2),
    localizeBulgarianAddressPart(location.town),
  ];
  const region = localizeBulgarianAddressPart(location.state_or_province);
  const regionPostcode = [region, location.postcode].filter(Boolean).join(' ');
  if (regionPostcode) parts.push(regionPostcode);
  parts.push(localizeBulgarianAddressPart(location.country));
  return parts.filter(Boolean).join(', ');
};

/**
 * Get the user's current position using the Geolocation API
 * Returns a Promise with the latitude and longitude
 */
export const getCurrentPosition = async (): Promise<{ lat: number; lng: number }> => {
  if (Platform.OS === 'web') {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          let message;
          switch (error.code) {
            case 1:
              message = 'Permission denied. Please enable location services.';
              break;
            case 2:
              message = 'Position unavailable. Try again later.';
              break;
            case 3:
              message = 'Location request timed out. Try again later.';
              break;
            default:
              message = 'An unknown error occurred.';
              break;
          }
          reject(new Error(message));
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  } else {
    // Native (Expo/React Native)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission denied. Please enable location services.');
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Could not get your location. Please check your settings.'
      );
    }
  }
};

/**
 * Calculate distance between two coordinates in kilometers using the Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Check if coordinates are within given bounds
 */
export const isWithinBounds = (
  lat: number,
  lng: number,
  bounds: GeographicBounds
): boolean => {
  return (
    lat <= bounds.north &&
    lat >= bounds.south &&
    lng <= bounds.east &&
    lng >= bounds.west
  );
};

/**
 * Get center of bounds
 */
export const getBoundsCenter = (bounds: GeographicBounds): { lat: number; lng: number } => {
  return {
    lat: (bounds.north + bounds.south) / 2,
    lng: (bounds.east + bounds.west) / 2
  };
};

/**
 * Calculate bounds from center point and radius (in km)
 */
export const getBoundsFromCenter = (
  centerLat: number,
  centerLng: number,
  radiusKm: number
): GeographicBounds => {
  // Approximate degrees per km
  const latDegPerKm = 1 / 110.574;
  const lngDegPerKm = 1 / (111.32 * Math.cos(toRadians(centerLat)));

  const latDelta = latDegPerKm * radiusKm;
  const lngDelta = lngDegPerKm * radiusKm;

  return {
    north: centerLat + latDelta,
    south: centerLat - latDelta,
    east: centerLng + lngDelta,
    west: centerLng - lngDelta
  };
};

/**
 * Get a platform-appropriate navigation URL
 * On iOS, try to use Apple Maps, otherwise Google Maps
 */
export const getPlatformSpecificNavigationUrl = (
  lat: number,
  lng: number,
  name: string,
  address?: string
): string => {
  const encodedName = encodeURIComponent(name);
  const encodedAddress = address ? encodeURIComponent(address) : '';
  
  // For iOS devices, try to use Apple Maps
  if (Platform.OS === 'ios') {
    const appleMapsUrl = `maps:?q=${encodedName}&ll=${lat},${lng}`;
    return appleMapsUrl;
  }
  
  // Default to Google Maps for Android and web
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodedName}${encodedAddress ? ' ' + encodedAddress : ''}`;
};

/**
 * Create clustered representation of locations
 * This is a placeholder - a real implementation would use a library like supercluster
 */
export const clusterLocations = (
  locations: Array<{ lat: number; lng: number; id: string }>,
  zoom: number
): Array<{ lat: number; lng: number; count: number; points: string[] }> => {
  // Simplified clustering logic - in a real app, use a specialized library
  // This is a placeholder to show the concept
  if (zoom >= 14) {
    // At high zoom levels, don't cluster
    return locations.map(loc => ({ 
      lat: loc.lat, 
      lng: loc.lng, 
      count: 1, 
      points: [loc.id] 
    }));
  }

  // Very simple grid-based clustering
  const clusters: Record<string, { lat: number; lng: number; count: number; points: string[] }> = {};
  const gridSize = Math.max(0.01, 0.1 / Math.pow(2, zoom - 10)); // Adjust grid size based on zoom
  
  locations.forEach(loc => {
    // Create a grid cell key
    const cellX = Math.floor(loc.lng / gridSize);
    const cellY = Math.floor(loc.lat / gridSize);
    const cellKey = `${cellX}-${cellY}`;
    
    if (!clusters[cellKey]) {
      clusters[cellKey] = {
        lat: loc.lat,
        lng: loc.lng,
        count: 1,
        points: [loc.id]
      };
    } else {
      // Update existing cluster
      clusters[cellKey].count += 1;
      clusters[cellKey].points.push(loc.id);
      
      // Recalculate center (average)
      const pts = clusters[cellKey].points.length;
      clusters[cellKey].lat = (clusters[cellKey].lat * (pts - 1) + loc.lat) / pts;
      clusters[cellKey].lng = (clusters[cellKey].lng * (pts - 1) + loc.lng) / pts;
    }
  });
  
  return Object.values(clusters);
};

/**
 * Generate a descriptive error message for common map errors
 */
export const getMapErrorMessage = (error: Error | null): string => {
  if (!error) return '';
  
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
    return 'Location permission denied. Please enable location access in your settings.';
  }
  
  if (errorMessage.includes('timeout')) {
    return 'Location request timed out. Please try again later.';
  }
  
  if (errorMessage.includes('unavailable') || errorMessage.includes('network')) {
    return 'Location service unavailable. Check your internet connection.';
  }
  
  if (errorMessage.includes('load') || errorMessage.includes('fetch')) {
    return 'Failed to load map data. Please check your connection and try again.';
  }
  
  return 'An error occurred with the map. Please try again later.';
};
