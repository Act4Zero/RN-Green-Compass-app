import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { getCurrentPosition } from '../utils/mapUtils';
import { getIpApproxLocation } from '../utils/ipLocation';

interface Location {
  lat: number;
  lng: number;
}

interface UseUserLocationResult {
  userLocation: Location | null;
  locationPermission: boolean | null;
  isLocating: boolean;
  locateUser: () => Promise<Location | null>;
  initializeLocation: () => Promise<void>;
}

export function useUserLocation(): UseUserLocationResult {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Function to locate the user and update map position
  const locateUser = useCallback(async (): Promise<Location | null> => {
    setIsLocating(true);
    
    try {
      // Use our utility function to get position (handles permissions)
      const position = await getCurrentPosition();
      setLocationPermission(true);
      setUserLocation(position);
      return position;
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error', 
        error instanceof Error 
          ? error.message 
          : 'Could not get your location. Please check your settings.'
      );
      return null;
    } finally {
      setIsLocating(false);
    }
  }, []);

  // Initial location setup function
  const initializeLocation = useCallback(async (): Promise<void> => {
    // 1. Try precise geolocation
    try {
      const position = await getCurrentPosition();
      setUserLocation(position);
      setLocationPermission(true);
      return;
    } catch {}
    
    // 2. Try IP-based location (web only)
    if (Platform.OS === 'web') {
      const approx = await getIpApproxLocation();
      if (approx) {
        setUserLocation({ lat: approx.lat, lng: approx.lng });
        setLocationPermission(false);
        Alert.alert('Approximate location', 'Showing your city or region based on your IP address.');
        return;
      }
    }
    
    // 3. Fallback to country/world
    setLocationPermission(false);
    // We don't set a fallback location here, as that will be handled by the map component
  }, []);

  return {
    userLocation,
    locationPermission,
    isLocating,
    locateUser,
    initializeLocation
  };
}
