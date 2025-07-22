import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useWebMapInit } from '../../hooks/useWebMapInit';
import { useWebMapMarkers } from '../../hooks/useWebMapMarkers';
import { mapViewStyles } from '../../styles/map/MapViewStyles';

interface WebMapViewProps {
  isDataInitialized: boolean;
  filteredLocations: any[];
  userLocation: { lat: number; lng: number } | null;
  updateUserLocationOnMap?: boolean;
}

/**
 * Web-specific implementation of the map view using Leaflet directly
 */
export function WebMapView({
  isDataInitialized,
  filteredLocations,
  userLocation,
  updateUserLocationOnMap
}: WebMapViewProps) {
  // Initialize the Leaflet map
  const { isInitialized, mapInstance } = useWebMapInit({
    initialLat: 20,
    initialLng: 0,
    initialZoom: 2,
    isDataInitialized
  });

  // Manage markers on the map
  useWebMapMarkers(filteredLocations);

  // Update user location marker when it changes
  useEffect(() => {
    if (isInitialized && mapInstance && userLocation) {
      if (typeof window !== 'undefined' && window._leafletMapInstance) {
        const L = require('leaflet');
        
        // If user location has changed, update the marker and center the map
        if (updateUserLocationOnMap) {
          window._leafletMapInstance.setView([userLocation.lat, userLocation.lng], 15);
        }

        // Add or update the user location marker
        if (L) {
          if (!window._userLocationMarker) {
            window._userLocationMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
              radius: 8,
              color: '#1976D2',
              fillColor: '#1976D2',
              fillOpacity: 0.9,
              weight: 2
            }).addTo(window._leafletMapInstance);
          } else {
            window._userLocationMarker.setLatLng([userLocation.lat, userLocation.lng]);
          }
        }
      }
    }
  }, [isInitialized, mapInstance, userLocation, updateUserLocationOnMap]);

  // Load Leaflet CSS for web
  useEffect(() => {
    if (typeof document !== 'undefined') {
      require('leaflet/dist/leaflet.css');
    }
  }, []);

  return (
    <div
      className="leaflet-container"
      style={{
        width: '100vw',
        height: '100vh',
        zIndex: 1,
        position: 'fixed',
        top: 0,
        left: 0
      }}
    >
      <div
        id="map"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
}

export default WebMapView;
