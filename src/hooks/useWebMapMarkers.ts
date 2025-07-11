import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { categoryConfig } from '../utils/categoryUtils';
import { ioniconSvgPaths } from '../utils/ioniconPaths';
import { createMarkerIconUrl } from '../utils/markerUtils';

interface Location {
  id: string;
  lat: number;
  lng: number;
  name: string;
  category: string;
}

/**
 * Hook to manage markers on a web-based Leaflet map
 */
export function useWebMapMarkers(locations: Location[]) {
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (Platform.OS !== 'web' || 
        !window._leafletMapInitialized || 
        !window._leafletMapInstance) {
      return;
    }

    const L = require('leaflet');
    const map = window._leafletMapInstance;
    
    // Remove old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    locations.forEach((location: Location) => {
      // Get icon and color for this category
      const config = categoryConfig[location.category] || categoryConfig['Community'];
      const iconName = config.icon;
      const iconColor = config.color;
      const iconPath = ioniconSvgPaths[iconName] || '';

      // Create marker icon URL
      const svgIconUrl = createMarkerIconUrl(iconPath, iconColor);
      
      // Create Leaflet icon
      const icon = L.icon({
        iconUrl: svgIconUrl,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -36],
        shadowUrl: undefined
      });
      
      // Create and add marker to map
      const marker = L.marker([location.lat, location.lng], { icon })
        .addTo(map)
        .bindPopup(location.name || '');
        
      markersRef.current.push(marker);
    });

    console.log('[WebMapMarkers] Markers added:', markersRef.current.length);
  }, [locations]);

  return {
    markerCount: markersRef.current.length
  };
}
