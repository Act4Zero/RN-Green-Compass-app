import React, { useState, useContext } from 'react';
import { View, Platform, ActivityIndicator, Text } from 'react-native';
import { mapViewStyles } from '../../styles/map/MapViewStyles';
import { useMapIntegration } from '../../hooks/useMapIntegration';
import { useUserLocation } from '../../hooks/useUserLocation';
import { MapContext } from '../../context/MapContext';
import MapPopup from './MapPopup';
import LocateButton from './LocateButton';
import DebugPanel from './DebugPanel';
import WebMapView from './WebMapView';
import NativeMapView from './NativeMapView';

/**
 * Main MapView component that delegates to platform-specific implementations
 */

export default function MapView() {
  // Context and hooks
  const { isDataInitialized } = useContext(MapContext);
  const { filteredLocations, viewport, updateViewport, selectedLocation, selectLocation } = useMapIntegration();
  const { userLocation, locationPermission, isLocating, locateUser, initializeLocation } = useUserLocation();

  // State
  const [mapReady, setMapReady] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(__DEV__);
  const [shouldUpdateUserLocation, setShouldUpdateUserLocation] = useState(false);

  // Debug panel data
  const filteredLocationsCount = filteredLocations?.length ?? 0;
  const filteredLocationsSample = filteredLocations?.slice(0, 3) ?? [];

  // Initialize map location when map is ready
  const handleMapReady = () => {
    setMapReady(true);
    initializeLocation();
  };

  // Handler for map movements
  const handleMapMove = (center: { lat: number; lng: number }, zoom: number) => {
    updateViewport({
      center,
      zoom
    });
  };

  // Handler for marker clicks
  const handleMarkerClick = (locationId: string) => {
    const location = filteredLocations.find(loc => loc.id === locationId);
    if (location) {
      selectLocation(location);
    }
  };

  // Handle locate me button press
  const handleLocateMe = async () => {
    const position = await locateUser();
    if (position) {
      setShouldUpdateUserLocation(true);
      // Reset flag after a short delay
      setTimeout(() => setShouldUpdateUserLocation(false), 100);
    }
  };

  // Render loading state if data is not yet initialized
  if (!isDataInitialized) {
    return (
      <View style={[mapViewStyles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{ marginTop: 16, color: '#2E7D32', fontWeight: '500' }}>Loading map data...</Text>
      </View>
    );
  }

  return (
    <View style={mapViewStyles.container}>
      {/* Platform-specific map implementation */}
      {Platform.OS === 'web' ? (
        <WebMapView 
          isDataInitialized={isDataInitialized}
          filteredLocations={filteredLocations}
          userLocation={userLocation}
          updateUserLocationOnMap={shouldUpdateUserLocation}
        />
      ) : (
        <NativeMapView
          filteredLocations={filteredLocations}
          onMapReady={handleMapReady}
          onMapMove={handleMapMove}
          onMarkerClick={handleMarkerClick}
          userLocation={userLocation}
          updateUserLocationOnMap={shouldUpdateUserLocation}
        />
      )}

      {/* Common UI elements */}
      <LocateButton onPress={handleLocateMe} isLoading={isLocating} />
      
      {selectedLocation && (
        <MapPopup location={selectedLocation} />
      )}

      {/* Debug panel (only in development) */}
      {showDebugPanel && (
        <DebugPanel
          filteredLocationsCount={filteredLocationsCount}
          filteredLocationsSample={filteredLocationsSample}
          onClose={() => setShowDebugPanel(false)}
        />
      )}
    </View>
  );
}
